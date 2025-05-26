import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// 默认数据库URL
const DEFAULT_DB_URL = 'postgres://pguser:123456@localhost:5432/adverAdmin';

// 连接单例和DB实例
let dbInstance: ReturnType<typeof drizzle> | null = null;
let clientInstance: ReturnType<typeof postgres> | null = null;

// 获取或创建数据库连接
export function getDb(env?: any) {
  if (dbInstance) {
    return dbInstance;
  }
  
  // 优先使用环境变量中的配置
  const dbUrl = env?.DATABASE_URL || DEFAULT_DB_URL;
  
  // 创建PostgreSQL客户端
  clientInstance = postgres(dbUrl);
  
  // 创建Drizzle ORM实例
  dbInstance = drizzle(clientInstance, { schema });
  
  return dbInstance;
}

// 创建代理对象，在访问属性时才初始化数据库连接
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(target, prop) {
    const dbConn = getDb();
    return dbConn[prop as keyof typeof dbConn];
  }
});

// 导出schema以便在其他地方使用
export { schema }; 