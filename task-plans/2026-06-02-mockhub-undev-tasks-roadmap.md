# MockHub 未开发任务梳理与后续开发计划

## 1. 基本信息

- 任务标题：MockHub 未开发任务梳理与后续开发计划
- 日期：2026-06-02
- 项目：MockHub
- 任务类型：planning / roadmap
- 责任范围：梳理当前系统已开发、未开发和半开发能力，形成后续开发优先级与可验收实施节点。
- 对应目录 / 仓库：
  - 工作空间：`/Users/qiang/github/mockhub`
  - 后端源码：`/Users/qiang/github/mockhub/sources/backend-nest`
  - 前端源码：`/Users/qiang/github/mockhub/sources/frontend`

## 2. 目标与背景

- 需求目标：
  - 梳理 MockHub 当前所有未开发任务和功能。
  - 给出后续开发计划。
  - 为后续逐节点开发、验收、提交和资料同步提供统一依据。
- 背景说明：
  - MockHub 当前已有认证、项目、接口、网关、上传和前端控制台基础框架。
  - 产品文档中定义了团队协作、动态脚本 Mock、代理规则、公共资产、统计分析等能力，但源码中存在静态展示、占位或尚未建模的模块。
- 当前现状：
  - 已开发核心闭环：
    - 认证：注册、登录、JWT、本地 token 登录态。
    - 项目管理：项目 CRUD、Mock Key、Logo、项目代理配置。
    - 接口管理：项目接口 CRUD、接口文档字段、Mock 配置、真实代理调试请求。
    - 网关：`/gateway/*` 按 `x-mock-key` 定位项目，支持静态 Mock、真实代理、自动捕获接口。
    - 前端控制台：登录、Dashboard、Projects、API Management、Proxy、Assets、Team、Integration 页面框架。
  - 未开发或半开发能力：
    - 脚本 Mock 引擎。
    - Dashboard 真实统计与活动日志。
    - 公共资产管理后端与前端 CRUD。
    - 团队成员与权限体系。
    - 代理规则分组管理。
    - 多环境管理。
    - 接口版本、场景编排与多响应。
    - 请求日志、回放与审计。
    - Analytics 页面。
    - 前端国际化完整覆盖。
- 分支与工作区状态：
  - 工作空间仓库：`/Users/qiang/github/mockhub`
  - 方案确认时分支：`dev`
  - 方案确认时远端跟踪分支：`origin/dev`
  - 节点 1 实施分支：`codex/mockhub-script-mock-engine`
  - 工作区状态：方案确认前检查为干净工作区；进入节点 1 前存在本任务方案文档与单 Git 仓库规范修正改动，已获用户验收。
  - 涉及的 `sources` 源码目录：
    - `sources/backend-nest`
    - `sources/frontend`
  - Git 跟踪事实：MockHub 当前只有一个 Git 仓库，`sources/backend-nest` 与 `sources/frontend` 是当前工作空间仓库内的源码目录，不是独立 Git 仓库；分支、远端跟踪和工作区状态以工作空间根目录 Git 仓库为准。
- 已知约束：
  - 任何开发实施前必须先确认方案。
  - 方案确认后必须先落地方案与实施计划文档。
  - 实施计划确认不等于方案确认，必须再次获得用户明确确认后才可进入源码或配置修改。
  - 每个实施节点完成后必须回写本文档，等待用户验收。
  - 每个节点经用户验收通过后，必须在当前工作空间 Git 仓库内统一提交并推送本节点相关改动，才能进入下一节点；提交范围需说明是否包含 `sources` 源码目录改动。
  - 涉及源码修改的节点默认需要确认是否切出独立开发分支。
- 不在本次范围：
  - 本文档落地阶段不修改业务源码。
  - 本文档落地阶段不实现任何未开发功能。
  - 不读取或沿用既有 `task-plans/` 历史方案；本任务以当前确认内容为准。

## 3. 方案内容

- 方案结论：
  - 后续开发应先补齐 MockHub 核心 Mock 闭环，再补数据化、协作、规则、环境和分析能力。
  - 推荐优先级为：
    1. 脚本 Mock 引擎。
    2. 请求日志与 Dashboard 数据化。
    3. 公共资产 CRUD。
    4. 团队成员与项目权限。
    5. 代理规则分组。
    6. 多环境与场景编排。
    7. Analytics 与审计增强。
    8. 前端国际化完整覆盖可作为各节点随改随补的横向任务。
- 目标落点：
  - 将产品文档中已定义但当前源码未落地的能力，拆分为可逐步开发、验证和验收的节点。
  - 每个节点形成独立交付边界，避免一次性大改导致验收和版本维护失控。
- 涉及模块 / 页面 / 服务：
  - 后端：Auth、Projects、Apis、Gateway、Prisma、未来 Metrics / Assets / Team / ProxyRules / Environments / Audit 模块。
  - 前端：Dashboard、API Management、Proxy Rules、Public Assets、Team Members、Analytics、LanguageContext。
- 涉及目录 / 文件：
  - `sources/backend-nest/prisma/schema.prisma`
  - `sources/backend-nest/src/`
  - `sources/frontend/src/`
  - `docs/product-knowledge/mockhub.md`
  - `docs/projects/mockhub/`
  - `skills/mockhub/`
  - `task-plans/`
  - `change-history/mockhub/`
- 预期影响范围：
  - 后端数据模型、接口、网关行为、权限边界、统计与审计能力。
  - 前端页面从静态展示逐步升级为真实数据驱动。
  - 产品知识、源码说明、开发规范和场景 skill 需随功能落地同步更新。
- 风险点：
  - 脚本执行涉及安全隔离、超时、资源限制和错误处理。
  - 团队权限会改变项目访问边界，需避免破坏现有 owner-only 访问逻辑。
  - 请求日志和 Analytics 可能引入性能与存储成本，需要先定义最小可用数据结构。
  - 多环境与场景编排会影响接口配置模型，需在前置节点稳定后再推进。
- 方案调整规则：
  - 若方案、实施路径、节点拆分、验收方式或优先级发生调整，必须先与用户确认，再同步更新本文档。

## 4. 实施计划

### 4.1 节点总览

| 节点 | 名称 | 状态 | 验收结论 |
| --- | --- | --- | --- |
| 节点 1 | 脚本 Mock 引擎 | 已验收 | 验收通过 |
| 节点 2 | 请求日志与 Dashboard 数据化 | 已验收 | 验收通过 |
| 节点 3 | 公共资产 CRUD | 已验收 | 验收通过 |
| 节点 4 | 团队成员与项目权限 | 已验收 | 验收通过 |
| 节点 5 | 代理规则分组 | 未开始 | 未验收 |
| 节点 6 | 多环境与场景编排 | 未开始 | 未验收 |
| 节点 7 | Analytics 与审计增强 | 未开始 | 未验收 |

