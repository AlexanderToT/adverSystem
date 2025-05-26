# 蓝鲸时代后台管理系统 - 前端

## 项目概述

蓝鲸时代后台管理系统是一个广告管理平台，主要用于广告投放、应用接入和监测数据的管理。前端使用React 18 + Ant Design + Redux Toolkit + React Router 6 + Axios技术栈开发。

## 技术栈

- 框架：React 18
- UI库：Ant Design 5.x
- 状态管理：Redux Toolkit
- 路由：React Router 6
- 请求库：Axios
- 构建工具：Vite
- 样式：Less

## 开发环境

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 运行开发环境

```bash
npm run dev
```

### 构建生产环境

```bash
npm run build
```

## 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # 公共组件
├── config/          # 配置文件
├── hooks/           # 自定义钩子
├── layouts/         # 布局组件
├── pages/           # 页面组件
│   ├── account/     # 账号管理页面
│   ├── application/ # 应用管理页面
│   └── advertisement/ # 广告管理页面
├── services/        # API服务
├── store/           # Redux状态管理
│   └── slices/      # Redux切片
├── styles/          # 全局样式
├── types/           # TypeScript类型定义
└── utils/           # 工具函数
```

## 功能模块

### 账号管理

- 账号列表：展示系统中的所有账号，支持搜索、筛选、新增、编辑、删除操作。
- 角色管理：管理用户角色及权限。

### 应用管理

- 应用列表：展示接入的所有应用，支持搜索、筛选、新增、编辑、删除操作。
- 广告位管理：管理应用中的广告位配置。

### 广告管理

- 广告列表：展示所有广告，支持搜索、筛选、新增、编辑、删除操作。
- 素材管理：管理广告素材（图片、视频等）。

## 开发规范

- 代码风格遵循ESLint和Prettier配置。
- 组件使用函数组件和Hooks。
- 状态管理使用Redux Toolkit。
- API请求使用封装的Axios服务。
- 路由使用React Router 6，受保护的路由使用AuthGuard组件。 