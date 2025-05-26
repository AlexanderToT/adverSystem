// API响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 分页数据类型
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

// 用户类型
export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  loginType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
}

// 角色类型
export interface Role {
  id: string;
  name: string;
  description?: string;
}

// 登录请求类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  token: string;
  user: User;
}

// 创建用户请求类型
export interface CreateUserRequest {
  username: string;
  password: string;
  displayName?: string;
  email?: string;
  loginType: string;
  roleIds: string[];
}

// 更新用户请求类型
export interface UpdateUserRequest {
  displayName?: string;
  email?: string;
  isActive?: boolean;
  roleIds?: string[];
}

// 修改密码请求类型
export interface ChangePasswordRequest {
  newPassword: string;
} 