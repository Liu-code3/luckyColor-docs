# 前端说明

## 项目位置

前端项目目录：

```text
D:\zl\luckyColor-admin
```

## 前端在整个平台中的职责

前端不是单纯的页面壳，它负责把后端返回的“菜单、权限、租户上下文、工作台统计、字典与配置”真正变成用户可操作的后台系统。

它主要承担：

- 登录、验证码交互和登录态恢复
- 动态菜单渲染与动态路由注册
- 页面级按钮权限显隐
- 工作台、系统管理、租户管理等页面交互
- 租户 Header 透传
- 前端主题、布局、多标签页和锁屏等后台体验能力

## 技术栈

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
- Playwright

## 启动方式

```powershell
cd D:\zl\luckyColor-admin
pnpm install
pnpm dev
```

默认开发地址：

```text
http://127.0.0.1:9900
```

除了默认真实联调模式，当前前端还支持：

- `pnpm dev:mock`
- `pnpm dev:hybrid`

如果你想看这三种模式和登录态恢复链路的详细说明，可以继续阅读 [会话恢复与联调模式](/frontend/session-and-api-modes)。

## 关键环境变量

前端主要使用 `.env.dev` 和 `.env.prod`。

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `VITE_API_PROXY_TARGET` | `http://127.0.0.1:3001` | 开发环境下 `/api` 代理目标 |
| `VITE_API_DOC_URL` | `http://127.0.0.1:3001/docs` | Swagger 地址 |
| `VITE_TENANT_ID` | `tenant_001` | 默认租户 ID |
| `VITE_TENANT_ENABLED` | `true` | 是否启用租户 Header |
| `VITE_LOGIN_CAPTCHA_ENABLED` | `true` | 登录页是否启用验证码 |
| `VITE_APP_DEFAULT_USERNAME` | `admin` | 默认登录用户名 |
| `VITE_APP_DEFAULT_PASSWORD` | `123456` | 默认登录密码 |
| `VITE_BUILD_PUBLIC_PATH` | `/` | 打包后的基础路径 |
| `VITE_BUILD_OUT_DIR` | `dist/dev` 或 `dist/prod` | 构建输出目录 |

## 与后端的联调方式

开发环境由 `vite.config.ts` 把 `/api` 请求代理到后端：

```ts
proxy: {
  '/api': {
    target: envConfig.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3001',
    changeOrigin: true
  }
}
```

这意味着：

- 业务代码里尽量只写 `/api` 相对路径。
- 前端不需要在每个接口里硬编码完整域名。
- 只要改 `VITE_API_PROXY_TARGET`，就可以切换联调环境。

此外，前端仓库当前还支持：

- `pnpm dev`：真实接口模式
- `pnpm dev:mock`：本地 Mock 模式
- `pnpm dev:hybrid`：Mock + 真实接口混合模式

## 目录结构与职责

```text
luckyColor-admin/
├─ src/api/                    与后端接口一一对应的 API 封装
├─ src/components/             通用组件，例如编辑表格、锁屏、图标选择器
├─ src/config/                 系统配置、默认账号、租户 Header、主题色
├─ src/layouts/                modular、top、normal、empty 等布局
├─ src/router/                 静态路由、白名单、404 回退、动态路由基础入口
├─ src/store/                  菜单、多标签页、全局状态
├─ src/utils/                  请求封装、权限工具、菜单标准化、租户处理
├─ src/views/                  登录页、工作台、系统管理、功能演示等页面
├─ public/                     静态资源
└─ tests/playwright/           冒烟测试
```

### 重点目录怎么看

| 目录 | 建议怎么读 |
| --- | --- |
| `src/config` | 先看，能快速理解系统默认行为 |
| `src/router` | 再看，能明白登录前后怎么切换页面 |
| `src/store/modules/menu.ts` | 动态菜单与动态路由的核心 |
| `src/api` | 前端实际对接了哪些后端模块 |
| `src/views/sys` | 平台业务页面主体都在这里 |
| `tests/playwright/smoke` | 用来了解当前系统最重要的回归链路 |

## 前端代码组织风格

LuckyColor 前端的代码组织不是“页面想到哪写到哪”，而是比较标准的后台平台拆法。理解这件事以后，读代码会轻松很多。

### 1. 先按职责分层，不先按页面堆逻辑

它大致分成六层：

| 层次 | 目录 | 说明 |
| --- | --- | --- |
| 运行配置层 | `src/config` | 默认账号、租户开关、主题配置、运行参数 |
| 路由入口层 | `src/router` | 静态路由、守卫、动态路由恢复 |
| 全局状态层 | `src/store` | 菜单、标签页、全局主题、布局状态 |
| 平台壳层 | `src/layouts` | 后台框架外壳、导航、用户栏、面包屑 |
| 业务页面层 | `src/views` | 用户真正操作的业务页面 |
| 接口与工具层 | `src/api`、`src/utils` | 对后端接口映射、认证、菜单标准化、HTTP 封装 |