状态说明：

- `未开始`：节点尚未启动。
- `进行中`：节点正在实施。
- `已完成`：节点已完成实现和自检，待用户验收。
- `已验收`：节点已获用户明确验收通过。

### 4.2 节点实施明细

#### 节点 1

- 节点名称：脚本 Mock 引擎
- 当前状态：`已验收`
- 目标：
  - 让 `mockMode = script` 的接口在网关中可执行脚本并返回动态响应。
  - 支持基础请求上下文、响应构造、异常返回、超时限制和最小安全隔离。
- 前置条件：
  - 用户明确确认本文档中的实施计划。
  - 已切出独立开发分支：`codex/mockhub-script-mock-engine`。
  - 用户已验收通过“MockHub 单 Git 仓库 sources 规范修正”。
- 实施步骤：
  - 设计脚本执行输入输出契约。
  - 在后端增加脚本执行服务或工具。
  - 接入 `GatewayService` 的 `script` 分支。
  - 前端 API Management 保持或增强脚本编辑与保存能力。
  - 同步更新产品知识、源码说明和相关 skill / reference。
- 验证方式：
  - 后端构建：`cd sources/backend-nest && npx nest build`
  - 前端构建：`cd sources/frontend && npm run build`
  - 手工验证：创建脚本 Mock 接口，通过 `/gateway/*` 携带 `x-mock-key` 请求并获得动态响应。
- 验收标准：
  - 静态 Mock、真实代理、脚本 Mock 三种模式均可区分运行。
  - 脚本错误不会导致服务崩溃，并能返回可理解错误。
  - 脚本执行具备超时保护。
- 验收后版本维护：
  - 工作空间 Git 提交推送：统一提交并推送任务计划、文档、skill、`sources/backend-nest` 与按需 `sources/frontend` 相关改动。
  - `sources` 源码目录改动说明：本节点预计包含 `sources/backend-nest` 改动，按需包含 `sources/frontend` 改动。
  - 远端分支：默认 `origin/dev` 或用户确认后的独立开发分支。
  - 下一步推荐动作：进入“请求日志与 Dashboard 数据化”节点。
- 完成说明：
- 已新增 `sources/backend-nest/src/gateway/script-mock.service.ts`，使用 Node `vm` 实现轻量脚本 Mock 执行服务。
- 已支持 `export default function(req, res) {}`、`module.exports = function(req, res) {}` 和内联脚本包装。
- 已为脚本暴露受限请求上下文、`response.status/header/json/text/body/delay` 响应辅助方法和 `utils.randomInt/now` 工具。
- 已在 `GatewayService` 的 `script` 模式分支接入脚本执行结果，并复用现有 static 响应返回结构。
- 已将全局前缀排除中的网关通配符从旧写法 `gateway/(.*)` 调整为 Nest 11 / path-to-regexp 兼容写法 `gateway{/*path}`，避免 `LegacyRouteConverter` warn 并确保 `/gateway/*` 不进入 `/api` 前缀。
- 已确认 GatewayController 需保留 Fastify 可接受的 `@All('*')`；若改成 `{*path}` 会触发 Fastify `Wildcard must be the last character in the route` 启动错误。
- 已补充网关三层日志：`GatewayIngress`、`GatewayController`、`GatewayService`，用于确认请求是否进入 MockHub、是否命中网关路由、是否进入业务解析和转发。
- 已修复代理转发 body 丢失问题：当 Fastify/Nest 将 JSON body 解析为 object 时，网关会重新序列化为 Buffer 继续转发，避免目标服务报 `Required request body is missing`。
- 已新增 `gateway.body.ts` 与 `gateway.body.spec.ts`，覆盖 Buffer、object、string、empty body 的转发转换和日志描述。
- 已新增 `script-mock.service.spec.ts` 覆盖 JSON 返回、状态码和 headers、文本返回、超时保护、`process/require` 不暴露。
- 已同步更新 `docs/projects/mockhub/backend-design-nodejs.md` 与 `docs/projects/mockhub/source-map.md`。
- 验证结果：
- `cd sources/backend-nest && npm test -- --runInBand gateway.body.spec.ts script-mock.service.spec.ts`：通过，2 个测试套件、10 个测试全部通过。
- `cd sources/backend-nest && npx nest build`：通过。
- `cd sources/frontend && npm run build`：通过。
- `cd sources/backend-nest && PORT=4017 npm run start`：通过，启动日志显示 `Mapped {/gateway/*, ALL} route`，未再出现 `LegacyRouteConverter` warn。
- `curl -i http://127.0.0.1:4017/gateway/health-check`：返回 `401 Missing x-mock-key header`，说明请求已命中网关业务逻辑，不再是路由 404。
- `curl -i -X POST http://127.0.0.1:4017/gateway/api/test -H 'content-type: application/json' -H 'x-mock-key: invalid' --data '{"name":"mockhub"}'`：返回 `401 Invalid mock key`，日志显示 `GatewayIngress` 与 `GatewayController` 均命中，说明带 body 的 POST 请求已进入 MockHub 网关入口；有效 mockKey 下会继续打印 `proxy body ... rawBodyType=... forwardBodyBytes=...`。
- 遗留事项：
- 当前脚本沙箱为轻量 Mock 场景实现，未提供独立进程或 V8 isolate 级别强隔离；后续如要运行高风险不可信脚本，应升级为 `isolated-vm` 或 Worker 进程模型。
- 本节点未做真实数据库 API 创建后的完整脚本 Mock 请求；当前已完成无 `x-mock-key` 的 `/gateway/*` 路由命中验证，完整脚本响应可在用户验收或联调时基于真实项目数据补测。
- 用户验收结论：用户回复“验收通过”，确认节点 1 脚本 Mock 引擎及网关代理修复通过验收。
- 用户验收时间：2026-06-02 17:52:08 CST

#### 节点 2

- 节点名称：请求日志与 Dashboard 数据化
- 当前状态：`已验收`
- 目标：
  - 建立最小请求日志模型。
  - 网关记录请求、响应状态、耗时、模式、接口和项目。
  - Dashboard 接入真实统计接口，替换固定 mock 值。
- 前置条件：
  - 节点 1 已完成并经用户验收，且完成提交推送门禁。
- 实施步骤：
  - 增加请求日志 Prisma 模型与 schema sync。
  - 在网关请求链路写入日志。
  - 增加 Metrics / Dashboard 后端接口。
  - 前端 Dashboard 调用真实接口，处理 loading / empty / error 状态。
  - 同步更新文档。
