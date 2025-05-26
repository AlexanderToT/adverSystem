// import { compare, hash } from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { KVNamespace } from '@cloudflare/workers-types';

// 默认值，仅在未提供环境变量时使用
const DEFAULT_JWT_SECRET = 'your-jwt-secret-replace-in-production';
const DEFAULT_JWT_EXPIRES_IN = '24h';

/**
 * 使用Web Crypto API的SHA-256算法生成密码哈希
 * 确保在Cloudflare Workers环境中可靠工作
 * @param password 要哈希的密码
 * @returns Base64编码的哈希值（包含盐值）
 */
export const hashPassword = async (password: string): Promise<string> => {
  try {
    // 生成随机盐值（16字节）
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // 将密码转换为Uint8Array
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // 将盐值和密码合并到一个新的Uint8Array
    const combined = new Uint8Array(salt.length + passwordData.length);
    combined.set(salt, 0);
    combined.set(passwordData, salt.length);
    
    // 使用SHA-256哈希算法
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const hashArray = new Uint8Array(hashBuffer);
    
    // 将盐值和哈希拼接
    const result = new Uint8Array(salt.length + hashArray.length);
    result.set(salt, 0);
    result.set(hashArray, salt.length);
    
    // 转换为Base64
    return arrayBufferToBase64(result);
  } catch (error) {
    console.error('创建密码哈希时出错:', error);
    throw new Error('密码哈希失败');
  }
};

/**
 * 验证密码是否与存储的哈希匹配
 * @param password 要验证的密码
 * @param storedHash 存储的哈希值（Base64编码，包含盐值）
 * @returns 是否匹配
 */
export const comparePassword = async (password: string, storedHash: string): Promise<boolean> => {
  try {
    // 将Base64哈希转换为Uint8Array
    const hashData = base64ToArrayBuffer(storedHash);
    
    // 从哈希数据中提取盐值（前16字节）
    const salt = hashData.slice(0, 16);
    
    // 将密码转换为Uint8Array
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // 将盐值和密码合并到一个新的Uint8Array
    const combined = new Uint8Array(salt.length + passwordData.length);
    combined.set(salt, 0);
    combined.set(passwordData, salt.length);
    
    // 使用相同的哈希算法和盐值计算哈希
    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const calculatedHash = new Uint8Array(hashBuffer);
    
    // 从存储的哈希中提取原始哈希部分（跳过盐值）
    const originalHash = hashData.slice(16);
    
    // 确保长度匹配
    if (calculatedHash.length !== originalHash.length) {
      console.log('哈希长度不匹配');
      return false;
    }
    
    // 比较哈希值（恒定时间比较）
    let result = 0;
    for (let i = 0; i < originalHash.length; i++) {
      result |= originalHash[i] ^ calculatedHash[i];
    }
    
    return result === 0;
  } catch (error) {
    console.error('验证密码时出错:', error);
    return false;
  }
};

/**
 * 将Uint8Array转换为Base64字符串
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

/**
 * 将Base64字符串转换为Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

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
  console.log(`[JWT] 使用的JWT密钥: ${jwtSecret === DEFAULT_JWT_SECRET ? '默认密钥' : '环境变量密钥'}`);
  
  const secret = new TextEncoder().encode(jwtSecret);
  
  try {
    const { payload } = await jwtVerify(token, secret);
    console.log(`[JWT] 验证成功，载荷: ${JSON.stringify(payload)}`);
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.log(`[JWT] 验证失败:`, error);
    throw new Error('Invalid token');
  }
};

// 检查JWT是否在黑名单中
export const isTokenBlacklisted = async (token: string, jwtBlacklist?: KVNamespace): Promise<boolean> => {
  if (!jwtBlacklist) {
    console.warn('JWT黑名单服务不可用，跳过黑名单检查');
    return false;
  }
  
  try {
    const isBlacklisted = await jwtBlacklist.get(token);
    return !!isBlacklisted;
  } catch (error) {
    console.error('检查JWT黑名单时出错:', error);
    return false;
  }
};

// 将JWT加入黑名单
export const blacklistToken = async (
  token: string, 
  expiresIn: number, 
  jwtBlacklist?: KVNamespace
): Promise<void> => {
  if (!jwtBlacklist) {
    console.warn('JWT黑名单服务不可用，无法将令牌加入黑名单');
    return;
  }
  
  try {
    // 将token加入黑名单，过期时间与JWT相同
    await jwtBlacklist.put(token, 'blacklisted', { expirationTtl: expiresIn });
  } catch (error) {
    console.error('将令牌加入黑名单时出错:', error);
  }
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