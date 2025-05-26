import { defineConfig } from "drizzle-kit";

// 默认数据库URL
const DEFAULT_DB_URL = 'postgres://pguser:123456@localhost:5432/adverAdmin';

// 获取数据库URL - 兼容多种环境
const getDatabaseUrl = (): string => {
  try {
    // 尝试从环境变量中获取
    const env = globalThis as any;
    // Workers环境或全局变量
    if (env.DATABASE_URL) return env.DATABASE_URL;
    
    // Node.js环境
    if (typeof globalThis !== 'undefined' && 
        'process' in globalThis && 
        (globalThis as any).process?.env?.DATABASE_URL) {
      return (globalThis as any).process.env.DATABASE_URL;
    }
  } catch (e) {
    // 忽略错误，使用默认值
  }
  
  return DEFAULT_DB_URL;
};

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  // 只处理这3个表
  tablesFilter: [
    "accounts",
    "users",
    "applications"
  ],
  // 是否严格模式，严格模式会在执行迁移前进行更严格的检查
  strict: true,
  // 是否打印详细日志
  verbose: true,
}); 