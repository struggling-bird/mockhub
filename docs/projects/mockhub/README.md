# MockHub 项目入口

MockHub 是一款接口模拟与代理管理系统，核心目标是在 Postman 核心功能基础上，提供团队协作、场景化接口管理和自动化代理能力。

## 源码结构

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 后端服务 | `sources/backend-nest/` | NestJS + Fastify + Prisma 后端服务 |
| 前端控制台 | `sources/frontend/` | React + Vite 前端控制台 |

## 已有设计资料

- [backend-design-nodejs.md](./backend-design-nodejs.md)：后端技术方案与模块划分。
- [frontend-product-design.md](./frontend-product-design.md)：前端产品形态、信息架构和交互设计。
- [source-map.md](./source-map.md)：前后端源码入口与模块说明。
- [development-spec.md](./development-spec.md)：MockHub 开发规范与验证基线。
- [../../product-knowledge/mockhub.md](../../product-knowledge/mockhub.md)：产品定位与核心能力。

## 任务定位建议

- 后端认证、项目、接口、上传、网关相关任务优先进入 `sources/backend-nest/`。
- 前端页面、组件、路由、国际化和交互相关任务优先进入 `sources/frontend/`。
- 产品概念和功能边界先查 `docs/product-knowledge/mockhub.md`。
- 场景化任务先按 [../../../skills/mockhub/README.md](../../../skills/mockhub/README.md) 选择项目 skill。
