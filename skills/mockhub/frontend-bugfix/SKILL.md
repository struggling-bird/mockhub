# 前端 Bug 修复

## 适用范围

适用于 MockHub 前端控制台中的 React、Vite、路由、页面、组件、国际化、HTTP 请求和构建问题。不适用于纯后端服务异常。

## 触发条件

- 用户描述页面显示异常、交互失败、接口请求异常、构建失败或 Vite 启动问题。
- 用户要求修复 `sources/frontend/` 下页面、组件、类型或工具函数。
- 需要组合 `systematic-debugging`、`branch-and-worktree-workflow` 和 `verification-before-completion`。

## 前置输入

- 当前分支和工作区状态。
- 页面路径、操作步骤、浏览器现象或控制台报错。
- 是否涉及后端接口或代理。

## 首读资料

1. `docs/projects/mockhub/source-map.md`
2. `docs/projects/mockhub/development-spec.md`
3. `docs/projects/mockhub/frontend-product-design.md`
4. `references/runtime-and-ports.md`
5. `references/api-routing.md`
6. 与页面对应的 `sources/frontend/src/pages/<domain>/`

## 产物与退出条件

- 明确前端问题根因、修复范围和验证结果。
- `cd sources/frontend && npm run build` 通过。
- 如涉及用户体验或页面状态，提供浏览器验证建议或截图验证结果。

## 工作流程

1. 确认页面路径和复现操作。
2. 定位到页面、组件、context、utils 或 Vite 配置。
3. 若涉及后端接口，确认请求路径是否符合 `/api` 代理和后端路由事实。
4. 优先保持既有组件拆分和多语言方式。
5. 执行 `cd sources/frontend && npm run build`。
6. 必要时运行根目录 `npm run dev`，打开 `http://127.0.0.1:3000` 验证。

## 验证清单

- 是否定位到具体页面或组件。
- 是否确认接口路径和请求工具。
- 是否运行前端构建。
- 是否说明未覆盖的浏览器验证或交互路径。

## 禁止事项

1. 不绕过现有 `LanguageContext` 新增大量硬编码文案。
2. 不把 API 地址散落硬编码到组件中。
3. 不为局部修复重写页面结构。
4. 不在未验证构建时宣称完成。

## 按需资料

- `docs/projects/mockhub/frontend-product-design.md`
- `references/runtime-and-ports.md`
- `references/api-routing.md`
