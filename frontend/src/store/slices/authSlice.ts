import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginRequest, LoginResponse } from '@/types/auth';
import * as accountApi from '@/services/accountApi';
import { ApiError } from '@/types/api';
import { authApi } from '../../services/authApi';

// 定义认证状态类型
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 初始状态
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  status: 'idle',
  error: null,
};

// 异步action：登录
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '登录失败');
    }
  }
);

// 异步action：获取当前用户信息
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser();
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取用户信息失败');
    }
  }
);

// 异步action：登出
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '登出失败');
    }
  }
);

// 创建auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.status = 'succeeded';
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
    });
    
    // Fetch current user
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.status = 'loading';
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload as string;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('token');
    });
    
    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
    });
  },
});

// 导出actions
export const { clearErrors } = authSlice.actions;

// 导出reducer
export default authSlice.reducer; 