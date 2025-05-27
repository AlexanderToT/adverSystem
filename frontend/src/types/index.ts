// API响应数据类型
export interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    current: number;
    pageSize: number;
  };
}

// 分页响应数据类型
export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    total: number;
    current: number;
    pageSize: number;
  };
}

// 后端API响应格式
export interface BackendApiResponse<T = any> {
  code: number; // 状态码
  message?: string; // 消息
  data: T; // 数据
  pagination?: {
    total: number;
    current: number;
    pageSize: number;
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