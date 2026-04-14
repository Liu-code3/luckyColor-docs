# 快速开始

## 适用目标

本页面向第一次把 LuckyColor 前后端跑起来的同学，目标是用最短路径完成：

1. 启动 MySQL 与 Redis。
2. 选择 Spring Boot 或 NestJS 作为本次联调后端。
3. 初始化后端数据库和种子数据。
4. 启动前端服务。
5. 验证登录、菜单、工作台和系统管理页面是否可用。

## 环境要求

| 项目 | 建议版本 | 说明 |
| --- | --- | --- |
| Node.js | 20+ | 前端与 NestJS 后端依赖 |
| pnpm | 8+ | 前端与 NestJS 包管理器 |
| JDK | 17+ | Spring Boot 后端依赖 |
| Maven | 3.9+ | 可选，推荐直接用 Maven Wrapper |
| MySQL | 8.x | 后端主数据库 |
| Redis | 7.x | 缓存、验证码等能力依赖 |
| Docker | 可选 | 可用于本地拉起 MySQL / Redis |

## 路径约定

本文中的 Spring Boot 项目当前使用真实路径，其余仓库仍使用占位写法：

- `<workspace>/luckyColor-admin`
- `<workspace>/luckyColor-admin-serve`
- `/Users/admin/code/luckyColor-admin-springboot`

执行命令时，请把 `<workspace>` 替换成你自己的代码目录。

## 默认联调口径

本文统一按以下默认配置说明：

- MySQL：`127.0.0.1:3306`
- Redis：`127.0.0.1:6379`
- MySQL 账号：`root`
- MySQL 密码：`123456`

如果你的本机存在额外的个人联调 profile，也建议优先覆盖成这套默认值，避免和文档口径分叉。

如果你在启动前想先核对前端模式、后端端口、数据库名、Redis 地址和默认账号密码，建议先看 [双后端环境变量与默认值对照](/guide/env-alignment)。

## 推荐启动顺序

1. 准备 MySQL 与 Redis。
2. 选择要联调的后端实现。
3. 启动该后端并完成数据库初始化。
4. 确认 Swagger 与健康检查可访问。
5. 启动前端。
6. 用默认管理员账号登录并检查系统菜单。

如果你能登录，但后面碰到“按钮不显示”“按钮显示但接口 403”“前后端权限名对不上”这类问题，直接继续看 [前后端权限码对照](/security/permission-alignment)。

## 第一步：启动依赖服务

### 启动 MySQL 与 Redis

你可以使用本机服务，也可以用容器。只要保证 MySQL 与 Redis 可访问即可。

如果本地已经安装好 MySQL，建议至少准备这两个数据库：

```sql
CREATE DATABASE luckycolor_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE luckycolor_admin_sb DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

- `luckycolor_admin`：给 NestJS 使用
- `luckycolor_admin_sb`：给 Spring Boot 使用

如果你想偷懒快速拉起 MySQL，也可以先在 `<workspace>/luckyColor-admin-serve` 下执行：

```powershell
docker compose up -d
```

默认会启动一个 MySQL 实例：

- MySQL 容器：`luckycolor-admin-mysql`
- 数据库端口：`3306`
- 可直接用于 `luckycolor_admin`，也可以再手工创建 `luckycolor_admin_sb`
- root 密码：`123456`

Redis 需要单独准备，你可以任选一种方式：

1. 本机直接安装 Redis。
2. 使用自己的 Redis 容器。
3. 连接现成的远程 Redis。

默认 Redis 地址可按 `127.0.0.1:6379` 准备。

## 第二步：选择后端实现

| 实现 | 仓库位置 | 默认联调端口 | Swagger 地址 | 适合场景 |
| --- | --- | --- | --- | --- |
| Spring Boot | `/Users/admin/code/luckyColor-admin-springboot` | `3001` | `http://127.0.0.1:3001/api/docs` | 当前默认联调、Java 技术栈交付 |
| NestJS | `<workspace>/luckyColor-admin-serve` | `3002` | `http://127.0.0.1:3002/docs` | 对照历史实现、验证契约兼容 |

如果你只是第一次接手项目，推荐优先跑 Spring Boot；前端当前的 `pnpm dev` 默认也指向 Spring Boot。

## 第三步：初始化并启动后端

### 方案 A：启动 Spring Boot 后端

在 `/Users/admin/code/luckyColor-admin-springboot` 下执行：

```powershell
mvnw.cmd spring-boot:run
```

Spring Boot 默认会使用下面这些本地配置：

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `SERVER_PORT` | `3001` | 服务端口 |
| `DB_NAME` | `luckycolor_admin_sb` | MySQL 数据库名 |
| `DB_USERNAME` | `root` | 数据库账号 |
| `DB_PASSWORD` | `123456` | 数据库密码 |
| `REDIS_HOST` | `127.0.0.1` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `JWT_SECRET` | `replace-with-a-strong-secret-for-luckycolor-admin` | JWT 密钥 |
| `TENANT_HEADER` | `x-tenant-id` | 租户 Header |

Spring Boot 当前使用 MyBatis-Plus 持久层，联调前需要先准备好数据库结构和基础数据。

当前文档统一以 `application.yml` 中的默认值为准，也就是本地 `127.0.0.1:3306` 和 `127.0.0.1:6379`；如果你的个人 `local profile` 指向其他服务器，请在联调前覆盖回默认值，避免和文档口径不一致。

