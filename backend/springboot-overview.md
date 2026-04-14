# Spring Boot 后端说明

## 项目位置

Spring Boot 后端项目仓库名：`luckyColor-admin-springboot`

当前本机项目路径：`/Users/admin/code/luckyColor-admin-springboot`

## Spring Boot 版本在整个平台中的职责

Spring Boot 后端不是单纯把 Node.js 代码翻译成 Java，它承担的仍然是整个平台的“规则中心”角色：

- 校验登录态和验证码
- 解析当前租户上下文
- 判断菜单权限、按钮权限和数据权限
- 提供系统管理、租户管理和平台能力接口
- 负责数据库读写、缓存访问和基础数据初始化
- 输出 OpenAPI 文档给前端、测试和交付人员联调

它的目标不是做一套完全不同的接口，而是在 Java 技术栈下尽量保持对前端的契约稳定。

## 技术选型

- Spring Boot 3.5.13
- Java 17
- Spring Security
- MyBatis-Plus 3.5.x
- MySQL 8.x
- Redis 7.x
- springdoc OpenAPI
- JUnit 5 / Spring Boot Test

## 启动入口与对外地址

默认情况下，Spring Boot 启动后会暴露：

| 类型 | 地址 | 说明 |
| --- | --- | --- |
| API 基地址 | `http://127.0.0.1:3001/api` | 通过 `server.servlet.context-path=/api` 统一前缀 |
| Swagger | `http://127.0.0.1:3001/api/docs` | springdoc UI 页面 |
| OpenAPI JSON | `http://127.0.0.1:3001/api/v3/api-docs` | 便于前后端或测试工具消费 |
| 健康检查 | `GET /api/health` | 验证服务和数据库是否可用 |

## 环境变量

Spring Boot 默认从 `src/main/resources/application.yml` 读取配置，也支持环境变量覆盖。常用参数如下：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `SERVER_PORT` | `3001` | 应用监听端口 |
| `DB_HOST` | `127.0.0.1` | MySQL 主机 |
| `DB_PORT` | `3306` | MySQL 端口 |
| `DB_NAME` | `luckycolor_admin_sb` | MySQL 数据库名 |
| `DB_USERNAME` | `root` | MySQL 用户名 |
| `DB_PASSWORD` | `123456` | MySQL 密码 |
| `REDIS_HOST` | `127.0.0.1` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `REDIS_PASSWORD` | 空 | Redis 密码 |
| `REDIS_DATABASE` | `0` | Redis DB |
| `JWT_SECRET` | `replace-with-a-strong-secret-for-luckycolor-admin` | JWT 密钥 |
| `JWT_EXPIRES_IN` | `2h` | 登录态有效期 |
| `FLYWAY_ENABLED` | `true` | 是否执行数据库迁移 |
| `LOGIN_CAPTCHA_ENABLED` | `true` | 是否启用登录验证码 |
| `TENANT_ENABLED` | `true` | 是否开启租户模式 |
| `TENANT_HEADER` | `x-tenant-id` | 租户 Header 名称 |
| `DEFAULT_TENANT_ID` | 空 | 无显式租户时的回退租户 |
| `STORAGE_ROOT_PATH` | `/data/luckycolor/storage` | 生产环境文件根目录 |

### 当前文档采用哪套默认值

这份文档统一按 `application.yml` 的本地默认值描述，也就是：

- MySQL：`127.0.0.1:3306`
- Redis：`127.0.0.1:6379`
- MySQL 账号：`root`
- MySQL 密码：`123456`

如果你的 `application-local.yml` 或个人环境变量覆盖到了其他服务器，请以这套默认联调口径为准进行文档理解和联调说明。

## 启动方式

### 本地启动

```powershell
mvnw.cmd spring-boot:run
```

### 打包产物

```powershell
mvnw.cmd clean package
```

### 按生产配置启动

```powershell
$env:SPRING_PROFILES_ACTIVE="prod"
mvnw.cmd spring-boot:run
```

如果你习惯以 Jar 方式部署，也可以在打包后执行：

```powershell
java -jar .\target\luckycolor-admin-springboot-1.0.0-alpha.1.jar
```

## 数据库初始化方式

Spring Boot 版本和 NestJS 最大的运行差异之一在于初始化方式：

- NestJS 依赖 Prisma 的 `db:setup`
- Spring Boot 依赖预先准备好的数据库结构与基础数据，并由 MyBatis-Plus 负责运行期持久层映射

对应重点：

- `application.yml` 中的数据源配置
- 数据库里的实际表结构
- 管理员、角色、菜单、字典等基础数据

如果你想看一份更具体的落地说明，可以继续阅读 [Spring Boot 数据库初始化方式](/backend/springboot-database-bootstrap)。

## 目录结构与职责

```text
luckycolor-admin-springboot/
├─ src/main/java/com/luckycolor/admin/
│  ├─ LuckycolorAdminSpringbootApplication.java  应用入口
│  ├─ common/                                    通用响应、配置、异常、基础契约
│  ├─ infrastructure/                            缓存、安全、持久层、租户基础设施
│  └─ modules/                                   frontend、iam、system、tenant、platform
├─ src/main/resources/
│  ├─ application.yml                            默认配置
│  └─ application-prod.yml                       生产配置
├─ src/test/java/com/luckycolor/admin/           控制器、服务与回归测试
├─ mvnw / mvnw.cmd                               Maven Wrapper
└─ pom.xml                                       依赖与构建配置
```

