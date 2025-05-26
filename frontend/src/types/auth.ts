// 用户角色
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  USER = 'user'
}

// 用户登录类型
export enum LoginType {
  PASSWORD = 'password',
  OAUTH = 'oauth'
}

// 角色
export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 用户信息
export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  loginType: LoginType;
  isActive: boolean;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
}

// 创建用户请求
export interface CreateUserRequest {
  username: string;
  password: string;
  displayName?: string;
  email?: string;
  roleIds: string[];
}

// 更新用户请求
export interface UpdateUserRequest {
  displayName?: string;
  email?: string;
  isActive?: boolean;
  roleIds?: string[];
}

// 修改密码请求
export interface ChangePasswordRequest {
  newPassword: string;
}

// 分页查询参数
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  role?: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
} 