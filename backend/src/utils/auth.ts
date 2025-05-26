// import { compare, hash } from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { KVNamespace } from '@cloudflare/workers-types';

// 默认值，仅在未提供环境变量时使用
const DEFAULT_JWT_SECRET = 'your-jwt-secret-replace-in-production';
const DEFAULT_JWT_EXPIRES_IN = '24h';

// 使用Web Crypto API实现密码哈希
export const hashPassword = async (password: string): Promise<string> => {
  // 生成随机盐值（16字节）
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // 将盐值和密码合并
  const saltedPassword = new Uint8Array(salt.length + passwordData.length);
  saltedPassword.set(salt);
  saltedPassword.set(passwordData, salt.length);
  
  // 使用SHA-256哈希算法
  const hashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword);
  
  // 将盐值和哈希值拼接并转为Base64
  const hashArray = new Uint8Array(salt.length + hashBuffer.byteLength);
  hashArray.set(salt);
  hashArray.set(new Uint8Array(hashBuffer), salt.length);
  
  return btoa(String.fromCharCode(...hashArray));
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    // 从Base64解码哈希
    const hashData = Uint8Array.from(atob(hashedPassword), c => c.charCodeAt(0));
    
    // 提取盐值（前16字节）
    const salt = hashData.slice(0, 16);
    const originalHash = hashData.slice(16);
    
    // 使用相同的盐值和算法重新哈希输入的密码
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    const saltedPassword = new Uint8Array(salt.length + passwordData.length);
    saltedPassword.set(salt);
    saltedPassword.set(passwordData, salt.length);
    
    const newHashBuffer = await crypto.subtle.digest('SHA-256', saltedPassword);
    const newHash = new Uint8Array(newHashBuffer);
    
    // 比较两个哈希值是否相同
    if (originalHash.length !== newHash.length) return false;
    
    // 使用恒定时间比较防止计时攻击
    let result = 0;
    for (let i = 0; i < originalHash.length; i++) {
      result |= originalHash[i] ^ newHash[i];
    }
    
    return result === 0;
  } catch (error) {
    // 解码错误或其他问题，返回false
    return false;
  }
};

// JWT相关
interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

// 生成JWT
export const generateJwt = async (payload: Omit<JwtPayload, 'iat' | 'exp'>, env?: any): Promise<string> => {
  const jwtSecret = env?.JWT_SECRET || DEFAULT_JWT_SECRET;
  const expiresIn = env?.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN;
  
  const secret = new TextEncoder().encode(jwtSecret);
  
  // 将过期时间字符串转换为秒
  const expiresInSeconds = parseExpiresIn(expiresIn);
  
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secret);
  
  return jwt;
};

// 验证JWT
export const verifyJwt = async (token: string, env?: any): Promise<JwtPayload> => {
  const jwtSecret = env?.JWT_SECRET || DEFAULT_JWT_SECRET;
  const secret = new TextEncoder().encode(jwtSecret);
  
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// 检查JWT是否在黑名单中
export const isTokenBlacklisted = async (token: string, jwtBlacklist: KVNamespace): Promise<boolean> => {
  const isBlacklisted = await jwtBlacklist.get(token);
  return !!isBlacklisted;
};

// 将JWT加入黑名单
export const blacklistToken = async (
  token: string, 
  expiresIn: number, 
  jwtBlacklist: KVNamespace
): Promise<void> => {
  // 将token加入黑名单，过期时间与JWT相同
  await jwtBlacklist.put(token, 'blacklisted', { expirationTtl: expiresIn });
};

// 辅助函数：解析过期时间字符串
const parseExpiresIn = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    // 默认24小时
    return 24 * 60 * 60;
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return 24 * 60 * 60;
  }
}; 