- 验证方式：
  - 后端构建、前端构建。
  - 通过网关发起请求后，Dashboard 数值和最近活动发生变化。
- 验收标准：
  - Dashboard 不再依赖固定写死统计。
  - 最近活动来源于真实请求或操作记录。
  - 日志写入失败不影响网关主流程。
- 验收后版本维护：
  - 工作空间 Git 提交推送：统一提交并推送计划状态、文档、后端和前端相关改动。
  - `sources` 源码目录改动说明：本节点预计包含 `sources/backend-nest` 与 `sources/frontend` 改动。
  - 远端分支：默认 `origin/dev` 或用户确认后的独立开发分支。
  - 下一步推荐动作：进入“公共资产 CRUD”节点。
- 完成说明：
- 已新增 `RequestLog` Prisma 模型和 `request_logs` schema sync，记录项目、接口、方法、路径、模式、状态码、耗时、错误信息和创建时间。
- 已在 `GatewayService` 的 static、script、proxy、auto-capture 和部分配置错误路径写入请求日志；日志写入失败只打印 warn，不阻断原请求。
- 已新增 `DashboardModule`、`DashboardController`、`DashboardService`，提供 `/api/dashboard/summary`。
- Dashboard summary 返回接口总数、活跃代理数、owner-only 团队计数、最近一小时请求数、最近 5 条网关活动和系统状态。
- 前端 Dashboard 已从固定 mock 数值改为调用 `/api/dashboard/summary`，并提供 loading、error、empty 和真实最近活动展示。
- 已同步 `docs/projects/mockhub/source-map.md` 与 `docs/projects/mockhub/frontend-product-design.md`。
- 验证结果：
- `cd sources/backend-nest && npm test -- --runInBand gateway.body.spec.ts script-mock.service.spec.ts`：通过，2 个测试套件、10 个测试全部通过。
- `cd sources/backend-nest && npx nest build`：通过。
- `cd sources/frontend && npm run build`：通过。
- 遗留事项：
- 当前 Team 指标在团队成员体系未落地前按 owner-only 模型返回 `1`。
- 当前系统状态为后端静态健康枚举，尚未接入真实 Redis/DB/服务健康探测。
- 未做基于真实数据库数据的浏览器端联调截图验证；当前完成判断基于构建、单测和代码路径验证。
- 用户验收结论：用户回复“验收通过”，确认节点 2 请求日志与 Dashboard 数据化通过验收。
- 用户验收时间：2026-06-02 18:17:50 CST

#### 节点 3

- 节点名称：公共资产 CRUD
- 当前状态：`已验收`
- 目标：
  - 将 Public Assets 从静态展示升级为真实数据管理。
  - 支持资产新增、编辑、删除、查询、复制和项目隔离。
- 前置条件：
  - 节点 2 已完成并经用户验收，且完成提交推送门禁。
- 实施步骤：
  - 增加 `PublicAsset` 数据模型。
  - 增加 Assets 后端模块与 REST API。
  - 前端 Assets 页面接入真实接口并补充表单、搜索、空态和错误状态。
  - 同步产品知识与源码说明。
- 用户验收反馈补充：
  - 创建资产表单需完成国际化处理。
  - 公共资产需在产品说明中明确其对 Mock、代理、接口定义和团队协作的实际价值。
  - 请求代理记录可作为后续自动沉淀公共资产的来源，但应采用“自动发现 + 人工确认”的建议池机制，不在当前节点直接静默入库。
- 补充实施计划：
  - 将公共资产新增/编辑表单中的类型名称、按钮、placeholder、校验错误、加载文案、删除确认等硬编码英文迁移到前端国际化字典。
  - 更新公共资产产品说明，明确公共资产与接口 Mock、真实代理、接口定义、团队协作之间的价值闭环。
  - 在方案记录中补充“公共资产建议池”后续增强项：基于代理请求日志识别 base URL、错误码、枚举字段、重复 JSON 结构，经脱敏过滤后生成候选资产，用户确认后转为正式资产。
  - 重新执行前端构建、后端构建、后端专项测试和 `git diff --check`。
- 二次验收反馈补充：
  - 公共资产价值不能只停留在文档层面，需要在 API 管理、Mock 编辑等真实功能中可被使用。
  - 自动沉淀公共资产需要在当前节点落地，而不是仅记录为后续增强方向。
- 二次补充实施计划：
  - API 管理页加载项目公共资产，将 Base URL 资产并入 Proxy 模式代理地址候选。
  - Mock 编辑区域展示项目公共资产引用入口，支持复制错误码、枚举、JSON 配置和文本常量，用于脚本 Mock 或静态 Mock 编辑。
  - 后端 Assets 模块新增公共资产建议接口，基于项目代理地址、接口代理地址和请求日志聚合生成 Base URL、Error Codes、Enum Set 候选资产。
  - 公共资产页新增建议资产区域，展示建议来源、出现次数、置信度，并支持用户确认后写入正式公共资产。
  - 同步产品知识、前端设计和源码说明，重新执行前端构建、后端构建、后端专项测试和 `git diff --check`。
- 三次验收反馈补充：
  - 建议资产能力需进一步加强，不能只识别代理地址、HTTP 状态码和基础 method/mode 枚举。
  - 需要尝试从请求参数、响应结构、静态 Mock JSON、保存后的代理响应中自动识别业务枚举、业务响应码和通用响应结构。
- 三次补充实施计划：
  - 后端建议资产识别扩展到 `project_apis.request_params` 与 `project_apis.response_schema`，识别字段名包含 `status`、`state`、`type`、`role`、`channel`、`mode`、`method`、`code` 等的候选枚举字段。
  - 后端建议资产识别扩展到 `project_apis.mock_static_body`，解析 JSON 后识别 `code`、`status`、`errorCode`、`resultCode` 等业务响应码字段，生成 Error Codes 候选资产。
  - 后端建议资产识别通用响应结构模板，如 `{ code, message, data }`、`{ success, data, error }`、`{ status, message, data }`，生成 JSON Config 候选资产。
  - 建议资产来源信息补充字段路径或结构来源描述，例如 `response.data.status`、`request.query.type`、`mockStaticBody.code`、`response envelope`。
  - 当前节点仍不新增完整代理请求/响应明细采集表；真实流量持续学习仅基于已保存的接口定义、静态 Mock、代理调试保存结果和现有请求日志，避免引入敏感数据存储风险。
  - 同步产品知识、前端设计和源码说明，重新执行前端构建、后端构建、后端专项测试和 `git diff --check`。
- 四次验收反馈补充：
  - 建议资产行式列表适合扫描，但缺少完整详情查看能力。
  - 建议资产需要提供忽略操作，避免用户不接受的建议反复干扰审核。
