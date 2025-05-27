import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import advertisementApi, { AdvertisementQuery, AdStatsQuery } from '@/services/advertisementApi';
import { ApiResponse, PaginatedResponse } from '@/types';

// 广告类型定义
export interface Advertisement {
  id: string;
  name: string;
  adType: string;
  targetUrl?: string;
  materialConfig?: any;
  displayConfig?: any[];
  countryCodes?: string[];
  isDisplayed: boolean;
  totalClicks: number;
  createdAt: string;
  updatedAt: string;
}

// 广告统计数据类型
export interface AdStats {
  date: string;
  clicks: number;
  impressions: number;
}

// 素材上传URL响应
export interface MaterialUploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  filePath: string;
}

// 状态接口
interface AdvertisementState {
  advertisements: Advertisement[];
  currentAd: Advertisement | null;
  adStats: AdStats[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  uploadLoading: boolean;
  uploadError: string | null;
  uploadUrls: MaterialUploadUrlResponse | null;
}

// 初始状态
const initialState: AdvertisementState = {
  advertisements: [],
  currentAd: null,
  adStats: [],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  loading: false,
  error: null,
  uploadLoading: false,
  uploadError: null,
  uploadUrls: null,
};

// 异步Thunk: 获取广告列表
export const fetchAdvertisements = createAsyncThunk(
  'advertisements/fetchAdvertisements',
  async (params: AdvertisementQuery = {}, { rejectWithValue }) => {
    try {
      // API 返回的格式: { code: 200, data: [...], pagination: {...} }
      const apiResponse = await advertisementApi.getAdvertisements(params);
      return apiResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取广告列表失败');
    }
  }
);

// 异步Thunk: 获取单个广告详情
export const fetchAdvertisementById = createAsyncThunk(
  'advertisements/fetchAdvertisementById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await advertisementApi.getAdvertisementById(id);
      // response格式为 { code: 200, data: {...} }
      return response.data as Advertisement;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取广告详情失败');
    }
  }
);

// 异步Thunk: 创建广告
export const createAdvertisement = createAsyncThunk(
  'advertisements/createAdvertisement',
  async (adData: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await advertisementApi.createAdvertisement(adData);
      // 创建成功后重新获取广告列表
      dispatch(fetchAdvertisements({}));
      return response.data as Advertisement;
    } catch (error: any) {
      return rejectWithValue(error.message || '创建广告失败');
    }
  }
);

// 异步Thunk: 更新广告
export const updateAdvertisement = createAsyncThunk(
  'advertisements/updateAdvertisement',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue, dispatch }) => {
    try {
      const response = await advertisementApi.updateAdvertisement(id, data);
      // 更新成功后重新获取广告列表
      dispatch(fetchAdvertisements({}));
      return response.data as Advertisement;
    } catch (error: any) {
      return rejectWithValue(error.message || '更新广告失败');
    }
  }
);

// 异步Thunk: 删除广告
export const deleteAdvertisement = createAsyncThunk(
  'advertisements/deleteAdvertisement',
  async (id: string, { rejectWithValue, dispatch }) => {
    try {
      await advertisementApi.deleteAdvertisement(id);
      // 删除成功后重新获取广告列表
      dispatch(fetchAdvertisements({}));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || '删除广告失败');
    }
  }
);

// 异步Thunk: 批量更新广告状态
export const batchUpdateAdsStatus = createAsyncThunk(
  'advertisements/batchUpdateAdsStatus',
  async ({ adIds, isDisplayed }: { adIds: string[]; isDisplayed: boolean }, { rejectWithValue, dispatch }) => {
    try {
      await advertisementApi.batchUpdateAdsStatus(adIds, isDisplayed);
      // 更新成功后重新获取广告列表
      dispatch(fetchAdvertisements({}));
      return { adIds, isDisplayed };
    } catch (error: any) {
      return rejectWithValue(error.message || '批量更新广告状态失败');
    }
  }
);

// 异步Thunk: 获取广告统计数据
export const fetchAdvertisementStats = createAsyncThunk(
  'advertisements/fetchAdvertisementStats',
  async ({ id, params }: { id: string; params: AdStatsQuery }, { rejectWithValue }) => {
    try {
      const response = await advertisementApi.getAdvertisementStats(id, params);
      return response.data as AdStats[];
    } catch (error: any) {
      return rejectWithValue(error.message || '获取广告统计数据失败');
    }
  }
);

// 异步Thunk: 获取素材上传URL
export const getMaterialUploadUrl = createAsyncThunk(
  'advertisements/getMaterialUploadUrl',
  async (params: { fileName: string; contentType: string }, { rejectWithValue }) => {
    try {
      const response = await advertisementApi.getMaterialUploadUrl(params);
      return response.data as MaterialUploadUrlResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || '获取上传URL失败');
    }
  }
);

// 创建slice
const advertisementSlice = createSlice({
  name: 'advertisements',
  initialState,
  reducers: {
    clearAdvertisementError(state) {
      state.error = null;
    },
    clearCurrentAd(state) {
      state.currentAd = null;
    },
    clearUploadUrls(state) {
      state.uploadUrls = null;
    },
    clearUploadError(state) {
      state.uploadError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理获取广告列表
      .addCase(fetchAdvertisements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisements.fulfilled, (state, action) => {
        state.loading = false;
        // 服务器返回的格式: { code: 200, data: [...], pagination: {...} }
        state.advertisements = action.payload.data || [];
        state.pagination = action.payload.pagination || {
          current: 1,
          pageSize: 10,
          total: 0
        };
      })
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 处理获取单个广告详情
      .addCase(fetchAdvertisementById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisementById.fulfilled, (state, action: PayloadAction<Advertisement>) => {
        state.loading = false;
        state.currentAd = action.payload;
      })
      .addCase(fetchAdvertisementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 处理创建广告
      .addCase(createAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdvertisement.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 处理更新广告
      .addCase(updateAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdvertisement.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 处理删除广告
      .addCase(deleteAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdvertisement.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 处理批量更新广告状态
      .addCase(batchUpdateAdsStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchUpdateAdsStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(batchUpdateAdsStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 处理获取广告统计数据
      .addCase(fetchAdvertisementStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisementStats.fulfilled, (state, action: PayloadAction<AdStats[]>) => {
        state.loading = false;
        state.adStats = action.payload;
      })
      .addCase(fetchAdvertisementStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // 处理获取素材上传URL
      .addCase(getMaterialUploadUrl.pending, (state) => {
        state.uploadLoading = true;
        state.uploadError = null;
      })
      .addCase(getMaterialUploadUrl.fulfilled, (state, action: PayloadAction<MaterialUploadUrlResponse>) => {
        state.uploadLoading = false;
        state.uploadUrls = action.payload;
      })
      .addCase(getMaterialUploadUrl.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadError = action.payload as string;
      });
  },
});

export const {
  clearAdvertisementError,
  clearCurrentAd,
  clearUploadUrls,
  clearUploadError
} = advertisementSlice.actions;

export default advertisementSlice.reducer; 