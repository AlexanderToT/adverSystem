import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '@/types/api';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api', // 使用相对路径，通过Vite代理转发到后端
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// 请求拦截器：添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理统一的响应格式和错误
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // 如果服务端返回的是我们自定义的API响应格式，则直接返回data字段
    if (response.data && 'code' in response.data) {
      if (response.data.code === 200) {
        return response.data.data;
      }
      // 处理非成功的业务码
      return Promise.reject({
        statusCode: response.data.code,
        message: response.data.message,
      } as ApiError);
    }
    // 对于没有经过我们的API封装的响应，直接返回
    return response.data;
  },
  (error: AxiosError<ApiResponse<any>>) => {
    let apiError: ApiError = {
      statusCode: error.response?.status || 500,
      message: '网络错误，请稍后重试',
    };

    // 如果有响应数据，尝试提取更具体的错误信息
    if (error.response?.data) {
      apiError = {
        statusCode: error.response.data.code || error.response.status,
        message: error.response.data.message || error.message,
      };
    }

    // 处理401未授权错误，可能是token已过期
    if (apiError.statusCode === 401) {
      localStorage.removeItem('token');
      // 可以在这里添加重定向到登录页的逻辑
      window.location.href = '/login';
    }

    return Promise.reject(apiError);
  }
);

export default api; 