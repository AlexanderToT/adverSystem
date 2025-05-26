// 响应状态码枚举
export enum ResponseCode {
  SUCCESS = 200,           // 成功
  BAD_REQUEST = 400,       // 请求参数错误
  UNAUTHORIZED = 401,      // 未授权
  FORBIDDEN = 403,         // 禁止访问
  NOT_FOUND = 404,         // 资源不存在
  VALIDATION_ERROR = 422,  // 数据验证错误
  INTERNAL_ERROR = 500     // 服务器内部错误
}

// 通用响应接口
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

// 成功响应
export const success = <T>(data: T, message = '操作成功'): ApiResponse<T> => ({
  code: ResponseCode.SUCCESS,
  message,
  data
});

// 错误响应
export const error = (message: string, code = ResponseCode.INTERNAL_ERROR): ApiResponse<null> => ({
  code,
  message,
  data: null
});

// 带有验证错误的响应
export interface ValidationError {
  errors: Record<string, string[]>;
}

export const validationError = (errors: Record<string, string[]>): ApiResponse<ValidationError> => ({
  code: ResponseCode.VALIDATION_ERROR,
  message: '输入验证失败',
  data: { errors }
}); 