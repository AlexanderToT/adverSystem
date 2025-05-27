import { dictTypes, dictData } from '../db/schema';
import { getDb } from '../db';
import { eq, like, and, desc, asc, count, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

/**
 * 数据字典类型服务
 */
export class DictTypeService {
  /**
   * 获取字典类型列表
   * @param params 查询参数
   */
  static async getList(params?: {
    dictName?: string;
    dictType?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const db = getDb();
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    // 构建查询条件
    let whereConditions = [];
    if (params?.dictName) {
      whereConditions.push(like(dictTypes.dictName, `%${params.dictName}%`));
    }
    if (params?.dictType) {
      whereConditions.push(like(dictTypes.dictType, `%${params.dictType}%`));
    }
    if (params?.status) {
      whereConditions.push(eq(dictTypes.status, params.status));
    }
    
    const whereClause = whereConditions.length > 0
      ? and(...whereConditions)
      : undefined;
    
    // 查询数据
    const data = await db.query.dictTypes.findMany({
      where: whereClause,
      orderBy: [desc(dictTypes.updatedAt)],
      limit: pageSize,
      offset
    });
    
    // 获取总数
    const countResult = await db
      .select({ count: count() })
      .from(dictTypes)
      .where(whereClause || undefined);
    
    const total = Number(countResult[0].count) || 0;
    
    return {
      list: data,
      pagination: {
        total,
        page,
        pageSize
      }
    };
  }
  
  /**
   * 获取字典类型详情
   * @param id 字典类型ID
   */
  static async getById(id: string) {
    const db = getDb();
    const type = await db.query.dictTypes.findFirst({
      where: eq(dictTypes.id, id)
    });
    
    if (!type) {
      throw new HTTPException(404, { message: '字典类型不存在' });
    }
    
    return type;
  }
  
  /**
   * 根据字典类型代码获取字典类型
   * @param dictType 字典类型代码
   */
  static async getByType(dictType: string) {
    const db = getDb();
    const type = await db.query.dictTypes.findFirst({
      where: eq(dictTypes.dictType, dictType)
    });
    
    if (!type) {
      throw new HTTPException(404, { message: '字典类型不存在' });
    }
    
    return type;
  }
  
  /**
   * 创建字典类型
   * @param data 字典类型数据
   */
  static async create(data: {
    dictName: string;
    dictType: string;
    status?: string;
    remark?: string;
  }) {
    const db = getDb();
    
    // 检查字典类型是否已存在
    const exists = await db.query.dictTypes.findFirst({
      where: eq(dictTypes.dictType, data.dictType)
    });
    
    if (exists) {
      throw new HTTPException(409, { message: `字典类型 ${data.dictType} 已存在` });
    }
    
    const result = await db.insert(dictTypes).values({
      dictName: data.dictName,
      dictType: data.dictType,
      status: data.status || 'normal',
      remark: data.remark
    }).returning();
    
    return result[0];
  }
  
  /**
   * 更新字典类型
   * @param id 字典类型ID
   * @param data 更新数据
   */
  static async update(id: string, data: {
    dictName?: string;
    dictType?: string;
    status?: string;
    remark?: string;
  }) {
    const db = getDb();
    
    // 检查是否存在
    await this.getById(id);
    
    // 如果修改了字典类型，检查是否与其他记录冲突
    if (data.dictType) {
      const exists = await db.query.dictTypes.findFirst({
        where: and(
          eq(dictTypes.dictType, data.dictType),
          sql`${dictTypes.id} != ${id}`
        )
      });
      
      if (exists) {
        throw new HTTPException(409, { message: `字典类型 ${data.dictType} 已存在` });
      }
    }
    
    const result = await db.update(dictTypes)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(dictTypes.id, id))
      .returning();
    
    return result[0];
  }
  
  /**
   * 删除字典类型
   * @param id 字典类型ID
   */
  static async delete(id: string) {
    const db = getDb();
    
    // 检查是否存在
    await this.getById(id);
    
    // 删除字典类型及其关联的字典数据(通过外键级联删除)
    await db.delete(dictTypes).where(eq(dictTypes.id, id));
    
    return { success: true };
  }
  
  /**
   * 导出字典类型数据
   */
  static async exportData(params?: {
    dictName?: string;
    dictType?: string;
    status?: string;
  }) {
    const db = getDb();
    
    // 构建查询条件
    let whereConditions = [];
    if (params?.dictName) {
      whereConditions.push(like(dictTypes.dictName, `%${params.dictName}%`));
    }
    if (params?.dictType) {
      whereConditions.push(like(dictTypes.dictType, `%${params.dictType}%`));
    }
    if (params?.status) {
      whereConditions.push(eq(dictTypes.status, params.status));
    }
    
    const whereClause = whereConditions.length > 0
      ? and(...whereConditions)
      : undefined;
    
    // 查询数据
    const data = await db.query.dictTypes.findMany({
      where: whereClause,
      orderBy: [asc(dictTypes.dictType)],
    });
    
    return data;
  }
}

/**
 * 数据字典数据服务
 */
export class DictDataService {
  /**
   * 获取字典数据列表
   * @param params 查询参数
   */
  static async getList(params: {
    dictTypeId: string;
    dictLabel?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const db = getDb();
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const offset = (page - 1) * pageSize;
    
    // 构建查询条件
    let whereConditions = [eq(dictData.dictTypeId, params.dictTypeId)];
    if (params?.dictLabel) {
      whereConditions.push(like(dictData.dictLabel, `%${params.dictLabel}%`));
    }
    if (params?.status) {
      whereConditions.push(eq(dictData.status, params.status));
    }
    
    const whereClause = and(...whereConditions);
    
    // 查询数据
    const data = await db.query.dictData.findMany({
      where: whereClause,
      orderBy: [asc(dictData.dictSort), asc(dictData.createdAt)],
      limit: pageSize,
      offset,
      with: {
        dictType: true
      }
    });
    
    // 获取总数
    const countResult = await db
      .select({ count: count() })
      .from(dictData)
      .where(whereClause);
    
    const total = Number(countResult[0].count) || 0;
    
    return {
      list: data,
      pagination: {
        total,
        page,
        pageSize
      }
    };
  }
  
  /**
   * 根据字典类型代码获取字典数据
   * @param dictType 字典类型代码
   */
  static async getDataByType(dictType: string) {
    const db = getDb();
    
    // 先查询字典类型
    const type = await db.query.dictTypes.findFirst({
      where: eq(dictTypes.dictType, dictType)
    });
    
    if (!type) {
      throw new HTTPException(404, { message: `字典类型 ${dictType} 不存在` });
    }
    
    // 查询字典数据
    const data = await db.query.dictData.findMany({
      where: and(
        eq(dictData.dictTypeId, type.id),
        eq(dictData.status, 'normal')
      ),
      orderBy: [asc(dictData.dictSort), asc(dictData.createdAt)]
    });
    
    return data;
  }
  
  /**
   * 获取字典数据详情
   * @param id 字典数据ID
   */
  static async getById(id: string) {
    const db = getDb();
    const data = await db.query.dictData.findFirst({
      where: eq(dictData.id, id),
      with: {
        dictType: true
      }
    });
    
    if (!data) {
      throw new HTTPException(404, { message: '字典数据不存在' });
    }
    
    return data;
  }
  
  /**
   * 创建字典数据
   * @param data 字典数据
   */
  static async create(data: {
    dictTypeId: string;
    dictLabel: string;
    dictValue: string;
    dictSort?: number;
    cssClass?: string;
    listClass?: string;
    isDefault?: boolean;
    status?: string;
    remark?: string;
  }) {
    const db = getDb();
    
    // 检查字典类型是否存在
    const type = await db.query.dictTypes.findFirst({
      where: eq(dictTypes.id, data.dictTypeId)
    });
    
    if (!type) {
      throw new HTTPException(404, { message: '字典类型不存在' });
    }
    
    // 检查是否已存在相同的字典值
    const exists = await db.query.dictData.findFirst({
      where: and(
        eq(dictData.dictTypeId, data.dictTypeId),
        eq(dictData.dictValue, data.dictValue)
      )
    });
    
    if (exists) {
      throw new HTTPException(409, { message: `字典值 ${data.dictValue} 已存在于该字典类型中` });
    }
    
    const result = await db.insert(dictData).values({
      dictTypeId: data.dictTypeId,
      dictLabel: data.dictLabel,
      dictValue: data.dictValue,
      dictSort: data.dictSort || 0,
      cssClass: data.cssClass,
      listClass: data.listClass,
      isDefault: data.isDefault || false,
      status: data.status || 'normal',
      remark: data.remark
    }).returning();
    
    return result[0];
  }
  
  /**
   * 更新字典数据
   * @param id 字典数据ID
   * @param data 更新数据
   */
  static async update(id: string, data: {
    dictLabel?: string;
    dictValue?: string;
    dictSort?: number;
    cssClass?: string;
    listClass?: string;
    isDefault?: boolean;
    status?: string;
    remark?: string;
  }) {
    const db = getDb();
    
    // 检查是否存在
    const item = await this.getById(id);
    
    // 如果修改了字典值，检查是否与其他记录冲突
    if (data.dictValue) {
      const exists = await db.query.dictData.findFirst({
        where: and(
          eq(dictData.dictTypeId, item.dictTypeId),
          eq(dictData.dictValue, data.dictValue),
          sql`${dictData.id} != ${id}`
        )
      });
      
      if (exists) {
        throw new HTTPException(409, { message: `字典值 ${data.dictValue} 已存在于该字典类型中` });
      }
    }
    
    const result = await db.update(dictData)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(dictData.id, id))
      .returning();
    
    return result[0];
  }
  
  /**
   * 删除字典数据
   * @param id 字典数据ID
   */
  static async delete(id: string) {
    const db = getDb();
    
    // 检查是否存在
    await this.getById(id);
    
    await db.delete(dictData).where(eq(dictData.id, id));
    
    return { success: true };
  }
}

/**
 * 初始化系统默认的字典数据
 */
export async function initSystemDictionaries() {
  // 广告类型字典
  await initDictionary({
    dictType: 'sys_ad_type',
    dictName: '广告类型',
    items: [
      { dictLabel: '弹窗图片', dictValue: 'popup_image', dictSort: 10 },
      { dictLabel: '弹窗视频', dictValue: 'popup_video', dictSort: 20 },
      { dictLabel: '横幅多图', dictValue: 'banner_multiple_image', dictSort: 30 },
      { dictLabel: '信息流多图', dictValue: 'strip_multiple_image', dictSort: 40 },
    ]
  });
  
  // 国家/地区代码字典
  await initDictionary({
    dictType: 'sys_country_code',
    dictName: '国家/地区代码',
    items: [
      { dictLabel: '中国', dictValue: 'CN', dictSort: 10 },
      { dictLabel: '美国', dictValue: 'US', dictSort: 20 },
      { dictLabel: '日本', dictValue: 'JP', dictSort: 30 },
      { dictLabel: '韩国', dictValue: 'KR', dictSort: 40 },
      { dictLabel: '英国', dictValue: 'GB', dictSort: 50 },
      { dictLabel: '德国', dictValue: 'DE', dictSort: 60 },
      { dictLabel: '法国', dictValue: 'FR', dictSort: 70 },
      { dictLabel: '意大利', dictValue: 'IT', dictSort: 80 },
      { dictLabel: '加拿大', dictValue: 'CA', dictSort: 90 },
      { dictLabel: '澳大利亚', dictValue: 'AU', dictSort: 100 },
    ]
  });
  
  return { success: true, message: '系统字典初始化完成' };
}

/**
 * 初始化单个字典及其数据项
 */
async function initDictionary(config: {
  dictType: string;
  dictName: string;
  items: Array<{
    dictLabel: string;
    dictValue: string;
    dictSort?: number;
    isDefault?: boolean;
    status?: string;
    remark?: string;
  }>;
}) {
  const db = getDb();
  
  // 检查字典类型是否已存在
  let type = await db.query.dictTypes.findFirst({
    where: eq(dictTypes.dictType, config.dictType)
  });
  
  // 如果不存在则创建
  if (!type) {
    const result = await db.insert(dictTypes).values({
      dictName: config.dictName,
      dictType: config.dictType,
      status: 'normal'
    }).returning();
    
    type = result[0];
  }
  
  // 添加字典数据项
  for (const item of config.items) {
    // 检查是否已存在
    const exists = await db.query.dictData.findFirst({
      where: and(
        eq(dictData.dictTypeId, type.id),
        eq(dictData.dictValue, item.dictValue)
      )
    });
    
    // 不存在则创建
    if (!exists) {
      await db.insert(dictData).values({
        dictTypeId: type.id,
        dictLabel: item.dictLabel,
        dictValue: item.dictValue,
        dictSort: item.dictSort || 0,
        isDefault: item.isDefault || false,
        status: item.status || 'normal',
        remark: item.remark
      });
    }
  }
} 