这意味着一个功能通常不是只在一个 `.vue` 文件里结束，而是会沿着：

页面 -> API -> store / utils -> 路由 / 布局

这条线协同起来。

### 2. 业务页面按领域放，通用能力横向抽

前端并没有把所有东西都塞进 `src/views/sys`。它的思路是：

- 业务页面按功能域放到 `views`
- 全局体验能力提到 `layouts` 和 `store`
- 请求与鉴权相关能力提到 `api` 和 `utils`
- 租户、菜单、登录恢复这类跨页面逻辑，不放进单页组件里

这是一种更适合 SaaS 后台长期维护的写法，因为登录态、菜单和租户上下文本来就不是某一个页面独有的事情。

### 3. 页面和后端模块是镜像关系

很多代码位置可以直接靠业务名去猜：

| 前端页面或能力 | 前端落点 | 后端大致落点 |
| --- | --- | --- |
| 用户管理 | `src/views/sys/user.vue`、`src/api/users.ts` | `modules/system/users` |
| 角色管理 | `src/views/sys/role/*`、`src/api/roles.ts` | `modules/system/roles` |
| 菜单管理 | `src/views/sys/menu/*`、`src/api/menus.ts` | `modules/system/menus` |
| 租户管理 | `src/views/sys/tenant/*`、`src/api/tenants.ts` | `modules/tenant/tenants` |
| 租户套餐 | `src/views/sys/tenantPackage/*`、`src/api/tenantPackages.ts` | `modules/tenant/tenant-packages` |
| 工作台 | `src/views/index/*`、`src/api/dashboard.ts` | `modules/platform/dashboard` |

这也是为什么这套前端虽然页面多，但不算难找代码。

## 功能模块拆解

### 1. 登录与登录态恢复

主要落点：

- `src/views/login/login.vue`
- `src/views/login/components/ArithmeticCaptchaPanel.vue`
- `src/utils/auth.ts`
- `src/utils/auth-bootstrap.ts`

这部分完成：

- 获取算术验证码
- 校验验证码
- 用户名密码登录
- 登录成功后写入 Token、用户信息和租户上下文
- 登录成功后再拉取 `/api/menus/tree` 初始化菜单与动态路由
- 刷新页面后通过 `/api/auth/profile` 和本地菜单缓存恢复登录态与动态路由

### 2. 动态菜单与动态路由

主要落点：

- `src/store/modules/menu.ts`
- `src/utils/menu-normalizer.ts`
- `src/utils/menu-navigation.ts`
- `src/router/index.ts`

这部分完成：

- 缓存后端返回的菜单树
- 标准化旧菜单结构与新菜单结构
- 按菜单 `component` 动态加载页面组件
- 对 iframe 菜单、外链菜单、404 回退做兼容
- 在刷新页面后从缓存恢复动态路由

这是接手前端时最关键的一条主线，因为大部分“菜单不显示”“刷新后白页”“路由丢失”的问题都和这里有关。

### 3. 系统管理页面

当前主要页面包括：

- 工作台首页：`src/views/index/index.vue`
- 用户管理：`src/views/sys/user.vue`
- 角色管理：`src/views/sys/role/index.vue`
- 菜单管理：`src/views/sys/menu/index.vue`
- 部门管理：`src/views/sys/department/department.vue`
- 字典管理：`src/views/sys/dict/index.vue`
- 系统配置：`src/views/sys/config/index.vue`
- 通知公告：`src/views/sys/notice/index.vue`
- 租户管理：`src/views/sys/tenant/index.vue`
- 租户套餐：`src/views/sys/tenantPackage/index.vue`

页面所需接口主要对应：

- `src/api/users.ts`
- `src/api/roles.ts`
- `src/api/menus.ts`
- `src/api/departments.ts`
- `src/api/dict.ts`
- `src/api/configs.ts`
- `src/api/notices.ts`
- `src/api/tenants.ts`
- `src/api/tenantPackages.ts`

### 4. 平台基础体验

除了业务页面，前端还实现了典型后台产品常见能力：

- 多标签页
- 布局切换
- 主题切换
- 锁屏
- 面包屑
- 模块切换
- 富文本编辑器
- 可编辑表格示例
- iframe 页面
- 外链菜单

这些能力分布在：

- `src/layouts/components`
- `src/components`
- `src/views/icomponent`
- `src/views/iframe`
- `src/views/tool/apifox`

