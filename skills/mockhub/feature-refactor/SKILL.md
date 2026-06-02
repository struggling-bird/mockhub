# 功能重构

## 适用范围

适用于 MockHub 跨模块功能调整、页面重组、后端服务拆分、项目级配置变化和前后端联动重构。

## 触发条件

- 用户要求调整某个功能的产品形态、交互、数据结构或模块边界。
- 任务横跨 `sources/backend-nest/` 与 `sources/frontend/`。
- 需要组合 `solution-confirmation`、`writing-implementation-plan`、`branch-and-worktree-workflow` 和 `verification-before-completion`。

## 前置输入

- 目标功能、当前痛点、非目标范围和验收方式。
- 是否允许改变接口、数据库字段、页面路由或交互流程。

## 首读资料

1. `docs/product-knowledge/mockhub.md`
2. `docs/projects/mockhub/source-map.md`
3. `docs/projects/mockhub/development-spec.md`
4. 相关前端页面和后端模块
5. 对应 references

## 产物与退出条件

- 已确认的方案和实施计划。
- 重构后的代码、文档同步和验证结果。
- 明确遗留项和后续拆分建议。

## 工作流程

1. 先把功能边界拆成产品、接口、数据、前端交互和验证五类影响面。
2. 输出方案并等待确认。
3. 落地实施计划，拆分为可验收节点。
4. 每个节点只处理一个清晰范围，完成后验证并汇报。
5. 所有节点完成后同步文档、references 或项目 skill。

## 验证清单

- 是否明确非目标范围。
- 是否覆盖前端、后端、数据和文档影响面。
- 是否按节点验证。
- 是否更新项目文档或产品知识。

## 禁止事项

1. 不把功能重构做成无边界重写。
2. 不跳过实施计划确认。
3. 不把多个节点混在一起一次性验收。
4. 不忽略用户已有改动。

## 按需资料

- `docs/product-knowledge/mockhub.md`
- `docs/projects/mockhub/frontend-product-design.md`
- `docs/projects/mockhub/backend-design-nodejs.md`
