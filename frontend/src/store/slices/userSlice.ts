import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  changePassword 
} from '@/services/authApi';
import { User, PaginatedResponse, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest } from '@/types';

interface UsersState {
  users: User[];
  currentUser: User | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  currentUser: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  error: null,
};

// 异步Thunk: 获取用户列表
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await getUsers(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取用户列表失败');
    }
  }
);

// 异步Thunk: 获取用户详情
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getUserById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取用户详情失败');
    }
  }
);

// 异步Thunk: 创建用户
export const addUser = createAsyncThunk(
  'users/addUser',
  async (userData: CreateUserRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await createUser(userData);
      // 创建成功后重新获取用户列表
      dispatch(fetchUsers({}));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '创建用户失败');
    }
  }
);

// 异步Thunk: 更新用户
export const editUser = createAsyncThunk(
  'users/editUser',
  async ({ id, data }: { id: string; data: UpdateUserRequest }, { rejectWithValue, dispatch }) => {
    try {
      const response = await updateUser(id, data);
      // 更新成功后重新获取用户列表
      dispatch(fetchUsers({}));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '更新用户失败');
    }
  }
);

// 异步Thunk: 删除用户
export const removeUser = createAsyncThunk(
  'users/removeUser',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await deleteUser(id);
      // 删除成功后重新获取用户列表
      dispatch(fetchUsers({}));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || '删除用户失败');
    }
  }
);

// 异步Thunk: 修改密码
export const modifyPassword = createAsyncThunk(
  'users/modifyPassword',
  async ({ id, data }: { id: string; data: ChangePasswordRequest }, { rejectWithValue }) => {
    try {
      await changePassword(id, data);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || '修改密码失败');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    },
    clearCurrentUser(state) {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理获取用户列表
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<PaginatedResponse<User> | null>) => {
        state.loading = false;
        if (action.payload) {
          state.users = action.payload.data;
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 处理获取用户详情
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 处理创建用户
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 处理更新用户
      .addCase(editUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(editUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 处理删除用户
      .addCase(removeUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 处理修改密码
      .addCase(modifyPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(modifyPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(modifyPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserError, clearCurrentUser } = userSlice.actions;

export default userSlice.reducer;