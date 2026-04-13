# NestJS 后端模块渐进式解读

## 怎么读这篇文档

这篇文档不是按“目录树”来硬讲，而是按新人最容易建立理解的顺序来讲：

1. 先知道后端整体在做什么
2. 再理解四大模块怎么分工
3. 再进入每个模块内部，看 controller、service、数据表和前端页面怎么对应
4. 最后告诉你如果要改功能，应该先从哪里下手

如果你是第一次接手 LuckyColor，建议和 [NestJS 后端说明](/backend/overview) 配合着看。如果你当前主要阅读 Java 版本，请改看 [Spring Boot 后端模块渐进式解读](/backend/springboot-module-walkthrough)。

## 第一层：先把后端看成一个“平台大脑”

先不要急着记住 `iam`、`system`、`tenant`、`platform` 这些目录名。先把后端当成一个平台的大脑，它主要在做五件事：

1. 接住前端发来的请求
2. 判断这个用户是谁、属于哪个租户
3. 判断这个用户有没有权限做这件事
4. 去数据库和缓存里读写数据
5. 把结果用统一格式返回前端

从这个角度看，后端并不是一堆散乱接口，而是一套“规则 + 数据 + 业务”的执行层。

## 第二层：为什么拆成四大模块

当前后端的核心模块分成：

- `iam`
- `system`
- `tenant`
- `platform`

最简单的理解方式是：

| 模块 | 一句话理解 |
| --- | --- |
| `iam` | 你是谁，你能干什么 |
| `system` | 后台管理的通用业务能力 |
| `tenant` | 平台如何管理租户和租户套餐 |
| `platform` | 一些辅助型平台能力，不直接属于某个后台业务模块 |

你可以把它想成一栋楼：

- `iam` 是门禁系统
- `system` 是办公室和业务区
- `tenant` 是整栋楼的租赁管理中心
- `platform` 是配电室、监控室和公共服务区

## 第三层：从启动入口进入项目

如果你想顺着代码真正走进去，建议先看这两个文件：

### 1. `src/main.ts`

这里能看到全局行为：

- 全局前缀是 `/api`
- 开启了 CORS
- 启用了全局参数校验
- 使用了全局异常过滤器
- 条件开启 Swagger

它决定了“整个应用是怎么跑起来的”。

### 2. `src/app.module.ts`

这里能看到所有模块注册关系：

- `RedisModule`
- `PrismaModule`
- `TenantModule`
- `AuthModule`
- `UsersModule`
- `RolesModule`
- `TenantsModule`
- `DashboardModule`

它决定了“这个后端究竟由哪些能力组成”。

新人如果先把这两个文件读明白，后面再去看业务模块会轻松很多。

## 第四层：先讲 `iam`，因为它是所有请求的入口

### `iam` 模块解决什么问题

这个模块的核心问题只有一句话：

“请求进来以后，系统怎么知道你是谁，以及你有没有资格做这件事。”

### 主要目录

```text
src/modules/iam/
├─ auth/
├─ permissions/
├─ data-scopes/
└─ security-audit/
```

### 你应该先看哪些文件

建议顺序：

1. `src/modules/iam/auth/auth.controller.ts`
2. `src/modules/iam/auth/auth.service.ts`
3. `src/modules/iam/auth/jwt-auth.guard.ts`
4. `src/modules/iam/permissions/permission-guard.ts`
5. `src/modules/iam/data-scopes/data-scope.service.ts`

### 这个模块具体做什么

#### 1. 登录认证

`auth` 模块负责：

- 获取登录验证码
- 验证验证码
- 用户名密码登录
- 返回 Token
- 返回当前用户资料
- 返回权限快照
- 返回动态路由树
- 返回按钮权限

也就是说，前端登录成功后能不能显示出正确的菜单和按钮，根源都在这里。

#### 2. 权限判断

`permissions` 模块负责：

- 菜单权限判断
- 按钮权限判断
- 控制器级的访问保护

你在 controller 中经常会看到：

