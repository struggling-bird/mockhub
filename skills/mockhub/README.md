# MockHub 项目 Skill

本目录存放 MockHub 项目级场景 skill。使用时应先组合工作空间 workflow skill，再按任务类型读取对应项目场景 skill。

## 场景入口

| 场景 | 入口 | 适用任务 |
| --- | --- | --- |
| 后端 Bug 修复 | [backend-bugfix/SKILL.md](./backend-bugfix/SKILL.md) | NestJS、Prisma、数据库、认证、项目、接口、上传等后端问题 |
| 前端 Bug 修复 | [frontend-bugfix/SKILL.md](./frontend-bugfix/SKILL.md) | React、Vite、页面、组件、路由、国际化、HTTP 调用问题 |
| 网关调试 | [gateway-debugging/SKILL.md](./gateway-debugging/SKILL.md) | `/gateway/*` Mock/Proxy 请求透传、路由匹配、请求体处理问题 |
| API 重构 | [api-refactor/SKILL.md](./api-refactor/SKILL.md) | 后端接口、DTO、前端请求、类型和文档同步 |
| 功能重构 | [feature-refactor/SKILL.md](./feature-refactor/SKILL.md) | 跨前后端功能调整、模块拆分、交互重组 |
| 性能调优 | [performance-tuning/SKILL.md](./performance-tuning/SKILL.md) | 启动、构建、请求、列表渲染、代理链路性能问题 |

## 通用首读

1. `docs/projects/mockhub/README.md`
2. `docs/projects/mockhub/source-map.md`
3. `docs/projects/mockhub/development-spec.md`
4. `workspace-config/code-sources.yaml`
5. 与当前场景对应的 `SKILL.md`
