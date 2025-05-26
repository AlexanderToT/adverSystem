import { z } from 'zod';
// 登录请求验证
export const loginSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100),
});
// 创建用户请求验证
export const createUserSchema = z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(100),
    displayName: z.string().max(100).optional(),
    email: z.string().email().optional(),
    roleIds: z.array(z.string().uuid()),
});
// 更新用户请求验证
export const updateUserSchema = z.object({
    displayName: z.string().max(100).optional(),
    email: z.string().email().optional(),
    isActive: z.boolean().optional(),
    roleIds: z.array(z.string().uuid()).optional(),
});
// 修改密码请求验证
export const changePasswordSchema = z.object({
    newPassword: z.string().min(6).max(100),
});
// 创建角色请求验证
export const createRoleSchema = z.object({
    name: z.string().min(2).max(50),
    description: z.string().max(200).optional(),
});
// 更新角色请求验证
export const updateRoleSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    description: z.string().max(200).optional(),
});
