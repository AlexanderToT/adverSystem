import axiosInstance from './api';

// 后端API响应类型
export interface BackendApiResponse<T> {
  code: number;
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface DictType {
  id: string;
  dictName: string;
  dictType: string;
  status: 'normal' | 'disabled';
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DictData {
  id: string;
  dictTypeId: string;
  dictLabel: string;
  dictValue: string;
  dictSort: number;
  cssClass?: string;
  listClass?: string;
  isDefault: boolean;
  status: 'normal' | 'disabled';
  remark?: string;
  dictType?: DictType; // 关联的字典类型
  createdAt: string;
  updatedAt: string;
}

export interface DictTypeQuery {
  page?: number;
  pageSize?: number;
  dictName?: string;
  dictType?: string;
  status?: string;
}

export interface DictDataQuery {
  page?: number;
  pageSize?: number;
  dictTypeId: string;
  dictLabel?: string;
  status?: string;
}

const dictApi = {
  // 字典类型API
  getDictTypes: (params: DictTypeQuery) => 
    axiosInstance.get<BackendApiResponse<DictType[]>>('/dict/types', { params }),
  
  getDictTypeById: (id: string) => 
    axiosInstance.get<BackendApiResponse<DictType>>(`/dict/types/${id}`),
  
  createDictType: (data: Partial<DictType>) => 
    axiosInstance.post<BackendApiResponse<DictType>>('/dict/types', data),
  
  updateDictType: (id: string, data: Partial<DictType>) => 
    axiosInstance.put<BackendApiResponse<DictType>>(`/dict/types/${id}`, data),
  
  deleteDictType: (id: string) => 
    axiosInstance.delete<BackendApiResponse<null>>(`/dict/types/${id}`),
  
  exportDictTypes: (params: Partial<DictTypeQuery>) => 
    axiosInstance.get<BackendApiResponse<DictType[]>>('/dict/types/export', { params }),
  
  // 字典数据API
  getDictDataList: (params: DictDataQuery) => 
    axiosInstance.get<BackendApiResponse<DictData[]>>('/dict/data', { params }),
  
  getDictDataByType: (dictType: string) => 
    axiosInstance.get<BackendApiResponse<DictData[]>>(`/dict/data/type/${dictType}`),
  
  getDictDataById: (id: string) => 
    axiosInstance.get<BackendApiResponse<DictData>>(`/dict/data/${id}`),
  
  createDictData: (data: Partial<DictData>) => 
    axiosInstance.post<BackendApiResponse<DictData>>('/dict/data', data),
  
  updateDictData: (id: string, data: Partial<DictData>) => 
    axiosInstance.put<BackendApiResponse<DictData>>(`/dict/data/${id}`, data),
  
  deleteDictData: (id: string) => 
    axiosInstance.delete<BackendApiResponse<null>>(`/dict/data/${id}`),
  
  // 系统字典初始化
  initSystemDict: () => 
    axiosInstance.post<BackendApiResponse<null>>('/dict/init')
};

export default dictApi; 