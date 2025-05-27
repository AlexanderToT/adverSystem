import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { loggerMiddleware } from './middleware/logger.middleware';
import { responseMiddleware } from './middleware/response.middleware';
import { dbMiddleware } from './middleware/db.middleware';
import apiRouter from './routes';
import { initSystemDictionaries } from './services/dict.service';

// 创建Hono应用实例
const app = new Hono();

// 中间件
app.use('*', logger());
app.use('*', loggerMiddleware); // 添加自定义日志中间件
app.use('*', responseMiddleware); // 添加响应拦截器中间件
app.use('*', dbMiddleware); // 添加数据库连接管理中间件
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

// 初始化系统字典数据
(async () => {
  try {
    console.log('开始初始化系统字典数据...');
    await initSystemDictionaries();
    console.log('系统字典数据初始化完成');
  } catch (error) {
    console.error('系统字典数据初始化失败:', error);
  }
})();

export default app; 