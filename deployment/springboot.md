# Spring Boot 部署说明

## 这页的定位

这页专门补 Spring Boot 版本的部署口径，解决两个常见问题：

- 当前通用部署文档很多示例最早是按 NestJS 写的，Java 读者容易不知道该替换哪些地方
- Spring Boot 生产部署通常更关心 `Jar`、`systemd`、`prod profile`、`Flyway` 和可写存储目录，而不是 `pnpm start:prod`

如果你只想先看整体部署形态，仍然建议先看 [生产部署方案](/deployment/production)；如果你要落地 Java 版本，再回到本页按步骤执行。

## 什么时候优先选 Spring Boot 部署

以下场景建议优先采用这套方式：

- 当前交付目标是 Java 技术栈
- 前端默认联调目标就是 Spring Boot
- 你希望后端以 `Jar`、`systemd` 或标准 Java 容器方式运行
- 你需要长期维护、运维排查和上线流程都更贴近 Java 项目习惯

## 推荐的生产目录

建议按下面这种方式组织服务器目录：

```text
/srv/luckycolor/
├─ admin/                        前端静态资源
├─ springboot/
│  ├─ app.jar                    Spring Boot 可运行产物
│  ├─ logs/                      应用日志
│  └─ storage/                   文件上传目录
├─ env/
│  └─ luckycolor-springboot.env  环境变量文件
└─ scripts/
   ├─ deploy-springboot.sh
   └─ restart-springboot.sh
```

这样做的好处是：

- 前端与后端产物边界清晰
- 环境变量不和代码或公开目录混放
- 文件上传目录和应用产物分开，便于持久化和备份

## 部署前需要准备什么

### 基础运行时

- JDK 17
- MySQL 8.x
- Redis 7.x
- Nginx

### 关键环境变量

至少确认这些项：

| 变量 | 建议值 | 说明 |
| --- | --- | --- |
| `SPRING_PROFILES_ACTIVE` | `prod` | 启用生产配置 |
| `SERVER_PORT` | `3001` | 应用监听端口 |
| `DB_HOST` | 实际数据库地址 | MySQL 主机 |
| `DB_PORT` | `3306` | MySQL 端口 |
| `DB_NAME` | `luckycolor_admin_sb` | Java 版本数据库 |
| `DB_USERNAME` | 实际账号 | MySQL 用户名 |
| `DB_PASSWORD` | 强密码 | MySQL 密码 |
| `REDIS_HOST` | 实际 Redis 地址 | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `JWT_SECRET` | 强随机值 | JWT 密钥 |
| `FLYWAY_ENABLED` | `true` | 首次部署建议开启迁移 |
| `STORAGE_ROOT_PATH` | `/srv/luckycolor/springboot/storage` | 文件上传目录 |

### 生产 profile 的一个关键点

`src/main/resources/application-prod.yml` 默认关闭了：

- Swagger UI
- OpenAPI docs

这意味着：

- 线上如果你按 `prod` profile 运行，`/api/docs` 默认不会开放
- 如果实施、测试需要临时查看文档，要么用受保护环境开放，要么在测试环境单独打开

## 方案一：Jar + systemd

这是最推荐的 Spring Boot 生产方式。

### 1. 在构建机打包

在 `/Users/admin/code/luckyColor-admin-springboot` 执行：

```powershell
mvnw.cmd clean package
```

默认会生成类似产物：

```text
target/luckycolor-admin-springboot-1.0.0-alpha.1.jar
```

### 2. 上传到服务器

把 Jar 上传到：

```text
/srv/luckycolor/springboot/app.jar
```

### 3. 准备环境变量文件

例如：

```ini
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=luckycolor_admin_sb
DB_USERNAME=luckycolor
DB_PASSWORD=replace-me
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=replace-with-a-strong-secret
FLYWAY_ENABLED=true
TENANT_ENABLED=true
TENANT_HEADER=x-tenant-id
STORAGE_ROOT_PATH=/srv/luckycolor/springboot/storage
```

保存到：`/srv/luckycolor/env/luckycolor-springboot.env`

### 4. 首次手工验证启动

```bash
set -a && source /srv/luckycolor/env/luckycolor-springboot.env && set +a
java -jar /srv/luckycolor/springboot/app.jar
```

先确认这些点：

- `GET /api/health` 正常
- MySQL 迁移成功
- Redis 可连接
- 文件目录可写

### 5. 使用 `systemd` 托管

示例：

