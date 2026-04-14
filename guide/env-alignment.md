# 双后端环境变量与默认值对照

## 这页解决什么问题

LuckyColor 现在同时存在 Spring Boot 与 NestJS 两套后端实现，但前端、文档和后端各自都有一层本地配置。接手项目时，最容易混乱的往往不是代码本身，而是：

- 当前到底该连哪个端口
- MySQL 和 Redis 默认该写哪里
- 前端 `mode` 和后端端口怎么对应
- 哪些值是团队默认口径，哪些只是个人本地覆盖

这页专门把这些问题一次说清楚。

## 当前统一采用的联调默认值

本轮文档统一按下面这套默认口径编写：

- MySQL：`127.0.0.1:3306`
- Redis：`127.0.0.1:6379`
- MySQL 账号：`root`
- MySQL 密码：`123456`
- Spring Boot API：`http://127.0.0.1:3001/api`
- NestJS API：`http://127.0.0.1:3002/api`
- 前端开发地址：`http://127.0.0.1:9900`
- 默认租户：`tenant_001`
- 默认管理员：`admin / 123456`

## 项目位置

- 前端：`<workspace>/luckyColor-admin`
- NestJS：`<workspace>/luckyColor-admin-serve`
- Spring Boot：`/Users/admin/code/luckyColor-admin-springboot`

## 前端模式与后端目标地址

前端当前两套模式文件都已经明确写死了代理目标：

| 文件 | 目标后端 | 默认值 |
| --- | --- | --- |
| `luckyColor-admin/.env.springboot` | Spring Boot | `VITE_API_PROXY_TARGET=http://127.0.0.1:3001` |
| `luckyColor-admin/.env.nestjs` | NestJS | `VITE_API_PROXY_TARGET=http://127.0.0.1:3002` |

也就是说：

- `pnpm dev` 与 `pnpm dev:springboot` 默认联调 Spring Boot
- `pnpm dev:nestjs` 默认联调 NestJS

## Spring Boot 当前真实默认值

Spring Boot 当前以 `src/main/resources/application.yml` 为基础口径，关键默认项如下：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `SERVER_PORT` | `3001` | 后端端口 |
| `DB_HOST` | `127.0.0.1` | MySQL 主机 |
| `DB_PORT` | `3306` | MySQL 端口 |
| `DB_NAME` | `luckycolor_admin_sb` | Java 版本数据库 |
| `DB_USERNAME` | `root` | MySQL 用户名 |
| `DB_PASSWORD` | `123456` | MySQL 密码 |
| `REDIS_HOST` | `127.0.0.1` | Redis 主机 |
| `REDIS_PORT` | `6379` | Redis 端口 |
| `REDIS_PASSWORD` | 空 | Redis 密码 |
| `REDIS_DATABASE` | `0` | Redis DB |
| `JWT_SECRET` | `replace-with-a-strong-secret-for-luckycolor-admin` | JWT 密钥 |
| `TENANT_ENABLED` | `true` | 开启租户模式 |
| `TENANT_HEADER` | `x-tenant-id` | 租户 Header |
| `LOGIN_CAPTCHA_ENABLED` | `true` | 登录验证码开关 |

### 要额外注意什么

Spring Boot 项目里如果存在个人本地 `local profile` 或额外环境变量覆盖，它们可能指向其他服务器；但团队文档和默认联调口径，统一仍以这份默认值为准。

换句话说，这份文档回答的是“标准联调应该怎么配”，不是“某台开发机私下改过什么值”。

## NestJS 当前文档默认值

当前 NestJS 本地仓库没有出现在本次机器扫描路径里，所以这里采用 LuckyColor 现有文档与前端模式文件中已经确认的口径：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PORT` | `3001` 或联调时建议改成 `3002` | 后端端口 |
| `DATABASE_URL` | 指向 `luckycolor_admin` 的 MySQL 连接串 | NestJS 数据库 |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis 地址 |
| `JWT_SECRET` | `replace-with-a-strong-secret` | JWT 密钥 |
| `TENANT_ENABLED` | `true` | 开启租户模式 |
| `TENANT_HEADER` | `x-tenant-id` | 租户 Header |
| `LOGIN_CAPTCHA_ENABLED` | `true` | 登录验证码开关 |

## 双后端差异最值得记住的点

### 1. 端口差异

- Spring Boot：默认 `3001`
- NestJS：为了和 Spring Boot 并存，联调时建议 `3002`

### 2. 数据库名差异

- Spring Boot：`luckycolor_admin_sb`
- NestJS：`luckycolor_admin`

### 3. Redis 口径

两套后端文档当前统一按 `127.0.0.1:6379` 描述，这样前后端联调最稳定，也最容易排查。

### 4. 前端租户 Header

前端两套模式都默认发送：

```http
x-tenant-id: tenant_001
```

这意味着如果你后端没有种子好 `tenant_001`，登录、菜单和系统页请求会直接出现偏差。

## 推荐的联调检查顺序

1. 先确认 MySQL 和 Redis 都在本地默认地址启动。
2. 再确认后端端口与前端模式匹配。
3. 再确认数据库名是否对应了当前后端实现。
4. 最后确认前端默认租户和管理员账号是否可用。

## 如果你要继续排查权限问题

环境变量配通以后，下一个最容易卡住的是权限码。继续阅读 [前后端权限码对照](/security/permission-alignment)。
