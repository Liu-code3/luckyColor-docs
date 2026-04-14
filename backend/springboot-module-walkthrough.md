# Spring Boot 后端模块渐进式解读

## 怎么读这篇文档

这篇文档不是按 Java 包名机械展开，而是按新人最容易建立理解的顺序来讲：

1. 先把 Spring Boot 后端看成一套规则执行层
2. 再理解为什么这里是五大模块，而不只是传统的四块业务域
3. 再进入每个模块内部，看控制器、服务、数据表和前端页面怎么对应
4. 最后告诉你如果要改功能，应该先从哪里下手

建议和 [Spring Boot 后端说明](/backend/springboot-overview) 配合着看。

## 第一层：先把 Java 后端看成一个“平台规则执行器”

先不要急着记 `modules/frontend`、`modules/system` 这些目录名。先把 Spring Boot 后端看成一个执行平台规则的中枢，它主要在做五件事：

1. 接住前端发来的请求
2. 判断这个用户是谁、属于哪个租户
3. 判断这个用户有没有权限做这件事
4. 去 MySQL 和 Redis 里读写数据
5. 把结果按前端能直接消费的结构返回出去

这意味着 Spring Boot 版本不是简单做 CRUD，而是在 Java 技术栈下把“认证、权限、租户、业务、兼容适配”重新组织了一遍。

## 第二层：为什么这里是五大模块

Spring Boot 版本的 `modules/` 下主要有五块：

- `frontend`
- `iam`
- `system`
- `tenant`
- `platform`

最简单的理解方式是：

| 模块 | 一句话理解 |
| --- | --- |
| `frontend` | 把 Java 后端结果适配成当前前端更容易直接使用的结构 |
| `iam` | 你是谁，你能干什么 |
| `system` | 后台管理最核心的系统业务能力 |
| `tenant` | 平台如何管理租户、租户套餐和租户初始化 |
| `platform` | 工作台、文件、健康检查、国际化、水印、代码生成等平台能力 |

和 NestJS 版本相比，Spring Boot 最值得先记住的差异就是：

- `frontend` 是兼容层，不是多余层
- 很多前端仍在调用的旧路径，会先落到 `frontend/web/*CompatibilityController`
- 真正的原生 Java API 又同时存在于 `/admin/*` 路径下

所以在 Spring Boot 仓库里排查接口时，先判断它是“前端兼容入口”还是“原生业务入口”，非常关键。

## 第三层：从启动入口进入项目

如果你想顺着代码真正走进去，建议先看这几个文件：

### 1. `LuckycolorAdminSpringbootApplication.java`

它就是应用启动入口，先确认项目是不是标准的 Spring Boot 单体应用。

### 2. `src/main/resources/application.yml`

这里能看到全局运行约定：

- 服务端口默认 `3001`
- 全局上下文路径是 `/api`
- MySQL、Redis 的默认连接方式
- JWT、租户头、默认租户等基础配置

它决定了“应用默认怎么跑”。

### 3. `common/config/SecurityConfig.java`

这里能看到整个认证授权入口：

- 哪些路径放行
- JWT 过滤器挂在哪一层
- 无权限和未登录时如何返回 JSON
- 应用是否是无状态会话

它决定了“请求进来以后怎么被安全链处理”。

### 4. `infrastructure/tenant/config/TenancyProperties.java`

这里能看到多租户的全局约定：

- 默认租户头是 `x-tenant-id`
- 哪些路径不参与租户解析
- 哪些表不做租户隔离

它决定了“租户上下文到底怎么在 Java 版本里流转”。

### 5. `modules/iam/auth/web/AuthController.java`

这里是最贴近前端联调的一组入口，能直接看到：

- `/auth/captcha`
- `/auth/captcha/challenge`
- `/auth/captcha/verify`
- `/auth/login`
- `/auth/refresh`
- `/auth/logout`
- `/auth/profile`
- `/auth/access`

新人如果先把这几层读明白，后面再进入业务模块会轻松很多。

## 第四层：先讲 `frontend`，因为它是 Spring Boot 版本最容易被忽略的一层

### `frontend` 模块解决什么问题

这个模块的核心问题只有一句话：

“当前前端历史上已经形成了一批接口路径、字段结构和菜单契约，Java 后端怎么在不大改前端的前提下兼容它们。”

### 主要目录

```text
src/main/java/com/luckycolor/admin/modules/frontend/web/
├─ FrontendCompatibilityController.java
├─ FrontendContentCompatibilityController.java
├─ FrontendSystemCompatibilityController.java
└─ FrontendTenantCompatibilityController.java
```

### 你应该先看哪些文件

建议顺序：

1. `FrontendCompatibilityController.java`
2. `FrontendSystemCompatibilityController.java`
3. `FrontendContentCompatibilityController.java`
4. `FrontendTenantCompatibilityController.java`
5. `modules/system/menu/support/FrontendMenuContractMapper.java`

