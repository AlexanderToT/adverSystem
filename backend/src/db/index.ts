import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 默认数据库连接URL
const DEFAULT_DB_URL = 'postgres://pguser:123456@localhost:5432/adverAdmin';

// 连接配置
const CONNECTION_CONFIG = {
  max: 1,        // Workers环境中，每个请求最多使用1个连接
  idle_timeout: 10, // 空闲连接超时时间（秒）
  connect_timeout: 10, // 连接超时时间（秒）
};

/**
 * 获取数据库连接
 * 在Cloudflare Workers环境中，每个请求都需要创建新的数据库连接
 * 不能使用全局单例连接，因为这违反了Workers的I/O隔离规则
 * 
 * @param env 环境变量
 * @returns {PostgresJsDatabase} Drizzle ORM数据库实例
 */
export function getDb(env?: any) {
  // 优先使用环境变量中的配置
  const dbUrl = env?.DATABASE_URL || DEFAULT_DB_URL;
  
  // 为每个请求创建新的PostgreSQL客户端，并设置合理的连接参数
  const client = postgres(dbUrl, CONNECTION_CONFIG);
  
  // 创建Drizzle ORM实例
  const db = drizzle(client, { schema });
  
  // 为db对象添加关闭连接的方法
  (db as any).close = async () => {
    try {
      await client.end();
      console.log('数据库连接已关闭');
    } catch (error) {
      console.error('关闭数据库连接失败:', error);
    }
  };
  
  return db;
}

// 不再导出全局db实例，因为这会导致Workers环境中的I/O共享问题
// 而是在每个需要数据库的函数中，显式传入context并获取新的连接
export { schema }; 