import api from './api';

// 封装认证相关API
export const authApi = {
  // 登录
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },
  
  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response;
  },
  
  // 登出
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response;
  }
} 