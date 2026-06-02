# MockHub 工作空间资产索引

## 首读入口

1. `QUICKSTART.md`
2. `docs/README.md`
3. `docs/projects/mockhub/README.md`
4. `skills/README.md`
5. `workspace-config/code-sources.yaml`
6. `task-completion-checklist.md`

## 资产分层

| 目录 | 职责 | 默认是否首读 |
| --- | --- | --- |
| `sources/` | MockHub 前后端源码 | 按任务需要 |
| `docs/` | 产品知识、项目说明、架构设计与开发规范 | 是 |
| `skills/` | 工作空间流程与项目场景化执行流程 | 是 |
| `workspace-config/` | 源码映射与工作空间配置事实 | 按需 |
| `references/` | 数据字典、报文、环境等外围事实 | 按需 |
| `scripts/` | 校验与辅助脚本 | 按需 |
| `task-plans/` | 已确认方案与实施计划 | 否 |
| `change-history/` | 已完成任务记录 | 否 |

## 推荐阅读路径

### 全局理解

1. `README.md`
2. `docs/README.md`
3. `docs/product-knowledge/mockhub.md`
4. `docs/projects/mockhub/README.md`
5. `workspace-config/code-sources.yaml`

### 后端任务

1. `docs/projects/mockhub/README.md`
2. `docs/projects/mockhub/source-map.md`
3. `docs/projects/mockhub/development-spec.md`
4. `docs/projects/mockhub/backend-design-nodejs.md`
5. `skills/mockhub/backend-bugfix/SKILL.md`
6. `workspace-config/code-sources.yaml`
7. `sources/backend-nest/`

### 前端任务

1. `docs/projects/mockhub/README.md`
2. `docs/projects/mockhub/source-map.md`
3. `docs/projects/mockhub/development-spec.md`
4. `docs/projects/mockhub/frontend-product-design.md`
5. `skills/mockhub/frontend-bugfix/SKILL.md`
6. `workspace-config/code-sources.yaml`
7. `sources/frontend/`

### 网关任务

1. `skills/mockhub/gateway-debugging/SKILL.md`
2. `references/api-routing.md`
3. `docs/projects/mockhub/source-map.md`
4. `sources/backend-nest/src/gateway/`

### 流程与收口

1. `skills/README.md`
2. `skills/_workflow/<workflow>/SKILL.md`
3. `skills/mockhub/<scene>/SKILL.md`
4. `task-completion-checklist.md`
5. `task-plans/TEMPLATE.md`
6. `change-history/TEMPLATE.md`

## 注意事项

- `sources/` 是当前仓库内的真实源码目录，由当前 Git 仓库继续跟踪。
- `task-plans/` 和 `change-history/` 默认非首读，只有方案推进、历史追溯或复盘沉淀时按需读取。
- 不要把工作空间流程说明误认为 MockHub 产品能力；产品事实以 `docs/product-knowledge/` 和 `docs/projects/mockhub/` 为准。