## 业务功能怎么顺着前端代码读

如果你想把“业务功能说明”和“前端代码结构”对上，可以按这个顺序理解：

1. 登录与权限初始化先看 `login.vue`、`auth.ts`、`auth-bootstrap.ts`。
2. 菜单与动态路由先看 `router` 和 `store/modules/menu.ts`。
3. 后台壳层体验先看 `App.vue`、`layouts`、`global` store。
4. 具体系统管理能力再看 `views/sys/*` 和对应 `api/*.ts`。
5. 工作台、工具页、文件上传等平台扩展能力最后看 `views/index`、`views/tool`、`components`。

这条顺序的好处是，你会先理解“平台怎么跑起来”，再理解“某个页面怎么实现”，不会一上来就陷在某个表单组件里。

## 租户模式在前端怎么处理

前端通过 `src/config/index.ts` 统一维护租户相关配置：

- Header 名称：`x-tenant-id`
- 默认租户 ID：来自 `VITE_TENANT_ID`
- 是否启用租户模式：`VITE_TENANT_ENABLED`

只要租户模式开启并且配置了租户 ID，请求头就会自动带上：

```http
x-tenant-id: tenant_001
```

这对本地联调很重要，因为后端会根据租户上下文返回菜单、角色和业务数据。

## 接口层怎么理解

`src/api/index.ts` 已经统一导出了主要业务模块：

- `auth`
- `captcha`
- `dashboard`
- `users`
- `roles`
- `menus`
- `departments`
- `dict`
- `configs`
- `notices`
- `tenants`
- `tenantPackages`
- `health`

也就是说，前端当前已经和后端主要系统管理能力、租户能力和平台能力打通，而不是只接了一个登录页示例。

需要额外说明的是，当前前端实际已使用或落地展示的能力还包括：

- `file`：富文本图片上传等文件场景
- `codegen`：前端代码生成器工作台与预览页

其中代码生成器页面目前更偏前端工作台形态，适合演示页面骨架、字段配置和预览流程。

## 测试覆盖情况

前端仓库内置了 Playwright 冒烟测试，主要覆盖：

- 登录页与登录流程
- 工作台入口
- 菜单显示
- 动态路由恢复
- iframe 菜单与外链菜单
- 404 回退
- 用户、系统、租户、Apifox、VxeTable 等页面主链路

常用命令：

```powershell
pnpm test:smoke
pnpm test:smoke:headed
```

这对交付前回归非常有帮助，尤其适合验证“系统能不能完整跑通”。

## 构建与部署

```powershell
pnpm build
pnpm preview
```

生产部署时，通常把构建后的静态资源交给 Nginx 托管。需要注意三个点：

1. `VITE_BUILD_PUBLIC_PATH` 必须和部署访问路径一致。
2. Nginx 必须配置 `try_files $uri $uri/ /index.html;`，否则刷新子路由会 404。
3. `/api` 和 `/docs` 需要反代到后端服务。

## 前端常见问题

### 页面能打开，但数据都请求失败

一般是代理目标没配对，优先检查：

- `VITE_API_PROXY_TARGET`
- 后端是否真的运行在 `3001`
- 后端接口是否都挂在 `/api`

### 登录成功后菜单为空

优先检查：

- `/api/auth/login` 是否返回了正常用户信息
- `/api/menus/tree` 是否返回了菜单树
- 当前租户是否正确
- 登录账号是否绑定了角色与菜单

### 刷新页面后白屏或 404

优先检查：

- 动态路由是否已从缓存恢复
- Nginx 是否配置了 SPA 回退
- 菜单 `component` 字段是否能在 `src/views` 找到对应页面

### 某些页面按钮不显示

优先检查：

- 当前角色是否有对应按钮权限码
- 后端 `/api/auth/button-permissions` 返回是否正确
- 页面是否使用了权限指令或权限判断工具

## 建议的阅读顺序

如果你要快速接手前端，建议按这个顺序读源码：

1. `src/config/index.ts`
2. `src/router/index.ts`
3. `src/store/modules/menu.ts`
4. `src/utils/auth.ts` 和 `src/utils/auth-bootstrap.ts`
5. `src/views/login/login.vue`
6. `src/views/sys/*`
7. `src/views/tool/codegen/*`
8. `tests/playwright/smoke/*`

## 如果你想按模块顺着读代码

可以继续阅读 [前端模块渐进式解读](/frontend/module-walkthrough)。那一页会按“前端解决什么问题、启动入口在哪里、菜单和路由怎么工作、布局和状态怎么协作、页面和接口如何对应、改功能先看哪里”的顺序展开，更适合新人上手和内部讲解。