- `@RequireMenuPermission(...)`
- `@RequirePlatformMenuPermission(...)`
- `@RequirePermissions(...)`

这些装饰器背后依赖的就是这一层。

#### 3. 数据权限

`data-scopes` 模块不是控制“能不能进页面”，而是控制：

- 进入页面之后，你到底能看到哪些数据

比如用户管理页面，两个管理员都能进入，不代表他们都能看到同样范围的用户。

#### 4. 安全审计

`security-audit` 负责记录：

- 登录成功与失败
- Token 异常
- 其他安全相关事件

这部分在排查账号异常、暴力尝试登录时很重要。

### 对应哪些数据库表

- `users`
- `roles`
- `user_roles`
- `role_permissions`
- `role_menus`
- `role_department_scopes`
- `security_audit_logs`

### 对应哪些前端页面或能力

- 登录页
- 动态菜单
- 按钮显隐
- 页面刷新后的权限恢复

### 如果要改这块功能，先从哪里下手

| 改动目标 | 先看哪里 |
| --- | --- |
| 改登录流程 | `auth.controller.ts`、`auth.service.ts` |
| 改 Token 校验 | `jwt-auth.guard.ts`、`jwt.strategy.ts` |
| 改按钮权限 | `permissions/*` |
| 改数据权限范围 | `data-scope.service.ts` |
| 改登录审计 | `security-audit.service.ts` |

## 第五层：再讲 `system`，因为它是后台业务主体

### `system` 模块解决什么问题

这个模块其实就是“通用后台管理平台”的主业务区。你在前端看到的大部分系统管理页面，基本都来自这里。

### 主要目录

```text
src/modules/system/
├─ users/
├─ roles/
├─ menus/
├─ departments/
├─ dictionary/
├─ configs/
├─ notices/
└─ system-logs/
```

下面不要一次全部记住，我们分块看。

### 1. 用户管理 `users`

#### 它解决什么问题

平台里的账号怎么创建、修改、禁用、导入、导出、分配角色、重置密码，都由它负责。

#### 主要代码入口

- `src/modules/system/users/users.controller.ts`
- `src/modules/system/users/users.service.ts`

#### 主要接口能力

- 分页列表
- 用户详情
- 导出 CSV
- 批量导入
- 创建用户
- 更新用户
- 状态修改
- 重置密码
- 分配角色
- 删除用户

#### 对应数据库表

- `users`
- `user_roles`
- `departments`
- `roles`

#### 对应前端页面

- `src/views/sys/user.vue`

#### 接手时要注意什么

- 它会同时受到租户边界和数据权限影响
- 导入导出属于高频出问题点
- 重置密码通常还会牵涉密码策略和审计

### 2. 角色管理 `roles`

#### 它解决什么问题

角色管理不是单纯改个名称，它实际上在控制：

- 这个角色能看到哪些菜单
- 这个角色能做哪些按钮动作
- 这个角色能看到哪些组织数据

#### 主要代码入口

- `src/modules/system/roles/roles.controller.ts`
- `src/modules/system/roles/roles.service.ts`

#### 主要接口能力

- 角色分页
- 角色详情
- 数据权限范围查询
- 已分配菜单查询
- 创建角色
- 更新角色
- 修改角色状态
- 分配数据权限
- 分配菜单
- 删除角色

#### 对应数据库表

- `roles`
- `role_menus`
- `role_permissions`
- `role_department_scopes`

#### 对应前端页面

- `src/views/sys/role/index.vue`

#### 接手时要注意什么

- 这里是权限系统的枢纽
- 改角色功能时，通常要联动菜单、权限码和数据权限
- 403 问题很多都能追到这里

### 3. 菜单管理 `menus`

#### 它解决什么问题

菜单管理既决定前端左侧导航显示什么，也决定后端如何按菜单维度限制访问。

#### 主要代码入口

- `src/modules/system/menus/menus.controller.ts`
- `src/modules/system/menus/menus.service.ts`

#### 主要接口能力