启动成功后可访问：

- 接口基地址：`http://127.0.0.1:3001/api`
- Swagger：`http://127.0.0.1:3001/api/docs`
- OpenAPI JSON：`http://127.0.0.1:3001/api/v3/api-docs`
- 健康检查：`http://127.0.0.1:3001/api/health`

### 方案 B：启动 NestJS 后端

在 `<workspace>/luckyColor-admin-serve` 下执行：

```powershell
pnpm install
Copy-Item .env.example .env
pnpm db:setup
pnpm dev
```

建议把 `.env` 里的 `PORT` 改成 `3002`，这样可以和 Spring Boot 的 `3001` 并存，也和前端 `pnpm dev:nestjs` 的默认代理一致。

### NestJS 的 `db:setup` 做了什么

该脚本会依次执行：

- `pnpm prisma:generate`
- `pnpm prisma:db:push`
- `pnpm prisma:seed`

也就是说，它会生成 Prisma Client、把当前 schema 推送到 MySQL，并写入默认租户、管理员、角色、菜单和字典数据。

NestJS 成功启动后可访问：

- 接口基地址：`http://127.0.0.1:3002/api`
- Swagger：`http://127.0.0.1:3002/docs`
- 健康检查：`http://127.0.0.1:3002/api/health`

## 第四步：启动前端

在 `<workspace>/luckyColor-admin` 下执行：

```powershell
pnpm install
pnpm dev:springboot
```

如果你本次联调的是 NestJS，请改用：

```powershell
pnpm dev:nestjs
```

其中：

- `pnpm dev` 与 `pnpm dev:springboot` 等价，默认代理到 Spring Boot
- `pnpm dev:nestjs` 代理到 NestJS

默认访问地址：

```text
http://127.0.0.1:9900
```

## 默认账号与开发配置

### 默认账号

- 用户名：`admin`
- 密码：`123456`

### 前端多后端联调配置

前端仓库已经内置两套模式配置：

| 文件 | 对应后端 | 关键目标地址 |
| --- | --- | --- |
| `<workspace>/luckyColor-admin/.env.springboot` | Spring Boot | `http://127.0.0.1:3001` |
| `<workspace>/luckyColor-admin/.env.nestjs` | NestJS | `http://127.0.0.1:3002` |

Spring Boot 模式的关键项：

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:3001` | 开发环境代理到 Spring Boot |
| `VITE_API_DOC_URL` | `http://127.0.0.1:3001/api/docs` | Spring Boot Swagger 页面 |
| `VITE_TENANT_ID` | `tenant_001` | 默认租户 ID |

NestJS 模式的关键项：

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:3002` | 开发环境代理到 NestJS |
| `VITE_API_DOC_URL` | `http://127.0.0.1:3002/docs` | NestJS Swagger 页面 |
| `VITE_TENANT_ID` | `tenant_001` | 默认租户 ID |
| `VITE_LOGIN_CAPTCHA_ENABLED` | `true` | 登录页启用算术验证码 |
| `VITE_TENANT_ENABLED` | `true` | 开启租户模式 |

### NestJS 默认环境变量

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

### Spring Boot 默认环境变量

Spring Boot `application.yml` 支持的关键覆盖项包括：

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `SERVER_PORT` | `3001` | 服务端口 |
| `DB_NAME` | `luckycolor_admin_sb` | 后端主数据库 |
| `DB_USERNAME` | `root` | 数据库账号 |
| `DB_PASSWORD` | `123456` | 数据库密码 |
| `REDIS_HOST` | `127.0.0.1` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `JWT_SECRET` | `replace-with-a-strong-secret-for-luckycolor-admin` | JWT 密钥 |
| `FLYWAY_ENABLED` | `true` | 是否执行迁移脚本 |
| `TENANT_ENABLED` | `true` | 是否开启租户模式 |
| `TENANT_HEADER` | `x-tenant-id` | 租户 Header 名称 |

## 首次联调检查项

建议按下面顺序验证，而不是一上来就排查整个系统：

1. 访问所选后端的 `GET /api/health`，确认服务和数据库连通。
2. 打开对应 Swagger 页面，确认接口文档可正常显示。
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

### Spring Boot 启动时报数据库迁移错误

优先检查：

- `luckycolor_admin_sb` 是否已经创建
- `DB_HOST`、`DB_PORT`、`DB_USERNAME`、`DB_PASSWORD` 是否正确
- 数据库账号是否有建表权限
- `FLYWAY_ENABLED` 是否被错误关闭

### 后端启动后 Swagger 打不开

优先检查：

- 如果是 NestJS：`.env` 中 `SWAGGER_ENABLED` 是否为 `true`
- 如果是 Spring Boot：确认访问的是 `http://127.0.0.1:3001/api/docs`，不是 `/docs`
- `3001` 或 `3002` 是否被其他程序占用
- 控制台是否有环境变量或数据库连接报错

### 前端页面打开但接口全部 404

优先检查：

- 后端是否运行在你当前模式对应的端口
- 前端是否启动了正确的模式：`pnpm dev:springboot` 或 `pnpm dev:nestjs`
- 前端 `VITE_API_PROXY_TARGET` 是否仍指向当前后端地址
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