## 后端代码组织风格

Spring Boot 版本仍然遵循“先按业务域拆模块，再区分基础设施与公共能力”的思路：

### 1. 模块优先，不按技术类型平铺

`modules/` 下主要包含：

- `iam`：认证、JWT、权限快照、登录链路
- `system`：用户、角色、菜单、部门、字典、公告、配置
- `tenant`：租户、租户套餐、租户初始化
- `platform`：文件、健康检查、国际化、偏好、水印、代码生成
- `frontend`：前端兼容适配层

### 2. `frontend` 模块是 Spring Boot 版本的关键差异

Spring Boot 版本新增了一个很有价值的模块：`modules/frontend/web`。

它的作用不是新增业务，而是把 Java 后端返回值进一步适配成当前前端更容易直接消费的结构，例如：

- 对齐前端既有的列表接口形状
- 对齐菜单、租户、系统管理相关接口的历史契约
- 帮助前端在切换 `dev:springboot` 时尽量不改页面逻辑

这也是为什么当前前端可以在 `Spring Boot` 与 `NestJS` 之间切换，而不是被某一套后端绑定死。

### 3. 业务模块、基础设施、公共层是分开的

整个项目刻意拆成三层：

| 区域 | 目录 | 说明 |
| --- | --- | --- |
| 业务模块 | `src/main/java/com/luckycolor/admin/modules/*` | 真正承载业务能力 |
| 基础设施 | `src/main/java/com/luckycolor/admin/infrastructure/*` | Redis、MyBatis、租户上下文、安全能力 |
| 公共支撑 | `src/main/java/com/luckycolor/admin/common/*` | 配置、异常、统一响应、通用契约 |

## 请求是怎么流过 Spring Boot 的

1. `LuckycolorAdminSpringbootApplication` 启动应用。
2. `application.yml` 挂载 `/api` 作为统一上下文路径。
3. Spring Security 处理认证、放行白名单与 Token 解析。
4. 租户能力从 `infrastructure/tenant` 解析当前租户。
5. 控制器进入对应业务模块。
6. 服务层通过 MyBatis-Plus 访问 MySQL，并在必要时使用 Redis。
7. 最终通过统一响应结构返回前端。

## 多租户是怎么落地的

当前租户识别优先级与前端约定保持一致：

1. 请求头 `x-tenant-id`
2. Token 中的租户信息
3. 默认租户配置

需要特别注意的一点是：Spring Boot 版本不仅支持数值型租户 ID，也额外支持前端当前默认透传的 `tenant_001` 这类外部租户标识。这样可以减少前端切换后端时的兼容成本。

## 默认初始化数据

首次启动后，Spring Boot 会准备一套可直接联调的引导数据，包括：

- 默认管理员：`admin / 123456`
- 默认租户与租户套餐
- 系统菜单树、权限点与动态路由种子
- 字典、配置、公告等基础系统数据
- 前端兼容所需的租户 profile 与菜单契约数据

## 典型接口分组

| 模块 | 前缀 | 说明 |
| --- | --- | --- |
| 认证中心 | `/api/auth` | 登录、验证码、权限快照、动态路由 |
| 用户管理 | `/api/admin/users` | 列表、详情、角色分配、导入导出 |
| 角色管理 | `/api/admin/roles` | 列表、详情、菜单授权、数据权限 |
| 菜单管理 | `/api/admin/menus` | 菜单树、详情、创建更新 |
| 字典管理 | `/api/admin/dictionary-types`、`/api/admin/dictionary-items` | 字典类型、字典项 |
| 租户管理 | `/api/admin/tenants`、`/api/admin/tenant-packages` | 租户与租户套餐 |
| 平台能力 | `/api/admin/files`、`/api/health` | 文件服务、健康检查 |

## 测试与质量控制

常用命令：

| 命令 | 说明 |
| --- | --- |
| `.\mvnw.cmd test` | 运行全部测试 |
| `.\mvnw.cmd -Dtest=类名 test` | 运行指定测试类 |
| `.\mvnw.cmd clean package` | 构建可运行产物 |
| `.\mvnw.cmd clean verify` | 执行完整校验与构建 |

建议在以下场景至少执行一次 `.\mvnw.cmd clean verify`：

- 修改租户上下文或权限链路
- 修改数据库结构准备方式或基础数据
- 修改前端兼容接口
- 修改统一响应结构或登录返回结构

## 什么时候优先看 Spring Boot 版本

以下场景建议先看这套实现：

- 你当前交付目标是 Java 技术栈
- 你要和前端默认的 `pnpm dev` 模式联调
- 你要确认前端当前真正依赖的接口契约是否已经在 Java 版本落地
- 你要评估从 NestJS 迁移到 Spring Boot 还差哪些能力

如果你还想顺着 Java 模块继续往里读，再继续阅读 [Spring Boot 后端模块渐进式解读](/backend/springboot-module-walkthrough)。如果你想先把当前数据库准备方式看明白，再继续阅读 [Spring Boot 数据库初始化方式](/backend/springboot-database-bootstrap)。如果你还想回看早期 Node.js 版本的目录组织方式、Prisma 数据模型或原始模块边界，再继续阅读 [NestJS 后端说明](/backend/overview) 和 [切换 Java 时的文档更新点](/backend/java-migration)。
