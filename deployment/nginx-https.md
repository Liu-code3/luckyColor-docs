# Nginx / HTTPS 配置

## 这页解决什么问题

LuckyColor 前端是单页应用，后端是独立 API 服务，因此正式部署时通常需要 Nginx 同时解决四件事：

- 提供前端静态资源访问
- 把 `/api` 反向代理到后端
- 把 `/docs` 反向代理到 Swagger
- 处理 HTTPS 证书与域名入口

## 推荐访问方式

| 地址 | 作用 |
| --- | --- |
| `https://admin.example.com/` | 前端后台入口 |
| `https://admin.example.com/api/` | 后端接口 |
| `https://admin.example.com/docs/` | Swagger 文档 |

下面示例默认按 Spring Boot 本地端口 `3001` 编写。如果你部署的是 NestJS，请把 Swagger 的目标地址改成实际服务的 `/docs`。

## 最关键的三个配置点

### 1. 单页应用回退

前端刷新任何子路由都不能直接让 Nginx 去找对应磁盘文件，否则会 404。必须配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. `/api/` 反代

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3. `/docs/` 反代

```nginx
location /docs/ {
    proxy_pass http://127.0.0.1:3001/api/docs/;
    proxy_set_header Host $host;
}
```

## HTTP 到 HTTPS 跳转示例

```nginx
server {
    listen 80;
    server_name admin.example.com;
    return 301 https://$host$request_uri;
}
```

## HTTPS 主站示例

```nginx
server {
    listen 443 ssl http2;
    server_name admin.example.com;

    ssl_certificate /etc/letsencrypt/live/admin.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/admin.example.com/privkey.pem;

    root /srv/luckycolor/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /docs/ {
        proxy_pass http://127.0.0.1:3001/api/docs/;
        proxy_set_header Host $host;
    }
}
```

## 当前仓库可复用的示例

文档仓库内已经提供了示例文件：

- `examples/deploy/nginx/default.conf`
- `examples/deploy/nginx/https.conf`

它们适合作为起点，但不能直接无脑上线。你需要至少替换：

- 域名
- 后端主机地址
- 证书路径
- 日志目录

## 为什么 `/api/` 和 `/docs/` 要单独代理

因为前端本身只是静态资源，真正的业务能力都来自后端：

- 登录认证
- 菜单和权限
- 工作台统计
- 用户、角色、菜单、租户管理
- Swagger 文档

如果不单独代理，前端只能显示空壳页面。

## HTTPS 证书建议

### 方式一：宿主机 Certbot

如果 Nginx 跑在宿主机，可以直接申请：

```bash
sudo certbot certonly --nginx -d admin.example.com
```

### 方式二：证书挂载到容器

如果 Nginx 在容器中，通常做法是：

- 在宿主机申请证书
- 把证书目录挂载进容器
- 在 `https.conf` 中引用容器内路径

### 方式三：云厂商负载均衡或 CDN 终止 HTTPS

如果 HTTPS 在云上终止，Nginx 只需要接收内网 HTTP，但仍建议保留：

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

这样后端仍能感知原始协议。

## 推荐补充的 Nginx 配置

### 上传大小

文件上传场景建议增加：

```nginx
client_max_body_size 20m;
```

### 压缩与缓存

静态资源建议：

- 开启 gzip
- 对 js、css、图片设置缓存头

### 超时

如果某些导出或大文件下载较慢，可以适当增加：

- `proxy_read_timeout`
- `proxy_connect_timeout`

## 与多租户相关的注意点

如果后续采用域名识别租户模式，需要提前考虑：

- `server_name` 是否使用通配域名
- 证书是否支持通配域名
- Nginx 是否正确保留 `Host` 头给后端

当前 LuckyColor 后端支持从域名后缀识别租户，因此代理层不要随意覆盖或丢弃 Host 信息。

## 常见问题

### 刷新页面 404

几乎都是没有配置 `try_files`。

### 前端正常，但接口全是 502

优先检查：

- 后端是否监听 `3001`
- `proxy_pass` 地址是否正确
- 宿主机与容器网络是否连通

### Swagger 页面打不开

优先检查：

- 后端 `.env` 中 `SWAGGER_ENABLED=true`
- `/docs/` 的代理配置是否正确
- 是否被防火墙或访问控制拦截

### HTTPS 配好了但页面资源加载异常

优先检查：

- 前端构建时的 `VITE_BUILD_PUBLIC_PATH`
- 静态资源路径是否与部署目录一致
- 是否还在引用 HTTP 资源导致浏览器拦截混合内容

## 实践建议

- 本地调试先用 HTTP 跑通，再加 HTTPS。
- 先确认前端静态站点能打开，再接 `/api` 反代。
- 部署完成后至少验证登录、工作台、用户管理和租户管理四条主链路。