- 菜单分页
- 菜单树
- 菜单详情
- 创建菜单
- 批量同步菜单树
- 更新菜单
- 更新菜单状态
- 删除菜单

#### 对应数据库表

- `menus`
- `role_menus`

#### 对应前端页面

- `src/views/sys/menu/index.vue`

#### 接手时要注意什么

- 菜单不是只给前端看的，它还是权限控制入口
- `component` 字段必须和前端页面路径匹配
- 拖拽排序和层级调整很容易带出树结构问题

### 4. 部门管理 `departments`

#### 它解决什么问题

部门不仅是组织结构展示，也和数据权限强相关。

#### 主要代码入口

- `src/modules/system/departments/departments.controller.ts`
- `src/modules/system/departments/departments.service.ts`

#### 主要接口能力

- 部门分页
- 部门树
- 查询部门及子部门 ID
- 查询部门绑定用户
- 创建部门
- 更新部门
- 更新部门状态
- 删除部门

#### 对应数据库表

- `departments`
- `users`
- `role_department_scopes`

#### 对应前端页面

- `src/views/sys/department/department.vue`

#### 接手时要注意什么

- 它是树结构
- 它直接影响数据权限
- 删除和移动部门时要特别小心层级关系

### 5. 字典管理 `dictionary`

#### 它解决什么问题

后台里很多下拉选项、状态映射、类型枚举，不适合硬编码，就需要字典系统来统一提供。

#### 主要代码入口

- `src/modules/system/dictionary/dictionary.controller.ts`
- `src/modules/system/dictionary/dictionary-types.controller.ts`
- `src/modules/system/dictionary/dictionary-items.controller.ts`
- `src/modules/system/dictionary/dictionary.service.ts`

#### 主要接口能力

- 字典树
- 字典分页
- 按类型编码获取选项
- 字典详情
- 创建和更新字典
- 刷新字典缓存

#### 对应数据库表

- `dictionaries`

#### 对应前端页面

- `src/views/sys/dict/index.vue`

#### 接手时要注意什么

- 字典既有平台级，也有租户级数据
- 改字典后可能需要刷新 Redis 缓存
- 很多页面的下拉项其实都依赖这里

### 6. 系统配置 `configs`

#### 它解决什么问题

系统配置用于保存不适合写死在代码里的平台参数，比如默认语言、外观配置、登录相关配置等。

#### 主要代码入口

- `src/modules/system/configs/configs.controller.ts`
- `src/modules/system/configs/configs.service.ts`

#### 主要接口能力

- 配置分页
- 批量读取配置
- 配置详情
- 创建配置
- 刷新缓存
- 更新配置
- 删除配置

#### 对应数据库表

- `system_configs`

#### 对应前端页面

- `src/views/sys/config/index.vue`

#### 接手时要注意什么

- 配置值可能有敏感信息，需要脱敏
- 配置修改后一般要刷新缓存
- 很适合作为“业务参数平台化”的入口

### 7. 通知公告 `notices`

#### 它解决什么问题

通知公告负责把需要运营、管理或提醒的信息推送到平台内，比如发布通知、系统公告、租户提醒等。

#### 主要代码入口

- `src/modules/system/notices/notices.controller.ts`
- `src/modules/system/notices/notices.service.ts`

#### 主要接口能力

- 公告分页
- 公告详情
- 创建公告
- 更新公告
- 发布
- 撤回
- 置顶
- 删除

#### 对应数据库表

- `notices`

#### 对应前端页面

- `src/views/sys/notice/index.vue`
- 工作台公告区域

#### 接手时要注意什么

- 它有发布范围、定时发布、置顶等业务语义
- 不只是一个简单的 CRUD 表单

### 8. 系统日志 `system-logs`

#### 它解决什么问题

谁在什么时候改了什么，通常都需要能追到，这就是系统日志的价值。

#### 主要代码入口

- `src/modules/system/system-logs/system-logs.controller.ts`
- `src/modules/system/system-logs/system-logs.service.ts`
- `src/modules/system/system-logs/system-log.decorator.ts`
- `src/modules/system/system-logs/system-log.interceptor.ts`

