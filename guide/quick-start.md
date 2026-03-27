# 快速开始

## 适用目标

本页面向第一次把 LuckyColor 前后端跑起来的同学，目标是用最短路径完成：

1. 启动 MySQL 与 Redis。
2. 初始化后端数据库和种子数据。
3. 启动后端服务。
4. 启动前端服务。
5. 验证登录、菜单、工作台和系统管理页面是否可用。

## 环境要求

| 项目 | 建议版本 | 说明 |
| --- | --- | --- |
| Node.js | 20+ | 前后端都依赖 |
| pnpm | 8+ | 统一包管理器 |
| MySQL | 8.x | 后端主数据库 |
| Redis | 7.x | 缓存、验证码等能力依赖 |
| Docker | 可选 | 推荐用于本地拉起 MySQL |

## 推荐启动顺序

1. 准备 MySQL 与 Redis。
2. 启动后端并执行数据库初始化。
3. 确认 Swagger 与健康检查可访问。
4. 启动前端。
5. 用默认管理员账号登录并检查系统菜单。

## 第一步：启动依赖服务

### 启动 MySQL

在 `D:\zl\luckyColor-admin-serve` 下执行：

```powershell
docker compose up -d
```

默认会启动：

- MySQL 容器：`luckycolor-admin-mysql`
- 数据库端口：`3306`
- 数据库名：`luckycolor_admin`
- root 密码：`123456`

### 准备 Redis

后端仓库自带的 `docker-compose.yml` 只包含 MySQL，不包含 Redis，所以 Redis 需要单独准备。你可以任选一种方式：

1. 本机直接安装 Redis。
2. 使用自己的 Redis 容器。
3. 连接现成的远程 Redis。

如果 Redis 地址不是默认的 `redis://127.0.0.1:6379`，记得在后端 `.env` 中修改 `REDIS_URL`。

## 第二步：初始化后端

在 `D:\zl\luckyColor-admin-serve` 下执行：

```powershell
pnpm install
Copy-Item .env.example .env
pnpm db:setup
pnpm dev
```

### `db:setup` 做了什么

该脚本会依次执行：

- `pnpm prisma:generate`
- `pnpm prisma:db:push`
- `pnpm prisma:seed`

也就是说，它会生成 Prisma Client、把当前 schema 推送到 MySQL，并写入默认租户、管理员、角色、菜单和字典数据。

### 后端成功启动后可访问

- 接口基地址：`http://127.0.0.1:3001/api`
- Swagger：`http://127.0.0.1:3001/docs`
- 健康检查：`http://127.0.0.1:3001/api/health`

## 第三步：启动前端

在 `D:\zl\luckyColor-admin` 下执行：

```powershell
pnpm install
pnpm dev
```

默认访问地址：

```text
http://127.0.0.1:9900
```

## 默认账号与开发配置

### 默认账号

- 用户名：`admin`
- 密码：`123456`

### 前端开发环境默认配置

前端 `D:\zl\luckyColor-admin\.env.dev` 中已经预设了这些关键项：

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:3001` | 开发环境代理后端 |
| `VITE_API_DOC_URL` | `http://127.0.0.1:3001/docs` | Swagger 页面地址 |
| `VITE_TENANT_ID` | `tenant_001` | 默认租户 ID |
| `VITE_LOGIN_CAPTCHA_ENABLED` | `true` | 登录页启用算术验证码 |
| `VITE_TENANT_ENABLED` | `true` | 开启租户模式 |

### 后端默认环境变量

后端 `.env.example` 中的关键项包括：

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` | 服务端口 |
| `DATABASE_URL` | MySQL 连接串 | 后端主数据库 |
| `JWT_SECRET` | `replace-with-a-strong-secret` | JWT 密钥，生产必须替换 |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis 地址 |
| `SWAGGER_ENABLED` | `true` | 是否启用 Swagger |
| `LOGIN_CAPTCHA_ENABLED` | `true` | 是否启用登录验证码 |
| `TENANT_ENABLED` | `true` | 是否开启租户模式 |
| `TENANT_HEADER` | `x-tenant-id` | 租户 Header 名称 |

## 首次联调检查项

建议按下面顺序验证，而不是一上来就排查整个系统：

1. 访问 `GET /api/health`，确认后端和数据库连通。
2. 打开 Swagger 页面，确认接口文档可正常显示。
3. 打开前端登录页，确认静态资源和 Vite 服务正常。
4. 使用 `admin / 123456` 登录，完成验证码验证。
5. 检查首页工作台是否能加载。
6. 检查“用户管理”“角色管理”“菜单管理”“租户管理”是否能拉取列表。

## 常见启动问题

### `pnpm db:setup` 失败

优先检查：

- MySQL 是否真的启动并监听在 `3306`
- `DATABASE_URL` 是否与实际账号密码一致
- 数据库名 `luckycolor_admin` 是否可访问

### 后端启动后 Swagger 打不开

优先检查：

- `.env` 中 `SWAGGER_ENABLED` 是否为 `true`
- `PORT` 是否被其他程序占用
- 控制台是否有环境变量校验报错，例如 `JWT_SECRET`、`TENANT_HEADER`、`APP_TIME_ZONE`

### 前端页面打开但接口全部 404

优先检查：

- 后端是否运行在 `3001`
- 前端 `VITE_API_PROXY_TARGET` 是否仍指向 `http://127.0.0.1:3001`
- 后端接口是否统一带 `/api` 前缀

### 登录时一直失败

优先检查：

- 是否先完成验证码校验
- 默认管理员是否已被修改
- 当前租户是否正确，前端默认会带 `x-tenant-id: tenant_001`

### 页面刷新后出现 404

这通常不是前端业务问题，而是部署时没有配置 SPA 回退。开发环境不会遇到，生产环境需要在 Nginx 中配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

更多部署类问题可继续查看 [部署排查清单](/deployment/troubleshooting)。
