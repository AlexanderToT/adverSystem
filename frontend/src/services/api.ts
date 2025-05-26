import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from '@/utils/storage';

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;
    // 如果是直接返回文件流等特殊响应，直接返回
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response;
    }

    // 检查响应状态码
    if (res.code !== 200) {
      // 可以在这里统一处理错误，如显示错误消息、重定向等
      return Promise.reject(new Error(res.message || '错误'));
    }
    return res;
  },
  (error) => {
    // 处理HTTP错误
    if (error.response) {
      // 处理401未授权错误
      if (error.response.status === 401) {
        // 重定向到登录页或其他操作
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// 封装GET请求
export const get = <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.get(url, { params, ...config });
};

// 封装POST请求
export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.post(url, data, config);
};

// 封装PUT请求
export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.put(url, data, config);
};

// 封装DELETE请求
export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.delete(url, config);
};

export default axiosInstance; 