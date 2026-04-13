# Docker Compose 完整部署

## 适用场景

这套方案适合：

- 测试环境
- 演示环境
- 小规模生产环境
- 希望用一套编排快速拉起全栈服务的场景

如果你当前重点部署的是 Java 版本，建议同时阅读 [Spring Boot 部署说明](/deployment/springboot)。当前文档仓库里的容器示例文件仍然是按 NestJS 后端编写的。

## 方案包含哪些容器

完整部署通常包括：

- `mysql`
- `redis`
- `server`
- `admin`
- `nginx`

它们在文档仓库中的示例文件分别是：

- `examples/deploy/docker-compose.prod.yml`
- `examples/deploy/server.Dockerfile`
- `examples/deploy/docker-compose.springboot.prod.yml`
- `examples/deploy/server.springboot.Dockerfile`
- `examples/deploy/admin.Dockerfile`
- `examples/deploy/nginx/default.conf`
- `examples/deploy/nginx/https.conf`
- `examples/deploy/nginx/default.springboot.conf`
- `examples/deploy/nginx/https.springboot.conf`

## 建议的部署目录

不要直接在文档仓库根目录运行示例，而是建议复制到独立部署目录，例如：

```text
/opt/luckycolor-deploy/
├─ docker-compose.prod.yml
├─ .env
├─ docker/
│  ├─ admin.Dockerfile
│  ├─ server.Dockerfile
│  └─ nginx/
│     ├─ default.conf
│     └─ https.conf
└─ data/
   ├─ mysql/
   ├─ redis/
   └─ logs/
```

这样做的原因是：

- 示例里有相对路径，直接照抄到其他服务器通常需要调整
- 证书、日志、数据目录通常不适合放在文档仓库里
- 更方便按环境区分测试版和正式版配置

## 示例 Compose 的主要职责

### `mysql`

- 使用 `mysql:8.4`
- 对外暴露 `3306`
- 将数据挂载到宿主机目录

### `redis`

- 使用 `redis:7-alpine`
- 开启 AOF 持久化
- 对外暴露 `6379`

### `server`

- 可以从 NestJS 或 Spring Boot 后端仓库构建镜像
- 当前文档仓库同时提供 Node 版和 Java 版 Dockerfile 示例
- 通过环境变量连接 MySQL 和 Redis
- Spring Boot 示例为了测试方便，额外覆盖了 Swagger 开关

### `admin`

- 从前端仓库构建镜像
- 产出静态站点

### `nginx`

- 作为统一入口
- 转发 `/` 到 `admin`
- 转发 `/api/` 到 `server`
- 转发 `/docs/` 到 Swagger

## 首次部署步骤

### 1. 复制示例文件到部署目录

建议把下面这些文件复制出来再改：

- `docker-compose.prod.yml`
- `docker-compose.springboot.prod.yml`
- `server.Dockerfile`
- `server.springboot.Dockerfile`
- `admin.Dockerfile`
- `default.conf`
- `default.springboot.conf`
- `https.conf`
- `https.springboot.conf`

### 2. 修改关键配置

至少要改这些项：

- MySQL 和 Redis 密码
- `JWT_SECRET`
- 域名
- 证书路径
- 前后端真实仓库的构建上下文路径
- 日志目录和数据目录挂载位置

### 3. 构建并启动容器

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. 首次初始化数据库

如果数据库还是空的，需要进入 `server` 容器执行：

```bash
docker compose -f docker-compose.prod.yml exec server pnpm prisma:generate
docker compose -f docker-compose.prod.yml exec server pnpm prisma:db:push
docker compose -f docker-compose.prod.yml exec server pnpm prisma:seed
```

如果你部署的是 Spring Boot，不需要执行 Prisma 命令，而是要在镜像中运行打包后的 Jar，并依赖 Flyway 在启动时自动迁移数据库。

### 5. 验证入口

- 前端入口：`http://<host>/`
- API：`http://<host>/api`
- Swagger：`http://<host>/docs`

## 需要特别注意的路径问题

NestJS 示例 `docker-compose.prod.yml` 使用了这样的构建上下文：

- `../../../luckyColor-admin`
- `../../../luckyColor-admin-serve`

Spring Boot 示例 `docker-compose.springboot.prod.yml` 也有相同问题，它默认假设部署目录和文档仓库、前端仓库、Spring Boot 后端仓库之间有特定相对关系。实际落地时，这通常不是你服务器上的真实路径，所以必须手动调整。

如果这里不改，最常见的结果就是：

- `docker compose build` 找不到仓库目录
- Nginx 找不到配置文件挂载源
- 镜像能构建，但容器启动后路径不对

## Nginx 示例的作用

### `default.conf`

负责 HTTP 下的统一入口：

- `/` 到 `admin`
- `/api/` 到 `server`
- `/docs/` 到 `server`

### `default.springboot.conf`

职责和 `default.conf` 一样，但 Swagger 反代目标改成了 Spring Boot 的 `/api/docs/`。

### `https.conf`

负责 HTTPS 域名场景，但示例中的证书路径是占位值：

```text
/etc/letsencrypt/live/admin.example.com/fullchain.pem
/etc/letsencrypt/live/admin.example.com/privkey.pem
```

实际部署时必须替换成自己的域名和证书挂载路径。

### `https.springboot.conf`

和 `https.conf` 类似，但默认按 Spring Boot 的 Swagger 地址 `/api/docs/` 编写。

## 容器化部署的优点

- 搭环境更快
- 组件边界更清晰
- 更适合测试环境和演示环境复用
- 与后续迁移到 CI/CD 或容器平台更兼容

## 容器化部署的限制

- 当前示例更接近“可运行样板”，不是完整生产模板
- NestJS 版本数据库迁移和首次初始化仍需要手动执行
- Spring Boot 版本需要你自己补 Java 镜像与 Compose 服务定义
- 文件上传目录、证书管理、日志采集、高可用还需要你自己补齐

## 上线前建议补充

- 为 `server` 增加健康检查
- 为 `mysql` 和 `redis` 增加密码和更严格的网络访问控制
- 明确上传文件目录挂载
- 明确日志采集目录
- 为 Nginx 增加上传大小、超时、缓存、gzip 配置

## 常见问题

### `server` 容器启动后不断退出

优先检查：

- `DATABASE_URL` 是否能连通 `mysql`
- `REDIS_URL` 是否能连通 `redis`
- `JWT_SECRET` 是否为空
- 是否遗漏数据库初始化

### `admin` 能访问，但接口 502

优先检查：

- `server` 容器是否真的启动成功
- Nginx 是否正确代理到 `server:3001`
- 后端是否已经监听 `3001`

### HTTPS 配置后站点打不开

优先检查：

- 域名是否解析到当前服务器
- 证书是否正确挂载进 Nginx 容器
- `https.conf` 的 `server_name` 和证书路径是否已替换

如果你准备直接在服务器手工部署而不是用容器，可以继续查看 [生产部署方案](/deployment/production)。
