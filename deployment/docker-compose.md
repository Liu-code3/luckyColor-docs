# Docker Compose 完整部署

## 适用场景

这一套方案适合：

- 测试环境
- 演示环境
- 小规模生产环境
- 需要快速交付一整套可运行服务的场景

## 部署组成

完整部署通常包括以下容器：

- `mysql`
- `redis`
- `server`，即 `luckyColor-admin-serve`
- `admin`，即 `luckyColor-admin` 构建后的静态站点
- `nginx`，统一入口和反向代理

## 建议目录

建议把示例文件放在部署仓库或服务器目录中，例如：

```text
/opt/luckycolor-deploy/
├─ docker-compose.prod.yml
├─ .env
├─ docker/
│  ├─ admin.Dockerfile
│  ├─ server.Dockerfile
│  └─ nginx/
│     └─ default.conf
└─ data/
   ├─ mysql/
   ├─ redis/
   └─ logs/
```

## 可复用示例文件

文档项目里已经附带示例配置，仓库内路径如下：

- `examples/deploy/docker-compose.prod.yml`
- `examples/deploy/admin.Dockerfile`
- `examples/deploy/server.Dockerfile`
- `examples/deploy/nginx/default.conf`

## 启动步骤

1. 修改示例配置中的域名、镜像构建上下文、数据库密码和 JWT 密钥。
2. 确保前端仓库与后端仓库路径和 Compose 文件中的构建路径一致。
3. 首次使用前，建议把这些示例文件复制到独立的部署目录后再按环境修改。
4. 在部署目录执行：

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

5. 首次部署完成后进入后端容器执行数据库初始化：

```bash
docker compose -f docker-compose.prod.yml exec server pnpm prisma:generate
docker compose -f docker-compose.prod.yml exec server pnpm prisma:db:push
docker compose -f docker-compose.prod.yml exec server pnpm prisma:seed
```

## 容器职责

| 容器 | 端口 | 说明 |
| --- | --- | --- |
| `mysql` | `3306` | 主数据库 |
| `redis` | `6379` | 缓存服务 |
| `server` | `3001` | NestJS API |
| `admin` | `80` | 前端静态站点 |
| `nginx` | `80/443` | 网关和 HTTPS 入口 |

## 发布建议

- 如果是测试环境，可以把 `admin` 和 `nginx` 合并。
- 如果是正式环境，建议把数据库与 Redis 放到独立托管服务。
- 如果后端扩容到多实例，改由 Nginx 反代多个 `server` 实例。
