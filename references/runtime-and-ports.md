# 运行环境与端口

## 本地开发入口

根目录：

```bash
npm run dev
```

默认服务：

| 服务 | 地址 | 说明 |
| --- | --- | --- |
| 前端控制台 | `http://127.0.0.1:3000` | Vite dev server |
| 后端 Swagger | `http://127.0.0.1:4100/docs` | NestJS Swagger 文档 |

## 端口约定

- 后端默认端口：`4100`
- 前端默认端口：`3000`
- 前端 Vite 代理将 `/api` 转发到 `http://localhost:4100`

`scripts/dev.sh` 支持通过环境变量覆盖：

```bash
BACKEND_PORT=4100 FRONTEND_PORT=3000 npm run dev
```

## 依赖安装

```bash
cd sources/backend-nest && npm install
cd sources/frontend && npm install
```

## 常见验证

```bash
curl -I http://127.0.0.1:3000
curl -I http://127.0.0.1:4100/docs
```
