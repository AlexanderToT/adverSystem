import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as accountController from '../controllers/account.controller';
import { loginSchema, createUserSchema, updateUserSchema, changePasswordSchema } from '../validations/account.validation';
import { authenticate, authorize } from '../middleware/auth.middleware';

// 创建账号路由
const accountRouter = new Hono();

// 公开路由
accountRouter.post('/login', zValidator('json', loginSchema), accountController.loginHandler);

// 需要认证的路由
accountRouter.post('/logout', authenticate, accountController.logoutHandler);
accountRouter.get('/me', authenticate, accountController.getCurrentUserHandler);

// 用户管理路由 (需要认证)
accountRouter.use('/users/*', authenticate);

// 获取用户列表 (所有认证用户都可以查看)
accountRouter.get('/usersList', accountController.getUsersHandler);

// 创建用户 (仅超级管理员)
accountRouter.post('/users', 
  authorize(['super_admin']), 
  zValidator('json', createUserSchema), 
  accountController.createUserHandler
);

// 获取单个用户
accountRouter.get('/users/:id', accountController.getUserByIdHandler);

// 更新用户 (仅超级管理员或用户自己)
accountRouter.put('/users/:id', 
  zValidator('json', updateUserSchema), 
  accountController.updateUserHandler
);

// 删除用户 (仅超级管理员)
accountRouter.delete('/users/:id', 
  authorize(['super_admin']), 
  accountController.deleteUserHandler
);

// 修改密码 (仅超级管理员或用户自己)
accountRouter.put('/users/:id/change-password', 
  zValidator('json', changePasswordSchema), 
  accountController.changeUserPasswordHandler
);

export default accountRouter; 