/**
 * 本地存储工具函数
 */

const TOKEN_KEY = 'adver_admin_token';
const USER_KEY = 'adver_admin_user';

// 保存令牌
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// 获取令牌
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// 移除令牌
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// 保存用户信息
export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// 获取用户信息
export const getUser = (): any => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

// 移除用户信息
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// 清除所有存储
export const clearStorage = (): void => {
  removeToken();
  removeUser();
}; 