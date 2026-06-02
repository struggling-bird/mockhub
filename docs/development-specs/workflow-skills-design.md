# Workflow Skill 设计说明

Workflow skill 用于承载跨项目通用的任务阶段门禁、执行流程、验证清单和禁止事项。项目事实和具体实现路径应放在项目文档或项目场景 skill 中，避免把通用流程和 MockHub 业务事实混在一起。

## 当前流程

- `solution-confirmation`：实施前的目标、范围、方案与授权确认。
- `writing-implementation-plan`：将已确认方案拆解为可落档、可验收的节点计划。
- `systematic-debugging`：通过复现、证据和最小修复定位问题。
- `verification-before-completion`：完成陈述前进行新鲜验证。
- `branch-and-worktree-workflow`：确认分支、工作区边界与版本维护门禁。
- `workspace-upgrade`：按需维护工作空间结构与协作资产。
