import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login as loginApi, getCurrentUser, logout as logoutApi } from '@/services/authApi';
import { setToken, setUser, getToken, getUser, clearStorage } from '@/utils/storage';
import { User, LoginRequest, LoginResponse } from '@/types';

// 状态类型
interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: AuthState = {
  token: getToken(),
  user: getUser(),
  isAuthenticated: !!getToken(),
  loading: false,
  error: null,
};

// 异步Thunk: 登录
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      const { token, user } = response.data as LoginResponse;
      // 保存到本地存储
      setToken(token);
      setUser(user);
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(error.message || '登录失败');
    }
  }
);

// 异步Thunk: 获取当前用户信息
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCurrentUser();
      const user = response.data;
      setUser(user);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取用户信息失败');
    }
  }
);

// 异步Thunk: 登出
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      clearStorage();
      return null;
    } catch (error: any) {
      clearStorage(); // 即使API调用失败，也应清除本地存储
      return rejectWithValue(error.message || '登出失败');
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理登录
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 处理获取当前用户
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      // 处理登出
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer; 