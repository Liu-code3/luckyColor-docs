# Smoke 修复与功能链条任务板

## 这页怎么用

这页不是问题复盘，而是当前这轮修复的执行基线。后续每做完一个最小子任务，都要同步更新这里的状态，避免：

- 重复做同一件事
- 以为做过，实际没做
- 中途换人后不知道修到哪一步

状态约定：

- `[ ]` 未开始
- `[x]` 已完成
- `[-]` 阻塞中

建议执行规则：

1. 开始一个子任务前，先确认它是否已经被勾选。
2. 完成一个子任务后，立刻勾选，不要等一整轮结束再统一补。
3. 如果遇到阻塞，改成 `[-]` 并在后面补一句阻塞原因。
4. 如果新增了修复项，把它追加到最接近的任务组里，而不是散落在别处。

## 当前基线

- [x] 已补双后端环境变量与默认值对照文档：`guide/env-alignment.md`
- [x] 已补前后端权限码对照文档：`security/permission-alignment.md`
- [x] 已完成 Spring Boot 项目路径与默认本地 MySQL / Redis 口径统一
- [x] 已完成前端权限值向 Spring Boot 真实权限码收口
- [x] 已执行一轮 `pnpm test:smoke`
- [x] 已完成 smoke 失败项初步归类
- [x] 已整理出本轮修复与补文档的大任务拆分
- [x] 已创建本任务板，后续所有修复请以本页为准同步状态

## 当前结论摘要

当前最值得优先处理的不是一个单点 bug，而是四类问题：

1. iframe 场景被 `X-Frame-Options` 或相关安全头拦截。
2. 租户中心页面依赖动态菜单注册，当前有路由恢复或菜单契约不一致问题。
3. 一批 smoke 用例仍依赖首页 `.modular_box`，测试对当前 UI 结构过于敏感。
4. 最后访问页恢复、keepAlive 状态恢复与当前实现存在偏差。

## 执行顺序

建议按下面顺序推进，完成一组再进入下一组：

1. A1 失败项复盘与分类固化
2. A2 iframe 安全头修复
3. A3 租户中心动态路由修复
4. A4 smoke 导航方式改造
5. A5 最后访问页恢复修复
6. A6 keepAlive 状态恢复修复
7. A7 权限链路回归验证
8. A8 全量 smoke 回归
9. D1 修复说明文档
10. D2-D8 前后端功能链条文档

## A1 失败项复盘与分类固化

- [x] 已跑一轮 `pnpm test:smoke`
- [x] 已确认本轮 smoke 基线结果为 `14` 项中 `5` 项通过、`9` 项失败
- [x] 已确认失败大类包含：iframe 安全头、动态路由 / 404、首页入口测试过时、状态恢复偏差
- [ ] 把每个失败用例整理成“测试名 -> 现象 -> 根因猜测 -> 所属类别”的表格
- [ ] 把 `test-results` 中的关键截图 / trace 路径补到这页或独立修复说明里

### 当前已确认的失败点

- [x] `tests/playwright/smoke/admin-tenant.spec.ts`：访问 `/tenantCenter/tenantPackage` 时进入 404
- [x] `tests/playwright/smoke/admin-system.spec.ts`：依赖 `.modular_box` 点击“系统管理”失败
- [x] `tests/playwright/smoke/admin-apifox.spec.ts`：依赖 `.modular_box` 点击“Apifox”失败
- [x] `tests/playwright/smoke/admin-vxe-table.spec.ts`：依赖 `.modular_box` 点击“功能演示”失败
- [x] `tests/playwright/smoke/iframe-menu.spec.ts`：iframe 被 `X-Frame-Options` 拦截
- [x] `tests/playwright/smoke/route-404-fallback.spec.ts`：同样被 iframe 安全头干扰
- [x] `tests/playwright/smoke/dashboard-entry.spec.ts`：访问 `/index` 后没有恢复到上次页面
- [x] `tests/playwright/smoke/route-keep-alive.spec.ts`：菜单管理页输入状态未保留
- [x] `tests/playwright/smoke/menu-visibility.spec.ts`：依赖 `.modular_box` 点击“系统管理”失败

