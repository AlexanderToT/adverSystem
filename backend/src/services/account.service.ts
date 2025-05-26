import { eq, and, sql } from 'drizzle-orm';
import { getDb } from '../db';
import { schema } from '../db';
import { hashPassword, comparePassword, generateJwt, verifyJwt, blacklistToken } from '../utils/auth';
import { LoginInput, CreateUserInput, UpdateUserInput, ChangePasswordInput } from '../validations/account.validation';
import { KVNamespace } from '@cloudflare/workers-types';
import { Context } from 'hono';

// 用户类型（包含角色）
export interface UserWithRoles {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  loginType: string;
  isActive: boolean;
  roles: {
    id: string;
    name: string;
    description?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// 登录服务
export const loginUser = async (loginInput: LoginInput, c: Context) => {
  console.log('登录服务: 开始处理登录请求...');
  console.log('使用用户名:', loginInput.username);
  
  try {
    // 为当前请求获取数据库连接
    const db = getDb(c.env);
    
    // 查找用户
    console.log('尝试从数据库查询用户...');
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, loginInput.username),
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      }
    });

    console.log('数据库查询结果:', user ? '用户存在' : '用户不存在');

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new Error('账号已被禁用');
    }

    // 验证密码
    console.log('开始验证密码...');
    console.log('数据库中的密码哈希:', user.passwordHash);
    const passwordToVerify = loginInput.password;
    console.log('用户输入的密码:', passwordToVerify);
    
    const isPasswordValid = await comparePassword(passwordToVerify, user.passwordHash);
    console.log('密码验证结果:', isPasswordValid ? '密码正确' : '密码错误');
    
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    // 提取角色
    const roles = user.userRoles.map((ur: any) => ur.role.name);

    // 生成JWT
    const token = await generateJwt({
      sub: user.id,
      username: user.username,
      roles
    }, c.env);

    // 转换为前端需要的格式
    const userWithRoles: UserWithRoles = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || undefined,
      email: user.email || undefined,
      loginType: user.loginType,
      isActive: user.isActive,
      roles: user.userRoles.map((ur: any) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description || undefined
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return { token, user: userWithRoles };
  } catch (error) {
    console.error('登录服务发生错误:', error);
    throw error;
  }
};

// 登出服务
export const logoutUser = async (token: string, jwtBlacklist?: KVNamespace) => {
  // 解析JWT获取过期时间，计算剩余有效期
  try {
    const payload = await verifyJwt(token);
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp || now;
    const ttl = Math.max(0, exp - now);
    
    // 将token加入黑名单（如果黑名单服务可用）
    if (jwtBlacklist) {
      await blacklistToken(token, ttl, jwtBlacklist);
    } else {
      console.warn('JWT黑名单服务不可用，无法记录已登出的令牌');
    }
  } catch (error) {
    // 如果token已经无效，不需要加入黑名单
    console.error('登出时发生错误:', error);
  }
};

