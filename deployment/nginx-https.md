# Nginx / HTTPS 配置

## 推荐目标

使用 Nginx 统一暴露：

- 前端静态站点
- `/api` 后端接口
- `/docs` Swagger 页面
- HTTPS 证书终止

## 推荐访问方式

| 地址 | 作用 |
| --- | --- |
| `https://admin.example.com/` | 前端管理后台 |
| `https://admin.example.com/api/` | 后端接口 |
| `https://admin.example.com/docs/` | Swagger 文档，可视情况限制访问 |

## 可复用示例

文档项目中提供了 HTTPS 配置示例，仓库内路径为：

- `examples/deploy/nginx/https.conf`

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

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://server:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /docs/ {
        proxy_pass http://server:3001/docs/;
        proxy_set_header Host $host;
    }
}
```

## 证书获取建议

如果服务器直接安装了 Certbot，可以使用：

```bash
sudo certbot certonly --nginx -d admin.example.com
```

如果是容器化部署，也可以采用：

- 证书在宿主机申请，再挂载进容器
- 使用专门的证书自动化容器
- 由云厂商负载均衡或 CDN 处理 HTTPS

## 安全加固建议

- 生产环境尽量限制 `/docs` 的公网访问
- 对 `/api` 添加合理的上传大小和超时控制
- 开启 `gzip` 和静态资源缓存
- 配合安全组或防火墙只开放 `80` 和 `443`
- 若使用二级域名租户模式，需要同步规划 `server_name` 和通配证书
