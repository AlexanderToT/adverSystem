import { Context } from 'hono';
import { DictTypeService, DictDataService, initSystemDictionaries } from '../services/dict.service';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

// 字典类型验证模式
const dictTypeSchema = z.object({
  dictName: z.string().min(1, '字典名称不能为空').max(100, '字典名称最长100个字符'),
  dictType: z.string().min(1, '字典类型不能为空').max(100, '字典类型最长100个字符'),
  status: z.enum(['normal', 'disabled']).optional(),
  remark: z.string().max(500, '备注最长500个字符').optional(),
});

const dictTypeUpdateSchema = dictTypeSchema.partial();

// 字典数据验证模式
const dictDataSchema = z.object({
  dictTypeId: z.string().uuid('字典类型ID必须是有效的UUID'),
  dictLabel: z.string().min(1, '字典标签不能为空').max(100, '字典标签最长100个字符'),
  dictValue: z.string().min(1, '字典键值不能为空').max(100, '字典键值最长100个字符'),
  dictSort: z.number().optional(),
  cssClass: z.string().max(100, 'CSS类名最长100个字符').optional(),
  listClass: z.string().max(100, '列表类名最长100个字符').optional(),
  isDefault: z.boolean().optional(),
  status: z.enum(['normal', 'disabled']).optional(),
  remark: z.string().max(500, '备注最长500个字符').optional(),
});

const dictDataUpdateSchema = dictDataSchema.omit({ dictTypeId: true }).partial();

/**
 * 获取字典类型列表
 */
export const getTypesListHandler = async (c: Context) => {
  try {
    const params = c.req.query();
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = params.pageSize ? parseInt(params.pageSize) : 10;
    
    const result = await DictTypeService.getList({
      dictName: params.dictName,
      dictType: params.dictType,
      status: params.status,
      page,
      pageSize,
    });
    
    return c.json({
      code: 200,
      success: true,
      data: result.list,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('获取字典类型列表失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '获取字典类型列表失败' });
  }
};

/**
 * 获取字典类型详情
 */
export const getTypeDetailHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const dictType = await DictTypeService.getById(id);
    
    return c.json({
      code: 200,
      success: true,
      data: dictType,
    });
  } catch (error) {
    console.error('获取字典类型详情失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '获取字典类型详情失败' });
  }
};

/**
 * 创建字典类型
 */
export const createTypeHandler = async (c: Context) => {
  try {
    const validator = zValidator('json', dictTypeSchema);
    await validator(c, async () => {});
    
    const data = await c.req.json();
    const dictType = await DictTypeService.create(data);
    
    return c.json({
      code: 201,
      success: true,
      message: '创建字典类型成功',
      data: dictType,
    }, 201);
  } catch (error) {
    console.error('创建字典类型失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '创建字典类型失败' });
  }
};

/**
 * 更新字典类型
 */
export const updateTypeHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    
    const validator = zValidator('json', dictTypeUpdateSchema);
    await validator(c, async () => {});
    
    const data = await c.req.json();
    const dictType = await DictTypeService.update(id, data);
    
    return c.json({
      code: 200,
      success: true,
      message: '更新字典类型成功',
      data: dictType,
    });
  } catch (error) {
    console.error('更新字典类型失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '更新字典类型失败' });
  }
};

/**
 * 删除字典类型
 */
export const deleteTypeHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    await DictTypeService.delete(id);
    
    return c.json({
      code: 200,
      success: true,
      message: '删除字典类型成功',
    });
  } catch (error) {
    console.error('删除字典类型失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '删除字典类型失败' });
  }
};

/**
 * 导出字典类型
 */
export const exportTypesHandler = async (c: Context) => {
  try {
    const params = c.req.query();
    const data = await DictTypeService.exportData({
      dictName: params.dictName,
      dictType: params.dictType,
      status: params.status,
    });
    
    return c.json({
      code: 200,
      success: true,
      data,
    });
  } catch (error) {
    console.error('导出字典类型失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '导出字典类型失败' });
  }
};

/**
 * 获取字典数据列表
 */
export const getDataListHandler = async (c: Context) => {
  try {
    const params = c.req.query();
    const page = params.page ? parseInt(params.page) : 1;
    const pageSize = params.pageSize ? parseInt(params.pageSize) : 10;
    
    if (!params.dictTypeId) {
      throw new HTTPException(400, { message: '字典类型ID不能为空' });
    }
    
    const result = await DictDataService.getList({
      dictTypeId: params.dictTypeId,
      dictLabel: params.dictLabel,
      status: params.status,
      page,
      pageSize,
    });
    
    return c.json({
      code: 200,
      success: true,
      data: result.list,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('获取字典数据列表失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '获取字典数据列表失败' });
  }
};

/**
 * 根据字典类型获取字典数据
 */
export const getDataByTypeHandler = async (c: Context) => {
  try {
    const dictType = c.req.param('type');
    const data = await DictDataService.getDataByType(dictType);
    
    return c.json({
      code: 200,
      success: true,
      data,
    });
  } catch (error) {
    console.error('获取字典数据失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '获取字典数据失败' });
  }
};

/**
 * 获取字典数据详情
 */
export const getDataDetailHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const data = await DictDataService.getById(id);
    
    return c.json({
      code: 200,
      success: true,
      data,
    });
  } catch (error) {
    console.error('获取字典数据详情失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '获取字典数据详情失败' });
  }
};

/**
 * 创建字典数据
 */
export const createDataHandler = async (c: Context) => {
  try {
    const validator = zValidator('json', dictDataSchema);
    await validator(c, async () => {});
    
    const data = await c.req.json();
    const dictData = await DictDataService.create(data);
    
    return c.json({
      code: 201,
      success: true,
      message: '创建字典数据成功',
      data: dictData,
    }, 201);
  } catch (error) {
    console.error('创建字典数据失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '创建字典数据失败' });
  }
};

/**
 * 更新字典数据
 */
export const updateDataHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    
    const validator = zValidator('json', dictDataUpdateSchema);
    await validator(c, async () => {});
    
    const data = await c.req.json();
    const dictData = await DictDataService.update(id, data);
    
    return c.json({
      code: 200,
      success: true,
      message: '更新字典数据成功',
      data: dictData,
    });
  } catch (error) {
    console.error('更新字典数据失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '更新字典数据失败' });
  }
};

/**
 * 删除字典数据
 */
export const deleteDataHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    await DictDataService.delete(id);
    
    return c.json({
      code: 200,
      success: true,
      message: '删除字典数据成功',
    });
  } catch (error) {
    console.error('删除字典数据失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '删除字典数据失败' });
  }
};

/**
 * 初始化系统字典
 */
export const initSystemDictHandler = async (c: Context) => {
  try {
    const result = await initSystemDictionaries();
    
    return c.json({
      code: 200,
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('初始化系统字典失败:', error);
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: '初始化系统字典失败' });
  }
};

// 字典类型验证中间件
export const validateDictTypeCreate = zValidator('json', dictTypeSchema);
export const validateDictTypeUpdate = zValidator('json', dictTypeUpdateSchema);

// 字典数据验证中间件
export const validateDictDataCreate = zValidator('json', dictDataSchema);
export const validateDictDataUpdate = zValidator('json', dictDataUpdateSchema); 