# Spring Boot 与 NestJS 接口契约对照表

## 这页的目的

LuckyColor 现在同时存在两套后端实现：

- `NestJS`：`D:\zl\luckyColor-admin-serve`
- `Spring Boot`：`D:\zl\luckycolor-admin-springboot`

前端已经支持在两套后端之间切换，但两边的代码组织方式并不完全一样。为了让前端、测试、实施和后端维护者更容易对齐，这页专门回答一个问题：

“当前前端真正依赖的接口契约，在 NestJS 和 Spring Boot 里分别落在哪里。”

## 先记住一个总原则

两套后端尽量保持这些对外约定稳定：

- 全局前缀都是 `/api`
- 租户头默认都是 `x-tenant-id`
- 成功响应都保持 `{ code, msg, data }`
- 当前前端仍主要调用历史兼容路径，如 `/users`、`/roles`、`/dict/tree`
- Spring Boot 在保留这些兼容路径的同时，还额外提供了一批原生 `/admin/*` 接口

所以在 Java 版本里，经常会看到“前端兼容路径”和“原生业务路径”并存。

## 基础入口对照

| 项目 | NestJS | Spring Boot | 说明 |
| --- | --- | --- | --- |
| 服务根地址 | `http://127.0.0.1:3002` | `http://127.0.0.1:3001` | 当前前端默认 `dev` 指向 Spring Boot |
| API 前缀 | `/api` | `/api` | 两边保持一致 |
| Swagger | `/docs` | `/api/docs` | 这是最常见的外部差异 |
| 健康检查 | `/api/health` | `/api/health` | 两边一致 |

## 认证接口对照

这批接口是两套后端里对齐程度最高的一组。

| 前端使用路径 | NestJS | Spring Boot | 备注 |
| --- | --- | --- | --- |
| `POST /api/auth/login` | 原生支持 | 原生支持 | 当前登录主入口 |
| `GET /api/auth/profile` | 原生支持 | 原生支持 | 页面刷新恢复资料 |
| `GET /api/auth/access` | 原生支持 | 原生支持 | 完整访问快照 |
| `GET /api/auth/routes` | 原生支持 | 原生支持 | 动态路由树 |
| `GET /api/auth/button-permissions` | 原生支持 | 原生支持 | 按钮权限码 |
| `GET /api/auth/captcha/challenge` | 原生支持 | 原生支持 | 算术验证码挑战 |
| `POST /api/auth/captcha/verify` | 原生支持 | 原生支持 | 验证码校验 |

### 当前要注意什么

- 认证相关路径基本不需要为双后端切换改前端代码。
- Spring Boot 版本额外还支持 `/auth/captcha` 这类 Java 原生扩展，但前端当前主流程不依赖它。

## 当前前端最常调用的业务接口对照

下面这组路径来自前端当前实际调用方式，例如：

- `src/api/users.ts`
- `src/api/roles.ts`
- `src/api/departments.ts`
- `src/api/menus.ts`
- `src/api/configs.ts`
- `src/api/dict.ts`
- `src/api/tenants.ts`
- `src/api/tenantPackages.ts`
- `src/api/file.ts`

### 系统管理

| 前端使用路径 | NestJS 落点 | Spring Boot 落点 | Spring Boot 原生替代 |
| --- | --- | --- | --- |
| `GET /api/users` | 原生 `users.controller.ts` | `FrontendSystemCompatibilityController` | `/api/admin/users/page` |
| `POST /api/users` | 原生 `users.controller.ts` | `FrontendSystemCompatibilityController` | `/api/admin/users` |
| `GET /api/roles` | 原生 `roles.controller.ts` | `FrontendSystemCompatibilityController` | `/api/admin/roles/page` |
| `POST /api/roles` | 原生 `roles.controller.ts` | `FrontendSystemCompatibilityController` | `/api/admin/roles` |
| `GET /api/departments` | 原生 `departments.controller.ts` | `FrontendSystemCompatibilityController` | `/api/admin/departments/tree` 或相关原生接口 |
| `GET /api/departments/tree` | 原生 `departments.controller.ts` | `FrontendSystemCompatibilityController` | `/api/admin/departments/tree` |
| `GET /api/menus/tree` | 原生 `menus.controller.ts` | `FrontendSystemCompatibilityController` | `/api/admin/menus/tree` |
| `POST /api/menus` | 原生 `menus.controller.ts` | `FrontendSystemCompatibilityController` | `/api/admin/menus` |
| `GET /api/configs` | 原生 `configs.controller.ts` | `FrontendContentCompatibilityController` | `/api/admin/system-configs/page` |
| `POST /api/configs` | 原生 `configs.controller.ts` | `FrontendContentCompatibilityController` | `/api/admin/system-configs` |
| `GET /api/dict/tree` | 原生 `dictionary.controller.ts` | `FrontendContentCompatibilityController` | `/api/admin/dictionary-items/tree` |
| `GET /api/dict/page` | 原生 `dictionary.controller.ts` | `FrontendContentCompatibilityController` | `/api/admin/dictionary-types/page` |
| `POST /api/dict` | 原生 `dictionary.controller.ts` | `FrontendContentCompatibilityController` | `/api/admin/dictionary-types` 或字典项原生接口 |
| `POST /api/dict/refresh-cache` | 原生 `dictionary.controller.ts` | `FrontendContentCompatibilityController` | 原生字典缓存刷新接口 |

