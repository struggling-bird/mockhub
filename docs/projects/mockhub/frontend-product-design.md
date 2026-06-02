## 一、产品概述

MockHub 是一款面向研发与测试团队的接口模拟与代理管理平台，目标是在 Postman 等传统接口调试工具基础上，提供 **更强的团队协作能力、场景化接口管理能力以及自动化代理能力**，贯穿「本地开发 / 联调 / 回归测试」全周期。

当前前端实现了一个基于 Web 的控制台（MockDev Platform），主要覆盖：

- 登录与多语言切换（中英双语）
- 总览看板（Dashboard）
- 接口管理（API Management）
- 代理分组（Proxy Rules）
- 公共资产（Public Assets）
- 项目管理（Projects）
- 团队成员管理（Team Members）

本设计文档聚焦于 **前端可见的产品形态与交互设计**，为后续产品迭代、后端能力落地以及多端扩展（桌面应用 / 浏览器插件）提供统一的产品蓝图。

---

## 二、目标用户与使用场景

### 2.1 目标用户

- **后端工程师**
  - 需要在后端尚未完全实现时，对外暴露稳定的 Mock 接口。
  - 在复杂场景下通过脚本模式模拟各种异常与边界条件。
- **前端工程师 / 移动端工程师**
  - 在后端不可用或不稳定时，依托 Mock 接口独立完成开发与联调。
  - 通过代理模式，将线上真实接口流量导入本地进行调试。
- **测试工程师（QA）**
  - 针对多种业务场景（成功 / 失败 / 超时等）配置可重复使用的接口响应。
  - 与团队共享场景配置，集成到自动化测试流水线。

### 2.2 典型场景

- **场景一：前端先行开发**
  - QA / 后端在 MockHub 中创建一个项目，配置接口定义与 Mock 响应。
  - 前端通过统一的 Mock 网关地址接入 Mock 服务，完成开发与联调。
- **场景二：线上问题复现**
  - 通过代理规则，将线上网关请求代理到 MockHub。
  - 利用脚本模式模拟特定的错误响应或慢查询，复现场景，协助排查。
- **场景三：测试场景编排**
  - 测试人员在 MockHub 中维护公共资产（错误码、基础 URL 等）。
  - 针对每个接口维持一个或多个响应脚本，测试用例直接引用这些配置。

---

## 三、信息架构与功能模块

### 3.1 顶层信息架构

当前前端的主要页面结构如下（括号内为前端路由）：

- 登录 / 注册页（`/` 未登录状态）
- 控制台主架构：
  - 侧边导航（`Sidebar`）
  - 顶部导航（语言切换 + 用户信息）
  - 主内容区（基于 `react-router` 切换）
- 功能页：
  - Dashboard（`/`）
  - Project Management（`/projects`）
  - Project Form（`/projects/new`、`/projects/edit/:id`）
  - API Table（`/apis`）
  - Proxy Config（`/proxies`）
  - Public Assets（`/assets`）
  - Team Management（`/team`）

其中「项目管理」和「团队成员」入口已被收纳至左侧底部的「Settings」菜单中，以减少主导航拥挤程度。

### 3.2 侧边导航（Sidebar）

- **模块列表**
  - Dashboard：数据总览与健康状态。
  - Projects：项目管理（通过 Settings 下拉进入）。
  - API Management：接口列表与详情编辑。
  - Proxy Rules：代理分组与策略。
  - Public Assets：公共资产与常量。
  - Team Members：团队成员与权限（通过 Settings 下拉进入）。
  - Analytics：统计视图（目前为占位，暂未实现细节）。
  - Settings：设置入口，展开后包含「项目管理」与「团队成员」二级入口。
- **多语言支持**
  - 所有菜单名称均通过 `LanguageContext` 的 `t(key)` 函数获取中英文文本。

---

## 四、核心功能设计

### 4.1 认证与登录（Auth）

- **登录 / 注册切换**
  - 支持在「登录」与「创建账号」模式之间切换。
  - UI 以单一表单呈现，通过按钮在两种模式间切换，底部有「没有账号？去注册」/「已有账号？去登录」的文案引导。
- **表单字段**
  - 登录模式：邮箱、密码。
  - 注册模式：用户名、公司名、邮箱、密码。
  - 所有字段标签及占位符均提供中英双语。
- **语言切换**
  - 右上角提供 EN / 中文 切换按钮，修改全局语言状态。
- **当前实现说明**
  - 登录逻辑目前是前端模拟（`onLogin` 回调直接进入控制台），真实产品中应接入后端认证（账号体系 / 单点登录）。

