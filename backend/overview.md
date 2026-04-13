# NestJS 后端说明

## 先说明当前项目的后端格局

LuckyColor 现在不是只有一套后端，而是同时维护：

- `NestJS` 实现：仓库 `D:\zl\luckyColor-admin-serve`
- `Spring Boot` 实现：仓库 `D:\zl\luckycolor-admin-springboot`

本页聚焦 NestJS 版本。如果你当前主要使用 Java 技术栈或默认前端联调模式，请优先阅读 [Spring Boot 后端说明](/backend/springboot-overview)。

## 项目位置

NestJS 后端项目目录：

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

单独运行 NestJS 时，默认端口通常仍是 `3001`；但如果你要和 Spring Boot 同时本地联调，建议把 NestJS 的 `PORT` 调整为 `3002`。

按当前前端仓库的双后端联调约定，NestJS 启动后推荐暴露：

| 类型 | 地址 | 说明 |
| --- | --- | --- |
| API 基地址 | `http://127.0.0.1:3002/api` | 双后端联调时推荐使用 `3002` |
| Swagger | `http://127.0.0.1:3002/docs` | 启用 `SWAGGER_ENABLED=true` 时可访问 |
| 健康检查 | `GET /api/health` | 验证服务和数据库是否可用 |

## 环境变量

后端启动时会对环境变量做严格校验，核心参数如下：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` | 单独运行默认端口，双后端联调建议改成 `3002` |
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

如果你要和 Spring Boot 并存联调，记得先把 `.env` 里的 `PORT` 改成 `3002`。

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

## 后端代码组织风格

LuckyColor 后端的组织风格可以概括成一句话：

先按业务域拆模块，再在模块内部按接口层、业务层、数据结构层继续拆开。

### 1. 先按业务域拆，而不是按技术类型平铺

后端没有把所有 `controller` 放一个目录、所有 `service` 放一个目录，而是先拆成：

- `iam`
- `system`
- `tenant`
- `platform`

这样拆的好处是，看到模块名时就已经知道它在解决哪一类业务问题，而不是先在全项目里到处找“这个 controller 属于谁”。

### 2. 模块内部再按职责分层

每个模块内部通常会继续看到：

| 层次 | 常见文件 | 作用 |
| --- | --- | --- |
| 接口入口层 | `*.controller.ts` | 定义路由、装饰器、权限入口 |
| 业务规则层 | `*.service.ts` | 执行核心业务逻辑 |
| 参数结构层 | `*.dto.ts` | 约束入参和校验规则 |
| 返回结构层 | `*.response.dto.ts` | 统一返回对象语义 |
| 模块装配层 | `*.module.ts` | 注册 provider、controller、依赖 |

这说明后端不是把所有事情都塞在 controller 里，而是尽量让“路由入口”和“真实业务规则”分开。

### 3. 业务模块、基础设施、公共层是分开的

整个项目还刻意把三种职责分开：

| 区域 | 目录 | 说明 |
| --- | --- | --- |
| 业务模块 | `src/modules/*` | 真正承载业务能力 |
| 基础设施 | `src/infra/*` | Prisma、Redis、租户上下文、安全工具 |
| 公共支撑 | `src/shared/*` | 异常、响应、环境校验、Swagger 等全局能力 |

这样做以后，业务服务大多只关心“我要实现什么业务”，而不需要直接把数据库连接、缓存细节、全局响应格式揉在一起。

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

## 业务功能是怎么映射到后端模块的

如果你只记一个规律，可以记这个：

- 登录、权限、审计相关问题，先找 `iam`
- 用户、角色、菜单、部门、字典、公告这类后台主体功能，先找 `system`
- 租户和套餐这类 SaaS 平台功能，先找 `tenant`
- 工作台、文件、偏好、水印、健康检查这类公共能力，先找 `platform`

换句话说，后端目录并不是技术分类，而是业务分类。

这对接手非常重要，因为你遇到一个需求时，通常可以先判断“它属于哪个业务域”，再进入对应模块，不用在整个仓库盲找。

## 请求是怎么流过后端的

1. `main.ts` 启动应用并设置 `/api` 前缀。
2. 全局 `ValidationPipe` 先校验 DTO。
3. 控制器进入对应模块。
4. 如需认证，`JwtAuthGuard` 会先校验 Token。
5. 权限装饰器会继续判断菜单权限或按钮权限。
6. 多租户上下文服务解析当前租户。
7. 业务服务通过 Prisma 查询 MySQL，并在必要时使用 Redis。
8. 最终通过统一响应结构返回前端。

## 如果按渐进式方式理解后端，建议这样看

最不容易迷路的顺序通常是：

1. 先看 `src/main.ts`，知道应用怎么启动、全局前缀和全局校验怎么挂。
2. 再看 `src/app.module.ts`，知道有哪些核心模块。
3. 接着看 `iam`，因为所有业务请求都先经过登录和权限体系。
4. 然后看 `system`，理解平台最核心的后台管理能力。
5. 再看 `tenant`，理解 LuckyColor 为什么不只是普通后台，而是 SaaS 平台。
6. 最后看 `platform` 和 `prisma/`，理解公共能力和数据模型。

这样看的好处是：

- 先建立整体骨架
- 再理解权限和租户边界
- 最后再落到具体 CRUD 和数据表

顺序对了，理解成本会低很多。

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

当前文档已经额外整理了 [切换 Java 时的文档更新点](/backend/java-migration)。虽然项目里已经有 Spring Boot 实现，但如果你还在持续把 NestJS 能力对齐到 Java，仍然建议优先按那份清单逐页同步更新，避免只改代码不改文档。

## 如果你想按模块顺着读代码

可以继续阅读 [NestJS 后端模块渐进式解读](/backend/module-walkthrough)。那一页会按“模块解决什么问题、主要 controller/service 在哪里、关键表是什么、前端对应什么页面、改功能先看哪里”的顺序展开，更适合新人上手和内部讲解。
