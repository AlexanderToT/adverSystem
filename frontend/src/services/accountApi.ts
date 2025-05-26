import api from './api';
import {
  LoginRequest, 
  LoginResponse, 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  PaginationParams, 
  PaginatedResponse,
  Role,
  ChangePasswordRequest
} from '@/types/auth';

// 认证相关API
export const login = (credentials: LoginRequest): Promise<LoginResponse> => {
  return api.post('/auth/login', credentials);
};

export const logout = (): Promise<void> => {
  return api.post('/auth/logout');
};

export const getCurrentUser = (): Promise<User> => {
  return api.get('/auth/me');
};

// 用户管理相关API
export const getUsers = (params: PaginationParams): Promise<PaginatedResponse<User>> => {
  return api.get('/users', { params });
};

export const getUserById = (id: string): Promise<User> => {
  return api.get(`/users/${id}`);
};

export const createUser = (userData: CreateUserRequest): Promise<User> => {
  return api.post('/users', userData);
};

export const updateUser = (id: string, userData: UpdateUserRequest): Promise<User> => {
  return api.put(`/users/${id}`, userData);
};

export const deleteUser = (id: string): Promise<void> => {
  return api.delete(`/users/${id}`);
};

export const changeUserPassword = (id: string, passwordData: ChangePasswordRequest): Promise<void> => {
  return api.put(`/users/${id}/change-password`, passwordData);
};

// 角色管理相关API
export const getRoles = (): Promise<Role[]> => {
  return api.get('/roles');
};

export const getRoleById = (id: string): Promise<Role> => {
  return api.get(`/roles/${id}`);
};

export const createRole = (roleData: { name: string; description?: string }): Promise<Role> => {
  return api.post('/roles', roleData);
};

export const updateRole = (id: string, roleData: { name?: string; description?: string }): Promise<Role> => {
  return api.put(`/roles/${id}`, roleData);
};

export const deleteRole = (id: string): Promise<void> => {
  return api.delete(`/roles/${id}`);
}; 