### 4.2 总览看板（Dashboard）

Dashboard 用于在项目层面展示 MockHub 的整体运行情况和最近活动。

- **指标卡片**
  - Total APIs：接口总数。
  - Active Proxies：活跃代理数。
  - Team：团队成员数。
  - Requests/hr：每小时请求量。
  - 数据由后端 `/api/dashboard/summary` 提供；当前 Team 在成员体系落地前按 owner-only 模型返回当前用户计数。
- **最近活动（Recent Activity）**
  - 列表形式展示最近的网关请求日志，包括请求方法、路径、模式、状态码、耗时和发生时间。
  - 当前来源为 `request_logs`，未来可继续扩展操作审计。
- **系统状态（System Status）**
  - 展示 Proxy Engine / Mock Storage / Auth Service 等子系统的运行状况。
  - 使用颜色与标签（OPERATIONAL / LATENCY）区分健康状态。
- **团队小贴士（Team Tip）**
  - 在侧栏以卡片形式展示使用建议，例如「使用 Script Mode 模拟分页或基于时间的 token」。

### 4.3 项目管理（Projects）

#### 4.3.1 项目列表（Project Management）

用于对项目进行集中管理和快速切换。

- **项目卡片**
  - 展示项目名称、简要描述、状态（Active / Archived）、成员数量、Owner、Mock Key。
  - 提供编辑入口（Edit）和更多操作菜单。
- **Mock Key 管理**
  - 每个项目有一个可复制的 Mock Key，用于请求头 `x-mock-key` 认证。
  - 前端提供一键复制按钮。
- **主要操作**
  - 创建项目（`Create Project`）。
  - 加入项目（`Join Project`，用于团队成员加入已有项目）。
  - 进入项目（`Enter`，未来可跳转至项目维度的综合视图）。

#### 4.3.2 项目编辑 / 新建（Project Form）

- **基础信息**
  - 项目名称、描述、Logo、初始成员数。
  - 通过统一的 `SelectableInput` 控件选择成员规模（仅我自己 / 小团队 / 大团队）。
- **代理相关配置**
  - Proxy URL：项目级代理入口地址，用于后端 Proxy Engine。
- **交互**
  - 创建模式：提交后生成 Mock Key 并展示成功页（当前代码中成功页实现预留）。
  - 编辑模式：加载既有数据，修改后提交并返回项目列表。

### 4.4 接口管理（API Management）

API 管理模块是 MockHub 的核心，用于按项目维度管理接口定义及其 Mock 行为。

#### 4.4.1 左侧接口列表 / 树

- **列表模式**
  - 显示所有接口的 Method、Path、Name、最近调用时间。
  - 支持按名称或路径关键字搜索。
- **树形模式**
  - 基于路径层级构建树结构（如 `/api/v1/user/profile` 按 `api` / `v1` / `user` / `profile` 划分）。
  - 支持展开 / 折叠目录，点击叶子节点选中接口。
- **新建接口**
  - 「New Interface」按钮用于新增接口（当前为 UI 占位，后端行为待接入）。

#### 4.4.2 接口详情头部

- 显示接口的状态（Published / Debugged / To Test）与最近更新时间。
- 提供删除、设置、保存修改等操作按钮。

#### 4.4.3 基础信息区域（Basic Information）

- **Interface Name**
  - 接口的人类可读名称。
- **Endpoint Path**
  - Request Method（GET/POST/PUT/DELETE/PATCH/OPTIONS）通过下拉框选择。
  - Path 以 `/api/v1` 为前缀展示，并允许编辑后半部分路径。

#### 4.4.4 响应模式（Response Mode）

- 三种模式：
  - Static Mock：静态 JSON 模式。
  - Dynamic Script：脚本模式。
  - Real Proxy：代理模式。
- 当选择 `Real Proxy` 时，可以通过下拉输入框选择或输入代理目标 URL。

#### 4.4.5 选项卡内容（Tabs）

- Headers：请求头配置展示，包含示例（Content-Type、Authorization、x-mock-key）。
- Request Params：查询参数与请求体 Schema 的结构化定义表格。
- Response Headers：接口响应头示例。
- Response：响应结构 Schema 定义（字段名、类型、是否必填、说明）。
- Mock：
  - 静态 JSON 预览（Static JSON Preview）。
  - 代理模式说明（Proxy Mode Active，提示请求将转发至目标 URL）。
  - 动态脚本代码编辑预览（Dynamic Mock Script），包含示例脚本与「实时执行」标识。

