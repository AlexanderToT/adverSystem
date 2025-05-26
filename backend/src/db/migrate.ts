import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

// 默认数据库URL
const DEFAULT_DB_URL = 'postgres://pguser:123456@localhost:5432/adverAdmin';

// 获取数据库连接URL
const getDatabaseUrl = (env?: any): string => {
  // 优先使用传入的env参数，适用于Cloudflare Workers环境
  return env?.DATABASE_URL || DEFAULT_DB_URL;
};

// 执行迁移
export const runMigration = async (env?: any) => {
  const migrationClient = postgres(getDatabaseUrl(env), { max: 1 });
  
  try {
    console.log('Starting database migration...');
    
    // 创建Drizzle实例
    const db = drizzle(migrationClient);
    
    // 执行迁移，从指定目录加载迁移文件
    await migrate(db, { migrationsFolder: 'drizzle' });
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // 关闭数据库连接
    await migrationClient.end();
  }
};

// 只在直接执行此文件作为脚本时运行迁移
// 修改为环境无关的方式
const isDirectlyExecuted = () => {
  try {
    // 在非Cloudflare Workers环境中判断
    if (typeof globalThis !== 'undefined' && 
        'process' in globalThis && 
        (globalThis as any).process?.argv?.[1]) {
      // Node.js环境
      return true;
    }
  } catch (e) {
    // 忽略错误
  }
  return false;
};

if (isDirectlyExecuted()) {
  runMigration();
} 