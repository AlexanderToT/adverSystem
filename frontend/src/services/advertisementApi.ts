import axiosInstance from './api';
import { BackendApiResponse } from '@/types';
import { Advertisement, AdStats } from '@/store/slices/advertisementSlice';

export interface AdvertisementQuery {
  page?: number;
  limit?: number;
  search?: string;
  adType?: string;
  isDisplayed?: boolean;
}

export interface AdStatsQuery {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface MaterialUploadParams {
  fileName: string;
  contentType: string;
}

const advertisementApi = {
  // 获取广告列表
  getAdvertisements: (params: AdvertisementQuery) => 
    axiosInstance.get<BackendApiResponse<Advertisement[]>>('/advertisements', { params }),
  
  // 获取单个广告详情
  getAdvertisementById: (id: string) => 
    axiosInstance.get<BackendApiResponse<Advertisement>>(`/advertisements/${id}`),
  
  // 创建广告
  createAdvertisement: (adData: any) => 
    axiosInstance.post<BackendApiResponse<Advertisement>>('/advertisements', adData),
  
  // 更新广告
  updateAdvertisement: (id: string, adData: any) => 
    axiosInstance.put<BackendApiResponse<Advertisement>>(`/advertisements/${id}`, adData),
  
  // 删除广告
  deleteAdvertisement: (id: string) => 
    axiosInstance.delete<BackendApiResponse<null>>(`/advertisements/${id}`),
  
  // 获取广告统计数据
  getAdvertisementStats: (id: string, params: AdStatsQuery) => 
    axiosInstance.get<BackendApiResponse<AdStats[]>>(`/advertisements/${id}/stats`, { params }),
  
  // 批量更新广告状态
  batchUpdateAdsStatus: (adIds: string[], isDisplayed: boolean) => 
    axiosInstance.post<BackendApiResponse<{updatedIds: string[]}>>('/advertisements/batch-status', { adIds, isDisplayed }),
  
  // 获取素材上传URL
  getMaterialUploadUrl: (params: MaterialUploadParams) => 
    axiosInstance.post<BackendApiResponse<{uploadUrl: string, fileUrl: string, filePath: string}>>('/advertisements/materials/upload-url', params)
};

export default advertisementApi; 