### 这个模块具体做什么

#### 1. 兼容工作台与旧菜单入口

`FrontendCompatibilityController` 里能看到类似：

- `/dashboard/overview`
- `/dashboard/track-visit`

它会把 Java 侧工作台数据整理成更接近现有前端使用习惯的结构。

#### 2. 兼容系统管理旧路径

`FrontendSystemCompatibilityController` 负责：

- `/users`
- `/roles`
- `/departments`
- `/menus`

这些路径和原生 `/admin/users`、`/admin/roles` 并不是二选一，而是“兼容层 + 原生层”并存。

#### 3. 兼容字典、配置、公告等内容类接口

`FrontendContentCompatibilityController` 负责：

- `/configs`
- `/dict/*`
- `/notices`

#### 4. 兼容租户、文件等旧接口入口

`FrontendTenantCompatibilityController` 负责：

- `/tenants`
- `/tenant-packages`
- `/file/*`

### 对应哪些数据库表

这层本身主要是适配和聚合，不是单独的数据域。它会频繁触达：

- `sys_user`
- `sys_role`
- `sys_department`
- `sys_menu`
- `sys_dictionary_type`
- `sys_dictionary_item`
- `sys_config`
- `sys_notice`
- `sys_tenant`
- `sys_tenant_package`

### 对应哪些前端页面或能力

- 登录后首页工作台
- 用户、角色、部门、菜单页面
- 字典、配置、公告页面
- 租户与租户套餐页面
- 文件上传和访问

### 如果要改这块功能，先从哪里下手

| 改动目标 | 先看哪里 |
| --- | --- |
| 前端请求路径找不到 Java 入口 | `modules/frontend/web/*CompatibilityController` |
| 菜单路径、名称、组件映射不对 | `FrontendMenuContractMapper.java` |
| 同一个功能原生接口正常，但前端页面报错 | 先查兼容层返回结构 |
| 只想做新的原生 Java 接口 | 直接去 `modules/system` / `tenant` / `platform` 原生控制器 |

## 第五层：再讲 `iam`，因为所有请求都经过它

### `iam` 模块解决什么问题

它的核心问题只有一句话：

“请求进来以后，系统怎么知道你是谁，以及你有没有资格做这件事。”

### 主要目录

```text
src/main/java/com/luckycolor/admin/modules/iam/
├─ auth/
└─ audit/
```

### 你应该先看哪些文件

建议顺序：

1. `modules/iam/auth/web/AuthController.java`
2. `modules/iam/auth/service/impl/AuthServiceImpl.java`
3. `modules/iam/auth/service/impl/LoginCaptchaServiceImpl.java`
4. `modules/iam/auth/service/impl/RedisAuthTokenSessionService.java`
5. `modules/iam/audit/web/SecurityAuditLogController.java`

### 这个模块具体做什么

#### 1. 登录认证

`auth` 模块负责：

- 获取验证码
- 验证验证码
- 用户名密码登录
- 返回 Access Token / Refresh Token
- 返回当前用户资料
- 返回权限快照、按钮权限和动态路由

#### 2. 会话与令牌管理

Java 版本里既有 JWT，也有令牌会话管理服务。你会看到：

- `JwtTokenService`
- `RedisAuthTokenSessionService`
- `InMemoryAuthTokenSessionService`

这说明它不仅负责签发 Token，还负责处理刷新与会话态细节。

#### 3. 登录反滥用与验证码节流

认证链路里还接了：

- `AuthAntiAbuseService`
- `RedisAuthAntiAbuseService`
- `InMemoryAuthAntiAbuseService`

这部分对暴力尝试登录、验证码滥刷等问题很关键。

#### 4. 安全审计

`audit` 模块负责安全相关日志查询与留痕。

### 对应哪些数据库表

- `sys_security_audit_log`
- 与认证相关的用户、角色、菜单、租户关联表

### 对应哪些前端页面或能力

- 登录页
- 页面刷新后的身份恢复
- 权限快照恢复
- 按钮权限显隐
- 安全审计页

### 如果要改这块功能，先从哪里下手

| 改动目标 | 先看哪里 |
| --- | --- |
| 改登录接口返回 | `AuthController.java`、`AuthServiceImpl.java` |
| 改验证码链路 | `LoginCaptchaServiceImpl.java` |
| 改刷新 Token 行为 | `JwtTokenService`、`AuthTokenSessionService` 实现 |
| 改未登录 / 无权限返回结构 | `SecurityConfig.java`、`JsonAuthenticationEntryPoint`、`JsonAccessDeniedHandler` |
| 改安全审计查询 | `modules/iam/audit/*` |

