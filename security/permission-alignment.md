# 前后端权限码对照

## 这页解决什么问题

LuckyColor 当前前端按钮显隐、Spring Boot 控制器权限校验，以及兼容层接口路径之间，已经形成了一条完整链路。本页记录的是这条链路当前的对齐结果，以及仍然需要注意的前端语义别名。

如果不把这些关系说清楚，接手者很容易遇到三种误判：

- 前端按钮不显示，以为后端没返回权限
- 后端 403，以为前端常量写对了
- 改了权限码后，不知道还要同步改哪些页面和接口

这页就是把这条链路拆开对照。

## 先记住当前权限链路

当前主链路可以概括成：

1. Spring Boot 登录后返回 `buttonCodeList` / `permissions`。
2. 前端把这些权限码写入当前用户会话。
3. 页面里通过 `usePermission()` 和 `v-permission` 控制按钮显隐。
4. 请求真正打到后端时，Spring Boot 再用 `@RequirePermission(...)` 做最终校验。

目前前端常量值已经按 Spring Boot 真实权限码完成一轮收口，所以按钮显隐与后端校验的核心字符串是一致的。

## 前端当前权限常量

前端主要集中在 `luckyColor-admin/src/constants/permission.ts`：

- 用户管理：`system:user:create`、`system:user:update`、`system:user:delete`、`system:user:assign-role`
- 角色管理：`system:role:create`、`system:role:update`、`system:role:delete`、`system:role:authorize`
- 菜单管理：`system:menu:create`、`system:menu:update`、`system:menu:delete`
- 部门管理：`system:department:create`、`system:department:update`、`system:department:delete`
- 租户管理：`tenant:create`、`tenant:update`、`tenant:delete`
- 租户套餐：`tenant:package:create`、`tenant:package:update`、`tenant:package:delete`

## Spring Boot 当前真实校验点

Spring Boot 当前主要在两层做权限校验：

- 原生控制器，如 `/api/admin/users`、`/api/admin/tenants`
- 前端兼容层，如 `/api/users`、`/api/roles`、`/api/tenant-packages`

两层最终都依赖 `@RequirePermission(...)`。

## 当前最重要的对齐结果

下面这张表列的是本轮已经收口的关键权限：

| 业务场景 | 前端当前常量值 | Spring Boot 真实权限码 | 说明 |
| --- | --- | --- | --- |
| 用户分配角色 | `system:user:assign-role` | `system:user:assign-role` | 已对齐 |
| 角色授权菜单 / 数据范围 | `system:role:authorize` | `system:role:authorize` | 已对齐 |
| 租户创建 | `tenant:create` | `tenant:create` | 已对齐 |
| 租户更新 | `tenant:update` | `tenant:update` | 已对齐 |
| 租户删除 | `tenant:delete` | `tenant:delete` | 已对齐 |
| 租户状态切换 | `tenant:update` | `tenant:update` | 继续复用 update 权限 |
| 租户套餐绑定菜单 | `tenant:package:update` | `tenant:package:update` | 继续复用 update 权限 |

## 还需要注意什么

### 1. 前端分组名不一定等于最终权限值

为了减少业务页改动，前端常量对象的键名仍保留了一些语义化写法，例如：

- `BUTTON_PERMISSION_CODES.systemUser.assign`
- `BUTTON_PERMISSION_CODES.systemRole.grant`
- `BUTTON_PERMISSION_CODES.tenantManage.changeStatus`
- `BUTTON_PERMISSION_CODES.tenantPackage.bind`

但这些键对应的值已经对齐到了后端真实权限码，所以真正参与判断的是值，不是键名。

### 2. 有两处仍然是“动作语义别名”

当前有两处前端业务语义和后端权限值不是一一同名，而是复用同一个后端权限：

- `tenantManage.changeStatus` 实际使用 `tenant:update`
- `tenantPackage.bind` 实际使用 `tenant:package:update`

这不是 bug，而是当前后端权限模型本来就是这么设计的。

### 3. 兼容层路径和权限值是两回事

Spring Boot 兼容层已经把接口路径翻译成前端习惯，例如：

- `/api/users`
- `/api/roles/{id}/menus`
- `/api/tenant-packages/{id}/menus`

而权限判断仍以 `@RequirePermission(...)` 上的真实值为准。

## 结合接口怎么理解

### 用户管理

- 前端接口：`PUT /api/users/{id}/roles`
- Spring Boot 兼容层：`FrontendSystemCompatibilityController`
- 后端权限：`system:user:assign-role`
- 前端按钮常量值：`system:user:assign-role`

### 角色菜单与数据权限

- 前端接口：`PUT /api/roles/{id}/menus`
- 前端接口：`PUT /api/roles/{id}/data-scope`
- Spring Boot 兼容层权限：`system:role:authorize`
- 前端按钮常量值：`system:role:authorize`

### 租户管理

- 前端接口：`POST /api/tenants`
- 前端接口：`PATCH /api/tenants/{id}`
- 前端接口：`DELETE /api/tenants/{id}`
- Spring Boot 兼容层权限：`tenant:create`、`tenant:update`、`tenant:delete`
- 前端按钮常量值：`tenant:create`、`tenant:update`、`tenant:delete`

### 租户套餐菜单绑定

- 前端接口：`PUT /api/tenant-packages/{id}/menus`
- Spring Boot 兼容层权限：`tenant:package:update`
- 前端按钮常量值：`tenant:package:update`

## 当前文档建议怎么用

如果你在排查“为什么按钮没出来”或“为什么接口 403”，建议按下面顺序对：

1. 先看前端页面用的是哪个 `BUTTON_PERMISSION_CODES`。
2. 再看对应接口落到哪个 Spring Boot 兼容层控制器。
3. 再看控制器上的 `@RequirePermission(...)` 是什么真实权限码。
4. 最后确认登录返回的 `buttonCodeList` 里到底是哪一组值。

## 当前文档建议怎么理解剩余别名

如果你在看业务页代码时碰到下面这些写法，可以直接按右侧理解：

1. `systemUser.assign` 实际等于 `system:user:assign-role`
2. `systemRole.grant` 实际等于 `system:role:authorize`
3. `tenantManage.changeStatus` 实际等于 `tenant:update`
4. `tenantPackage.bind` 实际等于 `tenant:package:update`

也就是说，前端页面里保留的是“业务动作命名”，真正参与权限判断的是已经对齐后的权限值。
