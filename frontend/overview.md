# 前端说明

## 项目位置

前端项目目录：

```text
D:\zl\luckyColor-admin
```

## 技术选型

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Naive UI
- UnoCSS
- `vxe-table`
- `wangEditor`

## 启动方式

```bash
pnpm install
pnpm dev
```

默认开发地址：

```text
http://127.0.0.1:9900
```

## 关键配置

### 代理配置

在 `vite.config.ts` 中，前端会把 `/api` 请求代理到后端：

```ts
proxy: {
  '/api': {
    target: envConfig.VITE_API_PROXY_TARGET || 'http://127.0.0.1:3001',
    changeOrigin: true
  }
}
```

### 全局系统配置

`src/config/index.ts` 中维护了：

- API 基础地址
- Swagger 页面地址
- 登录默认账号密码
- 租户 Header
- 前端主题色

其中主题主色已经配置为 `#0F766E`，文档站也延续了这套视觉主色。

## 目录职责

| 目录 | 作用 |
| --- | --- |
| `src/api` | 接口封装 |
| `src/components` | 通用组件 |
| `src/layouts` | 后台布局 |
| `src/router` | 路由与动态菜单处理 |
| `src/store` | Pinia 状态管理 |
| `src/views` | 业务页面模块 |
| `src/utils` | 请求封装与通用工具 |

## 联调建议

- 保持后端服务先启动，减少前端代理报错噪音
- 先验证登录、菜单、用户信息这三条主链路
- Swagger 页面可作为接口参数和返回结果的对照参考
- 如果启用了租户模式，开发环境建议显式配置默认租户或请求头

## 构建与预览

```bash
pnpm build
pnpm preview
```

如果后续要单独部署前端静态资源，推荐由 Nginx 托管 `dist` 目录，并反向代理 `/api` 到后端服务。