## A2 iframe 安全头修复

### 目标

让需要内嵌的页面不再被浏览器拦截，同时不把全站 iframe 策略放得过宽。

### 当前已知结论

- [x] 已确认 Spring Boot 仓库里没有主动写死 `X-Frame-Options: DENY`
- [x] 已确认 `SecurityConfig` 内存在 `frameOptions().disable()`，所以 `DENY` 更像来自应用外层代理
- [x] 已定位关键文件：`luckyColor-admin-springboot/src/main/java/com/luckycolor/admin/common/config/SecurityConfig.java`
- [x] 已定位 iframe 相关后端页面：`/api/docs`、`/api/file/**`

### 子任务

- [x] A2-1 本地确认 `X-Frame-Options: DENY` 不是 Spring Boot 直接返回，当前本地 `/api/docs` 无该响应头
- [-] A2-2 如果是代理层追加，按路径级规则只放开 `/api/docs`、`/api/file/**` 等确实需要内嵌的路径。当前本地联调不经过 Nginx / Gateway，本轮没有可改的代理层配置
- [-] A2-3 如果还有 `Content-Security-Policy: frame-ancestors`，同步核对来源与允许范围。当前本地联调未发现额外 `frame-ancestors` 配置
- [ ] A2-4 核对 `/api/docs/assets/**`、`/api/v3/api-docs/**` 在 iframe 文档场景下也能正常访问
- [ ] A2-5 核对文件访问接口返回的是“可内联预览”还是“附件下载”，避免只修 XFO 但 iframe 仍打不开
- [x] A2-6 修复完成后单独回归 `iframe-menu.spec.ts`
- [x] A2-7 修复完成后单独回归 `route-404-fallback.spec.ts`

### 验收标准

- [x] 浏览器控制台不再出现 `Refused to display ... in a frame`
- [x] iframe 页面可以正常渲染
- [ ] 没有把其他不需要内嵌的接口一并放开

## A3 租户中心动态路由修复

### 目标

让 `/tenantCenter/tenant` 与 `/tenantCenter/tenantPackage` 这类页面在登录后和刷新后都能稳定命中真实页面，而不是落到 404。

### 当前已知结论

- [x] 已确认静态路由里没有这类业务路由，依赖动态菜单注册
- [x] 已确认关键链路是 `AUTH_MENU_TREE` -> menu store -> router guard
- [x] 已确认 `menu-normalizer.ts` 当前没有专门处理 tenantCenter 的兼容逻辑
- [x] 已定位关键文件：`src/router/index.ts`、`src/store/modules/menu.ts`、`src/utils/menu-normalizer.ts`
- [x] 已定位菜单同步脚本：`scripts/sync-system-menus.mjs`

### 子任务

- [x] A3-1 抓取登录后真实 `/api/menus/tree` 返回，确认租户中心菜单存在
- [x] A3-2 核对租户管理与租户套餐菜单的 `path`、`name`、`menuKey`、`component`
- [x] A3-3 核对 `sys/tenant/index` 与 `sys/tenantPackage/index` 是否能被前端动态组件映射正确解析
- [x] A3-4 核对 `menu-normalizer.ts`，确认当前没有遗漏 tenantCenter 的标准化逻辑
- [x] A3-5 通过补强 `loginAsAdmin` 对菜单缓存的等待，降低动态路由恢复时序抖动
- [-] A3-6 必要时补 tenantCenter 的兼容映射或路由修正逻辑。当前菜单契约和组件映射都正确，本轮无需新增 tenantCenter 特判
- [x] A3-7 单独回归 `admin-tenant.spec.ts`

### 验收标准

- [x] 访问 `/tenantCenter/tenantPackage` 不再进入 404
- [x] 访问 `/tenantCenter/tenant` 不再进入 404
- [x] 租户中心两页都能正常显示操作按钮与弹窗

## A4 smoke 导航方式改造

### 目标

让 smoke 用例不再依赖首页 `.modular_box` 这种容易随布局变化而失效的 DOM 结构。

### 当前已知结论

