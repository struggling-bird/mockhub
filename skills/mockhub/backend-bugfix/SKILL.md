# 后端 Bug 修复

## 适用范围

适用于 MockHub 后端服务中的 NestJS、Fastify、Prisma、MariaDB/MySQL、Redis、认证、项目、接口、上传和服务启动问题。不适用于纯前端 UI 或交互问题。

## 触发条件

- 用户描述后端服务启动失败、接口报错、数据库连接异常或 Swagger/API 不可访问。
- 用户要求修复 `sources/backend-nest/` 下的业务逻辑、DTO、Prisma schema 或模块接入问题。
- 需要组合 `systematic-debugging`、`branch-and-worktree-workflow` 和 `verification-before-completion`。

## 前置输入

- 当前分支和工作区状态。
- 后端错误日志、复现命令或失败接口。
- 数据库、Redis、端口和环境变量相关信息。

## 首读资料

1. `docs/projects/mockhub/source-map.md`
2. `docs/projects/mockhub/development-spec.md`
3. `references/runtime-and-ports.md`
4. `references/api-routing.md`
5. `sources/backend-nest/src/app.module.ts`
6. 与故障模块对应的 controller/service/dto

## 产物与退出条件

- 明确根因、修复范围和验证结果。
- 后端构建或复现命令通过。
- 若接口行为或数据结构变化，补充项目文档或 references。

## 工作流程

1. 用最小命令复现问题，优先拿到完整错误栈。
2. 根据错误定位模块：启动入口、模块注入、DTO、Prisma、schema sync、网关或上传。
3. 只修改与根因直接相关的文件。
4. 涉及数据库字段时同步检查 `prisma/schema.prisma`、`src/prisma/schema-sync.ts` 和前端类型。
5. 执行 `cd sources/backend-nest && npx nest build`。
6. 如问题是运行时问题，短暂启动 `npm run start:dev` 或根目录 `npm run dev` 做 HTTP 探测。

## 验证清单

- 是否复现或解释了失败条件。
- 是否有构建或接口探测证据。
- 是否说明数据库、Redis 或外部依赖是否参与问题。
- 是否检查了文档同步需求。

## 禁止事项

1. 不在未定位根因时大范围重构。
2. 不回退用户已有改动。
3. 不把数据库字段只改一端。
4. 不在未验证启动或构建时宣称修复。

## 按需资料

- `references/runtime-and-ports.md`
- `references/api-routing.md`
- `docs/projects/mockhub/backend-design-nodejs.md`
