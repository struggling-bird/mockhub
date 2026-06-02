# Skills 入口

Skills 分为两类：

| 类型 | 目录结构 | 用途 |
| --- | --- | --- |
| 工作空间流程 skill | `skills/_workflow/<workflow>/SKILL.md` | 承载跨项目通用的阶段门禁、执行流程与验证要求 |
| 项目场景 skill | `skills/<project>/<scene>/SKILL.md` | 承载 MockHub 具体模块、技术栈或任务场景的处理方法 |

## 可用流程 Skill

| 流程 skill | 入口 | 用途 |
| --- | --- | --- |
| `solution-confirmation` | [`skills/_workflow/solution-confirmation/SKILL.md`](./_workflow/solution-confirmation/SKILL.md) | 在任何实施前确认目标、范围、方案与授权 |
| `writing-implementation-plan` | [`skills/_workflow/writing-implementation-plan/SKILL.md`](./_workflow/writing-implementation-plan/SKILL.md) | 将已确认方案拆为落档、可验收的节点计划 |
| `systematic-debugging` | [`skills/_workflow/systematic-debugging/SKILL.md`](./_workflow/systematic-debugging/SKILL.md) | 以复现与证据定位异常根因并验证修复 |
| `verification-before-completion` | [`skills/_workflow/verification-before-completion/SKILL.md`](./_workflow/verification-before-completion/SKILL.md) | 在节点或任务完成陈述前获得新鲜验证证据 |
| `branch-and-worktree-workflow` | [`skills/_workflow/branch-and-worktree-workflow/SKILL.md`](./_workflow/branch-and-worktree-workflow/SKILL.md) | 确认开发分支、工作区边界与版本维护门禁 |
| `workspace-upgrade` | [`skills/_workflow/workspace-upgrade/SKILL.md`](./_workflow/workspace-upgrade/SKILL.md) | 维护工作空间结构、索引和协作资产 |

## 项目场景结构

当前 MockHub 场景 skill：

| 场景 | 入口 |
| --- | --- |
| 后端 Bug 修复 | [`skills/mockhub/backend-bugfix/SKILL.md`](./mockhub/backend-bugfix/SKILL.md) |
| 前端 Bug 修复 | [`skills/mockhub/frontend-bugfix/SKILL.md`](./mockhub/frontend-bugfix/SKILL.md) |
| 网关调试 | [`skills/mockhub/gateway-debugging/SKILL.md`](./mockhub/gateway-debugging/SKILL.md) |
| API 重构 | [`skills/mockhub/api-refactor/SKILL.md`](./mockhub/api-refactor/SKILL.md) |
| 功能重构 | [`skills/mockhub/feature-refactor/SKILL.md`](./mockhub/feature-refactor/SKILL.md) |
| 性能调优 | [`skills/mockhub/performance-tuning/SKILL.md`](./mockhub/performance-tuning/SKILL.md) |

## 流程路由

| 任务类型或阶段 | 优先流程 skill | 项目资料 |
| --- | --- | --- |
| 需求澄清与方案确认 | `solution-confirmation` | `docs/projects/mockhub/README.md` |
| 方案确认后的节点计划 | `writing-implementation-plan` | `task-plans/TEMPLATE.md` |
| Bug 定位与修复 | `solution-confirmation`、`systematic-debugging`、`verification-before-completion` | 后端或前端设计资料与源码 |
| 新功能、重构、性能或安全改造 | `solution-confirmation`、`writing-implementation-plan`、`verification-before-completion` | 对应项目资料 |
| 进入代码修改阶段 | `branch-and-worktree-workflow` | `workspace-config/code-sources.yaml` |
| 节点汇报与整体收口 | `verification-before-completion` | `task-completion-checklist.md` |
| 工作空间资产维护 | `workspace-upgrade` | `workspace-assets-index.md` |
