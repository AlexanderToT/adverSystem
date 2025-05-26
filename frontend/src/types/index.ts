// 用户相关类型
export interface User {
  id: string
  username: string
  displayName?: string
  email?: string
  loginType: string
  isActive: boolean
  roles: string[]
  createdAt: string
  updatedAt: string
}

// 角色相关类型
export interface Role {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

// API响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T | null
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
} 