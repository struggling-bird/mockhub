# 快速上手

## 首读路径

1. 阅读 [AGENTS.md](./AGENTS.md)，确认当前工作空间的协作约束。
2. 阅读 [workspace-assets-index.md](./workspace-assets-index.md)，定位文档、skill、配置和源码入口。
3. 阅读 [docs/projects/mockhub/README.md](./docs/projects/mockhub/README.md)，了解 MockHub 项目结构。
4. 根据任务类型按需读取 `skills/_workflow/` 中的流程 skill。

## 常用入口

| 目标 | 入口 |
| --- | --- |
| 查看源码位置 | [workspace-config/code-sources.yaml](./workspace-config/code-sources.yaml) |
| 查看产品与功能定位 | [docs/product-knowledge/mockhub.md](./docs/product-knowledge/mockhub.md) |
| 查看前后端设计资料 | [docs/projects/mockhub/](./docs/projects/mockhub/) |
| 创建任务方案 | [task-plans/TEMPLATE.md](./task-plans/TEMPLATE.md) |
| 任务收口检查 | [task-completion-checklist.md](./task-completion-checklist.md) |

## 开发启动

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
npm run start:dev
```

前端：

```bash
cd sources/frontend
npm run dev
```
