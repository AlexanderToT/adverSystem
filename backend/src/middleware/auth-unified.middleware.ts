import { Context, Next } from 'hono';
import { verifyJwt, isTokenBlacklisted } from '../utils/auth';
import { error } from '../utils/response';

// 白名单路径列表
const AUTH_WHITELIST = [
  '/api/auth/login',  // 登录接口
  '/api/auth/register', // 注册接口 
  '/api/health', // 健康检查
  // 添加其他不需要鉴权的路径
];

/**
 * 统一的认证与授权中间件
 * 
 * @param options 配置项
 * @param options.allowedRoles 允许访问的角色，不指定则只验证身份不验证权限
 * @returns Hono中间件
 */
export const auth = (options?: { allowedRoles?: string[] }) => {
  return async (c: Context, next: Next) => {
    const path = c.req.path;
    console.log(`[Auth-Unified] 请求路径: ${path}`);
    
    // 检查是否在白名单中
    if (AUTH_WHITELIST.some(whitelistPath => path.startsWith(whitelistPath))) {
      console.log(`[Auth-Unified] 路径在白名单中: ${path}`);
      await next();
      return;
    }
    
    // 验证JWT
    const authHeader = c.req.header('Authorization');
    console.log(`[Auth-Unified] 认证头: ${authHeader ? '存在' : '不存在'}`);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`[Auth-Unified] 未提供有效的Bearer令牌`);
      return error(c, '未授权访问', 401, 401);
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // 检查token是否在黑名单中
      const jwtBlacklist = c.env?.JWT_BLACKLIST;
      if (await isTokenBlacklisted(token, jwtBlacklist)) {
        console.log(`[Auth-Unified] 令牌在黑名单中`);
        return error(c, '令牌已失效', 401, 401);
      }
      
      // 验证token
      const payload = await verifyJwt(token, c.env);
      const userRoles = payload.roles || [];
      
      console.log(`[Auth-Unified] 令牌验证成功，用户: ${payload.username}, 角色: ${userRoles.join(',')}`);
      
      // 将用户信息添加到上下文中
      c.set('user', {
        id: payload.sub,
        username: payload.username,
        roles: userRoles
      });
      
      // 如果指定了允许的角色，检查用户是否有权限
      if (options?.allowedRoles && options.allowedRoles.length > 0) {
        console.log(`[Auth-Unified] 检查权限，允许的角色: ${options.allowedRoles.join(',')}`);
        
        const hasRole = userRoles.some(role => options.allowedRoles!.includes(role));
        console.log(`[Auth-Unified] 用户角色: ${userRoles.join(',')}, 是否有权限: ${hasRole}`);
        
        if (!hasRole) {
          console.log(`[Auth-Unified] 用户没有所需权限`);
          return error(c, '没有权限执行此操作', 500, 200);
        }
        
        console.log(`[Auth-Unified] 授权成功`);
      }
      
      await next();
    } catch (err) {
      console.log(`[Auth-Unified] 令牌验证失败:`, err);
      return error(c, '无效的令牌', 401, 401);
    }
  };
}; 