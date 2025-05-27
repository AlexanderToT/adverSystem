import { Hono } from 'hono';
import accountRoutes from './account.routes';
import advertisementRouter from './advertisement.routes';
// import applicationRouter from './application.routes'; // 待实现

// 创建API路由
const api = new Hono();

// 注册账号相关路由
api.route('/auth', accountRoutes); // 认证相关端点 (登录/登出/获取当前用户)
api.route('/accounts', accountRoutes);
api.route('/advertisements', advertisementRouter);

// 健康检查端点
api.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default api; 