## 第六层：讲 `system`，因为它是后台业务主体

### `system` 模块解决什么问题

这块就是标准后台管理平台的主业务区。你在前端看到的大部分系统管理页面，最终都能落到这里。

### 主要目录

```text
src/main/java/com/luckycolor/admin/modules/system/
├─ user/
├─ role/
├─ menu/
├─ department/
├─ dictionary/
├─ config/
├─ notice/
└─ operationlog/
```

下面不要一次全部记住，我们分块看。

### 1. 用户管理 `user`

#### 它解决什么问题

平台里的账号怎么创建、修改、禁用、导入、导出、分配角色、重置密码，都由它负责。

#### 主要代码入口

- `modules/system/user/web/SystemUserController.java`
- `modules/system/user/service/impl/SystemUserServiceImpl.java`

#### 主要接口能力

- 分页列表
- 用户详情
- 角色选项
- 导出预览与导出
- 导入
- 创建用户
- 更新用户
- 状态修改
- 重置密码
- 分配角色
- 删除用户

#### 对应数据库表

- `sys_user`
- 角色和部门相关关联表

#### 对应前端页面

- `src/views/sys/user.vue`

### 2. 角色管理 `role`

#### 它解决什么问题

角色模块真正控制的是：

- 菜单授权
- 权限码
- 数据权限范围

#### 主要代码入口

- `modules/system/role/web/SystemRoleController.java`
- `modules/system/role/service/impl/SystemRoleServiceImpl.java`

#### 对应数据库表

- `sys_role`
- 菜单、权限、数据权限相关关联表

#### 对应前端页面

- `src/views/sys/role/index.vue`

### 3. 菜单管理 `menu`

#### 它解决什么问题

菜单管理既决定左侧导航显示什么，也决定服务端如何按权限限制访问。

#### 主要代码入口

- `modules/system/menu/web/MenuController.java`
- `modules/system/menu/service/impl/MenuServiceImpl.java`

#### 对应数据库表

- `sys_menu`

#### 接手时要注意什么

- Spring Boot 版本里菜单不只是存树，还要和前端组件路径、图标、兼容层映射一起考虑。

### 4. 部门管理 `department`

#### 主要代码入口

- `modules/system/department/web/SystemDepartmentController.java`
- `modules/system/department/service/impl/SystemDepartmentServiceImpl.java`

#### 对应数据库表

- `sys_department`

### 5. 字典管理 `dictionary`

#### 主要代码入口

- `modules/system/dictionary/type/web/DictionaryTypeController.java`
- `modules/system/dictionary/item/web/DictionaryItemController.java`
- `modules/system/dictionary/catalog/web/DictionaryCatalogController.java`

#### 对应数据库表

- `sys_dictionary_type`
- `sys_dictionary_item`

#### 接手时要注意什么

- 字典除了表数据，还会受到缓存实现影响，相关缓存服务也要一起看。

### 6. 系统配置 `config`

#### 主要代码入口

- `modules/system/config/web/SystemConfigController.java`
- `modules/system/config/service/impl/SystemConfigServiceImpl.java`

#### 对应数据库表

- `sys_config`

### 7. 通知公告 `notice`

#### 主要代码入口

- `modules/system/notice/web/NoticeController.java`
- `modules/system/notice/service/impl/NoticeServiceImpl.java`

#### 对应数据库表

- `sys_notice`

### 8. 操作日志 `operationlog`

#### 主要代码入口

- `modules/system/operationlog/web/OperationLogController.java`
- `modules/system/operationlog/service/impl/OperationLogServiceImpl.java`

#### 对应数据库表

- `sys_operation_log`

### 如果要改系统管理，先从哪里下手

| 改动目标 | 先看哪里 |
| --- | --- |
| 页面报的是 `/users` / `/roles` 旧路径 | 先查 `modules/frontend/web` |
| 页面报的是 `/admin/users` / `/admin/roles` | 直接查原生控制器 |
| 菜单显示不对 | `menu` 模块 + `FrontendMenuContractMapper` |
| 字典更新后前端没变 | 字典模块 + 字典缓存实现 |

## 第七层：讲 `tenant`，因为它决定这不是普通后台，而是 SaaS 平台

### `tenant` 模块解决什么问题

这块的核心不是“多一张租户表”，而是：

- 怎么管理租户
- 怎么管理租户套餐
- 怎么给新租户初始化管理员、菜单和基础资源
- 怎么记录租户侧审计与引导过程

### 主要目录

```text
src/main/java/com/luckycolor/admin/modules/tenant/
├─ tenant/
├─ packageinfo/
├─ bootstrap/
├─ profile/
└─ audit/
```

### 你应该先看哪些文件

建议顺序：