- 四次补充实施计划：
  - 建议资产列表每行增加查看与忽略操作。
  - 新增建议资产详情侧栏，展示名称、类型、类别、完整值、来源、出现次数、置信度，并提供复制值、加入资产和忽略操作。
  - 忽略建议先采用项目维度 localStorage 持久化，不新增后端表；刷新后已忽略建议不再显示。
  - 同步前端设计与任务计划，重新执行前端构建和 `git diff --check`。
- 五次验收反馈补充：
  - 系统页面中可操作按钮 hover 时应统一显示 pointer，当前多处按钮未遵循该交互规范。
- 五次补充实施计划：
  - 扫描前端 `sources/frontend/src/**/*.tsx` 中的 `<button>` 标签，补齐缺失的 `cursor-pointer`。
  - 对存在禁用态的按钮补充 `disabled:cursor-not-allowed`，避免禁用状态仍表现为可点击。
  - 不调整按钮视觉样式和业务逻辑，仅补齐鼠标交互反馈。
  - 重新执行前端构建和 `git diff --check`。
- 验证方式：
  - 后端构建、前端构建。
  - 手工验证资产 CRUD 与项目隔离。
- 验收标准：
  - 资产数据真实持久化。
  - 不同项目资产互不泄漏。
  - 页面不再使用固定静态数组作为业务数据源。
- 验收后版本维护：
  - 工作空间 Git 提交推送：统一提交并推送计划状态、文档、后端和前端相关改动。
  - `sources` 源码目录改动说明：本节点预计包含 `sources/backend-nest` 与 `sources/frontend` 改动。
  - 远端分支：默认 `origin/dev` 或用户确认后的独立开发分支。
  - 下一步推荐动作：进入“团队成员与项目权限”节点。
- 完成说明：
- 已新增 `PublicAsset` Prisma 模型和 `public_assets` schema sync。
- 已新增 `AssetsModule`、`AssetsController`、`AssetsService`，提供 `/api/projects/:projectId/assets` 的列表、新增、更新和删除接口。
- 后端资产操作先校验项目 owner，确保不同项目和不同用户之间资产不泄漏。
- 资产服务使用 raw SQL 访问 `public_assets`，避免运行时 Prisma Client delegate 未重新生成导致的访问错误。
- 前端 Public Assets 页面已从静态数组替换为真实接口数据，支持搜索、新增、编辑、删除、复制、错误提示和空态展示。
- 新增与编辑资产已按 Base URL、Error Codes、Enum Set、JSON Config、Text Constant 分别提供对应交互，不再使用所有资产共用的统一输入形式。
- Error Codes 支持 code/message 多行结构和增删项；Enum Set 支持枚举项增删；JSON Config 支持 JSON 校验和格式化；Text Constant 支持多行文本。
- 已完成公共资产新增/编辑表单国际化，覆盖类型名称、按钮、placeholder、校验错误、加载文案和删除确认。
- 已补充公共资产产品价值说明，明确其对脚本 Mock、真实代理、接口定义、测试场景和团队协作的复用价值。
- API 管理页已加载项目公共资产，并将 Base URL 资产并入 Proxy 模式代理地址候选。
- Mock 编辑区域已新增公共资产引用入口，支持复制或插入错误码、枚举、JSON 配置和文本常量，用于静态 Mock 或脚本 Mock 编辑。
- 后端 Assets 模块已新增建议资产接口，基于项目代理地址、接口代理地址和请求日志聚合生成 Base URL、Error Codes、Enum Set 候选资产。
- 后端建议资产识别已扩展到接口请求参数、响应结构和静态 Mock JSON，可识别业务枚举字段、业务响应码字段和通用响应结构模板。
- 通用响应结构当前支持 `{ code, message, data }`、`{ success, data, error }`、`{ status, message, data }` 等模板建议。
- 公共资产页已新增建议资产区域，展示建议来源、出现次数、置信度，并支持用户确认后写入正式公共资产。
- 公共资产页已调整为「正式资产 / 建议资产」Tab 布局，默认展示正式资产，避免建议资产过多影响正式资产维护。
- 公共资产页已将正式资产和建议资产展示从大卡片改为紧凑行式列表，降低页面占用并提升批量资产扫描效率。
- 建议资产列表已补充查看和忽略操作；详情侧栏可查看完整取值、类型、类别、来源、出现次数和置信度，并支持复制、加入资产和忽略。
- 建议资产忽略状态当前按项目写入浏览器 localStorage，不新增后端忽略表，刷新后已忽略建议不再显示。
- 已补齐前端页面可操作按钮的 `cursor-pointer` 反馈，并为保存、加入资产等禁用态按钮补充 `disabled:cursor-not-allowed`。
- 已通过脚本扫描确认当前前端带 `className` 的 `<button>` 标签均包含 `cursor-*` 光标类。
- 已同步 `docs/projects/mockhub/source-map.md` 与 `docs/projects/mockhub/frontend-product-design.md`。
- 验证结果：
- `cd sources/backend-nest && npm test -- --runInBand gateway.body.spec.ts script-mock.service.spec.ts`：通过，2 个测试套件、10 个测试全部通过。
- `cd sources/backend-nest && npx nest build`：通过。
- `cd sources/frontend && npm run build`：通过。
- `git diff --check`：通过。
- 遗留事项：
- 未做真实数据库下的浏览器端资产 CRUD 手工验证；当前完成判断基于构建、单测和代码路径验证。
- 后端仍以通用 `type/category/value` 存储资产，不同资产类型的结构化交互由前端负责；后续如需更强约束，可继续把类型和值结构收敛为后端枚举与结构化字段。
- 用户验收结论：用户回复“验收通过”，确认节点 3 公共资产 CRUD、自动沉淀、建议资产详情/忽略和前端按钮 pointer 规范补齐通过验收。
- 用户验收时间：2026-06-03 13:56:15 CST

#### 节点 4

