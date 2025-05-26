import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Role } from '@/types/auth';
import * as accountApi from '@/services/accountApi';
import { ApiError } from '@/types/api';

// 定义角色状态类型
interface RoleState {
  roles: Role[];
  selectedRole: Role | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// 初始状态
const initialState: RoleState = {
  roles: [],
  selectedRole: null,
  status: 'idle',
  error: null,
};

// 异步action：获取角色列表
export const fetchRoles = createAsyncThunk<
  Role[],
  void,
  { rejectValue: ApiError }
>('roles/fetchRoles', async (_, { rejectWithValue }) => {
  try {
    return await accountApi.getRoles();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 异步action：根据ID获取角色
export const fetchRoleById = createAsyncThunk<
  Role,
  string,
  { rejectValue: ApiError }
>('roles/fetchRoleById', async (roleId, { rejectWithValue }) => {
  try {
    return await accountApi.getRoleById(roleId);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 异步action：创建角色
export const createRole = createAsyncThunk<
  Role,
  { name: string; description?: string },
  { rejectValue: ApiError }
>('roles/createRole', async (roleData, { rejectWithValue }) => {
  try {
    return await accountApi.createRole(roleData);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 异步action：更新角色
export const updateRole = createAsyncThunk<
  Role,
  { id: string; name?: string; description?: string },
  { rejectValue: ApiError }
>('roles/updateRole', async ({ id, ...roleData }, { rejectWithValue }) => {
  try {
    return await accountApi.updateRole(id, roleData);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 异步action：删除角色
export const deleteRole = createAsyncThunk<
  string,
  string,
  { rejectValue: ApiError }
>('roles/deleteRole', async (roleId, { rejectWithValue }) => {
  try {
    await accountApi.deleteRole(roleId);
    return roleId; // 返回被删除的角色ID，用于从Redux状态中移除
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// 创建role slice
const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 处理获取角色列表
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '获取角色列表失败';
      });

    // 处理获取单个角色
    builder
      .addCase(fetchRoleById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedRole = action.payload;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '获取角色信息失败';
      });

    // 处理创建角色
    builder
      .addCase(createRole.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '创建角色失败';
      });

    // 处理更新角色
    builder
      .addCase(updateRole.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // 更新角色列表中的数据
        const index = state.roles.findIndex(role => role.id === action.payload.id);
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
        // 如果是当前选中的角色，也更新selectedRole
        if (state.selectedRole?.id === action.payload.id) {
          state.selectedRole = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '更新角色失败';
      });

    // 处理删除角色
    builder
      .addCase(deleteRole.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // 从角色列表中移除被删除的角色
        state.roles = state.roles.filter(role => role.id !== action.payload);
        // 如果当前选中的角色被删除，清空selectedRole
        if (state.selectedRole?.id === action.payload) {
          state.selectedRole = null;
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || '删除角色失败';
      });
  },
});

// 导出actions
export const { clearSelectedRole, clearError } = roleSlice.actions;

// 导出reducer
export default roleSlice.reducer; 