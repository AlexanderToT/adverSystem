import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as accountController from '../controllers/account.controller';
import { loginSchema, createUserSchema, updateUserSchema, changePasswordSchema } from '../validations/account.validation';
import { auth } from '../middleware/auth-unified.middleware';

// 创建账号路由
const accountRouter = new Hono();

// 公开路由
accountRouter.post('/login', zValidator('json', loginSchema), accountController.loginHandler);

// 需要认证的路由
accountRouter.post('/logout', auth(), accountController.logoutHandler);
accountRouter.get('/me', auth(), accountController.getCurrentUserHandler);

// 获取角色列表
accountRouter.get('/roles', auth(), accountController.getRolesHandler);

// 用户管理路由 (不需要全局authenticate，每个路由单独设置)

// 获取用户列表 (所有认证用户都可以查看)
accountRouter.get('/usersList', auth(), accountController.getUsersHandler);

// 创建用户 (仅超级管理员)
accountRouter.post('/addUser', 
  auth({ allowedRoles: ['super_admin'] }), 
  zValidator('json', createUserSchema), 
  accountController.createUserHandler
);

// 获取单个用户
accountRouter.get('/users/:id', auth(), accountController.getUserByIdHandler);

// 更新用户 (仅超级管理员或用户自己)
accountRouter.put('/updateUsers/:id', 
  auth({ allowedRoles: ['super_admin'] }), // 简化版：只允许超级管理员，实际应该检查用户ID
  zValidator('json', updateUserSchema), 
  accountController.updateUserHandler
);

// 删除用户 (仅超级管理员)
accountRouter.delete('/users/:id', 
  auth({ allowedRoles: ['super_admin'] }), 
  accountController.deleteUserHandler
);

// 修改密码 (仅超级管理员或用户自己)
accountRouter.put('/users/change-password/:id', 
  auth(), // 简化版：先只验证身份，在控制器中处理权限
  zValidator('json', changePasswordSchema), 
  accountController.changeUserPasswordHandler
);

export default accountRouter; 