import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getRoles } from '@/services/authApi';
import { Role } from '@/types';

interface RolesState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  loading: false,
  error: null,
};

// 异步Thunk: 获取角色列表
export const fetchRoles = createAsyncThunk(
  'roles/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRoles();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取角色列表失败');
    }
  }
);

const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearRoleError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action: PayloadAction<Role[] | null>) => {
        state.loading = false;
        if (action.payload) {
          state.roles = action.payload;
        }
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRoleError } = roleSlice.actions;

export default roleSlice.reducer; 