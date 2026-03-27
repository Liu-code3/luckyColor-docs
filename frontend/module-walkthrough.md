# 前端模块渐进式解读

## 怎么读这篇文档

这篇文档和后端的“模块渐进式解读”保持同一风格，不按目录死背，而是按新人最容易建立理解的顺序来讲：

1. 先知道前端在整个平台里扮演什么角色
2. 再从启动入口进入项目
3. 然后理解路由、菜单、权限、布局、页面和接口层
4. 最后告诉你如果现在就要改功能，应该先看哪里

如果你是第一次接手 LuckyColor，建议搭配 [前端说明](/frontend/overview) 一起看。

## 第一层：先把前端看成一个“平台控制台”

先不要急着去记住 `views`、`layouts`、`store`、`utils` 这些目录。先把前端当成一个平台控制台，它主要做六件事：

1. 渲染登录页和后台页面
2. 维护登录态和租户上下文
3. 根据后端返回的菜单动态生成路由
4. 根据权限控制页面和按钮显示
5. 调用后端接口并处理统一响应
6. 提供后台常见体验能力，比如主题、多标签页、锁屏和布局切换

也就是说，前端并不是一个静态页面集合，而是一层把“后端规则”变成“用户体验”的执行层。

## 第二层：为什么前端结构看起来像一个后台框架

LuckyColor 的前端不是只做某几个业务页面，它本身就是一套可扩展后台壳层，所以你会看到它拆成了这些区域：

| 区域 | 一句话理解 |
| --- | --- |
| `config` | 平台默认行为和运行参数 |
| `router` | 入口路由和守卫 |
| `store` | 全局状态、菜单、多标签页 |
| `layouts` | 后台壳层和导航框架 |
| `views` | 具体业务页面 |
| `api` | 和后端一一对应的接口封装 |
| `utils` | 认证、菜单标准化、请求拦截和通用工具 |

从这个角度看，它不是“页面工程”，而是“后台平台前端壳”。

## 第三层：从启动入口进入项目

如果你想真正顺着代码读进去，建议先看这两个文件。

### 1. `src/main.ts`

这里能看到整个应用是怎么装配起来的：

- 挂载 Pinia
- 挂载 Vue Router
- 挂载自定义插件 `luckyColor`
- 挂载国际化
- 注册权限指令

这一步决定了“前端应用启动时默认会把哪些平台能力全部装上”。

### 2. `src/App.vue`

这里不是简单的根组件，它负责：

- 根据当前路由选择布局
- 加载 Naive UI 主题和语言
- 处理锁屏
- 监听登录态被清空后的跳转
- 全局显示水印

如果说 `main.ts` 决定“应用怎么启动”，那 `App.vue` 决定“应用跑起来以后，整体外壳是什么样”。

## 第四层：先讲“认证与会话”，因为页面能不能跑通先看它

### 这部分解决什么问题

最核心的问题只有一句话：

“用户刷新页面后，前端怎么知道自己还是不是登录状态，以及该显示什么内容。”

### 主要代码入口

建议先看：

1. `src/views/login/login.vue`
2. `src/utils/auth.ts`
3. `src/utils/auth-bootstrap.ts`
4. `src/utils/http/interceptors.ts`
5. `src/router/index.ts`

### 这条链路是怎么工作的

#### 1. 登录页

登录页负责：

- 输入用户名和密码
- 处理算术验证码与滑块验证交互
- 提交登录请求

主要入口：

- `src/views/login/login.vue`
- `src/views/login/components/ArithmeticCaptchaPanel.vue`

#### 2. Token 与用户信息

登录成功后，前端会保存：

- access token
- 当前用户基础信息
- 当前租户上下文
- 按钮权限摘要

这些能力主要在：

- `src/utils/auth.ts`

#### 3. 页面刷新后的会话恢复

这一步是 LuckyColor 前端比较关键的地方。刷新页面时，前端不会只是“看有没有 token”，还会进一步补齐：

- 当前用户 profile
- 菜单树缓存
- 当前租户上下文

主要入口：

- `src/utils/auth-bootstrap.ts`

#### 4. 请求拦截器

请求发送前会自动做这些事情：

- 自动带上 Bearer Token
- 如果 token 失效，拦截并跳回登录页
- 自动附加租户 Header
- 按统一响应结构处理成功与失败

主要入口：

- `src/utils/http/interceptors.ts`

### 对应哪些后端能力

- `/api/auth/login`
- `/api/auth/profile`
- `/api/auth/access`
- `/api/auth/button-permissions`

### 如果要改这块功能，先看哪里

| 改动目标 | 先看哪里 |
| --- | --- |
| 改登录页交互 | `src/views/login/login.vue` |
| 改 token 存取 | `src/utils/auth.ts` |
| 改刷新恢复逻辑 | `src/utils/auth-bootstrap.ts` |
| 改请求统一行为 | `src/utils/http/interceptors.ts` |
| 改登录失效跳转 | `src/App.vue`、`src/router/index.ts` |

## 第五层：再讲“路由与菜单”，因为这是后台平台的主干

