# 快速开始

## 环境要求

| 项目 | 建议版本 |
| --- | --- |
| Node.js | 20+ |
| pnpm | 8+ |
| MySQL | 8.x |
| Redis | 7.x |
| Docker | 可选，建议用于本地数据库启动 |

## 建议的启动顺序

1. 启动 MySQL 与 Redis。
2. 初始化后端数据库。
3. 启动后端服务。
4. 启动前端服务。
5. 打开 Swagger 与前端页面验证联调。

## 后端初始化

在 `D:\zl\luckyColor-admin-serve` 下执行：

```bash
pnpm install
Copy-Item .env.example .env
docker compose up -d
pnpm db:setup
pnpm dev
```

启动成功后：

- 接口基地址：`http://127.0.0.1:3001/api`
- Swagger：`http://127.0.0.1:3001/docs`

## 前端启动

在 `D:\zl\luckyColor-admin` 下执行：

```bash
pnpm install
pnpm dev
```

默认访问地址：

```text
http://127.0.0.1:9900
```

## 默认账号

根据后端默认环境变量与种子数据，初始管理员账号为：

- 用户名：`admin`
- 密码：`123456`

## 首次联调检查项

- 后端 `GET /api/health` 返回成功
- Swagger 页面可正常打开
- 前端登录页可访问
- 使用默认账号可以完成登录
- 菜单与用户信息可正常拉取
