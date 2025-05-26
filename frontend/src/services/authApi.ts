import { get, post, put, del } from './api';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  User, 
  Role, 
  PaginatedResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest
} from '@/types';

// 登录
export const login = (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return post<ApiResponse<LoginResponse>>('/auth/login', data);
};

// 获取当前用户信息
export const getCurrentUser = (): Promise<ApiResponse<User>> => {
  return get<ApiResponse<User>>('/auth/me');
};

// 登出
export const logout = (): Promise<ApiResponse<null>> => {
  return post<ApiResponse<null>>('/auth/logout');
};

// 获取用户列表（分页）
export const getUsers = (params?: any): Promise<ApiResponse<PaginatedResponse<User>>> => {
  return get<ApiResponse<PaginatedResponse<User>>>('/users', params);
};

// 获取用户详情
export const getUserById = (id: string): Promise<ApiResponse<User>> => {
  return get<ApiResponse<User>>(`/users/${id}`);
};

// 创建用户
export const createUser = (data: CreateUserRequest): Promise<ApiResponse<User>> => {
  return post<ApiResponse<User>>('/users', data);
};

// 更新用户
export const updateUser = (id: string, data: UpdateUserRequest): Promise<ApiResponse<User>> => {
  return put<ApiResponse<User>>(`/users/${id}`, data);
};

// 删除用户
export const deleteUser = (id: string): Promise<ApiResponse<null>> => {
  return del<ApiResponse<null>>(`/users/${id}`);
};

// 修改用户密码
export const changePassword = (id: string, data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
  return put<ApiResponse<null>>(`/users/${id}/change-password`, data);
};

// 获取角色列表
export const getRoles = (): Promise<ApiResponse<Role[]>> => {
  return get<ApiResponse<Role[]>>('/roles');
};
