# 蓝鲸时代广告管理系统

一个基于Hono.js (Cloudflare Workers) + React的现代化广告管理平台。

## 项目结构

```
adverAdmin/
├── backend/             # Hono.js后端API服务
├── frontend/            # React前端应用
└── design/              # 系统设计文档
```

## 主要功能

- 账号管理：用户管理、角色分配、权限控制
- 应用管理：应用信息管理、广告位配置
- 广告管理：广告素材管理、投放控制、数据统计

## 技术栈

### 前端
- React 18
- TypeScript
- Redux Toolkit
- React Router 6
- shadcn/ui + Tailwind CSS
- Vite

### 后端
- Hono.js (Cloudflare Workers)
- TypeScript
- PostgreSQL + Drizzle ORM
- JWT认证
- Cloudflare R2 (文件存储)

## 开发指南

### 后端
```bash
cd backend
npm install
npm run dev       # 开发环境启动
npm run deploy    # 部署到Cloudflare Workers
```

### 前端
```bash
cd frontend
npm install
npm run dev       # 开发环境启动
npm run build     # 构建生产版本
```

## 授权协议

私有项目，保留所有权利。 