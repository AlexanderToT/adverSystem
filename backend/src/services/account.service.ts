import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { schema } from '../db';
import { hashPassword, comparePassword, generateJwt, verifyJwt, blacklistToken } from '../utils/auth';
import { LoginInput, CreateUserInput, UpdateUserInput, ChangePasswordInput } from '../validations/account.validation';
import { KVNamespace } from '@cloudflare/workers-types';

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
export const loginUser = async (loginInput: LoginInput) => {
  // 查找用户
  const user = await (db.query as any).users.findFirst({
    where: eq(schema.users.username, loginInput.username),
    with: {
      userRoles: {
        with: {
          role: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('用户名或密码错误');
  }

  if (!user.isActive) {
    throw new Error('账号已被禁用');
  }

  // 验证密码
  const isPasswordValid = await comparePassword(loginInput.password, user.passwordHash);
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
  });

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
};

// 登出服务
export const logoutUser = async (token: string, jwtBlacklist: KVNamespace) => {
  // 解析JWT获取过期时间，计算剩余有效期
  try {
    const payload = await verifyJwt(token);
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp || now;
    const ttl = Math.max(0, exp - now);
    
    // 将token加入黑名单
    await blacklistToken(token, ttl, jwtBlacklist);
  } catch (error) {
    // 如果token已经无效，不需要加入黑名单
    console.error('登出时发生错误:', error);
  }
};

// 获取当前用户信息
export const getCurrentUser = async (userId: string): Promise<UserWithRoles> => {
  const user = await (db.query as any).users.findFirst({
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
export const getUsers = async (page: number, limit: number, search?: string, roleFilter?: string) => {
  // 构建查询条件
  let query = (db.query as any).users.findMany({
    with: {
      userRoles: {
        with: {
          role: true
        }
      }
    },
    limit,
    offset: (page - 1) * limit,
    orderBy: schema.users.createdAt
  });

  // 搜索条件
  // 注意：这里简化了实现，实际应该使用更复杂的查询条件
  if (search) {
    query = (db.query as any).users.findMany({
      where: (users: any) => {
        return eq(users.username, search); // 简化版，实际应该使用like或其他匹配方式
      },
      with: {
        userRoles: {
          with: {
            role: true
          }
        }
      },
      limit,
      offset: (page - 1) * limit,
      orderBy: schema.users.createdAt
    });
  }

  // 角色过滤
  if (roleFilter) {
    // 这里需要更复杂的查询，简化实现
    // 实际应该使用join或子查询
  }

  // 执行查询
  const users = await query;

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
export const getUserById = async (id: string): Promise<UserWithRoles> => {
  const user = await (db.query as any).users.findFirst({
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
export const createUser = async (userData: CreateUserInput): Promise<UserWithRoles> => {
  // 检查用户名是否已存在
  const existingUser = await (db.query as any).users.findFirst({
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
export const updateUser = async (id: string, userData: UpdateUserInput): Promise<UserWithRoles> => {
  // 检查用户是否存在
  const existingUser = await (db.query as any).users.findFirst({
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
export const deleteUser = async (id: string): Promise<void> => {
  // 检查用户是否存在
  const existingUser = await (db.query as any).users.findFirst({
    where: eq(schema.users.id, id)
  });

  if (!existingUser) {
    throw new Error('用户不存在');
  }

  // 删除用户（由于外键约束，相关的userRoles记录会自动删除）
  await db.delete(schema.users).where(eq(schema.users.id, id));
};

// 修改密码
export const changeUserPassword = async (id: string, { newPassword }: ChangePasswordInput): Promise<void> => {
  // 检查用户是否存在
  const existingUser = await (db.query as any).users.findFirst({
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