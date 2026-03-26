# 后端说明

## 项目位置

后端项目目录：

```text
D:\zl\luckyColor-admin-serve
```

## 技术选型

- NestJS 10
- TypeScript
- Prisma
- MySQL 8.x
- Redis 7.x
- Swagger / OpenAPI
- Jest

## 环境变量

后端提供了 `.env.example`，核心参数如下：

```ini
PORT=3001
DATABASE_URL="mysql://root:123456@127.0.0.1:3306/luckycolor_admin?charset=utf8mb4"
JWT_SECRET="replace-with-a-strong-secret"
REDIS_URL="redis://127.0.0.1:6379"
SWAGGER_ENABLED="true"
TENANT_ENABLED="true"
TENANT_HEADER="x-tenant-id"
DEFAULT_ADMIN_USERNAME="admin"
DEFAULT_ADMIN_PASSWORD="123456"
APP_TIME_ZONE="+08:00"
```

## 启动方式

```bash
pnpm install
Copy-Item .env.example .env
docker compose up -d
pnpm db:setup
pnpm dev
```

## 对外入口

| 类型 | 地址 |
| --- | --- |
| API 基地址 | `http://127.0.0.1:3001/api` |
| Swagger 文档 | `http://127.0.0.1:3001/docs` |
| 健康检查 | `GET /api/health` |

## 核心脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发模式启动 |
| `pnpm build` | 构建生产产物 |
| `pnpm start:prod` | 启动生产产物 |
| `pnpm db:setup` | 初始化数据库 |
| `pnpm prisma:generate` | 生成 Prisma Client |
| `pnpm prisma:db:push` | 推送 Schema |
| `pnpm prisma:seed` | 导入种子数据 |
| `pnpm verify` | 类型检查加构建 |

## 模块划分

### IAM

- 登录认证
- Token 鉴权
- 动态菜单
- 权限校验

### System

- 用户管理
- 角色管理
- 菜单管理
- 部门管理
- 字典管理
- 配置管理
- 公告管理
- 系统日志

### Tenant

- 租户管理
- 租户套餐

### Platform

- 健康检查
- 仪表盘
- 文件服务
- Swagger
- 代码生成能力

## 开发建议

- 每次改动后优先执行 `pnpm verify`
- 涉及 Prisma Schema 变更时同步更新初始化脚本和文档
- 对外接口说明尽量以 Swagger 为准，并在这里补充业务语义说明
- 部署到生产前，务必替换默认管理员账号密码和 JWT 密钥