- [x] 已确认 `.modular_box` 不是稳定首页入口，而是 modular 布局里的模块栏
- [x] 已确认默认布局不一定是 modular，因此这类测试天然脆弱
- [x] 已确认后续修法以“改测试为主”为准

### 子任务

- [x] A4-1 把 `admin-system.spec.ts` 改成登录后使用左侧菜单导航，避免依赖首页模块栏
- [x] A4-2 把 `admin-apifox.spec.ts` 改成登录后使用左侧菜单导航。当前开发环境下 `/apifox` 深链直达会返回 404，因此不再强制直达
- [x] A4-3 把 `admin-vxe-table.spec.ts` 改成登录后直达 `/featureDemo/vxeTable`
- [x] A4-4 把 `menu-visibility.spec.ts` 去掉 `.modular_box` 依赖，保留“隐藏菜单但路由仍可访问”的核心断言
- [x] A4-5 检查是否还有其他 smoke 用例依赖 `.modular_box`，当前已无匹配
- [x] A4-6 单独回归上述 smoke 用例

### 验收标准

- [x] 用例不再耦合首页布局细节
- [x] 用例仍然覆盖原本想验证的真实业务能力，而不是只验证 URL 可打开

## A5 最后访问页恢复修复

### 目标

让已登录用户访问 `/index` 时可以恢复到上次退出页面，而不是重新跳回登录页。

### 当前已知结论

- [x] 已确认失败用例为 `tests/playwright/smoke/dashboard-entry.spec.ts`
- [x] 已确认相关存储键包括 `AUTH_USER_INFO`、`AUTH_MENU_TREE`、`AUTH_LAST_VIEW_PATH`、`AUTH_TABS`
- [x] 已定位关键文件：`src/utils/auth.ts`、`src/utils/auth-bootstrap.ts`、`src/router/index.ts`

### 子任务

- [x] A5-1 核对仅注入本地会话数据时，前端仍会额外依赖刷新接口或现有内存 token 判断登录态，因此相关 smoke 已切换为真实登录链路
- [x] A5-2 核对 `/i/iframeDocs` 这种 iframe 中间路由的注册时机
- [x] A5-3 核对最后访问页恢复逻辑发生在登录态校验之前还是之后
- [x] A5-4 修复后单独回归 `dashboard-entry.spec.ts`

### 验收标准

- [x] 已登录访问 `/index` 时能恢复到上次页面
- [x] 不会出现恢复流程又把用户重定向回 `/login`

## A6 keepAlive 状态恢复修复

### 目标

让菜单管理等 keepAlive 页面在切页回来后仍保留关键查询状态。

### 当前已知结论

- [x] 已确认失败用例为 `tests/playwright/smoke/route-keep-alive.spec.ts`
- [x] 已确认当前现象是菜单管理页搜索关键字切页后丢失

### 子任务

- [x] A6-1 核对菜单管理路由是否真的带有 `keepAlive`
- [x] A6-2 核对 keepAlive 容器或多标签页缓存是否在切页时失效
- [x] A6-3 核对页面状态是依赖组件缓存还是依赖 store / query 保存
- [x] A6-4 修复后单独回归 `route-keep-alive.spec.ts`

### 验收标准

- [x] 切到其他管理页再返回时，菜单管理页输入框值仍然保留
- [x] 页面不会因为恢复状态而引入新的刷新或跳转副作用

## A7 权限链路回归验证

### 目标

确认“前端权限值已对齐 Spring Boot 真实权限码”的收口结果，在真实页面上没有引入按钮显隐和接口 403 的错位。

### 当前已知结论

- [x] 已完成前端权限常量值收口
- [x] 已更新前端权限规范文档 `BUTTON_PERMISSION_SPEC.md`
- [x] 已更新文档站权限对照页 `security/permission-alignment.md`

### 子任务

- [ ] A7-1 回归用户管理页“分配角色”按钮与接口权限
- [ ] A7-2 回归角色管理页“分配菜单 / 数据范围”按钮与接口权限
- [ ] A7-3 回归租户管理页新增、更新、删除、状态切换按钮与接口权限
- [ ] A7-4 回归租户套餐页菜单范围、绑定租户按钮与接口权限
- [ ] A7-5 抽查 `/api/auth/access` 或 `/api/auth/button-permissions` 返回的权限值是否与前端当前常量值一致

