import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, CreateUserRequest, UpdateUserRequest, PaginationParams, PaginatedResponse } from '@/types/auth';
import * as accountApi from '@/services/accountApi';
import { ApiError } from '@/types/api';

// 定义用户状态类型
interface UserState {
  users: User[];
  selectedUser: User | null;
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  } | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 初始状态
const initialState: UserState = {
  users: [],
  selectedUser: null,
  pagination: null,
  status: 'idle',
  error: null,
};

// 异步action：获取用户列表
export const fetchUsers = createAsyncThunk<
  PaginatedResponse<User>,
  PaginationParams,
  { rejectValue: ApiError }
>('users/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    return await accountApi.getUsers(params);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 异步action：根据ID获取用户
export const fetchUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: ApiError }
>('users/fetchUserById', async (userId, { rejectWithValue }) => {
  try {
    return await accountApi.getUserById(userId);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 异步action：创建用户
export const createUser = createAsyncThunk<
  User,
  CreateUserRequest,
  { rejectValue: ApiError }
>('users/createUser', async (userData, { rejectWithValue }) => {
  try {
    return await accountApi.createUser(userData);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 异步action：更新用户
export const updateUser = createAsyncThunk<
  User,
  { id: string; userData: UpdateUserRequest },
  { rejectValue: ApiError }
>('users/updateUser', async ({ id, userData }, { rejectWithValue }) => {
  try {
    return await accountApi.updateUser(id, userData);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 异步action：删除用户
export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>('users/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    await accountApi.deleteUser(userId);
    return userId; // 返回被删除的用户ID，用于从Redux状态中移除
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 异步action：修改用户密码
export const changeUserPassword = createAsyncThunk<
  void,
  { id: string; newPassword: string },
  { rejectValue: ApiError }
>('users/changePassword', async ({ id, newPassword }, { rejectWithValue }) => {
  try {
    await accountApi.changeUserPassword(id, { newPassword });
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 创建user slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 处理获取用户列表
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '获取用户列表失败';
      });

    // 处理获取单个用户
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '获取用户信息失败';
      });

    // 处理创建用户
    builder
      .addCase(createUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '创建用户失败';
      });

    // 处理更新用户
    builder
      .addCase(updateUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // 更新用户列表中的数据
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        // 如果是当前选中的用户，也更新selectedUser
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '更新用户失败';
      });

    // 处理删除用户
    builder
      .addCase(deleteUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // 从用户列表中移除被删除的用户
        state.users = state.users.filter(user => user.id !== action.payload);
        // 如果当前选中的用户被删除，清空selectedUser
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '删除用户失败';
      });

    // 处理修改密码
    builder
      .addCase(changeUserPassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.status = 'succeeded';
        // 密码修改成功，不需要更改状态
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '修改密码失败';
      });
  },
});

// 导出actions
export const { clearSelectedUser, clearError } = userSlice.actions;

// 导出reducer
export default userSlice.reducer; 