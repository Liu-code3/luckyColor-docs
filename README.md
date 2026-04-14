# luckyColor-docs

LuckyColor SaaS 平台文档中心，基于 VitePress 构建。

本仓库用于沉淀 LuckyColor 的产品总览、前后端项目结构、数据库设计、接口规范、权限体系与部署方案，帮助开发、测试、实施和运维人员更快理解并接手整个平台。

当前 LuckyColor 已经同时具备两套后端实现：

- `luckyColor-admin-serve`：基于 NestJS + Prisma 的 Node.js 实现
- `luckycolor-admin-springboot`：基于 Spring Boot + MyBatis-Plus 的 Java 实现

## 对应项目

| 项目 | 位置 | 说明 |
| --- | --- | --- |
| `luckyColor-docs` | `https://github.com/Liu-code3/luckyColor-docs` | 当前文档仓库 |
| `luckyColor-admin` | `https://github.com/Liu-code3/luckyColor-admin` | 管理后台前端 |
| `luckyColor-admin-serve` | `https://github.com/Liu-code3/luckyColor-admin-serve` | NestJS 后端服务 |
| `luckyColor-admin-springboot` | `/Users/admin/code/luckyColor-admin-springboot` | Spring Boot 后端服务 |

## 路径约定

为了避免大多数页面继续写死个人电脑路径，仓库内仍尽量使用占位写法；但 Spring Boot 项目当前已确认本机位置如下：

- `/Users/admin/code/luckyColor-admin-springboot`

其他仓库仍统一使用以下占位写法：

- `<workspace>/luckyColor-admin`
- `<workspace>/luckyColor-admin-serve`

只要把 `<workspace>` 替换成你自己的代码目录即可，例如 `~/code`、`/srv/workspace` 或任意团队统一工作区。

## 默认联调配置

当前文档统一按本地默认联调口径编写：

- MySQL：`127.0.0.1:3306`
- Redis：`127.0.0.1:6379`
- MySQL 默认账号：`root`
- MySQL 默认密码：`123456`

环境变量逐项对照见 [双后端环境变量与默认值对照](/guide/env-alignment)。

## 文档参考基线

这套文档在补写时，额外参考了 GitHub / Gitee 上 star 1k 以上的多租户 SaaS / 中后台项目文档组织方式，重点吸收了这些项目的优点：

- `YunaiV/ruoyi-vue-pro` 与 Gitee `zhijiantianya/ruoyi-vue-pro`
- `jeecgboot/JeecgBoot` 与 Gitee `jeecg/JeecgBoot`
- `dromara/RuoYi-Vue-Plus` 与 Gitee `dromara/RuoYi-Vue-Plus`

对应的整理页见 [参考项目与文档改进思路](/guide/reference-projects)。

## 本地启动文档站

```bash
pnpm install
pnpm docs:dev
```

## 构建与预览

```bash
pnpm docs:build
pnpm docs:preview
```

## 文档主要内容

- 产品定位与功能地图
- 系统架构与前后端分工
- 前端与 NestJS / Spring Boot 双后端真实目录结构说明
- 数据库设计与种子数据
- 接口规范与权限安全
- 本地部署、生产部署、Docker Compose、Nginx / HTTPS、部署排查
- 双后端联调方式，以及 NestJS 向 Spring Boot 对齐时的文档更新清单
