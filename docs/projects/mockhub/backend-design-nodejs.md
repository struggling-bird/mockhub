## 一、总体目标与设计原则

本方案是在现有 MockHub 产品形态和前端实现基础上，给出一套以 **Node.js 技术栈为优先** 的后端技术方案。目标是支撑：

- **接口 Mock 管理**：支持静态 JSON、脚本模式（动态响应）、真实代理三种模式；
- **代理网关能力**：按正则分组的代理规则，按项目/环境维度路由；
- **多项目 / 多环境管理**：与项目管理、团队成员、公共资产等前端模块对应；
- **易部署 + 易扩展**：本地开发、单机部署、Docker 部署统一一套代码。

关键设计原则：

- 优先选择 **Node.js + TypeScript**，保证开发体验与可维护性；
- 核心逻辑与 Express/Fastify 框架解耦，便于未来更换框架；
- 数据访问采用标准 ORM（Prisma / Sequelize / TypeORM），支持 SQLite / Postgres 双模；
- Script 执行引擎安全可控，限制资源与权限。

---

## 二、技术选型

### 2.1 运行时与语言

- **Node.js LTS（>= 20）**
  - 原生支持异步 IO，适合高并发 HTTP / 代理场景；
  - 丰富的中间件生态与调试工具；
  - 可与前端同一语言栈，降低团队沟通与协作成本。
- **TypeScript**
  - 强类型可减少接口、配置、脚本执行上下文等模块的 Bug；
  - 与 ORM / HTTP 框架良好集成，便于定义领域模型。

### 2.2 Web 框架

两种主流选择：

- **Fastify（推荐）**
  - 高性能、低开销，适合作为网关和 API Server；
  - 插件系统友好，内置 schema 校验。
- **NestJS**
  - 更完整的架构约束（模块化、依赖注入、装饰器），适合中大型项目；
  - 内部仍可使用 Fastify 作为 HTTP adapter。

方案建议：

- v1 推荐使用 **NestJS + Fastify adapter**：
  - 使用 Nest 模块化组织代码，清晰划分 API / Domain / Infra；
  - 网关部分可直接使用 Fastify 的 low-level 能力处理高并发代理。

### 2.3 数据库与 ORM

- **数据库**
  - 开发 / 单机部署：SQLite；
  - 生产 / 云端部署：Postgres。
- **ORM**
  - 推荐 **Prisma**：
    - Schema-first，类型推导好；
    - 支持 SQLite / Postgres 多种 provider。

数据库切换方式：

- `.env` 中通过 `DATABASE_URL` 控制：
  - 本地：`file:./data/mockhub.db`（SQLite）；
  - 云端：`postgresql://user:pass@host:5432/mockhub`.

### 2.4 代理与脚本执行

- **HTTP 代理**
  - 使用 `undici` / `node-fetch` / `axios` 实现上游请求转发；
  - 或者使用 `http-proxy` 等专业代理库。
- **脚本执行引擎**
  - Node 自身运行时 + `vm` 模块（沙箱执行）：
    - `vm.Script` + `vm.createContext`，限制访问的全局变量；
    - 通过同步执行超时保护主进程，当前不暴露 `require`、`process` 等对象。
  - 如果未来对安全/性能要求更高，可考虑：
    - `isolated-vm`（独立隔离的 V8 虚拟机）；
    - 使用外部 Worker 进程执行脚本，主进程通过 IPC 通信。

---

## 三、整体架构与模块划分

### 3.1 分层架构

后端整体沿用「接口层 – 领域层 – 基础设施层」三层结构：

- **接口层（API Layer）**
  - 提供 RESTful API & WebSocket 通道：
    - 项目、接口、Mock 配置、代理组、公共资产、团队成员等 CRUD；
    - 实时日志推送、脚本执行输出（可选）。
  - NestJS 的 Controller 层实现。
- **领域层（Domain Layer）**
  - 使用服务类（Service）封装业务逻辑：
    - `ProjectService`、`ApiEndpointService`、`MockConfigService`、`ProxyGroupService`、`TeamService` 等；
  - 不直接依赖具体 ORM，只依赖 Repository 抽象接口。