### 这部分解决什么问题

后台系统最核心的问题之一就是：

“用户登录后，到底应该看到哪些菜单、进入哪些页面、刷新后还能不能保持这些路由。”

LuckyColor 把这部分做成了一套比较完整的动态菜单机制。

### 主要代码入口

建议顺序：

1. `src/router/systemRouter.ts`
2. `src/router/index.ts`
3. `src/store/modules/menu.ts`
4. `src/utils/menu-normalizer.ts`
5. `src/utils/menu-navigation.ts`

### 这套机制是怎么工作的

#### 1. 静态路由只保留最基础入口

前端的静态路由并不多，主要是：

- `/login`
- `/`
- 404 回退
- 少量历史兼容跳转

这说明真正的业务页面入口大多来自后端返回的菜单树。

#### 2. 动态菜单树来自后端

登录后，前端会获取菜单树并缓存起来，然后由 `menu` store 去做两件事：

- 变成页面左侧菜单结构
- 变成真正注册到 Vue Router 的动态路由

#### 3. 菜单标准化

这个项目里存在一些历史菜单结构兼容处理，比如：

- 旧字典菜单重定向到新系统管理模块
- 旧 VxeTable 演示页挂到新的功能演示模块下

这些都在：

- `src/utils/menu-normalizer.ts`

#### 4. 刷新后恢复动态路由

这是很多后台项目最容易出问题的点。LuckyColor 做了缓存恢复：

- 如果页面刷新后动态路由丢失，会从本地缓存菜单树恢复
- 然后重试进入当前页面

这部分核心逻辑在：

- `src/router/index.ts`
- `src/store/modules/menu.ts`

### 对应哪些后端能力

- `/api/auth/access`
- `/api/auth/routes`
- `/api/menus/tree`

### 对应哪些前端显示区域

- 左侧菜单
- 顶部模块切换
- 页面标签页
- iframe 菜单和外链菜单

### 如果要改这块功能，先看哪里

| 改动目标 | 先看哪里 |
| --- | --- |
| 菜单不显示 | `src/store/modules/menu.ts` |
| 刷新后白屏 | `src/router/index.ts` |
| 菜单字段兼容 | `src/utils/menu-normalizer.ts` |
| iframe 或外链菜单 | `src/utils/menu-navigation.ts` |
| 新页面挂路由 | 菜单表 + `src/views` 组件路径 |

## 第六层：再讲“布局系统”，因为它决定用户看到的后台外壳

### 这部分解决什么问题

布局系统负责：

- 顶部、侧边栏、内容区如何排布
- 面包屑、标签页、用户栏怎么显示
- 不同布局模式如何切换

### 主要目录

```text
src/layouts/
├─ modular/
├─ normal/
├─ top/
├─ empty/
└─ components/
```

### 怎么理解这些布局

| 布局 | 适合什么场景 |
| --- | --- |
| `modular` | 当前默认后台形态，功能最完整 |
| `normal` | 常规后台布局 |
| `top` | 顶部导航布局 |
| `empty` | 登录页、404 等无后台壳场景 |

### 主要代码入口

- `src/App.vue`
- `src/layouts/*/index.vue`
- `src/layouts/components/*`

### 布局组件里都有什么

常见组成包括：

- 用户栏 `userbar.vue`
- 标签页 `tags.vue`
- 主题切换 `switchTheme.vue`
- 模块切换 `switchModules.vue`
- 面包屑 `breadcrumb.vue`
- 菜单组件 `NavMenu.vue`

### 对应哪些状态

布局大量依赖：

- `src/store/modules/global.ts`
- `src/store/modules/tab.ts`
- `src/store/modules/menu.ts`

## 第七层：再讲“全局状态”，因为平台体验都从这里汇总

### 这部分解决什么问题

前端不是只有页面数据，还有很多“全局体验状态”：

- 当前布局模式
- 当前主题色
- 是否暗黑模式
- 是否显示标签页
- 是否锁屏
- 是否显示水印
- 当前激活标签页

### 主要 store

#### 1. `global` store

主要负责：

- 布局模式
- 主题色
- 亮暗模式
- 水印开关
- 锁屏
- 语言
- 侧边栏主题

主要入口：

- `src/store/modules/global.ts`

#### 2. `tab` store

主要负责：

- 标签页列表
- 当前激活页面
- 页面切换与关闭

主要入口：

- `src/store/modules/tab.ts`

#### 3. `menu` store

主要负责：

- 菜单树缓存
- 动态路由生成
- 菜单转换
- 模块切换菜单

主要入口：

- `src/store/modules/menu.ts`

### 如果要改平台体验，先看哪里

| 改动目标 | 先看哪里 |
| --- | --- |
| 改主题和配色 | `global.ts` |
| 改标签页行为 | `tab.ts` |
| 改菜单显示 | `menu.ts` |
| 改布局外观 | `layouts/*` |

## 第八层：再讲“接口层”，因为所有业务页面最终都要靠它

### 这部分解决什么问题

