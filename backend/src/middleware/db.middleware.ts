import { Context, Next } from 'hono';
import { getDb } from '../db';

/**
 * 数据库连接中间件
 * 
 * 此中间件负责：
 * 1. 为每个请求创建数据库连接
 * 2. 将数据库连接存储在context中，供后续处理器使用
 * 3. 在请求结束后关闭连接
 */
export async function dbMiddleware(c: Context, next: Next) {
  // 为请求创建新的数据库连接
  const db = getDb(c.env);
  
  // 将数据库连接存储在context中
  c.set('db', db);
  
  try {
    // 继续处理请求
    await next();
  } finally {
    // 无论请求处理是成功还是失败，都要确保关闭数据库连接
    if (db && (db as any).close) {
      try {
        await (db as any).close();
      } catch (error) {
        console.error('关闭数据库连接失败:', error);
      }
    }
  }
} 