- **基础设施层（Infra Layer）**
  - Prisma Client 实现 Repository；
  - 代理转发器、脚本执行引擎、日志存储等；
  - 与云存储 / 消息队列（未来可选，如 Kafka、RabbitMQ）集成。

### 3.2 模块划分（NestJS Modules）

可按业务维度拆分为多个模块：

- `AuthModule`：认证与授权（登录、Token、Mock Key 验证）；
- `ProjectModule`：项目管理；
- `ApiModule`：接口定义与 Mock 配置；
- `ProxyModule`：代理分组与路由规则；
- `AssetModule`：公共资产管理；
- `TeamModule`：团队与成员；
- `GatewayModule`：统一 Mock/Proxy 网关入口（与前端 `/apis`、`/proxies` 等页面对应）；
- `MetricsModule`：Dashboard 所需统计数据；
- `ScriptModule`：脚本执行相关工具与安全控制。

---

## 四、领域模型设计

以下模型与前端页面强关联，并参考现有 `backend-design.md` 做 Node.js 适配。

### 4.1 Project（项目）

**表结构（Prisma 示例）**：

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  mockKey     String   @unique
  ownerId     String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  apis        ApiEndpoint[]
  proxyGroups ProxyGroup[]
  assets      PublicAsset[]
  members     ProjectMember[]
}
```

职责：

- 作为多租户 / 权限隔离的最小单元；
- 映射前端的「项目卡片」、「项目表单」与 Mock Key 展示。

### 4.2 ApiEndpoint（接口定义）

```prisma
model ApiEndpoint {
  id          String   @id @default(cuid())
  projectId   String
  method      String
  path        String
  name        String
  description String?
  status      String   // Published / Debugged / To Test ...
  lastCallAt  DateTime?

  project     Project   @relation(fields: [projectId], references: [id])
  mockConfig  MockConfig?
}
```

职责：

- 支持前端左侧列表 / 树展示（`/apis` 页面）；
- `status`、`lastCallAt` 用于 Dashboard 和 API 列表展示。

### 4.3 MockConfig（Mock 配置）

```prisma
model MockConfig {
  id            String   @id @default(cuid())
  apiEndpointId String   @unique
  mode          String   // static | script | proxy
  staticBody    Json?
  scriptCode    String?
  proxyTarget   String?
  enabled       Boolean  @default(true)

  apiEndpoint   ApiEndpoint @relation(fields: [apiEndpointId], references: [id])
}
```

职责：

- 对应前端 API Table 中 Response Mode 切换，以及三个 Tab 的行为；
- 静态 JSON，脚本模式（Script），真实代理（Proxy）。

### 4.4 ProxyGroup（代理分组）

```prisma
model ProxyGroup {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  regex       String
  mode        String   // Mock | Proxy | Hybrid
  autoSave    Boolean  @default(false)
  rulesCount  Int      @default(0)

  project     Project  @relation(fields: [projectId], references: [id])
}
```

职责：

- 映射前端 ProxyConfig 卡片列表；
- `regex` 用于网关请求匹配；
- `mode` 决定请求走 MockConfig 还是直接代理。

### 4.5 PublicAsset（公共资产）

```prisma
model PublicAsset {
  id        String   @id @default(cuid())
  projectId String
  name      String
  value     String
  type      String   // URL / Enum ...
  category  String   // Infrastructure / Definitions ...

  project   Project  @relation(fields: [projectId], references: [id])
}
```

职责：

- 对应前端的「Public Assets」；
- 用于存放 Auth Endpoint、角色枚举、错误码、自定义常量等。

### 4.6 Team / ProjectMember

```prisma
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  role      String   // Admin / Editor / Viewer
  status    String   // Active / Inactive
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  project   Project  @relation(fields: [projectId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
}
```

职责：

- 映射「Team Management」页面；
- 决定谁可以创建/编辑 Mock、谁可以仅查看等权限。
- Owner 由 `Project.ownerId` 表示，不强制写入普通成员表；接口返回时可作为虚拟成员行展示。
- `ProjectRoleDefinition` 记录项目级角色定义，默认补齐 Owner、Admin、Editor、Viewer，同时支持项目自定义角色。
- `ProjectRolePermission` 记录项目级角色权限配置，按 `project_id + role + permission_key` 唯一约束；旧项目无配置时使用默认权限模板。
- `ProjectAccessService` 同时负责项目可见性、角色定义补齐、角色 CRUD、角色识别和 permission key 校验，接口层按 `project.view`、`api.update`、`asset.suggestion.accept`、`team.invite`、`role.update` 等具体权限项执行访问控制。
- `ProjectInvitation` 记录项目邀请邮箱、角色、token、状态、邀请人、过期时间和接受时间。
- 成员邀请支持任意合法邮箱；未注册用户可通过邀请链接注册，注册成功后自动接受邀请并加入项目。
- 注册接口带邀请 token 时，以邀请记录中的邮箱和项目组织上下文写入新用户，避免前端篡改邮箱或公司名称造成跨身份加入。

---

## 五、核心模块设计与接口

### 5.1 项目管理 API

- `GET /api/projects`
  - 列出当前用户可见项目，用于前端项目列表页面。
- `POST /api/projects`
  - 创建项目，自动生成唯一 `mockKey`。
- `GET /api/projects/:projectId`
- `PUT /api/projects/:projectId`
- `DELETE /api/projects/:projectId`（可选，通常软删除）。

### 5.2 接口管理 API

- `GET /api/projects/:projectId/apis`
  - 支持按 name / path 搜索与分页。
- `POST /api/projects/:projectId/apis`
  - 创建接口定义。
- `GET /api/apis/:apiId`
- `PUT /api/apis/:apiId`
- `DELETE /api/apis/:apiId`

**Mock 配置相关**：

- `GET /api/apis/:apiId/mock-config`
- `PUT /api/apis/:apiId/mock-config`

> 前端在切换静态 / 脚本 / 代理模式，或编辑 JSON / Script 时调用。

### 5.3 代理与网关入口

网关统一入口例如：`/gateway/:projectKey/*path`

处理流程（Node.js / Fastify Handler）：

1. 从 URL 或 Header 中解析 `mockKey`；
2. 查找对应 `Project`；
3. 根据 `method + path` 查找 `ApiEndpoint` 与 `MockConfig`；
4. 应用 `ProxyGroup`（正则匹配 host / path）对请求进行二次路由决策；
5. 根据 `MockConfig.mode`：
   - `static`：直接返回静态 JSON；
   - `script`：调用脚本引擎；
   - `proxy`：转发到上游服务；
6. 记录调用日志（可异步写入）。

示意伪代码：

```ts
fastify.all('/gateway/:projectKey/*', async (req, reply) => {
  const project = await projectService.findByMockKey(req.params.projectKey);
  const route = await apiService.matchEndpoint(project.id, req.method, req.params['*']);
  const mockConfig = await mockConfigService.findByApi(route.id);
  const proxyGroup = await proxyService.matchGroup(project.id, req.headers.host, route.path);

  const mode = decideMode({ mockConfig, proxyGroup });

  switch (mode) {
    case 'static':
      return reply
        .code(200)
        .type('application/json')
        .send(mockConfig.staticBody);
    case 'script':
      return scriptService.execute({ req, reply, script: mockConfig.scriptCode });
    case 'proxy':
      return proxyService.forward({ req, reply, target: mockConfig.proxyTarget || proxyGroup.target });
  }
});
```

### 5.4 脚本执行模块（ScriptModule）

当前实现位于 `sources/backend-nest/src/gateway/script-mock.service.ts`，使用 Node `vm` 模块提供简单沙箱，并由 `GatewayService` 的 `script` 模式分支调用。

- 暴露给脚本的对象：

```ts
const sandbox = {
  request: {
    method: req.method,
    path: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
  },
  response: {
    status: 200,
    headers: {},
    body: null,
  },
  utils: {
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    now: () => Date.now(),
  },
};
```

- 支持脚本格式：
  - `export default function(req, res) { ... }`
  - `module.exports = function(req, res) { ... }`
  - 未显式导出的内联脚本会被包装为 `function(request, response) { ... }`
- 响应辅助方法：
  - `response.status(code)`
  - `response.setHeader(key, value)` / `response.header(key, value)`
  - `response.json(body)`
  - `response.text(body)`
  - `response.body(body)`
  - `response.delay(ms)`，最大延迟 5000ms。
- 执行过程：
  1. 规范化脚本格式并创建受限 sandbox；
  2. 使用 `vm.Script` 在 sandbox 内加载并调用脚本函数；
  3. 设定 500ms 同步执行超时；
  4. 脚本执行后，从 response state 读取状态码、headers 和 body 返回；
  5. 对象返回默认按 JSON 输出，字符串返回默认按 text 输出。

> 重要：当前脚本沙箱适合 Mock 场景的轻量动态响应，不应执行高风险、不可信或需要强隔离的生产级代码；如后续安全要求提高，应升级到 `isolated-vm` 或独立 Worker 进程。

---

## 六、认证与权限设计

### 6.1 用户认证

两阶段设计：

1. **v1 简化版**
   - 登录接口返回 JWT，前端 Auth 页面调用；
   - 仅区分基础角色（Admin / Editor / Viewer）。
2. **后续扩展**
   - 支持企业级 SSO / OAuth2（GitHub / GitLab / 企业 IDP）。

### 6.2 Mock Key 授权

对来自「Mock 网关」的请求采用 Project Mock Key 进行认证：

- 客户端在 Header 中添加：`x-mock-key: <project.mockKey>`；
- 后端在网关入口根据此 Key 查找项目，执行权限校验；
- 可配置 Key 权限级别（只读 / 读写）。

---

## 七、部署方案（Node.js 视角）

### 7.1 本地开发

- 技术栈：Node.js + NestJS + Prisma；
- 启动方式：

```bash
pnpm install
pnpm prisma migrate dev
pnpm start:dev
```

- 默认监听端口 `3000`，前端 Vite 开发服务器通过代理访问。

### 7.2 Docker 部署

- Dockerfile 示例（简化）：

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

- 通过环境变量 `DATABASE_URL` 区分 SQLite 与 Postgres。

### 7.3 与前端集成

- 云端部署时：
  - 前端静态资源也可由 Node 服务托管（NestJS + `@nestjs/serve-static`）；
  - 或通过 Nginx 反向代理到 Node API 与 Vite 构建产物。
- 本地开发时：
  - 前端运行在 `http://localhost:3000`（Vite），
  - Node API 在 `http://localhost:3001`，通过 Vite 代理 `/api`。

---

## 八、与现有前端的对齐与扩展

基于当前前端实现（Dashboard、API 管理、ProxyConfig、PublicAssets、ProjectManagement、TeamManagement）和产品文档，可以做如下对齐：

- 前端所有页面已按领域划分，对应后端各 Module 和 Model；
- 国际化（中/英）在前端通过 `t(key)` 实现，后端仅需要返回统一 key/value；
- Node.js 后端可以逐步替换前端中的 mock 数据：
  - 先从只读列表（Projects / APIs / ProxyGroups / Assets / Members）开始；
  - 再接入创建 / 编辑 / 删除等写操作；
  - 最后开启真实网关流量与脚本执行功能。

后续扩展方向：

- 接入审计日志、操作历史；
- 添加环境（Environment）与场景（Scenario）概念；
- 支持多 region、多实例部署下的配置一致性（通过数据库或配置中心）。

本 Node.js 后端技术方案与 `backend-design.md` 中的 Go 方案在领域层面保持一致，仅在实现技术与运行时上做了适配，方便团队按实际资源与偏好选择落地路径。 
