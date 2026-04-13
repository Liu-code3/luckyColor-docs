---
layout: home

hero:
  name: "LuckyColor SaaS Docs"
  text: "LuckyColor SaaS 平台文档中心"
  tagline: "覆盖产品理解、前后端项目结构、数据库模型、接口规范、权限体系与部署交付，帮助新成员快速接手 LuckyColor SaaS 平台。"
  image:
    src: /logo.svg
    alt: LuckyColor
  actions:
    - theme: brand
      text: 开始阅读
      link: /guide/overview
    - theme: alt
      text: 查看部署
      link: /deployment/local

features:
  - title: 贴近真实项目
    details: 文档内容基于真实前端仓库 luckyColor-admin 与后端仓库 luckyColor-admin-serve 整理，不是脱离代码的模板说明。
  - title: 面向接手与交付
    details: 不只解释技术栈，还会说明功能模块、协作边界、启动顺序、联调链路、部署步骤与常见故障。
  - title: 前后端一体化
    details: 同时覆盖 Vue 3 管理端、NestJS 与 Spring Boot 两套后端实现、数据库模型、Swagger / OpenAPI 接口规范与 Nginx 反向代理方案。
  - title: 便于后续迁移
    details: 既提供 Spring Boot 独立说明，也保留 NestJS 向 Java 迁移时的文档更新清单，方便双实现并行维护。
---

## 这套文档解决什么问题

- 帮助第一次接触 LuckyColor 的开发、测试、运维、实施同学快速看懂系统全貌。
- 帮助交付人员明确每个功能模块在前端、后端、数据库中的落点。
- 帮助部署人员理解 Spring Boot / NestJS 两套后端的本地启动、单机生产部署、Docker Compose 部署与 Nginx / HTTPS 配置。
- 帮助后续维护者在修改接口、数据库或更换后端技术栈时同步更新文档。

## 推荐阅读顺序

1. 先看“产品总览”，快速理解平台定位、功能地图和仓库分工。
2. 再看“系统架构”，建立前端、后端、数据库、缓存和部署入口之间的关系。
3. 然后进入“前端文档”和“后端文档”，分别理解真实目录结构、运行配置和模块职责。
4. 需要联调时查看“接口规范”“数据库设计”“权限安全”。
5. 准备交付或上线时重点阅读“部署方案”。

## 文档覆盖范围

- 产品定位、适用场景、功能地图
- 前后端项目结构、双后端启动方式、环境变量与模块职责
- 多租户、RBAC、数据权限与系统日志设计
- 数据库模型、初始化数据与常用索引思路
- 本地部署、单机生产部署、Docker Compose、Nginx / HTTPS、故障排查
- Spring Boot 独立说明，以及后端从 NestJS 对齐到 Java 时需要同步更新的文档项

## 适合谁阅读

- 新加入项目、需要快速上手的前端或后端开发
- 需要安排环境、排查部署问题的运维与交付人员
- 需要理解平台能力边界的产品、测试与实施人员
- 后续要进行技术迁移、接口升级或数据库调整的维护者
