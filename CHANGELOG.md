# CHANGELOG

## 2026-06-02

### Changed

- 将 MockHub 存量工程整理为 harness 工作空间结构。
- 将后端源码移动到 `sources/backend-nest/`。
- 将前端源码移动到 `sources/frontend/`。
- 将原根目录产品说明沉淀到 `docs/product-knowledge/mockhub.md`。
- 将原后端与前端设计文档迁入 `docs/projects/mockhub/`。
- 建立 MockHub 工作空间入口、源码映射、文档索引、workflow skill 入口和任务完成清单。
- 调整校验脚本为 MockHub 工作空间结构校验。

### Notes

- `sources/` 是当前仓库内真实源码目录，由当前 Git 仓库继续跟踪。
- 工作空间流程说明只描述协作机制，不代表 MockHub 产品功能。
