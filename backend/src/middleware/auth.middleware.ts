import { Context, Next } from 'hono';
import { verifyJwt, isTokenBlacklisted } from '../utils/auth';
import { error } from '../utils/response';

// 白名单路径列表
const AUTH_WHITELIST = [
  '/api/auth/login',  // 登录接口
  '/api/auth/register', // 注册接口 
  '/api/health' // 健康检查
  // 添加其他不需要鉴权的路径
];

// 认证中间件：验证JWT，带白名单机制
export const authenticate = async (c: Context, next: Next) => {
  const path = c.req.path;
  
  // 检查是否在白名单中
  if (AUTH_WHITELIST.some(whitelistPath => path.startsWith(whitelistPath))) {
    await next();
    return;
  }
  
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(error('未授权访问', 401), 401);
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // 检查token是否在黑名单中
    const jwtBlacklist = c.env.JWT_BLACKLIST;
    if (jwtBlacklist && await isTokenBlacklisted(token, jwtBlacklist)) {
      return c.json(error('令牌已失效', 401), 401);
    }
    
    // 验证token
    const payload = await verifyJwt(token);
    
    // 将用户信息添加到上下文中
    c.set('user', {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles
    });
    
    await next();
  } catch (err) {
    return c.json(error('无效的令牌', 401), 401);
  }
};

// 授权中间件：检查角色权限
export const authorize = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json(error('未授权访问', 401), 401);
    }
    
    // 检查用户是否有所需角色
    const hasRole = user.roles.some((role: string) => allowedRoles.includes(role));
    
    if (!hasRole) {
      return c.json(error('没有权限执行此操作', 403), 403);
    }
    
    await next();
  };
}; 