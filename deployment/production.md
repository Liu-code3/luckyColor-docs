# 生产部署方案

## 推荐方式

生产环境推荐采用以下拆分：

- 前端构建为静态资源，由 Nginx 托管
- 后端单独以 Node.js 进程或容器运行
- MySQL 与 Redis 独立部署
- 通过 Nginx 做统一域名入口和反向代理

## 推荐目录

```text
/srv/luckycolor/
├─ admin/                 # 前端 dist 静态资源
├─ server/                # 后端构建产物与运行文件
├─ logs/                  # 应用日志
├─ scripts/               # 发布脚本
└─ env/                   # 环境变量文件
```

## 前端发布流程

```bash
cd luckyColor-admin
pnpm install
pnpm build
```

将生成的 `dist` 上传到 Nginx 静态目录，例如：

```text
/srv/luckycolor/admin
```

## 后端发布流程

```bash
cd luckyColor-admin-serve
pnpm install
pnpm build
pnpm start:prod
```

如果使用进程守护，建议搭配 `pm2` 或 `systemd`。

## Nginx 反向代理示例

```nginx
server {
    listen 80;
    server_name admin.example.com;

    root /srv/luckycolor/admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /docs/ {
        proxy_pass http://127.0.0.1:3001/docs/;
        proxy_set_header Host $host;
    }
}
```

## 生产环境建议

- 替换默认数据库密码与管理员密码
- 使用强随机 `JWT_SECRET`
- 限制 Swagger 仅在内网或测试环境开放
- 为 MySQL 和 Redis 配置持久化与备份
- 通过 HTTPS 暴露站点
- 接入日志采集和应用监控

## 升级建议

后续如果系统规模扩大，可以逐步升级为：

- 前后端分离部署到不同机器
- 独立网关层
- 多实例后端加负载均衡
- 数据库主从与缓存高可用