- 节点名称：团队成员与项目权限
- 当前状态：`已验收`
- 方案确认：
  - 用户已确认“节点 4 团队成员与项目权限”方案，进入实施计划落地。
  - 确认时间：2026-06-03。
  - 用户在节点 4 初次验收中明确指出：添加成员不能只支持已注册账号，合法邮箱均应可邀请，未注册账号通过邀请注册后需自动加入团队；页面缺少角色管理相关功能，当前完成度未达到验收标准。
  - 用户已确认“节点 4 邀请链路与角色管理增强”调整方案。
  - 用户在节点 4 二次验收中明确指出：成员管理、邀请管理、角色管理需要按照业务场景拆分页面，而不是堆在一个大而全页面中；页面设计需要体现业务逻辑性。
  - 用户已确认“节点 4 Team 页面按成员管理、邀请管理、角色权限分区”调整方案并继续实施。
  - 用户在节点 4 三次验收中明确指出：被邀请账号注册时，公司名称和邮箱应默认填充且不可编辑，避免邀请注册身份与组织归属产生歧义。
  - 用户已确认“节点 4 被邀请注册邮箱与公司锁定逻辑”补充方案。
  - 用户在节点 4 四次验收中明确指出：角色、权限无法编辑，且目前权限粒度太过粗泛。
  - 用户已确认“节点 4 角色权限可编辑与权限粒度细化”补充方案。
  - 用户在节点 4 五次验收中明确指出：角色本身也应该可编辑；权限维护应取消当前横向平铺矩阵交互，因为该交互不利于后续自定义角色拓展维护。
  - 用户已确认“节点 4 角色可编辑与权限维护交互重构”补充方案。
  - 用户在节点 4 六次验收中明确指出：内置角色信息需要改成中文，避免中文界面中仍显示 Owner/Admin/Editor/Viewer 和英文描述。
  - 用户已确认“节点 4 内置角色中文化”补充方案。
- 目标：
  - 建立项目成员模型、角色和基础权限边界。
  - 将 Team 页面从静态成员列表升级为真实项目成员管理。
  - 将项目访问从 owner-only 扩展为 owner/member 协作访问。
- 前置条件：
  - 节点 3 已完成并经用户验收，且完成提交推送门禁。
  - 当前工作空间仓库分支：`codex/mockhub-script-mock-engine`。
  - 当前远端跟踪分支：`origin/codex/mockhub-script-mock-engine`。
  - 当前工作区状态：干净。
  - 当前任务涉及 `sources/backend-nest` 与 `sources/frontend`，二者均为当前工作空间单 Git 仓库内源码目录。
  - 角色与权限边界：
  - `Owner`：由 `projects.owner_id` 表示，拥有项目、成员、接口、资产的完整管理权限。
  - `Admin`：可管理成员、编辑项目、管理接口和公共资产，但不可删除项目 owner 身份本身。
  - `Editor`：可编辑接口和公共资产，不可管理成员、删除项目。
  - `Viewer`：只读项目、接口、公共资产和团队成员列表。
  - 成员邀请支持任意合法邮箱，不要求邮箱已注册。
  - 已注册用户可通过邀请链接接受邀请后加入项目；未注册用户通过邀请链接注册后自动加入项目。
- 实施步骤：
  - 数据模型与 schema sync：
    - 在 Prisma schema 中新增 `ProjectMember` 模型，字段包含 `id`、`projectId`、`userId`、`role`、`status`、`createdAt`、`updatedAt`。
    - 在 `schema-sync.ts` 中新增 `project_members` 表创建、唯一约束和索引。
    - `Owner` 不强制写入 `project_members` 表，Team 列表以虚拟 owner 成员行返回。
  - 权限服务：
    - 新增项目权限校验能力，支持判断当前用户是 owner、admin、editor、viewer 或非成员。
    - 替换 `projects`、`apis`、`assets` 中的 owner-only 校验。
    - 项目列表返回当前用户 owner 项目和 member 项目。
  - Team 后端模块：
    - 新增 `TeamModule`、controller、service、DTO。
    - 提供 `GET /api/projects/:projectId/members` 查询成员。
    - 提供 `POST /api/projects/:projectId/members` 按邮箱添加已注册用户为成员。
    - 提供 `PUT /api/projects/:projectId/members/:memberId` 调整角色或状态。
    - 提供 `DELETE /api/projects/:projectId/members/:memberId` 移除成员。
  - 邀请链路增强：
    - 新增 `ProjectInvitation` 数据模型与 `project_invitations` schema sync，记录项目、邮箱、角色、token、状态、邀请人、过期时间和接受时间。
    - Team 后端模块新增邀请接口，支持邀请任意合法邮箱，生成邀请 token、邀请链接和邀请消息。
    - Team 后端模块新增邀请列表、复制信息所需数据、撤销邀请接口。
    - 新增邀请详情接口，用于通过 token 查看项目名、邀请邮箱、角色和状态。
    - 新增接受邀请接口；已登录用户接受后加入项目，未注册用户注册完成后自动接受邀请。
    - 注册接口支持可选 invite token，注册成功后自动加入被邀请项目。
  - 权限落地：
    - 非项目成员无法访问项目、接口、公共资产和成员数据。
    - `Viewer` 可读不可写。
    - `Editor` 可管理接口和公共资产。
    - `Admin/Owner` 可管理成员。
  - Dashboard：
    - Dashboard Team 指标从固定 `1` 改为当前可见项目下真实 owner + member 去重计数。
  - 前端 Team 页面：
    - 从静态数组改为调用真实成员接口。
    - 补充 loading、empty、error、搜索、添加成员、角色调整、状态调整或移除交互。
    - 补充中英文国际化文案。
    - 将“添加成员”升级为“邀请成员”，允许输入任意合法邮箱。
    - 邀请成功后自动复制邀请消息和邀请链接，并在页面展示待接受邀请。
    - 待接受邀请支持复制链接和撤销。
    - 增加角色与权限管理区域，展示 Owner/Admin/Editor/Viewer 权限矩阵，不只依赖成员行内角色下拉。
    - 注册页识别 invite token，展示邀请上下文并在注册成功后自动接受邀请。
    - Team 页面改为「成员管理 / 邀请管理 / 角色权限」Tab 分区，默认进入成员管理，避免成员维护、邀请流转和权限认知混在一个大页面中。
  - 被邀请注册锁定逻辑：
    - 邀请详情接口补充返回组织/公司上下文，用于注册页展示被邀请账号将加入的组织归属。
    - 注册页存在 invite token 时，默认填充邀请邮箱和公司名称，并将邮箱、公司名称设为不可编辑。
    - 注册页存在 invite token 时，提交注册仍携带 invite token；后端注册时以邀请 token 中的邮箱和组织上下文为准，不信任前端可篡改的邮箱和公司字段。
    - 已登录用户接受邀请时继续要求当前登录邮箱与邀请邮箱一致，防止跨邮箱接受。
  - 角色权限可编辑与权限粒度细化：
    - 新增项目级角色权限配置存储，支持按项目覆盖 `Admin`、`Editor`、`Viewer` 的权限项；`Owner` 为系统内置全权限，不允许编辑。
    - 权限项粒度拆分为项目、接口、公共资产、团队、角色权限五组：
      - 项目：查看项目、编辑项目、删除项目。
      - 接口：查看接口、新建接口、编辑接口、删除接口、调试/代理请求。
      - 公共资产：查看资产、新增资产、编辑资产、删除资产、接受建议资产、忽略建议资产。
      - 团队：查看成员、邀请成员、编辑成员角色/状态、移除成员、撤销邀请。
      - 角色权限：查看角色权限、编辑角色权限。
    - 后端 `ProjectAccessService` 从角色等级判断升级为权限 key 判断，并保留默认权限模板作为旧项目回退。
    - `projects`、`apis`、`assets`、`team` 相关写操作改为检查具体权限项，而不是只按 `Admin/Editor/Viewer` 粗粒度判断。
    - Team 后端模块新增角色权限查询与保存接口，保存时仅允许 `Owner` 操作，禁止修改 `Owner` 全权限。
    - Team 前端「角色权限」Tab 从静态矩阵升级为可编辑权限表格；Owner 列锁定展示，Admin/Editor/Viewer 列可由 Owner 勾选/取消，非 Owner 只读。
    - 保存角色权限后刷新当前项目成员数据，使页面展示与后端权限边界保持一致。
  - 角色可编辑与权限维护交互重构：
    - 新增项目级角色定义存储，角色从固定枚举升级为项目内可维护资源；默认补齐 `Owner`、`Admin`、`Editor`、`Viewer`。
    - `Owner` 保持系统内置角色，固定全权限，不允许删除，不允许关闭核心权限。
    - `Admin`、`Editor`、`Viewer` 以及后续自定义角色支持编辑名称、描述和权限；支持新增自定义角色、复制现有角色、删除未被成员或待接受邀请引用的自定义角色。
    - 成员和邀请角色选择改为读取当前项目角色列表，不再在前端和后端写死 `Admin`、`Editor`、`Viewer`。
    - 后端权限校验改为通过角色定义的 `roleKey` 或角色 ID 解析权限；已有 `project_members.role` 与 `project_invitations.role` 暂按 role key 兼容。
    - Team 前端「角色权限」Tab 取消横向平铺矩阵，改为左侧角色列表、右侧角色详情和分组权限编辑。
    - 权限维护采用项目、接口、公共资产、团队、角色管理等分组面板或模块化列表；每次只编辑当前选中角色的权限，便于后续自定义角色扩展。
    - 保存当前角色后刷新角色列表、成员角色选项和权限详情，保证成员管理、邀请管理与角色权限配置一致。
  - 内置角色中文化：
    - 后端默认内置角色展示名称和描述改为中文，保留 `roleKey` 不变。
    - `Owner` 展示为“所有者”，描述为“项目所有者，拥有完整访问权限。”
    - `Admin` 展示为“管理员”，描述为“管理项目、成员、接口和公共资产。”
    - `Editor` 展示为“编辑者”，描述为“维护接口和公共资产。”
    - `Viewer` 展示为“查看者”，描述为“仅查看项目资源。”
    - 对已经初始化过的项目，`ensureDefaultRoles` 同步 `system_role = 1` 的内置角色展示信息；不覆盖自定义角色。
  - 文档同步：
    - 更新 `docs/product-knowledge/mockhub.md`、`docs/projects/mockhub/source-map.md`、`docs/projects/mockhub/frontend-product-design.md` 和必要开发规范说明。
