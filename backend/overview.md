# 后端说明

## 项目位置

后端项目目录：

```text
D:\zl\luckyColor-admin-serve
```

## 后端在整个平台中的职责

LuckyColor 后端不是简单的数据增删改查接口，它承担的是整个平台的“规则中心”角色：

- 校验登录态和验证码
- 解析当前租户上下文
- 判断菜单权限、按钮权限和数据权限
- 提供系统管理、租户管理和平台能力接口
- 负责数据库读写、缓存更新和种子初始化
- 输出 Swagger 文档给前端、测试和交付人员联调

## 技术选型

- NestJS 10
- TypeScript
- Prisma 5
- MySQL 8.x
- Redis 7.x
- Swagger / OpenAPI
- Jest

## 启动入口与对外地址

默认情况下，后端启动后会暴露：

| 类型 | 地址 | 说明 |
| --- | --- | --- |
| API 基地址 | `http://127.0.0.1:3001/api` | 全局前缀固定为 `/api` |
| Swagger | `http://127.0.0.1:3001/docs` | 启用 `SWAGGER_ENABLED=true` 时可访问 |
| 健康检查 | `GET /api/health` | 验证服务和数据库是否可用 |

## 环境变量

后端启动时会对环境变量做严格校验，核心参数如下：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` | 应用监听端口 |
| `DATABASE_URL` | `mysql://root:123456@127.0.0.1:3306/luckycolor_admin?charset=utf8mb4` | MySQL 连接串 |
| `JWT_SECRET` | `replace-with-a-strong-secret` | JWT 密钥，生产必须替换 |
| `JWT_EXPIRES_IN` | `2h` | 登录态有效期 |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis 地址 |
| `SWAGGER_ENABLED` | `true` | 是否启用 Swagger |
| `LOGIN_CAPTCHA_ENABLED` | `true` | 是否启用登录验证码 |
| `TENANT_ENABLED` | `true` | 是否开启租户模式 |
| `TENANT_HEADER` | `x-tenant-id` | 租户 Header 名称 |
| `TENANT_DOMAIN_SUFFIX` | 空 | 按域名识别租户时使用 |
| `DEFAULT_TENANT_ID` | 空 | 无显式租户时的回退租户 |
| `DEFAULT_ADMIN_USERNAME` | `admin` | 种子数据默认管理员 |
| `DEFAULT_ADMIN_PASSWORD` | `123456` | 种子数据默认密码 |
| `APP_TIME_ZONE` | `+08:00` | 应用时区偏移 |

## 启动方式

```powershell
cd D:\zl\luckyColor-admin-serve
pnpm install
Copy-Item .env.example .env
pnpm db:setup
pnpm dev
```

如果只想构建生产产物：

```powershell
pnpm build
pnpm start:prod
```

## 目录结构与职责

```text
luckyColor-admin-serve/
├─ src/main.ts                     应用入口、Swagger、全局过滤器、全局管道
├─ src/app.module.ts               根模块
├─ src/modules/iam/                登录认证、权限、数据权限、安全审计
├─ src/modules/system/             用户、角色、菜单、部门、字典、配置、公告、系统日志
├─ src/modules/tenant/             租户与租户套餐
├─ src/modules/platform/           工作台、文件、偏好、水印、国际化、健康检查、代码生成
├─ src/infra/database/prisma/      Prisma 服务
├─ src/infra/cache/redis/          Redis 服务
├─ src/infra/tenancy/              租户上下文和租户作用域
├─ src/infra/security/             密码哈希和安全工具
├─ src/shared/                     环境校验、异常封装、统一响应、Swagger 装饰器
├─ prisma/                         Schema、seed、初始化脚本
└─ test/                           unit 与 e2e 测试
```

## 模块地图

### IAM

对应目录：

- `src/modules/iam/auth`
- `src/modules/iam/permissions`
- `src/modules/iam/data-scopes`
- `src/modules/iam/security-audit`

主要能力：

- 登录验证码挑战与校验
- 用户登录、退出登录、当前用户资料
- 当前用户访问快照、动态路由树、按钮权限
- 菜单权限、按钮权限和数据权限校验
- 登录与安全审计记录

### System

对应目录：

- `users`
- `roles`
- `menus`
- `departments`
- `dictionary`
- `configs`
- `notices`
- `system-logs`

主要能力：

- 用户分页、详情、导入、导出、角色分配、状态修改、重置密码
- 角色分页、菜单授权、数据权限配置、状态修改
- 菜单树、菜单同步、菜单层级维护
- 部门树与部门维护
- 字典树、字典分页、统一枚举出口、缓存刷新
- 系统配置项维护
- 通知公告维护
- 系统日志留痕

### Tenant

对应目录：

- `tenant-packages`
- `tenants`

主要能力：

- 租户套餐增删改查
- 租户分页、详情、创建、更新
- 创建租户时自动初始化默认管理员、角色、部门、菜单授权和字典数据
- 租户审计日志

