import dictApi, { DictData } from '@/services/dictApi';

/**
 * 字典数据缓存
 */
interface DictCache {
  [key: string]: {
    data: DictData[];
    timestamp: number;
    expireTime: number;
  };
}

// 缓存过期时间 (默认5分钟)
const DEFAULT_EXPIRE_TIME = 5 * 60 * 1000;

// 字典缓存对象
const dictCache: DictCache = {};

/**
 * 获取字典数据
 * @param dictType 字典类型编码
 * @param refresh 是否强制刷新缓存
 * @param expireTime 缓存过期时间(毫秒)
 * @returns 字典数据列表
 */
export const getDictData = async (
  dictType: string,
  refresh = false,
  expireTime = DEFAULT_EXPIRE_TIME
): Promise<DictData[]> => {
  const now = Date.now();
  
  // 检查是否有缓存且未过期
  if (
    !refresh &&
    dictCache[dictType] &&
    dictCache[dictType].timestamp + dictCache[dictType].expireTime > now
  ) {
    return dictCache[dictType].data;
  }
  
  try {
    // 从API获取最新数据
    const response = await dictApi.getDictDataByType(dictType);
    const dictData:any = response.data || [];
    
    // 更新缓存
    dictCache[dictType] = {
      data: dictData,
      timestamp: now,
      expireTime
    };
    
    return dictData;
  } catch (error) {
    console.error(`获取字典数据失败: ${dictType}`, error);
    return [];
  }
};

/**
 * 通过字典值获取字典标签
 * @param dictType 字典类型编码
 * @param value 字典值
 * @param defaultLabel 默认标签
 * @returns 字典标签
 */
export const getDictLabel = async (
  dictType: string,
  value?: string | null,
  defaultLabel = '--'
): Promise<string> => {
  if (value === undefined || value === null || value === '') {
    return defaultLabel;
  }
  
  try {
    const dictData = await getDictData(dictType);
    const item = dictData.find(item => item.dictValue === value);
    return item ? item.dictLabel : defaultLabel;
  } catch (error) {
    console.error(`获取字典标签失败: ${dictType}, ${value}`, error);
    return defaultLabel;
  }
};

/**
 * 清除所有字典缓存
 */
export const clearDictCache = (): void => {
  Object.keys(dictCache).forEach(key => {
    delete dictCache[key];
  });
};

/**
 * 清除指定字典缓存
 * @param dictType 字典类型编码
 */
export const clearDictTypeCache = (dictType: string): void => {
  if (dictCache[dictType]) {
    delete dictCache[dictType];
  }
}; 