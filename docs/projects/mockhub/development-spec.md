# MockHub 开发规范

## 通用原则

- 先确认任务范围、涉及模块和当前 Git 状态，再进入实现。
- 修改源码前优先读取 `docs/projects/mockhub/source-map.md` 和对应场景 skill。
- 前后端改动应同步考虑文档更新，避免代码行为和工作空间资料脱节。
- 不把工作空间流程说明当作 MockHub 产品功能；产品事实以 `docs/product-knowledge/mockhub.md` 和项目文档为准。

## 后端规范

- 后端源码位于 `sources/backend-nest/`。
- 模块按 NestJS module/controller/service/dto 组织。
- 业务接口默认走 `/api` 前缀；`/gateway/*` 是网关入口，不走 `/api` 前缀。
- Prisma client 通过 `src/prisma/prisma.service.ts` 创建，启动时会先执行 `ensureDatabaseSchema`。
- 新增字段时应同步关注：
  - `prisma/schema.prisma`
  - `src/prisma/schema-sync.ts`
  - 对应 DTO、service 映射和前端类型
- 涉及数据库连接时注意 MariaDB/MySQL `caching_sha2_password` 鉴权配置，当前运行时连接配置启用了 `allowPublicKeyRetrieval`。

## 前端规范

- 前端源码位于 `sources/frontend/`。
- 页面级代码放在 `src/pages/<domain>/`，跨页面组件放在 `src/components/`。
- 多语言文本优先走 `LanguageContext`，避免新 UI 只写单语言硬编码。
- 访问后端 API 优先复用 `src/utils/http.ts`。
- 项目相关页面的类型集中关注 `src/pages/project/types.ts`。
- UI 改动后至少运行 `npm run build`，并在需要时启动 `npm run dev` 做浏览器验证。

## 验证基线

- 工作空间结构：`python3 scripts/validate_template_layout.py .`
- 一键开发启动：`npm run dev`
- 后端构建：`cd sources/backend-nest && npx nest build`
- 前端构建：`cd sources/frontend && npm run build`

## 文档同步

- 产品能力变化：更新 `docs/product-knowledge/mockhub.md`。
- 源码结构变化：更新 `docs/projects/mockhub/source-map.md`。
- 开发约束变化：更新本文件或对应 `skills/mockhub/` 场景 skill。
- 任务完成并经用户确认后，按需补充 `change-history/`。
