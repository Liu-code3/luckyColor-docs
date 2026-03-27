# luckyColor-docs

LuckyColor SaaS 平台文档中心，基于 VitePress 构建。

本仓库用于沉淀 LuckyColor 的产品总览、前后端项目结构、数据库设计、接口规范、权限体系与部署方案，帮助开发、测试、实施和运维人员更快理解并接手整个平台。

## 对应项目

| 项目 | 位置 | 说明 |
| --- | --- | --- |
| `luckyColor-docs` | `https://github.com/Liu-code3/luckyColor-docs` | 当前文档仓库 |
| `luckyColor-admin` | `https://github.com/Liu-code3/luckyColor-admin` | 管理后台前端 |
| `luckyColor-admin-serve` | `https://github.com/Liu-code3/luckyColor-admin-serve` | 后端服务 |

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
- 前端与后端真实目录结构说明
- 数据库设计与种子数据
- 接口规范与权限安全
- 本地部署、生产部署、Docker Compose、Nginx / HTTPS、部署排查
- 后端未来切换到 Java 时的文档更新清单