### 验收标准

- [ ] 按钮可见时，对应接口不再误报 403
- [ ] 前端页面判断的权限值与后端实际校验点一致

## A8 全量 smoke 回归

### 目标

在完成前述修复后，重新把 smoke 结果收口到可接受状态。

### 子任务

- [x] A8-1 先单跑 A2 相关 smoke
- [x] A8-2 再单跑 A3 相关 smoke
- [x] A8-3 再单跑 A4 相关 smoke
- [x] A8-4 再单跑 A5 / A6 相关 smoke
- [x] A8-5 跑全量 `pnpm test:smoke`
- [x] A8-6 跑 `pnpm typecheck`
- [x] A8-7 跑 `pnpm build:springboot`
- [x] A8-8 记录最终通过项与剩余失败项。当前 smoke 结果为 `14/14` 通过，无剩余失败项

### 验收标准

- [x] smoke 结果相比当前基线明显收敛
- [x] 若仍有失败项，必须能明确归类为“真实功能 bug”或“测试设计问题”

## D1 修复说明文档

### 目标

把这一轮修复沉淀成“现象 -> 原因 -> 修复 -> 验证”的过程文档。

### 子任务

- [ ] D1-1 新建修复说明页，建议文件：`guide/repair-log-smoke-and-permission.md`
- [ ] D1-2 记录本轮权限收口内容
- [ ] D1-3 记录 iframe 安全头修复内容
- [ ] D1-4 记录动态路由与 smoke 改造内容
- [ ] D1-5 记录最终验证命令与结果

## D2-D8 前后端功能链条文档

### D2 功能链条总览

- [ ] 新建 `guide/feature-chains.md`
- [ ] 建立登录、菜单、权限、租户、文件五条链路入口

### D3 登录与会话恢复链条

- [ ] 新建 `guide/feature-chain-auth.md`
- [ ] 写清前端登录入口、会话存储、刷新恢复、后端认证接口
- [ ] 写清常见故障：登录成功但没菜单、刷新回登录页

### D4 菜单与动态路由链条

- [ ] 新建 `guide/feature-chain-menu-routing.md`
- [ ] 写清 `AUTH_MENU_TREE`、menu normalizer、menu store、router guard、`/api/menus/tree`
- [ ] 写清常见故障：页面 404、刷新后路由丢失、菜单有但页面打不开

### D5 权限与按钮显隐链条

- [ ] 新建 `guide/feature-chain-permission.md`
- [ ] 写清 `BUTTON_PERMISSION_CODES`、`usePermission()`、`v-permission`、后端 `@RequirePermission(...)`
- [ ] 写清已对齐的权限值与仍保留的前端语义别名

### D6 租户与租户套餐链条

- [ ] 新建 `guide/feature-chain-tenant.md`
- [ ] 写清前端页面、前端 API、后端兼容层、原生控制器、关键表
- [ ] 写清常见故障：租户页 404、初始化不完整、套餐菜单范围不生效

### D7 文件上传与访问链条

- [ ] 新建 `guide/feature-chain-file.md`
- [ ] 写清前端上传入口、后端文件接口、存储路径、访问 URL、Nginx 映射
- [ ] 写清常见故障：上传成功但预览失败、附件下载与 iframe 冲突

### D8 导航补挂

- [ ] 把功能链条文档挂到 `.vitepress/config.mts`
- [ ] 在 `index.md`、`guide/overview.md`、`guide/quick-start.md`、`frontend/overview.md`、`backend/springboot-overview.md` 补入口

## 最终交付检查

- [ ] 有可追踪的任务板
- [ ] 有可复用的修复说明文档
- [ ] 有完整的前后端功能链条文档入口
- [ ] 有可复跑的 smoke / typecheck / build 验证结果

## 备注

这份任务板本身也要持续维护。后续如果已经开始修 A2、A3、A4，请先回到这里补记号，再继续下一步。
