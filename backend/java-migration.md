# 切换 Java 时的文档更新点

## 这页的目的

当前 LuckyColor 后端基于 NestJS。以后如果后端改为 Java，例如 Spring Boot、Spring Cloud 或其他 Java 技术栈，文档不能只改一句“技术栈从 Node 换成 Java”，而是需要把所有和运行方式、部署方式、接口契约、目录结构有关的内容一并更新。

本页就是一份迁移时的文档检查清单。

## 先区分两类内容

### 可以保持稳定的内容

这类内容如果迁移时尽量不变，前端和交付成本会低很多：

- `/api` 作为全局接口前缀
- `x-tenant-id` 作为默认租户 Header
- 登录返回 `accessToken + user` 的整体语义
- `/api/auth/access` 返回菜单树、角色和按钮权限快照
- 菜单字段结构，例如 `path`、`component`、`meta`
- 文件上传和访问路径
- 多租户、RBAC、数据权限的业务规则

### 必须更新的内容

这类内容一旦切换到 Java，就必须同步更新：

- 技术栈说明
- 项目目录结构
- 启动命令
- 环境变量命名
- Dockerfile
- Docker Compose 示例
- 部署脚本和进程守护方式
- ORM、数据库迁移工具和初始化脚本说明

## 需要同步更新的文档清单

| 文档 | 为什么必须更新 |
| --- | --- |
| `README.md` | 仓库首页通常是第一个被看到的入口 |
| `index.md` | 首页 hero 和特性说明里会写当前后端技术栈 |
| `guide/overview.md` | 产品总览里的前后端技术栈和仓库说明需要更新 |
| `guide/quick-start.md` | 启动命令、依赖安装方式和初始化步骤会变 |
| `architecture/overview.md` | 系统架构图中的后端实现与目录结构会变 |
| `backend/overview.md` | 后端主体文档必须整体重写 |
| `api/spec.md` | 如果接口契约、错误码、分页结构或认证方式变化，需要同步更新 |
| `database/design.md` | ORM、迁移工具、初始化方式变了就要更新 |
| `deployment/local.md` | 本地启动命令与依赖会变 |
| `deployment/production.md` | 生产部署、JDK、Jar 包或容器启动方式会变 |
| `deployment/docker-compose.md` | `server` 镜像构建方式和环境变量会变 |
| `deployment/nginx-https.md` | 反代目标和健康检查地址可能变化 |
| `deployment/troubleshooting.md` | 故障排查点会从 Node/NestJS 转为 Java/JVM |
| `examples/deploy/server.Dockerfile` | 需要改为 Java 构建与运行镜像 |
| `examples/deploy/docker-compose.prod.yml` | 服务启动命令、镜像上下文和环境变量会变 |

## 建议的迁移思路

### 第一步：先定义“不变的对外契约”

迁移前先明确哪些契约要保持稳定：

- 接口路径是否保持 `/api`
- Token 是否还是 Bearer Token
- 菜单、权限、租户 Header 是否沿用现有结构
- 统一响应格式是否仍然是 `{ code, msg, data }`
- 错误码是否延续当前体系

如果这些能保持不变，前端和文档的改动量会明显下降。

### 第二步：再定义“技术实现替换表”

下面是一份常见的 Node/NestJS 到 Java/Spring 的映射参考：

| 当前能力 | 现状 | 迁移后可能对应 |
| --- | --- | --- |
| Web 框架 | NestJS | Spring Boot |
| ORM | Prisma | MyBatis Plus、JPA、jOOQ 等 |
| 配置文件 | `.env` | `application.yml`、环境变量、配置中心 |
| 运行命令 | `pnpm dev` / `pnpm start:prod` | `mvn spring-boot:run`、`java -jar` |
| 构建工具 | pnpm + nest build | Maven 或 Gradle |
| Swagger | `@nestjs/swagger` | springdoc-openapi |
| 认证与拦截 | Guard / Decorator | Filter / Interceptor / AOP |
| DTO 校验 | class-validator | Jakarta Validation |

### 第三步：最后更新文档，不要反过来做

正确顺序应该是：

1. 先确定 Java 版本的目录结构、启动命令、配置命名和接口契约。
2. 再批量更新文档。
3. 最后让前端、测试、运维一起按文档重新走一遍。

如果先写文档、后定方案，文档很容易写了两遍还不准确。

## Java 版本最容易漏改的文档点

### 1. 启动命令

当前文档里大量出现：

- `pnpm install`
- `pnpm db:setup`
- `pnpm dev`
- `pnpm build`
- `pnpm start:prod`

切换 Java 后，这些都需要改。

### 2. 环境变量

当前后端是这一套命名：

- `DATABASE_URL`
- `JWT_SECRET`
- `REDIS_URL`
- `SWAGGER_ENABLED`
- `TENANT_HEADER`

Java 项目可能改为：

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `SPRING_REDIS_HOST`
- `SPRINGDOC_SWAGGER_UI_ENABLED`

如果环境变量名改了，但部署文档没改，交付时最容易卡住。

### 3. 数据库初始化方式

当前文档默认使用：

- `prisma generate`
- `prisma db push`
- `prisma seed`

如果 Java 改用 Flyway 或 Liquibase，就必须同步更新：

- 数据库初始化命令
- 数据库版本迁移说明
- 种子数据写法
- 回滚方式

### 4. Dockerfile

当前示例镜像是 Node 运行时：

```dockerfile
FROM node:20-alpine
```

切换 Java 后，通常要改成 JDK 构建 + JRE 运行，或者直接使用带 JDK 的基础镜像。

### 5. 运维排查项

Node 项目和 Java 项目的常见问题完全不一样：

- Node 更关注 `pnpm`、端口占用、环境变量、运行时依赖
- Java 更关注 JDK 版本、JVM 参数、内存、线程池、GC、Jar 包路径

所以部署排查文档也必须同步调整。

## 推荐的文档更新顺序

建议按下面顺序改，最不容易漏：

1. `README.md`
2. `backend/overview.md`
3. `guide/quick-start.md`
4. `architecture/overview.md`
5. `deployment/local.md`
6. `deployment/production.md`
7. `deployment/docker-compose.md`
8. `deployment/troubleshooting.md`
9. `api/spec.md`
10. `database/design.md`
11. 示例部署文件

## 建议保留的稳定约定

为了减少前端和实施成本，推荐尽量保留这些对外约定：

- API 前缀继续用 `/api`
- Swagger 地址继续用 `/docs`
- 租户 Header 继续用 `x-tenant-id`
- 登录与权限快照接口路径不变
- 统一响应结构不变
- 核心错误码不大改

如果这些全部变化，前端代码、测试脚本、部署配置和文档都要同步大改，成本会明显增大。

## 迁移完成后的验收清单

- 文档中所有 `NestJS`、`Prisma`、`pnpm dev` 等旧表述都已替换
- 文档中的目录结构与 Java 项目真实目录一致
- 本地启动文档能被新成员按步骤复现
- Docker Compose 示例能成功启动 Java 服务
- 生产部署文档能覆盖 Jar 包或容器部署方式
- 接口规范与 Swagger 实际输出一致
- 前端联调不需要猜测新的租户 Header 或新的响应结构

## 最后建议

如果未来真的切到 Java，建议把文档中的“领域与功能”保持稳定，把“实现与部署”单独替换。这样使用者看文档时仍然能沿着“登录、权限、系统管理、租户、工作台、部署”这条线理解平台，而不会因为技术栈切换导致整体认知被打散。