#### 主要接口能力

- 日志分页
- 日志详情
- 创建日志

#### 对应数据库表

- `system_logs`

#### 对应前端页面

- 当前仓库文档已定义该能力，前端可继续扩展日志查看页面

#### 接手时要注意什么

- 它是很多审计和排错的基础
- 新增关键操作时，最好同步考虑是否需要打日志

## 第六层：再讲 `tenant`，因为它是 SaaS 特性的核心

### `tenant` 模块解决什么问题

如果没有这个模块，这个项目只是一个普通后台。如果有了这个模块，它才真正变成 SaaS 平台。

### 主要目录

```text
src/modules/tenant/
├─ tenants/
└─ tenant-packages/
```

### 1. 租户管理 `tenants`

#### 它解决什么问题

平台管理员如何创建租户、查看租户、修改租户状态、设置租户有效期，都由它负责。

#### 主要代码入口

- `src/modules/tenant/tenants/tenants.controller.ts`
- `src/modules/tenant/tenants/tenants.service.ts`
- `src/modules/tenant/tenants/tenant-bootstrap.service.ts`

#### 主要接口能力

- 租户分页
- 租户详情
- 创建租户
- 更新租户

#### 对应数据库表

- `tenants`
- `tenant_audit_logs`
- 以及创建租户时关联写入的一系列表

#### 对应前端页面

- `src/views/sys/tenant/index.vue`

#### 接手时要注意什么

这里最大的重点不是“新建一条租户记录”，而是“新建租户时系统会顺带初始化很多东西”。

在 `tenant-bootstrap.service.ts` 里，你能看到它会自动初始化：

- 租户
- 默认部门
- 默认角色
- 租户管理员账号
- 角色菜单授权
- 角色权限码
- 默认字典
- 租户审计日志

这就是这个项目从“有租户表”变成“真的能开通租户”的关键。

### 2. 租户套餐 `tenant-packages`

#### 它解决什么问题

租户套餐用于定义不同租户能用多少人、多少角色、多少菜单，以及具备哪些功能开关。

#### 主要代码入口

- `src/modules/tenant/tenant-packages/tenant-packages.controller.ts`
- `src/modules/tenant/tenant-packages/tenant-packages.service.ts`

#### 主要接口能力

- 套餐分页
- 套餐详情
- 创建套餐
- 更新套餐
- 删除套餐

#### 对应数据库表

- `tenant_packages`

#### 对应前端页面

- `src/views/sys/tenantPackage/index.vue`

#### 接手时要注意什么

- 套餐更像平台运营能力，不是租户自己改的
- 删除套餐前要检查是否仍有租户在使用

## 第七层：最后讲 `platform`，因为它是辅助能力集合

### `platform` 模块解决什么问题

这个模块里放的是一些“平台必需，但不属于某一个系统管理模块”的能力。

### 主要目录

```text
src/modules/platform/
├─ dashboard/
├─ file/
├─ health/
├─ preferences/
├─ watermark/
├─ i18n/
└─ codegen/
```

### 1. 工作台 `dashboard`

#### 它解决什么问题

首页工作台需要统计、趋势、最近访问和公告数据，这些都由它聚合。

#### 主要代码入口

- `src/modules/platform/dashboard/dashboard.controller.ts`
- `src/modules/platform/dashboard/dashboard.service.ts`

#### 主要接口能力

- 获取首页概览
- 记录页面访问事件

#### 对应数据库表

- `dashboard_visits`
- `notices`

#### 对应前端页面

- `src/views/index/index.vue`

### 2. 文件服务 `file`

#### 它解决什么问题

为头像、图片或其他上传文件提供统一上传和读取能力。

#### 主要代码入口

- `src/modules/platform/file/file.controller.ts`
- `src/modules/platform/file/file.service.ts`

#### 主要接口能力

- 上传文件
- 删除文件
- 读取文件

#### 对应前端页面或能力

- 上传组件
- 头像、富文本图片等文件场景

