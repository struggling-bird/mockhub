# 网关调试

## 适用范围

适用于 MockHub `/gateway/*` 网关入口、Mock/Proxy 模式、请求透传、请求体解析、路径匹配和代理转发问题。

## 触发条件

- 用户描述 `/gateway/*` 请求不通、Mock 未命中、代理转发异常或请求体丢失。
- 用户要求调整项目级 `proxyUrl`、接口级 Mock/Proxy 配置或网关行为。
- 需要组合 `systematic-debugging` 和 `backend-bugfix`。

## 前置输入

- 请求 URL、Method、Headers、Body 和期望响应。
- 项目 `mockKey`、项目代理配置、接口 path/method/mockMode。
- 后端启动日志和数据库状态。

## 首读资料

1. `references/api-routing.md`
2. `docs/projects/mockhub/source-map.md`
3. `docs/projects/mockhub/backend-design-nodejs.md`
4. `sources/backend-nest/src/main.ts`
5. `sources/backend-nest/src/gateway/`
6. `sources/backend-nest/src/apis/`
7. `sources/backend-nest/src/projects/`

## 产物与退出条件

- 明确网关失败发生在路由、鉴权、项目查找、接口匹配、Mock 响应还是上游代理。
- 提供最小 curl 或浏览器请求验证。
- 后端构建通过。

## 工作流程

1. 确认 `/gateway/*` 不走 `/api` 前缀。
2. 检查 `main.ts` 的 global prefix exclude 和 gateway body parser。
3. 读取 `gateway.service.ts`，定位项目、接口、mockMode 和 proxyUrl 处理链路。
4. 检查 `apis.service.ts` 和 `projects.service.ts` 的数据映射。
5. 用 curl 构造最小请求验证。
6. 执行 `cd sources/backend-nest && npx nest build`。

## 验证清单

- 是否明确请求路径是否应带 `/api`。
- 是否确认 body parser 是否影响请求体。
- 是否确认 mockKey、项目和接口匹配条件。
- 是否验证 Mock 和 Proxy 至少一个相关路径。

## 禁止事项

1. 不把 `/gateway/*` 错改到 `/api/gateway/*`。
2. 不破坏原始请求体透传能力。
3. 不在未验证请求样例时宣称网关修复。
4. 不忽略 cookie/header rewrite 等项目级配置。

## 按需资料

- `references/api-routing.md`
- `references/runtime-and-ports.md`
