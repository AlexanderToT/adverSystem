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
    return c.json(success(result));
  } catch (err: any) {
    return c.json(error(err.message || '登录失败'), 400);
  }
};

// 登出处理
export const logoutHandler = async (c: Context) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json(error('未提供有效的认证令牌'), 400);
    }
    
    const token = authHeader.split(' ')[1];
    await accountService.logoutUser(token, c.env.JWT_BLACKLIST);
    
    return c.json(success(null, '登出成功'));
  } catch (err: any) {
    return c.json(error(err.message || '登出失败'), 400);
  }
};

// 获取当前用户信息
export const getCurrentUserHandler = async (c: Context) => {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json(error('未授权访问'), 401);
    }
    
    const userInfo = await accountService.getCurrentUser(user.id);
    return c.json(success(userInfo));
  } catch (err: any) {
    return c.json(error(err.message || '获取用户信息失败'), 400);
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
    
    return c.json(success(users));
  } catch (err: any) {
    return c.json(error(err.message || '获取用户列表失败'), 400);
  }
};

// 根据ID获取用户
export const getUserByIdHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const user = await accountService.getUserById(id);
    return c.json(success(user));
  } catch (err: any) {
    return c.json(error(err.message || '获取用户信息失败'), 400);
  }
};

// 创建用户
export const createUserHandler = async (c: Context) => {
  try {
    const input = await c.req.json();
    const validatedInput = createUserSchema.parse(input);
    const newUser = await accountService.createUser(validatedInput);
    return c.json(success(newUser), 201);
  } catch (err: any) {
    return c.json(error(err.message || '创建用户失败'), 400);
  }
};

// 更新用户
export const updateUserHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const input = await c.req.json();
    const validatedInput = updateUserSchema.parse(input);
    const updatedUser = await accountService.updateUser(id, validatedInput);
    return c.json(success(updatedUser));
  } catch (err: any) {
    return c.json(error(err.message || '更新用户失败'), 400);
  }
};

// 删除用户
export const deleteUserHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    await accountService.deleteUser(id);
    return c.json(success(null, '用户删除成功'));
  } catch (err: any) {
    return c.json(error(err.message || '删除用户失败'), 400);
  }
};

// 修改用户密码
export const changeUserPasswordHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const input = await c.req.json();
    const validatedInput = changePasswordSchema.parse(input);
    await accountService.changeUserPassword(id, validatedInput);
    return c.json(success(null, '密码修改成功'));
  } catch (err: any) {
    return c.json(error(err.message || '修改密码失败'), 400);
  }
}; 