前端业务页面不应该直接在页面里手写请求，所以 LuckyColor 把接口按业务模块拆到了 `src/api`。

### 主要目录

```text
src/api/
├─ auth.ts
├─ captcha.ts
├─ dashboard.ts
├─ users.ts
├─ roles.ts
├─ menus.ts
├─ departments.ts
├─ dict.ts
├─ configs.ts
├─ notices.ts
├─ tenants.ts
├─ tenantPackages.ts
└─ index.ts
```

### 怎么理解这层

这一层本质上就是前端对后端的“模块映射层”：

- 后端有 `users`，前端就有 `users.ts`
- 后端有 `roles`，前端就有 `roles.ts`
- 后端有 `dashboard`，前端就有 `dashboard.ts`

它的好处是：

- 页面不需要关心底层请求实现
- 接口变更时更容易集中修改
- 前后端模块边界会更清晰

### 主要入口

- `src/api/index.ts`
- `src/utils/http/index.ts`
- `src/utils/http/interceptors.ts`

## 第九层：再讲“业务页面”，因为这是使用者真正看到的内容

### 主要页面区域

```text
src/views/
├─ login/                     登录页
├─ index/                     工作台首页
├─ sys/                       系统管理与租户管理主体
├─ icomponent/                功能演示和组件示例
├─ iframe/                    iframe 页面
├─ tool/                      工具页
└─ errorPage/                 错误页
```

### `sys` 是最重要的业务区域

当前主要页面包括：

- 用户管理
- 角色管理
- 菜单管理
- 部门管理
- 字典管理
- 系统配置
- 通知公告
- 租户管理
- 租户套餐
- 系统概览

也就是说，后台最核心的可用业务几乎都集中在 `src/views/sys`。

### `index` 工作台

工作台不是一个静态欢迎页，它依赖后端返回：

- 当前用户信息
- 统计数据
- 趋势数据
- 最近访问
- 公告

对应 API：

- `src/api/dashboard.ts`

### `icomponent` 和 `tool`

这一块更像平台附带的能力展示区，里面包括：

- 富文本编辑器
- 可编辑表格
- iframe 页面
- 功能演示页
- Apifox 工具页

它们对于“系统能不能跑通”不是核心，但对于“平台能力展示”和“页面组件复用”很有价值。

## 第十层：再讲“租户模式在前端里怎么流动”

### 这部分解决什么问题

LuckyColor 是 SaaS 平台，所以前端不能只知道“当前用户是谁”，还得知道“当前用户在哪个租户下工作”。

### 关键入口

- `src/config/index.ts`
- `src/utils/auth.ts`
- `src/utils/tenant-scope.ts`
- `src/utils/auth-bootstrap.ts`

### 这套机制怎么工作

1. 前端启动时读取租户相关配置
2. 请求拦截器自动附加租户 Header
3. 登录成功后同步当前租户信息
4. 菜单和数据会按当前租户过滤

### 为什么这一步很重要

很多“看起来像前端 bug”的问题，其实是租户上下文没对上，比如：

- 菜单为空
- 用户列表不对
- 某些接口 403
- 某些字典项查不到

## 第十一层：如果你现在要开始改功能，怎么下手

### 场景一：改登录和权限初始化

先看：

1. `src/views/login/login.vue`
2. `src/utils/auth.ts`
3. `src/utils/auth-bootstrap.ts`
4. `src/router/index.ts`

### 场景二：改菜单、路由、刷新恢复

先看：

1. `src/store/modules/menu.ts`
2. `src/router/index.ts`
3. `src/utils/menu-normalizer.ts`

### 场景三：改后台整体风格和交互体验

先看：

1. `src/App.vue`
2. `src/store/modules/global.ts`
3. `src/layouts/*`
4. `src/layouts/components/*`

### 场景四：改某个系统管理页面

先看对应的三层：

1. `src/views/sys/*`
2. `src/api/*.ts`
3. 后端对应 controller/service

### 场景五：改请求统一行为

先看：

1. `src/utils/http/interceptors.ts`
2. `src/utils/http/config.ts`
3. `src/utils/http/index.ts`

## 第十二层：推荐给新人的阅读顺序

如果我是带新人接手 LuckyColor 前端，我会建议按这个顺序读：

1. `src/main.ts`
2. `src/App.vue`
3. `src/config/index.ts`
4. `src/router/index.ts`
5. `src/store/modules/menu.ts`
6. `src/utils/auth.ts`
7. `src/utils/auth-bootstrap.ts`
8. `src/utils/http/interceptors.ts`
9. `src/views/login/login.vue`
10. `src/views/sys/*`

读完这 10 步，前端主干就会非常清楚。

## 最后一层：一句话总结这个前端

这个前端本质上不是“几个页面”，而是一套可扩展的 SaaS 后台控制台：

- 路由和菜单是动态的
- 权限和租户是内建的
- 布局和主题是平台化的
- 业务页面是挂在这套壳上的

你如果顺着“启动入口 -> 会话 -> 路由菜单 -> 布局状态 -> 页面接口”这条线去理解，就能比较快地走进整个项目。
