# 生产部署方案

## 推荐的生产思路

生产环境推荐采用“前端静态资源 + 后端应用服务 + 独立 MySQL + 独立 Redis + Nginx 统一入口”的拆分方式。

如果你当前部署的是 Java 版本，建议配合阅读 [Spring Boot 部署说明](/deployment/springboot)。那一页会把 Jar、`systemd`、`prod profile`、数据库准备方式和 Swagger 暴露策略单独讲清楚。

推荐原因：

- 前端和后端职责清晰，便于独立发布
- Nginx 统一处理 HTTPS、静态资源和反向代理
- 数据库与缓存更容易做持久化与备份
- 后端以后扩容到多实例时更平滑

## 推荐部署结构

```text
/srv/luckycolor/
├─ admin/                 前端构建产物
├─ server/                后端构建产物
├─ env/                   环境变量文件
├─ logs/                  Nginx 与应用日志
└─ scripts/               发布与回滚脚本
```

## 推荐的服务分工

| 组件 | 角色 |
| --- | --- |
| Nginx | 统一域名入口、HTTPS 终止、静态资源服务、接口反代 |
| Admin 静态站点 | 托管前端 `dist` 产物 |
| Server | 运行当前选择的后端 API（Spring Boot 或 NestJS） |
| MySQL | 持久化业务主数据 |
| Redis | 验证码和缓存能力 |

## 前端发布流程

在前端仓库执行：

```powershell
pnpm install
pnpm build
```

然后把产物上传到 Nginx 静态目录，例如：

```text
/srv/luckycolor/admin
```

### 前端发布时重点确认

- `VITE_BUILD_PUBLIC_PATH` 是否和线上访问路径一致
- Nginx 是否为单页应用配置了 `try_files`
- `/api` 和 `/docs` 是否反代到当前后端实现

## 后端发布流程

如果你部署 Spring Boot，请在 `/Users/admin/code/luckyColor-admin-springboot` 执行 `mvnw.cmd clean package` 或 `mvnw.cmd spring-boot:run`；如果你部署 NestJS，则在 `<workspace>/luckyColor-admin-serve` 执行下面这些命令：

### Spring Boot

推荐流程：

1. `./mvnw.cmd clean package`
2. 上传 `target/*.jar`
3. 通过环境变量文件注入 `prod` 配置
4. 使用 `systemd` 或容器运行 `java -jar`

### NestJS

```powershell
pnpm install
pnpm build
```

如果是首次部署，还需要初始化数据库：

```powershell
pnpm db:setup
```

启动方式可以是：

```powershell
pnpm start:prod
```

生产环境建议使用 `systemd` 托管 Spring Boot，使用 `pm2` 或 `systemd` 托管 NestJS，而不是直接在终端里挂着。

## Nginx 反向代理示例

```nginx
server {
    listen 80;
    server_name admin.example.com;

    root /srv/luckycolor/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /docs/ {
        proxy_pass http://127.0.0.1:3001/api/docs/;
        proxy_set_header Host $host;
    }
}
```

上面这段示例默认按 Spring Boot 本地端口 `3001` 编写；如果你线上运行的是 NestJS，请把 `/docs/` 的反代目标改成对应服务的 `/docs/`。

## 生产环境必须替换的默认项

上线前至少要替换：

- MySQL root 密码或业务库账号密码
- Redis 访问密码
- `JWT_SECRET`
- 默认管理员密码
- 默认域名、证书路径和日志路径

如果这些仍然保留默认值，这套系统不适合正式对外提供服务。

## 推荐的上线检查清单

### 基础设施

- MySQL 可连接且已启用持久化
- Redis 可连接且有合理的访问控制
- Nginx 配置已生效
- 域名和 HTTPS 证书已就绪

### 应用

- `/api/health` 返回正常
- `/docs` 是否按预期开放或限制访问
- 前端登录、工作台、用户管理、租户管理可正常访问
- 文件上传目录可写

### 数据与安全

- 默认管理员密码已修改
- `JWT_SECRET` 已更换为强随机值
- 生产 `.env` 不在公开目录
- 应用日志与 Nginx 日志可落盘

## 发布与回滚建议

### 发布建议

- 前端和后端分开打包、分开发布
- 数据库结构变更前先备份
- 有 schema 变化时先执行数据库初始化或迁移，再重启应用

### 回滚建议

最稳妥的回滚点通常有三个：

1. 上一版前端静态资源包
2. 上一版后端构建产物
3. 上线前的数据库备份

如果只回滚代码，不回滚数据结构，容易出现接口和数据库不兼容。

## 进程托管建议

### `pm2`

适合快速管理 Node 进程：

- 支持重启
- 支持日志
- 支持守护

### `systemd`

适合更稳定的服务器运维方式：

- 开机自启
- 统一日志
- 更适合 Linux 生产环境

## 生产环境常见问题

### 前端能打开，但刷新二级路由报 404

原因通常是 Nginx 没有做单页应用回退。

### 后端接口能访问，但上传文件失败

优先检查：

- Nginx 是否限制了上传大小
- 文件目录是否有写权限
- 容器或进程重启后文件是否会丢失

### 登录时偶发租户错误

优先检查：

- 反向代理是否正确透传 Header
- 当前域名是否触发了租户域名匹配
- 是否显式传递了 `x-tenant-id`

## 什么时候考虑升级部署形态

如果出现以下情况，可以考虑从单机生产部署升级为标准三层或多实例架构：

- 并发量明显增加
- 需要灰度发布或多套环境并存
- 文件上传量、日志量显著增加
- 需要数据库主从、高可用 Redis 或独立网关层

下一步可以继续查看 [Docker Compose 完整部署](/deployment/docker-compose)、[Nginx / HTTPS 配置](/deployment/nginx-https) 和 [拓扑建议](/deployment/topologies)。
