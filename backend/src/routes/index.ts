import { Hono } from 'hono';
import accountRouter from './account.routes';
// import applicationRouter from './application.routes'; // 待实现
// import advertisementRouter from './advertisement.routes'; // 待实现

// 创建API路由
const apiRouter = new Hono();

// 注册各模块路由
apiRouter.route('/auth', accountRouter);
apiRouter.route('/users', accountRouter);
// apiRouter.route('/applications', applicationRouter); // 待实现
// apiRouter.route('/advertisements', advertisementRouter); // 待实现

// 健康检查端点
apiRouter.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default apiRouter; 