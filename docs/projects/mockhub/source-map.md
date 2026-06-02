# MockHub 源码说明

## 源码入口

| 模块 | 路径 | 技术栈 | 主要职责 |
| --- | --- | --- | --- |
| 后端服务 | `sources/backend-nest/` | NestJS、Fastify、Prisma、MariaDB/MySQL、Redis | 认证、项目、接口、上传、网关代理和数据访问 |
| 前端控制台 | `sources/frontend/` | React、Vite、React Router、Tailwind CSS、lucide-react | 登录、看板、项目、接口、代理、公共资产和团队页面 |

## 后端结构

| 路径 | 说明 |
| --- | --- |
| `src/main.ts` | NestJS + Fastify 启动入口，设置 `/api` 全局前缀、Swagger、CORS、multipart 和 gateway body parser；`gateway{/*path}` 使用新版具名通配符排除 `/gateway/*` 的 `/api` 前缀 |
| `src/gateway/gateway.controller.ts` | 网关控制器，使用 Fastify 可接受的 `@All('*')` 注册 `/gateway/*` 业务入口 |
| `src/app.module.ts` | 聚合 Prisma、Redis、Auth、Projects、Upload、Apis、Gateway 模块 |
| `src/auth/` | 注册、登录、JWT guard、公开路由装饰器和认证工具 |
| `src/projects/` | 项目 CRUD、Mock Key、项目级代理配置和项目响应 DTO |
| `src/apis/` | 项目接口 CRUD、接口 Mock 配置、代理请求 DTO |
| `src/gateway/` | `/gateway/*` 统一入口，处理 Static Mock、Script Mock、Proxy、自动捕获和请求透传 |
| `src/gateway/script-mock.service.ts` | 基于 Node `vm` 的轻量脚本 Mock 执行服务，提供受限上下文、响应辅助方法和同步超时保护 |
| `src/upload/` | Logo 上传、访问和清理 |
| `src/prisma/` | Prisma service、MariaDB adapter 配置和启动时 schema sync |
| `prisma/schema.prisma` | User、Project、ProjectApi 数据模型 |

## 前端结构

| 路径 | 说明 |
| --- | --- |
| `src/main.tsx` | React 应用入口 |
| `src/App.tsx` | 路由、登录态和整体应用框架 |
| `src/context/LanguageContext.tsx` | 中英文多语言字典和 hook |
| `src/components/Sidebar.tsx` | 控制台侧边导航 |
| `src/pages/auth/` | 登录与注册页面 |
| `src/pages/dashboard/` | Dashboard 总览页面 |
| `src/pages/project/` | 项目列表、新建、编辑、Logo 上传和项目表单组件 |
| `src/pages/api-table/` | API 管理、接口表单、响应/Mock 编辑相关组件 |
| `src/pages/proxy/` | 代理规则页面 |
| `src/pages/assets/` | 公共资产页面 |
| `src/pages/team/` | 团队成员页面 |
| `src/pages/integration/` | 集成说明页面 |
| `src/utils/http.ts` | 前端 HTTP 请求工具 |

## 开发命令

根目录一键启动：

```bash
npm run dev
```

后端单独验证：

```bash
cd sources/backend-nest
npx nest build
```

前端单独验证：

```bash
cd sources/frontend
npm run build
```