// 获取当前用户信息
export const getCurrentUser = async (userId: string, c: Context): Promise<UserWithRoles> => {
  const db = getDb(c.env);
  
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
    with: {
      userRoles: {
        with: {
          role: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName || undefined,
    email: user.email || undefined,
    loginType: user.loginType,
    isActive: user.isActive,
    roles: user.userRoles.map((ur: any) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description || undefined
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// 用户列表查询（分页）
export const getUsers = async (page: number, limit: number, c: Context, search?: string, role?: string) => {
  const db = getDb(c.env);
  
  // 构建查询条件
  let users;
  
  if (search) {
    // 搜索条件
    users = await db.query.users.findMany({
      where: eq(schema.users.username, search), // 简化版，实际应该使用like或其他匹配方式
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      },
      limit,
      offset: (page - 1) * limit,
    });
  } else {
    // 没有搜索条件
    users = await db.query.users.findMany({
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      },
      limit,
      offset: (page - 1) * limit,
    });
  }

  // 获取总数
  const totalCount = await db.select({ count: sql`count(*)` }).from(schema.users);
  const total = Number(totalCount[0].count);

  // 转换为前端格式
  const formattedUsers: UserWithRoles[] = users.map((user: any) => ({
    id: user.id,
    username: user.username,
    displayName: user.displayName || undefined,
    email: user.email || undefined,
    loginType: user.loginType,
    isActive: user.isActive,
    roles: user.userRoles.map((ur: any) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description || undefined
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));

  return {
    data: formattedUsers,
    pagination: {
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      limit
    }
  };
};

// 根据ID获取用户
export const getUserById = async (id: string, c: Context): Promise<UserWithRoles> => {
  const db = getDb(c.env);
  
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, id),
    with: {
      userRoles: {
        with: {
          role: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('用户不存在');
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName || undefined,
    email: user.email || undefined,
    loginType: user.loginType,
    isActive: user.isActive,
    roles: user.userRoles.map((ur: any) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description || undefined
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// 创建用户
export const createUser = async (userData: CreateUserInput, c: Context): Promise<UserWithRoles> => {
  // 获取数据库连接
  const db = getDb(c.env);
  
  // 检查用户名是否已存在
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.username, userData.username)
  });

  if (existingUser) {
    throw new Error('用户名已存在');
  }

  // 加密密码
  const passwordHash = await hashPassword(userData.password);

  // 创建用户事务
  const result = await db.transaction(async (tx) => {
    // 创建用户
    const [newUser] = await tx.insert(schema.users).values({
      username: userData.username,
      passwordHash,
      displayName: userData.displayName,
      email: userData.email,
      loginType: 'password',
      isActive: true
    }).returning();

    // 分配角色
    for (const roleId of userData.roleIds) {
      await tx.insert(schema.userRoles).values({
        userId: newUser.id,
        roleId
      });
    }

    // 查询完整的用户信息（包含角色）
    const userWithRoles = await (tx.query as any).users.findFirst({
      where: eq(schema.users.id, newUser.id),
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      }
    });

    return userWithRoles;
  });

  if (!result) {
    throw new Error('创建用户失败');
  }

  // 转换为前端格式
  return {
    id: result.id,
    username: result.username,
    displayName: result.displayName || undefined,
    email: result.email || undefined,
    loginType: result.loginType,
    isActive: result.isActive,
    roles: result.userRoles.map((ur: any) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description || undefined
    })),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  };
};

// 更新用户
export const updateUser = async (id: string, userData: UpdateUserInput, c: Context): Promise<UserWithRoles> => {
  // 获取数据库连接
  const db = getDb(c.env);
  
  // 检查用户是否存在
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.id, id)
  });

  if (!existingUser) {
    throw new Error('用户不存在');
  }

  // 更新用户事务
  const result = await db.transaction(async (tx) => {
    // 更新用户基本信息
    await tx.update(schema.users)
      .set({
        displayName: userData.displayName !== undefined ? userData.displayName : existingUser.displayName,
        email: userData.email !== undefined ? userData.email : existingUser.email,
        isActive: userData.isActive !== undefined ? userData.isActive : existingUser.isActive,
        updatedAt: new Date()
      })
      .where(eq(schema.users.id, id));

    // 如果提供了角色，更新角色
    if (userData.roleIds) {
      // 删除现有角色
      await tx.delete(schema.userRoles).where(eq(schema.userRoles.userId, id));

      // 添加新角色
      for (const roleId of userData.roleIds) {
        await tx.insert(schema.userRoles).values({
          userId: id,
          roleId
        });
      }
    }

    // 查询更新后的用户信息
    const updatedUser = await (tx.query as any).users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      }
    });

    return updatedUser;
  });

  if (!result) {
    throw new Error('更新用户失败');
  }

  // 转换为前端格式
  return {
    id: result.id,
    username: result.username,
    displayName: result.displayName || undefined,
    email: result.email || undefined,
    loginType: result.loginType,
    isActive: result.isActive,
    roles: result.userRoles.map((ur: any) => ({
      id: ur.role.id,
      name: ur.role.name,
      description: ur.role.description || undefined
    })),
    createdAt: result.createdAt,
    updatedAt: result.updatedAt
  };
};

// 删除用户
export const deleteUser = async (id: string, c: Context): Promise<void> => {
  // 获取数据库连接
  const db = getDb(c.env);
  
  // 检查用户是否存在
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.id, id)
  });

  if (!existingUser) {
    throw new Error('用户不存在');
  }

  // 删除用户（由于外键约束，相关的userRoles记录会自动删除）
  await db.delete(schema.users).where(eq(schema.users.id, id));
};

// 修改密码
export const changeUserPassword = async (id: string, { newPassword }: ChangePasswordInput, c: Context): Promise<void> => {
  // 获取数据库连接
  const db = getDb(c.env);
  
  // 检查用户是否存在
  const existingUser = await db.query.users.findFirst({
    where: eq(schema.users.id, id)
  });

  if (!existingUser) {
    throw new Error('用户不存在');
  }

  // 加密新密码
  const passwordHash = await hashPassword(newPassword);

  // 更新密码
  await db.update(schema.users)
    .set({ 
      passwordHash,
      updatedAt: new Date()
    })
    .where(eq(schema.users.id, id));
};

// 获取所有角色列表
export const getRoles = async (c: Context) => {
  const db = getDb(c.env);
  
  const rolesList = await db.query.roles.findMany({
    orderBy: (roles, { asc }) => [asc(roles.name)],
  });

  return rolesList.map(role => ({
    id: role.id,
    name: role.name,
    description: role.description || undefined
  }));
}; 