#### 接手时要注意什么

- 部署时要关注文件目录持久化
- 多实例部署时要考虑共享存储

### 3. 健康检查 `health`

#### 它解决什么问题

快速判断服务和数据库是不是正常。

#### 主要代码入口

- `src/modules/platform/health/health.controller.ts`
- `src/modules/platform/health/health.service.ts`

#### 主要接口能力

- `GET /api/health`

这通常是排查部署问题的第一步。

### 4. 用户偏好 `preferences`

#### 它解决什么问题

用户的布局、主题、暗黑模式、标签页偏好等个性化配置，统一从这里读写。

#### 主要代码入口

- `src/modules/platform/preferences/preferences.controller.ts`
- `src/modules/platform/preferences/preferences.service.ts`

#### 对应数据库表

- `user_preferences`

#### 对应前端能力

- 布局切换
- 主题切换
- 个性化界面偏好

### 5. 水印、国际化、代码生成

这三个模块目前更偏平台扩展能力：

- `watermark`：页面水印配置
- `i18n`：多语言资源读取
- `codegen`：代码生成元数据能力

新人不用第一时间深挖，但要知道平台已经给未来扩展留好了位置。

## 第八层：模块之间是怎么协作的

这里是最关键的一步。只理解每个模块还不够，还要知道它们怎么串起来。

### 例子一：用户登录后看到菜单

链路是：

1. `iam/auth` 登录成功
2. 根据用户和角色查权限
3. 去 `system/menus` 找菜单树
4. 把菜单和权限快照返回前端
5. 前端根据结果渲染菜单和动态路由

### 例子二：管理员创建一个租户

链路是：

1. 请求进入 `tenant/tenants`
2. 校验当前平台管理员权限
3. `tenant-bootstrap.service` 初始化租户基础数据
4. 写入租户、用户、角色、部门、菜单授权、字典
5. 记录租户审计日志

### 例子三：用户管理页面查列表

链路是：

1. 请求进入 `system/users`
2. `iam` 先校验登录态和权限
3. `data-scopes` 收敛数据范围
4. 按当前租户和数据权限去查 `users`
5. 返回用户分页数据给前端

## 第九层：如果你现在就要开始改代码，怎么下手

### 场景一：改登录、权限、菜单相关问题

先看：

1. `auth.controller.ts`
2. `auth.service.ts`
3. `permission-guard.ts`
4. `menus.service.ts`

### 场景二：改后台管理页接口

先看对应模块的：

1. `*.controller.ts`
2. `*.service.ts`
3. `*.dto.ts`
4. `*.response.dto.ts`

### 场景三：改租户开通逻辑

先看：

1. `tenants.controller.ts`
2. `tenants.service.ts`
3. `tenant-bootstrap.service.ts`
4. `tenant-bootstrap.templates.ts`

### 场景四：改数据库字段

先看：

1. `prisma/schema.prisma`
2. 相关模块 DTO
3. 相关 service 查询
4. seed 脚本
5. 文档页 `database/design.md`

## 第十层：推荐给新人的阅读顺序

如果我是带新人接手这个项目，我会建议按这个顺序读：

1. `src/main.ts`
2. `src/app.module.ts`
3. `src/modules/iam/auth/auth.controller.ts`
4. `src/modules/system/users/users.controller.ts`
5. `src/modules/system/roles/roles.controller.ts`
6. `src/modules/system/menus/menus.controller.ts`
7. `src/modules/tenant/tenants/tenant-bootstrap.service.ts`
8. `prisma/schema.prisma`

读完这 8 个入口，对整个后端的主干就基本建立起来了。

## 最后一层：一句话总结这个后端

这个后端本质上是一套“带多租户能力的后台平台内核”：

- `iam` 负责身份和权限
- `system` 负责后台通用业务
- `tenant` 负责 SaaS 平台化能力
- `platform` 负责支撑型公共能力

如果你顺着这个结构去理解，就不会把它看成一堆分散接口，而会把它看成一套非常清晰的后台平台骨架。