- 验证方式：
  - `cd sources/backend-nest && npx nest build`
  - `cd sources/frontend && npm run build`
  - `cd sources/backend-nest && npm test -- --runInBand gateway.body.spec.ts script-mock.service.spec.ts`
  - `git diff --check`
  - 如新增权限单测，则补充执行对应测试文件。
  - 通过代码路径或测试验证 owner/admin/editor/viewer/非成员的访问边界。
- 验收标准：
  - 项目成员可被管理。
  - 非项目成员无法访问项目数据。
  - 角色权限与文档描述一致。
  - 合法邮箱均可被邀请，未注册邮箱可通过邀请注册后自动加入项目。
  - 点击邀请会生成邀请消息和链接，并自动复制。
  - Team 页面具备明确角色管理/权限矩阵，不只提供行内角色下拉。
  - Team 页面按成员管理、邀请管理、角色权限进行功能分区，默认展示成员管理。
  - 待接受邀请可查看、复制和撤销。
  - 被邀请注册时，邮箱和公司名称默认填充且不可编辑。
  - 被邀请注册时，后端以邀请 token 对应邮箱和组织上下文为准，不信任前端篡改后的邮箱或公司字段。
  - 角色权限 Tab 支持查看细粒度权限项，并允许 Owner 编辑 `Admin/Editor/Viewer` 的权限配置。
  - 后端实际访问控制按具体权限项执行，项目、接口、资产、团队和角色权限相关操作不再只依赖粗粒度角色等级。
  - 旧项目没有自定义角色权限配置时，按默认权限模板回退，不破坏已有成员协作能力。
  - 角色权限 Tab 采用角色列表 + 当前角色详情/权限分组编辑交互，不再使用所有角色横向平铺矩阵。
  - Owner 可新增自定义角色、复制角色、编辑角色名称/描述/权限。
  - 未被成员或待接受邀请引用的自定义角色可删除；被引用角色删除时后端应拒绝并提示。
  - 成员管理和邀请管理的角色选项来自项目角色定义，支持自定义角色。
  - 中文界面中内置角色列表和角色详情默认显示中文名称与中文描述，且不改变成员和邀请引用的 `roleKey`。
  - Team 页面不再依赖静态成员数组。
  - Dashboard Team 指标不再固定为 owner-only `1`。
- 验收后版本维护：
  - 工作空间 Git 提交推送：统一提交并推送计划状态、文档、后端和前端相关改动。
  - `sources` 源码目录改动说明：本节点预计包含 `sources/backend-nest` 与 `sources/frontend` 改动。
  - 远端分支：`origin/codex/mockhub-script-mock-engine`。
  - 下一步推荐动作：进入“代理规则分组”节点。
