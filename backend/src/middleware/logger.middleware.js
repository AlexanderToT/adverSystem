/**
 * 简单的日志中间件
 * 记录每个请求的方法、URL和处理时间
 */
export async function loggerMiddleware(c, next) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${c.req.method} ${c.req.url} - ${ms}ms`);
}
