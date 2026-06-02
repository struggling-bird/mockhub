# API 重构

## 适用范围

适用于 MockHub 后端接口、DTO、Prisma 字段、前端请求类型、页面数据映射和接口文档的联动调整。

## 触发条件

- 用户要求新增或调整 API 字段、接口路径、响应结构或请求参数。
- 用户要求前后端接口联调、DTO 对齐或数据模型重构。
- 需要组合 `solution-confirmation`、`writing-implementation-plan` 和 `verification-before-completion`。

## 前置输入

- 目标接口、字段、兼容性要求和前端页面使用点。
- 是否需要数据库字段、schema sync 或历史数据兼容。

## 首读资料

1. `docs/projects/mockhub/source-map.md`
2. `docs/projects/mockhub/development-spec.md`
3. `references/api-routing.md`
4. 后端目标 module/controller/service/dto
5. 前端目标页面、类型和 `src/utils/http.ts`

## 产物与退出条件

- 前后端字段、类型、DTO 和文档一致。
- 后端构建和前端构建通过。
- 若影响接口路由或语义，更新 `references/api-routing.md` 或项目文档。

## 工作流程

1. 列出 API 改动影响面：后端 DTO、service、Prisma、前端类型、页面和文档。
2. 先确认方案和实施计划。
3. 按数据流顺序修改：数据库/schema、后端 DTO/service、前端请求/类型、页面展示。
4. 执行后端和前端构建。
5. 按需启动 `npm run dev` 做接口和页面联调。

## 验证清单

- 是否同步了请求 DTO、响应 DTO 和前端类型。
- 是否处理数据库字段和 schema sync。
- 是否运行 `npx nest build` 和 `npm run build`。
- 是否说明兼容性影响。

## 禁止事项

1. 不只改前端或后端一侧。
2. 不让 Prisma schema 和启动时 schema sync 脱节。
3. 不在未确认兼容性时改接口路径。
4. 不遗漏文档同步。

## 按需资料

- `references/api-routing.md`
- `docs/projects/mockhub/development-spec.md`
