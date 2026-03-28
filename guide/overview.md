# 产品概述

## 项目定位

LuckyColor 是一套面向中后台场景的多租户 SaaS 管理平台。当前文档所对应的真实项目由三个部分组成：

| 项目 | 位置 | 作用 |
| --- | --- | --- |
| `luckyColor-docs` | `https://github.com/Liu-code3/luckyColor-docs` | 文档站，基于 VitePress |
| `luckyColor-admin` | `https://github.com/Liu-code3/luckyColor-admin` | 管理后台前端，基于 Vue 3 + Vite + TypeScript |
| `luckyColor-admin-serve` | `https://github.com/Liu-code3/luckyColor-admin-serve` | 后端服务，基于 NestJS + Prisma + MySQL + Redis |

这套平台不是单一业务系统，而是一套可继续承载更多业务模块的“后台底座”。它已经实现了常见 SaaS 平台需要的账户、权限、菜单、租户、字典、配置、公告和工作台等能力。

如果你当前最想快速厘清“租户、部门、角色、用户”之间的真实关系，可以直接继续阅读 [核心关系说明](/guide/domain-relationships)。

## 平台想解决的问题

- 为多租户后台提供统一的登录、权限、租户隔离和系统管理能力。
- 为前端提供动态菜单、按钮权限、工作台统计、字典与配置等通用基础数据。
- 为交付和运维提供可快速拉起的开发环境、生产部署方案和故障排查路径。
- 为后续扩展业务模块保留稳定的接口、数据库与权限框架。

## 核心功能地图

| 功能域 | 使用者会看到什么 | 前端落点 | 后端落点 |
| --- | --- | --- | --- |
| 登录认证 | 登录页、算术验证码、登录态恢复 | `src/views/login`、`src/utils/auth*` | `modules/iam/auth` |
| 权限与路由 | 动态菜单、按钮显隐、页面访问控制 | `src/store/modules/menu.ts`、`src/directives/permission.ts` | `modules/iam/permissions`、`modules/iam/data-scopes` |
| 工作台 | 首页统计、访问趋势、最近访问、公告 | `src/views/index`、`src/api/dashboard.ts` | `modules/platform/dashboard` |
| 用户管理 | 用户列表、导出、导入、重置密码、分配角色 | `src/views/sys/user.vue` | `modules/system/users` |
| 角色管理 | 角色、菜单授权、数据权限范围 | `src/views/sys/role` | `modules/system/roles` |
| 菜单管理 | 菜单树、排序、启停、动态路由来源 | `src/views/sys/menu` | `modules/system/menus` |
| 部门管理 | 部门树、负责人、成员归属 | `src/views/sys/department` | `modules/system/departments` |
| 字典管理 | 字典树、分页、统一枚举出口 | `src/views/sys/dict` | `modules/system/dictionary` |
| 系统配置 | 配置项管理与缓存刷新 | `src/views/sys/config` | `modules/system/configs` |
| 通知公告 | 公告维护与工作台展示 | `src/views/sys/notice` | `modules/system/notices` |
| 租户管理 | 租户列表、创建租户、默认资源初始化 | `src/views/sys/tenant` | `modules/tenant/tenants` |
| 租户套餐 | 套餐维护、能力开关、配额限制与租户绑定 | `src/views/sys/tenantPackage` | `modules/tenant/tenant-packages` |
| 文件服务 | 文件上传、图片访问 | 上传组件与文件 API | `modules/platform/file` |
| 平台附加能力 | 健康检查、偏好设置、水印、国际化、代码生成 | API 层与工具页 | `modules/platform/*` |

## 技术栈概览

### 前端

- Vue 3
- Vite 8
- TypeScript
- Pinia
- Vue Router
- Naive UI
- UnoCSS
- Axios
- `vxe-table`
- `wangEditor`
- Playwright 冒烟测试

### 后端

- NestJS 10
- TypeScript
- Prisma 5
- MySQL 8.x
- Redis 7.x
- Swagger / OpenAPI
- Jest 单元测试与 e2e 测试

### 部署与交付

- Nginx 反向代理
- Docker Compose 示例编排
- 前端静态资源部署
- Node.js 进程或容器化运行后端服务

## 运行入口

| 服务 | 默认地址 | 说明 |
| --- | --- | --- |
| 前端开发服务 | `http://127.0.0.1:9900` | Vite 本地开发服务 |
| 后端接口 | `http://127.0.0.1:3001/api` | 全局前缀为 `/api` |
| Swagger | `http://127.0.0.1:3001/docs` | 便于联调和接口核对 |
| MySQL | `127.0.0.1:3306` | 后端默认数据库 |
| Redis | `127.0.0.1:6379` | 字典缓存、验证码、辅助缓存等能力依赖 |

## 多租户模型怎么理解

LuckyColor 当前采用“共享数据库、共享表、逻辑隔离”的多租户模式：

- 核心业务表大多带有 `tenant_id`。
- 用户、角色、部门等数据默认在租户范围内唯一。
- 租户识别优先级为请求头 `x-tenant-id`、域名后缀、登录态 Token、默认租户配置。
- 创建租户时，系统会自动初始化管理员、角色、部门、菜单授权和基础字典。

如果你想把这块关系看得更细，可以继续阅读 [核心关系说明](/guide/domain-relationships)。

这意味着平台既适合本地开发时通过 Header 指定租户，也适合未来演进为二级域名租户模式。

## 适用场景

- SaaS 多租户管理后台
- 企业内部运营后台
- 需要 RBAC、菜单、租户、字典、日志能力的系统底座
- 需要快速交付演示环境、测试环境或中小规模生产环境的项目

## 推荐的接手顺序

1. 先看本页，搞清楚系统解决什么问题、有哪些模块。
2. 再看“系统架构总览”，理解请求是如何从前端进入后端和数据库的。
3. 然后分别阅读“前端说明”和“后端说明”，对照真实仓库看目录和代码。
4. 联调时配合“接口规范”“权限安全”“数据库设计”一起看。
5. 如果你要搞清楚登录恢复、联调模式与 Mock/真实接口切换，继续看 [会话恢复与联调模式](/frontend/session-and-api-modes)。
6. 准备部署或交付时重点查看“部署方案”章节。

## 后续维护建议

- 新增业务模块时，同时补充前端页面、后端模块、数据库表和接口说明四处文档。
- 修改默认端口、环境变量或部署方式时，优先更新“快速开始”和“部署方案”。
- 如果后端后续改为 Java，请同步阅读并更新 [切换 Java 时的文档更新点](/backend/java-migration)。