### 4.5 代理规则（Proxy Rules）

Proxy 规则模块用于按分组管理正则路由规则和代理 / Mock 运行模式。

- **代理分组卡片**
  - 分组名称、匹配正则、模式（Mock / Proxy / Hybrid）、是否自动保存、规则数量等信息。
  - 模式标签以颜色区分不同模式。
- **全局代理配置**
  - 展示项目层面的全局代理地址（如 `https://proxy.mockdev.io/p-8821`）。
  - 提供复制 URL、重启代理服务等操作按钮。

### 4.6 公共资产（Public Assets）

用于集中管理跨项目 / 跨接口共享的常量和基础配置。

- **资产列表**
  - 示例包括 Auth Endpoint、User Roles、Error Codes、CDN Base 等。
  - 每条资产包含名称、值、类型（URL / Enum）、类别（Infrastructure / Definitions）。
  - 支持复制资产值。
- **空态引导**
  - 强调「集中管理常量」的价值，鼓励用户维护错误码、基础 URL、共享 Schema 等。

### 4.7 团队管理（Team Members）

用于管理项目协作者及其角色。

- **成员信息**
  - 显示成员昵称首字母头像、姓名、邮箱、角色（Admin/Editor/Viewer）、状态（Active/Inactive）。
- **操作能力**
  - 邀请新成员（Invite Member）。
  - 筛选成员（Filter members…）。
  - 查看总人数统计。

---

## 五、国际化设计（i18n）

前端已通过 `LanguageContext` 实现简易的多语言支持体系：

- **语言范围**
  - 支持 `en` 与 `zh` 两种语言。
- **实现方式**
  - 使用集中式 `translations` 字典管理所有 UI 文本。
  - 通过 `useLanguage()` Hook 在组件中注入 `t(key)` 函数和当前语言状态。
  - 控制台顶部和登录页右上角提供 EN / 中文 切换。
- **覆盖范围**
  - 包括但不限于：菜单名称、页面标题、文案说明、按钮文本、占位符、空态提示、提示标签等。

未来如需支持更多语言，可扩展 `Language` 类型并在 `translations` 中增加对应语言字段。

---

## 六、交互与体验原则

- **一致性**
  - 所有表单、表格、卡片采用统一的排版与间距。
  - Icon 与颜色语义一致，例如绿色代表健康 / 成功，红色代表错误 / 警告。
- **信息分级清晰**
  - Dashboard 用于高层总览，各功能页针对具体实体操作。
  - 侧边导航只展示高频一级模块，次要入口收纳在 Settings 内。
- **即时反馈**
  - Hover、选中状态、按钮交互均有视觉反馈。
  - 复制操作等可在后续增强 toast 提示。
- **可扩展性**
  - API、项目、团队等模块在前端层面按独立页面实现，后续可按需增加更多字段和高级能力（如版本管理、多环境支持）。

---

## 七、与后端设计的对应关系（简要映射）

结合 `docs/backend-design.md` 的后端方案，前端各模块与后端模型/接口的对应关系大致如下：

- **Projects / ProjectManagement / ProjectForm**
  - 对应后端 `projects` 表及相关 CRUD 接口。
  - Mock Key 与 `projects.mock_key` 映射。
- **API Management / ApiTable**
  - 对应 `api_endpoints`、`mock_configs`、`logs_requests` 等表。
  - Three modes（static/script/proxy）与后端 `mode` 字段一致。
- **Proxy Rules / ProxyConfig**
  - 对应 `proxy_groups` 表及其模式字段（Mock / Proxy / Hybrid）。
- **Public Assets**
  - 对应 `public_assets` 或类似共享配置表。
- **Team Management**
  - 对应 `team` / `team_members` 及角色授权模型。
- **Dashboard**
  - 对应聚合统计接口（请求量、接口数量、系统状态等）。

---

## 八、后续迭代建议

1. **接入真实后端 API**
   - 将当前所有 Mock 数据替换为实际接口返回。
   - 衔接后端认证与权限控制。
2. **增强接口版本与环境支持**
   - 为接口与项目增加「环境」（dev / staging / prod）与「版本」维度。
3. **场景管理**
   - 引入「场景」概念，一组接口配置可命名为场景并一键切换。
4. **自动化集成**
   - 提供 CLI 或 API 级能力，用于在 CI 中启停 Mock 服务、切换场景。
5. **审计与协作**
   - 增加操作审计日志、变更记录、项目邀请与成员角色调整 UI。

本设计文档应与后端设计文档一同维护，随产品能力演进持续更新。
