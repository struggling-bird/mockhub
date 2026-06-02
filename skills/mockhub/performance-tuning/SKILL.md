# 性能调优

## 适用范围

适用于 MockHub 启动速度、构建速度、接口响应、网关代理链路、前端列表渲染和资源体积相关问题。

## 触发条件

- 用户描述启动慢、构建慢、页面卡顿、接口慢或代理慢。
- 用户要求优化前端 bundle、后端查询、网关转发或开发体验。
- 需要组合 `systematic-debugging` 和 `verification-before-completion`。

## 前置输入

- 明确性能问题场景、衡量指标和基线数据。
- 是否有可复现命令、请求样例或页面操作。

## 首读资料

1. `docs/projects/mockhub/source-map.md`
2. `docs/projects/mockhub/development-spec.md`
3. `references/runtime-and-ports.md`
4. 相关前端页面或后端服务代码

## 产物与退出条件

- 性能基线、优化改动、优化后数据和风险说明。
- 构建或运行验证通过。
- 文档或 references 按需同步。

## 工作流程

1. 先测量，不凭感觉优化。
2. 区分启动、构建、接口、数据库、代理、渲染和资源体积问题。
3. 选择最小优化点，避免同时引入多个不可归因改动。
4. 重新测量并记录对比。
5. 执行受影响模块构建验证。

## 验证清单

- 是否有优化前后数据。
- 是否说明测量命令和环境。
- 是否确认没有破坏功能行为。
- 是否运行相关构建或接口探测。

## 禁止事项

1. 不在没有基线时声称性能提升。
2. 不用大重构替代可测量的小优化。
3. 不牺牲接口正确性或可维护性。
4. 不遗漏风险说明。

## 按需资料

- `references/runtime-and-ports.md`
- `docs/projects/mockhub/development-spec.md`
