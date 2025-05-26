import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { loggerMiddleware } from './middleware/logger.middleware';
import { responseMiddleware } from './middleware/response.middleware';
import apiRouter from './routes';
// 创建Hono应用实例
const app = new Hono();
// 中间件
app.use('*', logger());
app.use('*', loggerMiddleware); // 添加自定义日志中间件
app.use('*', responseMiddleware); // 添加响应拦截器中间件
app.use('*', cors({
    origin: '*', // 生产环境应该设置为特定域名
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
}));
// 路由
app.get('/', (c) => c.text('蓝鲸时代后台管理系统API服务'));
// 注册API路由
app.route('/api', apiRouter);
// 处理404
app.notFound((c) => {
    return c.json({
        message: '请求的资源不存在'
    }, 404);
});
// 全局错误处理
app.onError((err, c) => {
    console.error(`[ERROR] ${err.message}`);
    return c.json({
        message: err.message || '服务器内部错误'
    }, 500);
});
export default app;
