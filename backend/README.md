# 蓝鲸时代后台管理系统 - 后端

基于 Hono.js 和 Cloudflare Workers 的后端 API 服务。

## 项目结构

```
backend/
├── scripts/       # 各种脚本工具
├── src/           # 源代码
│   ├── accounts/  # 账号管理模块
│   ├── applications/ # 应用管理模块 
│   ├── advertisements/ # 广告管理模块
│   ├── middleware/    # 中间件
│   ├── db/           # 数据库相关代码
│   ├── utils/        # 工具函数
│   └── index.ts      # 入口文件
├── dist/          # 编译输出目录 (git忽略)
└── wrangler.toml  # Cloudflare Workers配置
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

### 构建项目

```bash
npm run build      # 完整构建(tsc + esbuild)
npm run build:tsc  # 仅TypeScript编译
```

### 清理构建产物

```bash
npm run clean
```

### 部署到Cloudflare Workers

```bash
npm run deploy
```

### 数据库操作

```bash
npm run db:generate  # 生成迁移脚本
npm run db:push     # 应用迁移到数据库
```

## TypeScript编译说明

本项目配置TypeScript输出编译后的JS文件到`dist`目录，而不是与源文件同目录。如果你在源代码目录中看到了`.js`文件，可通过以下步骤清理：

1. 运行`npm run clean`清理dist目录
2. 如果源码目录中仍有JS文件，请手动删除

## 环境变量

项目使用`wrangler.toml`管理环境变量，开发前请确保以下配置正确：

- `JWT_SECRET`: JWT签名密钥
- `DATABASE_URL`: PostgreSQL连接字符串
- `REDIS_URL`: Redis连接字符串(用于JWT黑名单)

实际部署时，建议使用Cloudflare的环境变量管理功能设置这些敏感信息。 