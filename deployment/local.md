# 本地部署

## 目标

本地部署的目标不是做正式上线，而是让你在一台机器上稳定完成：

- 前后端启动
- 选择 Spring Boot 或 NestJS 作为后端实现
- 数据库初始化
- 登录验证
- 菜单与系统管理联调
- 交付前基本演示

## 依赖清单

| 依赖 | 建议版本 | 说明 |
| --- | --- | --- |
| Node.js | 20+ | 前端与 NestJS 依赖 |
| pnpm | 8+ | 前端与 NestJS 包管理器 |
| JDK | 17+ | Spring Boot 依赖 |
| MySQL | 8.x | 主数据库 |
| Redis | 7.x | 缓存与验证码依赖 |
| Docker | 可选 | 推荐用于启动 MySQL |

## 路径约定

本文中的仓库路径约定如下：

- `<workspace>/luckyColor-admin`
- `<workspace>/luckyColor-admin-serve`
- `/Users/admin/code/luckyColor-admin-springboot`

实际执行时，请替换成你自己的代码目录。

## 默认联调数据库与缓存

文档统一使用下面这套本地默认值：

- MySQL：`127.0.0.1:3306`
- Redis：`127.0.0.1:6379`
- MySQL 账号：`root`
- MySQL 密码：`123456`

## 部署顺序

建议严格按这个顺序，不要跳步：

1. 启动 MySQL
2. 准备 Redis
3. 选择后端实现
4. 初始化并启动后端
5. 启动前端
6. 验证 Swagger、健康检查、登录页和系统页面

## 第一步：启动 MySQL

在后端仓库 `<workspace>/luckyColor-admin-serve` 下执行：

```powershell
docker compose up -d
```

默认配置会创建：

- 容器名：`luckycolor-admin-mysql`
- 端口：`3306`
- 默认数据库：`luckycolor_admin`
- root 密码：`123456`

如果你准备联调 Spring Boot，请额外创建：`luckycolor_admin_sb`。

## 第二步：准备 Redis

后端仓库当前自带的 `docker-compose.yml` 只有 MySQL，没有 Redis，所以 Redis 需要自行准备。你可以：

1. 本机安装 Redis
2. 单独拉一个 Redis 容器
3. 使用远程 Redis

如果 Redis 地址不是默认值，记得修改后端 `.env` 中的：

```ini
REDIS_URL="redis://127.0.0.1:6379"
```

## 第三步：选择后端实现

| 实现 | 仓库位置 | 默认联调端口 | 前端模式 |
| --- | --- | --- | --- |
| Spring Boot | `/Users/admin/code/luckyColor-admin-springboot` | `3001` | `pnpm dev` / `pnpm dev:springboot` |
| NestJS | `<workspace>/luckyColor-admin-serve` | `3002` | `pnpm dev:nestjs` |

## 第四步：初始化并启动后端

### Spring Boot

```powershell
mvnw.cmd spring-boot:run
```

启动后优先验证：

- Swagger：`http://127.0.0.1:3001/api/docs`
- 健康检查：`http://127.0.0.1:3001/api/health`

### NestJS

```powershell
pnpm install
Copy-Item .env.example .env
pnpm db:setup
pnpm dev
```

建议把 `.env` 中 `PORT` 改成 `3002`，与 Spring Boot 的 `3001` 区分开。

### 初始化完成后会得到

- 默认租户：`tenant_001`
- 默认管理员：`admin / 123456`
- 默认角色、菜单、部门、字典和租户套餐

### 启动后优先验证

- Swagger：`http://127.0.0.1:3002/docs`
- 健康检查：`http://127.0.0.1:3002/api/health`

## 第五步：启动前端

```powershell
pnpm install
pnpm dev:springboot
```

如果你当前联调的是 NestJS，请执行：

```powershell
pnpm dev:nestjs
```

默认访问地址：

```text
http://127.0.0.1:9900
```

## 第六步：联调验证

建议按下面顺序检查：

1. 打开 Swagger，确认接口文档可访问。
2. 访问前端登录页。
3. 使用 `admin / 123456` 登录。
4. 检查工作台首页是否有统计和公告。
5. 检查“用户管理”“角色管理”“菜单管理”“租户管理”能否正常打开。

## 本地开发时的关键配置

### 前端

`<workspace>/luckyColor-admin` 当前主要通过模式文件切换后端：

- `pnpm dev` 默认等价于 `pnpm dev:springboot`
- `.env.springboot` 指向 `http://127.0.0.1:3001`
- `.env.nestjs` 指向 `http://127.0.0.1:3002`
- `VITE_TENANT_ID=tenant_001`
- `VITE_LOGIN_CAPTCHA_ENABLED=true`
- `VITE_TENANT_ENABLED=true`

### 后端

NestJS `<workspace>/luckyColor-admin-serve/.env` 里至少要确认：

- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- `SWAGGER_ENABLED`
- `TENANT_ENABLED`
- `TENANT_HEADER`

Spring Boot `application.yml` 或环境变量里至少要确认：

- `SERVER_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `REDIS_HOST`
- `JWT_SECRET`
- `TENANT_ENABLED`
- `TENANT_HEADER`

## 常见问题

### 前端能打开，但接口都是 404

检查这几件事：

1. 后端是否真的启动在当前模式对应端口
2. 前端是否启动了正确的模式
3. 前端 `VITE_API_PROXY_TARGET` 是否还是当前后端地址
4. 后端是否统一使用 `/api` 前缀

### `pnpm db:setup` 报数据库连接失败

检查：

- MySQL 是否已启动
- 端口 `3306` 是否被占用
- `DATABASE_URL` 中的账号、密码、库名是否正确

### 后端能启动，但登录时报错

检查：

- Redis 是否可连通
- 验证码是否已先完成校验
- 默认管理员数据是否已写入
- 当前租户是否为 `tenant_001`

### Swagger 打不开

检查：

- 如果是 NestJS：`.env` 中 `SWAGGER_ENABLED=true`
- 如果是 Spring Boot：确认访问路径是 `/api/docs`
- 后端端口是否冲突
- 启动日志里是否有环境变量或数据库初始化报错

### 页面刷新后 404

这是生产部署时常见问题，本地 Vite 开发环境通常不会遇到。原因一般是 Nginx 没有做 SPA 回退，需要配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## 本地部署适合的场景

- 前后端开发联调
- 测试环境预演
- 交付演示准备
- 代码改动后的本机回归验证

如果你已经准备把系统部署到服务器，下一步建议看 [生产部署方案](/deployment/production) 和 [部署排查清单](/deployment/troubleshooting)。