```ini
[Unit]
Description=LuckyColor Spring Boot API
After=network.target

[Service]
User=www-data
WorkingDirectory=/srv/luckycolor/springboot
EnvironmentFile=/srv/luckycolor/env/luckycolor-springboot.env
ExecStart=/usr/bin/java -jar /srv/luckycolor/springboot/app.jar
SuccessExitStatus=143
Restart=always
RestartSec=5
StandardOutput=append:/srv/luckycolor/springboot/logs/app.log
StandardError=append:/srv/luckycolor/springboot/logs/app-error.log

[Install]
WantedBy=multi-user.target
```

启用方式：

```bash
sudo systemctl daemon-reload
sudo systemctl enable luckycolor-springboot
sudo systemctl restart luckycolor-springboot
sudo systemctl status luckycolor-springboot
```

## 方案二：Spring Boot 容器化

当前文档仓库里的 `examples/deploy/server.Dockerfile` 和 `docker-compose.prod.yml` 是按 NestJS 写的，不适合直接给 Java 版本复用。

现在文档仓库已经额外补了这些 Spring Boot 示例：

- `examples/deploy/server.springboot.Dockerfile`
- `examples/deploy/docker-compose.springboot.prod.yml`
- `examples/deploy/nginx/default.springboot.conf`
- `examples/deploy/nginx/https.springboot.conf`

其中 `docker-compose.springboot.prod.yml` 为了方便测试和演示，会显式打开 Swagger；如果你要直接拿去做正式生产模板，建议按环境决定是否保留这一项。

如果你想容器化 Spring Boot，推荐单独准备 Java 版 Dockerfile，例如：

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY target/luckycolor-admin-springboot-1.0.0-alpha.1.jar app.jar

EXPOSE 3001
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### Compose 里最关键的服务定义

```yaml
services:
  server:
    image: luckycolor-springboot:latest
    container_name: luckycolor-springboot
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SERVER_PORT: 3001
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: luckycolor_admin_sb
      DB_USERNAME: root
      DB_PASSWORD: 123456
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: replace-with-a-strong-secret
      FLYWAY_ENABLED: "true"
      STORAGE_ROOT_PATH: /data/storage
    volumes:
      - ./data/storage:/data/storage
    depends_on:
      - mysql
      - redis
    ports:
      - "3001:3001"
```

### 容器化时要特别注意的点

- `STORAGE_ROOT_PATH` 必须挂载到宿主机，否则重启后文件会丢失
- 首次启动会跑 Flyway，数据库账号需要有建表权限
- `prod` profile 默认关闭 Swagger，如果你访问 `/api/docs` 发现没有页面，先确认这是不是预期行为

## Nginx 反向代理怎么配

如果线上使用 Spring Boot，通常配置成：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

如果你在非生产环境开放 Swagger，可以再加：

```nginx
location /docs/ {
    proxy_pass http://127.0.0.1:3001/api/docs/;
    proxy_set_header Host $host;
}
```

注意两点：

- Spring Boot 对外文档入口是 `/api/docs`
- 但你给用户暴露 `/docs/` 还是 `/api/docs`，取决于你的 Nginx 路由设计

## 首次上线检查清单

- `SPRING_PROFILES_ACTIVE=prod`
- `JWT_SECRET` 已替换
- `DB_NAME` 指向 `luckycolor_admin_sb`
- `FLYWAY_ENABLED=true` 且迁移执行成功
- `STORAGE_ROOT_PATH` 目录存在且可写
- `GET /api/health` 返回正常
- 前端登录、工作台、用户管理、租户管理能正常打开
- 默认管理员密码已修改
- Swagger 是否开放符合当前环境要求

## 常见问题

### Jar 能启动，但前端全是 401/403

优先检查：

- `JWT_SECRET` 是否和当前签发逻辑一致
- 前端是否真的指向了 Spring Boot
- 租户头 `x-tenant-id` 是否透传到后端
- 当前登录用户和角色权限是否正确

### 服务启动后一直报 Flyway 错误

优先检查：

- 数据库是否已创建 `luckycolor_admin_sb`
- 数据库账号是否有建表和修改表结构权限
- 是否重复把历史表结构和新迁移脚本混在了一起

### 生产环境访问 `/docs` 是空白或 404

优先检查：

- 当前是否运行在 `prod` profile
- `application-prod.yml` 是否关闭了 Swagger
- Nginx 是否把 `/docs/` 反代到了 `/api/docs/`

## 推荐配合阅读

- [Spring Boot 后端说明](/backend/springboot-overview)
- [Spring Boot 后端模块渐进式解读](/backend/springboot-module-walkthrough)
- [Spring Boot 与 NestJS 接口契约对照表](/api/contract-comparison)
- [生产部署方案](/deployment/production)
- [Docker Compose 完整部署](/deployment/docker-compose)
