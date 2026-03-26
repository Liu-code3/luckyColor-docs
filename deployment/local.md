# 本地部署

## 目标

本地部署用于开发、联调和演示，目标是让前后端在一台机器上稳定运行。

## 依赖服务

- MySQL 8.x
- Redis 7.x
- Node.js 20+
- pnpm

## 启动 MySQL

后端仓库已提供 `docker-compose.yml`，可直接在 `D:\zl\luckyColor-admin-serve` 执行：

```bash
docker compose up -d
```

该配置默认创建：

- 容器名：`luckycolor-admin-mysql`
- 端口：`3306`
- 数据库：`luckycolor_admin`
- root 密码：`123456`

## 准备 Redis

Redis 需要自行准备，可以有两种方式：

1. 本地直接安装 Redis。
2. 使用单独的 Redis 容器或远程 Redis 服务。

然后把 `.env` 中的 `REDIS_URL` 改成实际连接地址。

## 部署后端

```bash
cd D:\zl\luckyColor-admin-serve
pnpm install
Copy-Item .env.example .env
pnpm db:setup
pnpm dev
```

## 部署前端

```bash
cd D:\zl\luckyColor-admin
pnpm install
pnpm dev
```

## 验证顺序

1. 打开 `http://127.0.0.1:3001/docs`
2. 打开 `http://127.0.0.1:9900`
3. 使用 `admin / 123456` 登录
4. 检查首页、用户管理、菜单管理、租户管理是否能正常加载

## 常见问题

### 前端能打开，但接口 404

- 检查后端是否启动
- 检查前端代理目标是否仍指向 `http://127.0.0.1:3001`
- 检查后端接口是否统一带 `/api` 前缀

### Swagger 打不开

- 检查 `.env` 中 `SWAGGER_ENABLED` 是否为 `true`
- 检查后端端口是否冲突

### 登录失败

- 检查数据库种子数据是否执行成功
- 检查默认管理员账号是否已被改动
- 检查租户模式是否要求附带 `x-tenant-id`
