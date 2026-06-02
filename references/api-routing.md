# API 与路由事实

## 后端前缀

- 常规业务接口使用 `/api` 全局前缀。
- 网关入口使用 `/gateway/*`，不走 `/api` 前缀。
- Swagger 文档位于 `/docs`。

## 已知模块路由

| 模块 | 路由范围 | 说明 |
| --- | --- | --- |
| Auth | `/api/auth/*` | 注册、登录、当前用户、退出 |
| Projects | `/api/projects/*` | 项目列表、创建、详情、更新、删除 |
| Upload | `/api/upload/*` | Logo 上传、访问和清理 |
| APIs | `/api/projects/:projectId/apis/*` | 项目接口管理与代理请求 |
| Gateway | `/gateway/*` | Mock/Proxy 网关入口 |

## 前端代理

`sources/frontend/vite.config.ts` 将 `/api` 代理到 `http://localhost:4100`。

当前网关 `/gateway/*` 不在 Vite 代理配置中，如前端需要直接调试网关路径，应确认是否需要补充代理规则或直接访问后端地址。
