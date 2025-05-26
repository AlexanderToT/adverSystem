// API响应统一格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

// 错误响应格式
export interface ApiError {
  message: string;
  statusCode: number;
}

// 通用状态枚举
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
} 