1. `modules/tenant/tenant/web/TenantController.java`
2. `modules/tenant/packageinfo/web/TenantPackageController.java`
3. `modules/tenant/bootstrap/web/TenantBootstrapController.java`
4. `modules/tenant/bootstrap/service/impl/TenantBootstrapServiceImpl.java`
5. `modules/tenant/audit/web/TenantAuditLogController.java`

### 这个模块具体做什么

#### 1. 租户管理

负责租户创建、更新、查询和状态维护。

#### 2. 租户套餐

负责套餐能力开关、菜单范围和配额边界。

#### 3. 租户初始化

`bootstrap` 是 Spring Boot 版本里非常值得重点关注的一块：

- 有模板查询接口
- 有初始化记录分页接口
- 有按租户执行初始化的接口

这说明 Java 版本对“创建租户以后如何装配基础资源”做了比较明确的分层。

#### 4. 租户 profile

这部分和前端默认透传的 `tenant_001` 这类外部租户标识有关，帮助系统把外部租户标识映射回内部租户数据。

### 对应数据库表

- `sys_tenant`
- `sys_tenant_package`
- `sys_tenant_profile`
- `sys_tenant_bootstrap_record`
- `sys_tenant_audit_log`

### 对应前端页面

- `src/views/sys/tenant`
- `src/views/sys/tenantPackage`

### 如果要改这块功能，先从哪里下手

| 改动目标 | 先看哪里 |
| --- | --- |
| 改租户创建和更新 | `tenant/*` |
| 改套餐菜单范围 | `packageinfo/*` |
| 改创建租户后的默认资源装配 | `bootstrap/*` |
| 改 `tenant_001` 这类外部租户标识解析 | `profile/*` + tenant infrastructure |

## 第八层：最后讲 `platform`，因为它是各种公共能力集合

### `platform` 模块解决什么问题

这块主要承载不直接属于系统管理或租户中心，但平台运行又离不开的能力。

### 主要目录

```text
src/main/java/com/luckycolor/admin/modules/platform/
├─ dashboard/
├─ storage/
├─ docs/
├─ health/
├─ i18n/
├─ preference/
├─ watermark/
└─ codegen/
```

### 1. 工作台 `dashboard`

#### 主要代码入口

- `modules/platform/dashboard/web/DashboardController.java`
- `modules/platform/dashboard/service/impl/DashboardServiceImpl.java`

#### 对应前端页面

- 首页工作台

### 2. 文件服务 `storage`

#### 主要代码入口

- `modules/platform/storage/web/StorageController.java`
- `modules/platform/storage/service/impl/FileStorageServiceImpl.java`

#### 接手时要注意什么

- 生产环境需要重点看 `STORAGE_ROOT_PATH`
- 文件能力通常要和 Nginx、磁盘持久化一起考虑

### 3. 文档与健康检查 `docs` / `health`

#### 主要代码入口

- `modules/platform/docs/web/ApiDocsController.java`
- `modules/platform/health/web/HealthController.java`
- `modules/platform/health/web/VersionController.java`

#### 接手时要注意什么

- Spring Boot 版本为了把 Swagger 固定在 `/api/docs`，额外做了一个文档页面适配控制器。
- `prod` profile 默认关闭 Swagger 和 OpenAPI 暴露。

### 4. 国际化、偏好、水印、代码生成

#### 主要代码入口

- `I18nResourceController.java`
- `UserPreferenceController.java`
- `WatermarkConfigController.java`
- `CodegenMetadataController.java`

#### 对应数据库表

- `sys_i18n_resource`
- `sys_user_preference`
- `sys_watermark_config`
- `sys_codegen_table`
- `sys_codegen_column`

## 最后：如果按渐进式方式接手 Spring Boot，建议这样看

最不容易迷路的顺序通常是：

1. 先看 `application.yml` 和 `SecurityConfig.java`，知道应用怎么启动、认证怎么挂。
2. 再看 `frontend`，理解为什么前端旧路径仍然能被 Java 版本接住。
3. 接着看 `iam`，因为所有真实请求都绕不开认证、权限和租户。
4. 然后看 `system`，理解平台最核心的后台能力。
5. 再看 `tenant`，理解 LuckyColor 为什么不是普通后台，而是 SaaS 平台。
6. 最后看 `platform` 和数据库基础数据准备方式，理解公共能力和数据落库方式。

## 如果你只想记住一个排查规律

可以只记这个：

- 前端接口路径像 `/users`、`/roles`、`/configs`，先找 `modules/frontend/web`
- 前端接口路径像 `/admin/users`、`/admin/roles`，先找原生业务控制器
- 登录和权限问题，先找 `iam`
- 租户初始化和 `tenant_001` 问题，先找 `tenant`
- 文件、健康检查、Swagger、工作台问题，先找 `platform`

顺着这个规律看，Spring Boot 版本的理解成本会低很多。
