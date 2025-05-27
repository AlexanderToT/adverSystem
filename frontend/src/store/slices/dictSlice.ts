import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dictApi, { DictType, DictData, DictTypeQuery, DictDataQuery } from '@/services/dictApi';

// 状态接口
interface DictState {
  dictTypes: DictType[];
  currentDictType: DictType | null;
  dictDataList: DictData[];
  currentDictData: DictData | null;
  typesPagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  dataListPagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loadingTypes: boolean;
  loadingData: boolean;
  error: string | null;
}

// 初始状态
const initialState: DictState = {
  dictTypes: [],
  currentDictType: null,
  dictDataList: [],
  currentDictData: null,
  typesPagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  dataListPagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  loadingTypes: false,
  loadingData: false,
  error: null,
};

// 异步Thunk: 获取字典类型列表
export const fetchDictTypes = createAsyncThunk(
  'dict/fetchDictTypes',
  async (params: DictTypeQuery = {}, { rejectWithValue }) => {
    try {
      return await dictApi.getDictTypes(params);
    } catch (error: any) {
      return rejectWithValue(error.message || '获取字典类型列表失败');
    }
  }
);

// 异步Thunk: 获取字典类型详情
export const fetchDictTypeById = createAsyncThunk(
  'dict/fetchDictTypeById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await dictApi.getDictTypeById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取字典类型详情失败');
    }
  }
);

// 异步Thunk: 创建字典类型
export const createDictType = createAsyncThunk(
  'dict/createDictType',
  async (data: Partial<DictType>, { rejectWithValue, dispatch }) => {
    try {
      const response = await dictApi.createDictType(data);
      dispatch(fetchDictTypes({}));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '创建字典类型失败');
    }
  }
);

// 异步Thunk: 更新字典类型
export const updateDictType = createAsyncThunk(
  'dict/updateDictType',
  async ({ id, data }: { id: string; data: Partial<DictType> }, { rejectWithValue, dispatch }) => {
    try {
      const response = await dictApi.updateDictType(id, data);
      dispatch(fetchDictTypes({}));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '更新字典类型失败');
    }
  }
);

// 异步Thunk: 删除字典类型
export const deleteDictType = createAsyncThunk(
  'dict/deleteDictType',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await dictApi.deleteDictType(id);
      dispatch(fetchDictTypes({}));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || '删除字典类型失败');
    }
  }
);

// 异步Thunk: 获取字典数据列表
export const fetchDictDataList = createAsyncThunk(
  'dict/fetchDictDataList',
  async (params: DictDataQuery, { rejectWithValue }) => {
    try {
      return await dictApi.getDictDataList(params);
    } catch (error: any) {
      return rejectWithValue(error.message || '获取字典数据列表失败');
    }
  }
);

// 异步Thunk: 根据字典类型获取字典数据
export const fetchDictDataByType = createAsyncThunk(
  'dict/fetchDictDataByType',
  async (dictType: string, { rejectWithValue }) => {
    try {
      const response = await dictApi.getDictDataByType(dictType);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取字典数据失败');
    }
  }
);

// 异步Thunk: 创建字典数据
export const createDictData = createAsyncThunk(
  'dict/createDictData',
  async (data: Partial<DictData>, { rejectWithValue, dispatch }) => {
    try {
      const response = await dictApi.createDictData(data);
      dispatch(fetchDictDataList({ dictTypeId: data.dictTypeId! }));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '创建字典数据失败');
    }
  }
);

// 异步Thunk: 更新字典数据
export const updateDictData = createAsyncThunk(
  'dict/updateDictData',
  async ({ id, data, dictTypeId }: { id: string; data: Partial<DictData>; dictTypeId: string }, { rejectWithValue, dispatch }) => {
    try {
      const response = await dictApi.updateDictData(id, data);
      dispatch(fetchDictDataList({ dictTypeId }));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || '更新字典数据失败');
    }
  }
);

// 异步Thunk: 删除字典数据
export const deleteDictData = createAsyncThunk(
  'dict/deleteDictData',
  async ({ id, dictTypeId }: { id: string; dictTypeId: string }, { rejectWithValue, dispatch }) => {
    try {
      await dictApi.deleteDictData(id);
      dispatch(fetchDictDataList({ dictTypeId }));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || '删除字典数据失败');
    }
  }
);

// 异步Thunk: 初始化系统字典
export const initSystemDict = createAsyncThunk(
  'dict/initSystemDict',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dictApi.initSystemDict();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '初始化系统字典失败');
    }
  }
);

// 创建slice
const dictSlice = createSlice({
  name: 'dict',
  initialState,
  reducers: {
    clearDictError(state) {
      state.error = null;
    },
    clearCurrentDictType(state) {
      state.currentDictType = null;
    },
    clearCurrentDictData(state) {
      state.currentDictData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理获取字典类型列表
      .addCase(fetchDictTypes.pending, (state) => {
        state.loadingTypes = true;
        state.error = null;
      })
      .addCase(fetchDictTypes.fulfilled, (state:any, action:any) => {
        state.loadingTypes = false;
        state.dictTypes = action.payload.data || [];
        state.typesPagination = action.payload.pagination || {
          page: 1,
          pageSize: 10,
          total: 0,
        };
      })
      .addCase(fetchDictTypes.rejected, (state, action) => {
        state.loadingTypes = false;
        state.error = action.payload as string;
      })
      
      // 处理获取字典类型详情
      .addCase(fetchDictTypeById.pending, (state) => {
        state.loadingTypes = true;
        state.error = null;
      })
      .addCase(fetchDictTypeById.fulfilled, (state:any, action:any) => {
        state.loadingTypes = false;
        state.currentDictType = action.payload;
      })
      .addCase(fetchDictTypeById.rejected, (state, action) => {
        state.loadingTypes = false;
        state.error = action.payload as string;
      })
      
      // 处理获取字典数据列表
      .addCase(fetchDictDataList.pending, (state) => {
        state.loadingData = true;
        state.error = null;
      })
      .addCase(fetchDictDataList.fulfilled, (state:any, action:any) => {
        state.loadingData = false;
        state.dictDataList = action.payload.data || [];
        state.dataListPagination = action.payload.pagination || {
          page: 1,
          pageSize: 10,
          total: 0,
        };
      })
      .addCase(fetchDictDataList.rejected, (state, action) => {
        state.loadingData = false;
        state.error = action.payload as string;
      })
      
      // 处理根据类型获取字典数据
      .addCase(fetchDictDataByType.pending, (state) => {
        state.loadingData = true;
        state.error = null;
      })
      .addCase(fetchDictDataByType.fulfilled, (state:any, action:any) => {
        state.loadingData = false;
        state.dictDataList = action.payload;
      })
      .addCase(fetchDictDataByType.rejected, (state, action) => {
        state.loadingData = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDictError, clearCurrentDictType, clearCurrentDictData } = dictSlice.actions;

export default dictSlice.reducer;