### 租户与平台能力

| 前端使用路径 | NestJS 落点 | Spring Boot 落点 | Spring Boot 原生替代 |
| --- | --- | --- | --- |
| `GET /api/tenants` | 原生 `tenants.controller.ts` | `FrontendTenantCompatibilityController` | `/api/admin/tenants/page` |
| `POST /api/tenants` | 原生 `tenants.controller.ts` | `FrontendTenantCompatibilityController` | `/api/admin/tenants` |
| `GET /api/tenant-packages` | 原生 `tenant-packages.controller.ts` | `FrontendTenantCompatibilityController` | `/api/admin/tenant-packages/page` |
| `POST /api/tenant-packages` | 原生 `tenant-packages.controller.ts` | `FrontendTenantCompatibilityController` | `/api/admin/tenant-packages` |
| `GET /api/dashboard/overview` | 原生 `dashboard.controller.ts` | `FrontendCompatibilityController` | `/api/admin/dashboard/overview` |
| `POST /api/dashboard/track-visit` | 原生 `dashboard.controller.ts` | `FrontendCompatibilityController` | 无需额外改造 |
| `POST /api/file/upload` | 原生 `file.controller.ts` | `FrontendTenantCompatibilityController` | `/api/admin/files/upload` |
| `GET /api/file/delete` | 原生 `file.controller.ts` | `FrontendTenantCompatibilityController` | `/api/admin/files/*` |

## 为什么 Spring Boot 里会出现两套路径

可以把 Java 版本理解成两层：

### 1. 兼容层

位于：

```text
src/main/java/com/luckycolor/admin/modules/frontend/web/
```

这层的目的，是把当前前端历史上已经依赖的路径和返回结构继续接住，例如：

- `/users`
- `/roles`
- `/configs`
- `/dict/tree`
- `/tenants`
- `/file/upload`

### 2. 原生层

位于：

```text
src/main/java/com/luckycolor/admin/modules/system/*/web/
src/main/java/com/luckycolor/admin/modules/tenant/*/web/
src/main/java/com/luckycolor/admin/modules/platform/*/web/
```

这层更贴近 Java 仓库内部设计，常见路径形如：

- `/api/admin/users/page`
- `/api/admin/roles/page`
- `/api/admin/dictionary-types/page`
- `/api/admin/tenants/page`
- `/api/admin/files/upload`

所以看到同一类能力在 Spring Boot 里有两条路径时，不要马上认为“重复设计”，它很多时候是在做“兼容旧前端 + 提供原生 Java API”这两件事。

## 当前最值得优先保持稳定的契约

如果你在继续维护双后端，最建议先守住这几类契约：

- 登录链路：`/api/auth/*`
- 页面刷新恢复：`/api/auth/profile`
- 菜单恢复：`/api/menus/tree`
- 用户、角色、部门、菜单等系统管理旧路径
- 租户旧路径：`/api/tenants`、`/api/tenant-packages`
- 文件上传旧路径：`/api/file/upload`
- 统一响应结构：`{ code, msg, data }`
- 默认租户头：`x-tenant-id`

只要这些保持稳定，前端切换 `dev:springboot` 和 `dev:nestjs` 的成本就会低很多。

## 排查双后端差异时，建议按这个顺序看

1. 先确认是不是同一路径。
2. 再确认两边是否都挂在 `/api` 下。
3. 再确认 Swagger 地址是不是搞混了。
4. 如果是 Spring Boot，再判断这是兼容层接口还是原生 `/admin/*` 接口。
5. 最后再比较字段名、分页结构、菜单字段和错误码。

## 推荐配合阅读

- [接口规范](/api/spec)
- [Spring Boot 后端说明](/backend/springboot-overview)
- [Spring Boot 后端模块渐进式解读](/backend/springboot-module-walkthrough)
- [NestJS 后端说明](/backend/overview)
