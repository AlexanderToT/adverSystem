import { Context } from 'hono';
import * as accountService from '../services/account.service';
import { loginSchema, createUserSchema, updateUserSchema, changePasswordSchema } from '../validations/account.validation';
import { success, error } from '../utils/response';

// 登录处理
export const loginHandler = async (c: Context) => {
  try {
    const input = await c.req.json();
    const validatedInput = loginSchema.parse(input);
    const result = await accountService.loginUser(validatedInput);
    return success(c, result, '登录成功');
  } catch (err: any) {
    return error(c, err.message || '登录失败', 400, 400);
  }
};

// 登出处理
export const logoutHandler = async (c: Context) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(c, '未提供有效的认证令牌', 400, 400);
    }
    
    const token = authHeader.split(' ')[1];
    await accountService.logoutUser(token, c.env.JWT_BLACKLIST);
    
    return success(c, null, '登出成功');
  } catch (err: any) {
    return error(c, err.message || '登出失败', 400, 400);
  }
};

// 获取当前用户信息
export const getCurrentUserHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    if (!user) {
      return error(c, '未授权访问', 401, 401);
    }
    
    const userInfo = await accountService.getCurrentUser(user.id);
    return success(c, userInfo, '获取用户信息成功');
  } catch (err: any) {
    return error(c, err.message || '获取用户信息失败', 400, 400);
  }
};

// 获取用户列表
export const getUsersHandler = async (c: Context) => {
  try {
    const { page = '1', limit = '10', search, role } = c.req.query();
    
    const users = await accountService.getUsers(
      parseInt(page, 10),
      parseInt(limit, 10),
      search,
      role
    );
    
    return success(c, users, '获取用户列表成功');
  } catch (err: any) {
    return error(c, err.message || '获取用户列表失败', 400, 400);
  }
};

// 根据ID获取用户
export const getUserByIdHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const user = await accountService.getUserById(id);
    return success(c, user, '获取用户信息成功');
  } catch (err: any) {
    return error(c, err.message || '获取用户信息失败', 400, 400);
  }
};

// 创建用户
export const createUserHandler = async (c: Context) => {
  try {
    const input = await c.req.json();
    const validatedInput = createUserSchema.parse(input);
    const newUser = await accountService.createUser(validatedInput);
    return success(c, newUser, '创建用户成功', 200, 201);
  } catch (err: any) {
    return error(c, err.message || '创建用户失败', 400, 400);
  }
};

// 更新用户
export const updateUserHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const input = await c.req.json();
    const validatedInput = updateUserSchema.parse(input);
    const updatedUser = await accountService.updateUser(id, validatedInput);
    return success(c, updatedUser, '更新用户成功');
  } catch (err: any) {
    return error(c, err.message || '更新用户失败', 400, 400);
  }
};

// 删除用户
export const deleteUserHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    await accountService.deleteUser(id);
    return success(c, null, '用户删除成功');
  } catch (err: any) {
    return error(c, err.message || '删除用户失败', 400, 400);
  }
};

// 修改用户密码
export const changeUserPasswordHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const input = await c.req.json();
    const validatedInput = changePasswordSchema.parse(input);
    await accountService.changeUserPassword(id, validatedInput);
    return success(c, null, '密码修改成功');
  } catch (err: any) {
    return error(c, err.message || '修改密码失败', 400, 400);
  }
}; 