### Platform

对应目录：

- `dashboard`
- `file`
- `health`
- `preferences`
- `watermark`
- `i18n`
- `codegen`

主要能力：

- 工作台统计与访问上报
- 文件上传、删除、读取
- 健康检查
- 用户偏好保存
- 水印配置
- 国际化资源查询
- 代码生成元数据维护

## 请求是怎么流过后端的

1. `main.ts` 启动应用并设置 `/api` 前缀。
2. 全局 `ValidationPipe` 先校验 DTO。
3. 控制器进入对应模块。
4. 如需认证，`JwtAuthGuard` 会先校验 Token。
5. 权限装饰器会继续判断菜单权限或按钮权限。
6. 多租户上下文服务解析当前租户。
7. 业务服务通过 Prisma 查询 MySQL，并在必要时使用 Redis。
8. 最终通过统一响应结构返回前端。

## 多租户是怎么落地的

当前租户识别优先级：

1. 请求头 `x-tenant-id`
2. 域名后缀
3. Token
4. 默认租户

对应代码主要在：

- `src/infra/tenancy/tenant-context.middleware.ts`
- `src/infra/tenancy/tenant-context.service.ts`
- `src/infra/tenancy/tenant-prisma-scope.service.ts`

这套设计带来的效果是：

- 平台级接口可以在没有租户上下文时运行
- 租户级接口可以自动限制在当前租户范围内
- 创建租户、切换租户和联调租户都比较清晰

## 数据库与种子初始化

后端依赖 Prisma schema，核心文件是：

```text
D:\zl\luckyColor-admin-serve\prisma\schema.prisma
```

初始化脚本主要包括：

- `prisma/seed.ts`
- `prisma/seed-manifest.ts`
- `prisma/seed-data/*`
- `prisma/upsert-system-menus.ts`

执行 `pnpm db:setup` 后会得到：

- 默认租户：`tenant_001`
- 默认管理员：`admin / 123456`
- 默认角色：`super_admin`、`tenant_admin`、`tenant_member`
- 默认菜单、字典、配置和租户套餐数据

## 权限设计要点

后端的权限不是单层判断，而是多层组合：

1. 登录认证
2. 菜单权限
3. 按钮权限
4. 数据权限
5. 租户边界

对应装饰器主要包括：

- `@RequireMenuPermission(...)`
- `@RequirePlatformMenuPermission(...)`
- `@RequirePermissions(...)`

这意味着即使前端已经隐藏了按钮，后端仍然会再次做权限校验。

## 典型接口分组

| 模块 | 前缀 | 说明 |
| --- | --- | --- |
| 认证中心 | `/api/auth` | 登录、当前用户、菜单、按钮权限 |
| 用户管理 | `/api/users` | 列表、导入导出、重置密码、分配角色 |
| 角色管理 | `/api/roles` | 数据权限、菜单授权 |
| 菜单管理 | `/api/menus` | 树、同步、状态维护 |
| 字典管理 | `/api/dict` | 树、分页、选项、刷新缓存 |
| 租户管理 | `/api/tenants` | 列表、创建、更新、详情 |
| 工作台 | `/api/dashboard` | 概览与访问统计 |
| 文件服务 | `/api/file` | 上传、删除、读取 |

## 测试与质量控制

常用命令：

| 命令 | 说明 |
| --- | --- |
| `pnpm typecheck` | 类型检查 |
| `pnpm build` | 构建 |
| `pnpm verify` | 类型检查 + 构建 |
| `pnpm test` | 所有测试 |
| `pnpm test:unit` | 单元测试 |
| `pnpm test:e2e` | e2e 测试 |

建议在以下场景至少执行一次 `pnpm verify`：

- 修改 DTO 或环境变量
- 修改 Prisma schema
- 修改权限装饰器或 Guard
- 修改租户上下文相关代码

## 部署注意事项

### 本地开发

- 自带 `docker-compose.yml` 只包含 MySQL，不包含 Redis。
- Redis 地址必须手动准备并填写到 `.env`。

### 生产部署

- 生产环境必须替换 `JWT_SECRET`、数据库密码和默认管理员密码。
- `SWAGGER_ENABLED` 建议仅在内网或受保护环境开放。
- 文件上传目录需要考虑持久化。
- 如果后端多实例部署，需要确认文件存储与缓存策略是否一致。

## 后续如果切换为 Java

当前文档已经额外整理了 [切换 Java 时的文档更新点](/backend/java-migration)。如果未来后端从 NestJS 迁移到 Spring Boot 或其他 Java 方案，建议优先按那份清单逐页同步更新，避免只改代码不改文档。

## 如果你想按模块顺着读代码

可以继续阅读 [后端模块渐进式解读](/backend/module-walkthrough)。那一页会按“模块解决什么问题、主要 controller/service 在哪里、关键表是什么、前端对应什么页面、改功能先看哪里”的顺序展开，更适合新人上手和内部讲解。