- 完成说明：
- 已完成基础团队成员与项目权限能力：`ProjectMember`、`project_members` schema sync、`ProjectAccessService`、项目/API/资产成员权限校验、Team 基础接口、Dashboard Team 真实计数、Team 页面真实成员列表。
- 初次验收未通过后，已按用户反馈补充邀请链路与角色管理增强。
- 已新增 `ProjectInvitation` Prisma 模型和 `project_invitations` schema sync，记录项目、邮箱、角色、token、状态、邀请人、过期时间和接受时间。
- Team 后端邀请接口已支持任意合法邮箱，不再要求邮箱已注册。
- 邀请成功会生成 invite token、邀请链接和邀请消息，并返回给前端用于自动复制。
- 已新增公开邀请详情接口和登录态接受邀请接口。
- 注册接口已支持可选 invite token，注册成功后自动接受匹配邮箱的项目邀请并加入项目。
- Team 页面已展示待接受邀请列表，支持复制邀请消息和撤销邀请。
- Team 页面已新增角色与权限矩阵，展示 Owner/Admin/Editor/Viewer 对项目管理、成员管理、接口维护、公共资产维护和只读访问的权限边界。
- Team 页面已根据业务场景调整为「成员管理 / 邀请管理 / 角色权限」Tab 分区，避免邀请、成员、权限规则混在单个大页面中。
- 三次验收反馈后，已完成“被邀请注册邮箱与公司锁定逻辑”：邀请详情返回组织/公司上下文；邀请注册页默认填充并锁定邮箱和公司名称；后端注册带 invite token 时以邀请上下文中的邮箱和组织归属为准，不信任前端提交的邮箱和公司字段。
- 四次验收反馈后，已完成“角色权限可编辑与权限粒度细化”：新增 `ProjectRolePermission` 模型和 `project_role_permissions` schema sync；后端权限从角色等级升级为 permission key 校验；Team 角色权限 Tab 支持 Owner 编辑 Admin/Editor/Viewer 的项目、接口、公共资产、团队和角色权限细粒度权限项；Owner 固定全权限不可编辑；旧项目无自定义配置时回退默认权限模板。
- 五次验收反馈后，已完成“角色可编辑与权限维护交互重构”：新增 `ProjectRoleDefinition` 模型和 `project_roles` schema sync；角色从固定枚举升级为项目级可维护资源；默认补齐 Owner/Admin/Editor/Viewer；Owner 固定全权限不可删除；Admin/Editor/Viewer 和自定义角色可编辑名称、描述和权限；成员与邀请角色选项改为读取项目角色定义；Team 角色权限页改为左侧角色列表、右侧当前角色详情与分组权限编辑，不再使用横向平铺矩阵。
- 六次验收反馈后，已完成“内置角色中文化”：内置角色展示名称和描述改为中文；`roleKey` 保持 Owner/Admin/Editor/Viewer 不变；已初始化项目会在默认角色补齐流程中同步 `system_role = 1` 的内置角色展示信息，自定义角色不受影响。
- 验证结果：
- 基础权限实现阶段已验证：`cd sources/backend-nest && npx nest build` 通过。
- 基础权限实现阶段已验证：`cd sources/frontend && npm run build` 通过。
- 基础权限实现阶段已验证：`cd sources/backend-nest && npm test -- --runInBand gateway.body.spec.ts script-mock.service.spec.ts project-access.service.spec.ts` 通过，3 个测试套件、14 个测试全部通过。
- 基础权限实现阶段已验证：`git diff --check` 通过。
- `cd sources/backend-nest && npx nest build`：通过。
- `cd sources/frontend && npm run build`：通过。
- `cd sources/backend-nest && npm test -- --runInBand gateway.body.spec.ts script-mock.service.spec.ts project-access.service.spec.ts team.service.spec.ts`：通过，4 个测试套件、16 个测试全部通过。
- `git diff --check`：通过。
- 二次页面分区调整后，`cd sources/frontend && npm run build`：通过。
- 三次注册锁定补强后，`cd sources/backend-nest && npx nest build`：通过。
- 三次注册锁定补强后，`cd sources/frontend && npm run build`：通过。
- 三次注册锁定补强后，`cd sources/backend-nest && npm test -- --runInBand gateway.body.spec.ts script-mock.service.spec.ts project-access.service.spec.ts team.service.spec.ts`：通过，4 个测试套件、17 个测试全部通过。
- 三次注册锁定补强后，`git diff --check`：通过。
- 受邀请用户注册失败回归修复后，`cd sources/backend-nest && npx nest build`：通过。
- 受邀请用户注册失败回归修复后，`cd sources/backend-nest && npm test -- --runInBand auth.service.spec.ts team.service.spec.ts project-access.service.spec.ts gateway.body.spec.ts script-mock.service.spec.ts`：通过，5 个测试套件、18 个测试全部通过。
- 受邀请用户注册失败回归修复后，`cd sources/frontend && npm run build`：通过。
- 受邀请用户注册失败回归修复后，`git diff --check`：通过。
- 角色权限可编辑与权限粒度细化后，`cd sources/backend-nest && npx nest build`：通过。
- 角色权限可编辑与权限粒度细化后，`cd sources/backend-nest && npm test -- --runInBand auth.service.spec.ts team.service.spec.ts project-access.service.spec.ts gateway.body.spec.ts script-mock.service.spec.ts`：通过，5 个测试套件、21 个测试全部通过。
- 角色权限可编辑与权限粒度细化后，`cd sources/frontend && npm run build`：通过。
- 角色权限可编辑与权限粒度细化后，`git diff --check`：通过。
- 角色可编辑与权限维护交互重构后，`cd sources/backend-nest && npx nest build`：通过。
- 角色可编辑与权限维护交互重构后，`cd sources/backend-nest && npm test -- --runInBand auth.service.spec.ts team.service.spec.ts project-access.service.spec.ts gateway.body.spec.ts script-mock.service.spec.ts`：通过，5 个测试套件、21 个测试全部通过。
- 角色可编辑与权限维护交互重构后，`cd sources/frontend && npm run build`：通过。
- 内置角色中文化后，`cd sources/backend-nest && npx nest build`：通过。
- 内置角色中文化后，`cd sources/frontend && npm run build`：通过。
- 内置角色中文化后，`cd sources/backend-nest && npm test -- --runInBand auth.service.spec.ts team.service.spec.ts project-access.service.spec.ts gateway.body.spec.ts script-mock.service.spec.ts`：通过，5 个测试套件、21 个测试全部通过。
- 内置角色中文化后，`git diff --check`：通过。
- 遗留事项：
- 本节点实现邀请链接和前端复制，不接入真实邮件发送服务。
- 未做真实数据库下的多用户浏览器端邀请注册联调；当前完成判断需基于构建、单测、代码路径与接口实现验证。
- 当前权限模型未接入操作审计；后续 Analytics 与审计增强节点可继续补充成员变更审计。
- 用户验收结论：
- 用户验收结论：验收通过。
- 用户验收时间：
- 用户验收时间：2026-06-04。

#### 节点 5

- 节点名称：代理规则分组
- 当前状态：`未开始`
- 目标：
  - 将 Proxy Rules 从静态展示升级为真实规则分组。
  - 支持正则匹配、模式配置、规则优先级和自动捕获策略。
- 前置条件：
  - 节点 4 已完成并经用户验收，且完成提交推送门禁。
- 实施步骤：
  - 增加 `ProxyGroup` 模型。
  - 增加代理规则后端模块。
  - 网关接入规则匹配和模式决策。
  - 前端 Proxy 页面接入真实接口，支持增删改查。
  - 同步网关设计与开发规范。
