# 产品概述

## 项目定位

LuckyColor 是一套面向中后台场景的 SaaS 管理系统，当前由两个核心仓库组成：

| 项目 | 位置 | 说明 |
| --- | --- | --- |
| `luckyColor-admin` | `D:\zl\luckyColor-admin` | 管理后台前端，基于 Vue 3 + Vite + TypeScript |
| `luckyColor-admin-serve` | `D:\zl\luckyColor-admin-serve` | 后端服务，基于 NestJS + Prisma + MySQL + Redis |

系统主要聚焦以下能力：

- 登录认证与权限控制
- 动态菜单与后台路由
- 多租户隔离与租户管理
- 系统管理能力，例如用户、角色、菜单、字典、公告、配置、日志
- 平台能力，例如仪表盘、健康检查、文件服务、Swagger 文档

## 技术栈概览

### 前端

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Naive UI
- UnoCSS
- Axios
- `vxe-table`
- `wangEditor`

### 后端

- NestJS 10
- TypeScript
- Prisma 5
- MySQL 8.x
- Redis 7.x
- Swagger / OpenAPI
- Jest

## 运行端口

| 服务 | 默认地址 | 说明 |
| --- | --- | --- |
| 前端开发服务 | `http://127.0.0.1:9900` | Vite 本地开发服务 |
| 后端接口服务 | `http://127.0.0.1:3001/api` | NestJS 接口前缀为 `/api` |
| Swagger 文档 | `http://127.0.0.1:3001/docs` | 后端启用 Swagger 时可访问 |
| MySQL | `127.0.0.1:3306` | `docker-compose.yml` 已提供 |
| Redis | `127.0.0.1:6379` | 需要自行准备本地或远程实例 |

## 当前适用场景

- SaaS 多租户管理后台
- 企业内部运营与配置后台
- 权限、租户、菜单、字典等通用后台底座
- 需要前后端分离和快速部署的后台系统
