# MockHub 工作空间

MockHub 是一款接口模拟与代理管理系统，目标是在 Postman 核心功能基础上，提供更强的团队协作、场景化接口管理与自动化代理能力，帮助开发与测试团队高效完成接口调试、场景模拟和自动化测试。

本仓库采用 harness 工程组织方式：根目录维护协作资产、文档、流程 skill、任务计划和校验脚本；真实前后端源码统一放在 `sources/` 下，并继续由当前 Git 仓库跟踪。

## 源码入口

| 模块 | 路径 | 说明 |
| --- | --- | --- |
| 后端服务 | `sources/backend-nest/` | NestJS + Fastify + Prisma 后端服务 |
| 前端控制台 | `sources/frontend/` | React + Vite 前端控制台 |

## 工作空间入口

- 项目文档：[docs/projects/mockhub/README.md](./docs/projects/mockhub/README.md)
- 产品知识：[docs/product-knowledge/mockhub.md](./docs/product-knowledge/mockhub.md)
- 源码映射：[workspace-config/code-sources.yaml](./workspace-config/code-sources.yaml)
- AI 工作约束：[AGENTS.md](./AGENTS.md)
- 任务完成清单：[task-completion-checklist.md](./task-completion-checklist.md)

## 本地开发

一键启动前后端开发服务：

```bash
npm run dev
```

默认地址：

- 前端控制台：http://127.0.0.1:3000
- 后端文档：http://127.0.0.1:4100/docs

也可以单独启动：

后端：

```bash
cd sources/backend-nest
npm install
npm run start:dev
```

前端：

```bash
cd sources/frontend
npm install
npm run dev
```