- 验证方式：
  - 后端构建、前端构建。
  - 配置不同规则后，通过网关请求验证匹配与模式选择。
- 验收标准：
  - 代理分组真实持久化。
  - 网关能按规则影响 Mock / Proxy 策略。
  - 页面不再依赖 `MOCK_PROXY_GROUPS` 作为业务数据源。
- 验收后版本维护：
  - 工作空间 Git 提交推送：统一提交并推送计划状态、文档、后端和前端相关改动。
  - `sources` 源码目录改动说明：本节点预计包含 `sources/backend-nest` 与 `sources/frontend` 改动。
  - 远端分支：默认 `origin/dev` 或用户确认后的独立开发分支。
  - 下一步推荐动作：进入“多环境与场景编排”节点。
- 完成说明：
- 验证结果：
- 遗留事项：
- 用户验收结论：
- 用户验收时间：

#### 节点 6

- 节点名称：多环境与场景编排
- 当前状态：`未开始`
- 目标：
  - 支持项目下多环境配置。
  - 支持同一接口多响应场景、默认场景和测试场景切换。
- 前置条件：
  - 节点 5 已完成并经用户验收，且完成提交推送门禁。
- 实施步骤：
  - 设计 Environment 与 Mock Scenario 数据模型。
  - 扩展接口 Mock 配置结构。
  - 网关支持按环境和场景选择响应。
  - 前端 API Management 增加场景管理交互。
  - 同步产品与架构文档。
- 验证方式：
  - 后端构建、前端构建。
  - 同一接口配置多个场景后，通过网关选择并验证不同响应。
- 验收标准：
  - 多环境配置可维护。
  - 多场景响应可切换。
  - 既有单响应接口有兼容策略。
- 验收后版本维护：
  - 工作空间 Git 提交推送：统一提交并推送计划状态、文档、后端和前端相关改动。
  - `sources` 源码目录改动说明：本节点预计包含 `sources/backend-nest` 与 `sources/frontend` 改动。
  - 远端分支：默认 `origin/dev` 或用户确认后的独立开发分支。
  - 下一步推荐动作：进入“Analytics 与审计增强”节点。
- 完成说明：
- 验证结果：
- 遗留事项：
- 用户验收结论：
- 用户验收时间：

#### 节点 7

- 节点名称：Analytics 与审计增强
- 当前状态：`未开始`
- 目标：
  - 实现 Analytics 页面。
  - 增强请求趋势、接口热度、失败率、代理耗时和操作审计能力。
- 前置条件：
  - 节点 6 已完成并经用户验收，且完成提交推送门禁。
- 实施步骤：
  - 在请求日志基础上补充聚合统计接口。
  - 设计最小操作审计模型。
  - 实现 Analytics 页面图表、筛选和空态。
  - 同步文档和变更历史。
- 验证方式：
  - 后端构建、前端构建。
  - 通过构造请求数据验证 Analytics 指标展示。
- 验收标准：
  - Analytics 页面不再是占位。
  - 核心指标与请求日志来源一致。
  - 审计记录可追溯关键操作。
- 验收后版本维护：
  - 工作空间 Git 提交推送：统一提交并推送计划状态、文档、变更历史、后端和前端相关改动。
  - `sources` 源码目录改动说明：本节点预计包含 `sources/backend-nest` 与 `sources/frontend` 改动。
  - 远端分支：默认 `origin/dev` 或用户确认后的独立开发分支。
  - 下一步推荐动作：进入最终完成判定、复盘和资料同步确认。
- 完成说明：
- 验证结果：
- 遗留事项：
- 用户验收结论：
- 用户验收时间：

## 5. 验证与验收计划

- 整体验证策略：
  - 每个节点独立实施、独立验证、独立等待用户验收。
  - 每个节点至少执行后端构建和前端构建；涉及页面交互时补充浏览器验证。
  - 涉及数据库模型变更时同步验证 Prisma schema sync 与真实接口行为。
- 关键验证项：
  - 后端构建：`cd sources/backend-nest && npx nest build`
  - 前端构建：`cd sources/frontend && npm run build`
  - 工作空间结构：`python3 scripts/validate_template_layout.py .`
  - 关键用户路径：登录、选择项目、配置接口、通过网关请求、查看页面数据。
- 用户验收方式：
  - 每个节点完成后，由 AI 汇报完成内容、验证结果、遗留风险和验收建议。
  - 用户明确回复验收通过后，才将节点状态更新为 `已验收`，并执行提交推送门禁。
- 不纳入本次验证的内容：
  - 当前方案文档落地阶段不验证具体功能实现。
  - 未进入对应节点前，不提前验证尚未开发能力。

## 6. 用户确认

### 6.1 方案确认

- 用户是否已明确同意该方案：是
- 用户确认原话 / 结论：用户回复“确认”，确认“MockHub 未开发任务梳理与后续开发计划”方案。
- 确认时间：2026-06-02 15:38:54 CST

### 6.2 实施计划确认

- 用户是否已明确同意实施计划：是
- 用户确认原话 / 结论：用户回复“确认”，确认“MockHub 未开发任务梳理与后续开发计划”实施计划。
- 确认时间：2026-06-02 15:38:54 CST 后续对话确认

### 6.3 实施中调整记录

| 日期 | 调整内容 | 调整原因 | 是否已获用户确认 | 文档是否已同步 |
| --- | --- | --- | --- | --- |
| 2026-06-02 | 将 `sources/backend-nest` 与 `sources/frontend` 明确为当前工作空间单 Git 仓库内的源码目录，并修正分支确认、节点提交推送和当前实施计划中的相关表述。 | 用户指出整个工作空间包括 `sources` 只有一个 Git 仓库，不需要分别确认工作空间、前端源码、后端源码分支情况。 | 是，用户回复“验收通过 MockHub 单 Git 仓库 sources 规范修正”。 | 是 |

## 7. 完成判定

- 是否已完成全部实施节点：否
- `task-plans` 文档状态是否已同步到最新：是，当前已同步到实施计划已确认、单 Git 仓库规范修正已验收、节点 1 已验收状态。
- 是否仍存在未完成项 / 风险项：是，节点 2 至节点 7 尚未开始。
- 最终完成结论：节点 1 脚本 Mock 引擎已完成实现、验证和用户验收，待完成节点 1 提交推送门禁后进入节点 2。

## 8. 备注

- 本文档是当前任务的方案与实施计划记录，当前节点 1 已完成实现、验证和用户验收。
- 前端国际化完整覆盖作为横向约束，在后续涉及相关页面的节点中随功能修改同步补齐。
