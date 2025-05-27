import { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { 
  createAdSchema, 
  updateAdSchema, 
  batchUpdateStatusSchema,
  getAdsQuerySchema,
  getAdStatsQuerySchema 
} from '../validations/advertisement.validation';
import { advertisementService } from '../services/advertisement.service';
import { generateR2PresignedUrl, getObjectSignedUrl } from '../utils/r2';

// 获取广告列表
export const getAdvertisementsHandler = async (c: Context) => {
  try {
    const query = await getAdsQuerySchema.parseAsync(c.req.query());
    const result = await advertisementService.getAdvertisements(query, c);
    
    return c.json({
      code: 200,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: any) {
    return c.json({
      code: 500,
      message: `获取广告列表失败: ${error.message}`,
      data: null,
    }, 500);
  }
};

// 获取单个广告详情
export const getAdvertisementByIdHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const ad = await advertisementService.getAdvertisementById(id, c);
    
    return c.json({
      code: 200,
      data: ad,
    });
  } catch (error: any) {
    return c.json({
      code: 404,
      message: error.message,
      data: null,
    }, 404);
  }
};

// 创建广告
export const createAdvertisementHandler = async (c: Context) => {
  try {
    const validator = zValidator('json', createAdSchema);
    await validator(c, async () => {});
    
    const body = await c.req.json();
    
    // 处理不同广告类型的特殊逻辑
    switch (body.adType) {
      case 'popup_image':
      case 'popup_video':
        if (!body.materialConfig) {
          return c.json({
            code: 400,
            message: '弹窗广告必须提供素材配置',
            data: null,
          }, 400);
        }
        break;
      case 'banner_multiple_image':
      case 'strip_multiple_image':
        if (!body.displayConfig || !body.displayConfig.length) {
          return c.json({
            code: 400,
            message: '多图广告必须提供展示配置',
            data: null,
          }, 400);
        }
        break;
    }
    
    const newAd = await advertisementService.createAdvertisement(body, c);
    
    return c.json({
      code: 201,
      data: newAd,
    }, 201);
  } catch (error: any) {
    return c.json({
      code: 500,
      message: `创建广告失败: ${error.message}`,
      data: null,
    }, 500);
  }
};

// 更新广告
export const updateAdvertisementHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    
    const validator = zValidator('json', updateAdSchema);
    await validator(c, async () => {});
    
    const body = await c.req.json();
    const updatedAd = await advertisementService.updateAdvertisement(id, body, c);
    
    return c.json({
      code: 200,
      data: updatedAd,
    });
  } catch (error: any) {
    if (error.message === '广告不存在') {
      return c.json({
        code: 404,
        message: error.message,
        data: null,
      }, 404);
    }
    return c.json({
      code: 500,
      message: `更新广告失败: ${error.message}`,
      data: null,
    }, 500);
  }
};

// 删除广告
export const deleteAdvertisementHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    await advertisementService.deleteAdvertisement(id, c);
    
    return c.json({
      code: 200,
      message: '广告已删除',
      data: null,
    });
  } catch (error: any) {
    if (error.message === '广告不存在') {
      return c.json({
        code: 404,
        message: error.message,
        data: null,
      }, 404);
    }
    return c.json({
      code: 500,
      message: `删除广告失败: ${error.message}`,
      data: null,
    }, 500);
  }
};

// 获取广告统计数据
export const getAdStatsHandler = async (c: Context) => {
  try {
    const id = c.req.param('id');
    const query = await getAdStatsQuerySchema.parseAsync(c.req.query());
    
    const statsData = await advertisementService.getAdStats(id, query, c);
    
    return c.json({
      code: 200,
      data: statsData,
    });
  } catch (error: any) {
    if (error.message === '广告不存在') {
      return c.json({
        code: 404,
        message: error.message,
        data: null,
      }, 404);
    }
    return c.json({
      code: 500,
      message: `获取广告统计数据失败: ${error.message}`,
      data: null,
    }, 500);
  }
};

// 批量更新广告状态
export const batchUpdateAdsStatusHandler = async (c: Context) => {
  try {
    const validator = zValidator('json', batchUpdateStatusSchema);
    await validator(c, async () => {});
    
    const { adIds, isDisplayed } = await c.req.json();
    const updatedIds = await advertisementService.batchUpdateAdsStatus(adIds, isDisplayed, c);
    
    return c.json({
      code: 200,
      message: `已更新${updatedIds.length}个广告的状态`,
      data: { updatedIds },
    });
  } catch (error: any) {
    return c.json({
      code: 500,
      message: `批量更新广告状态失败: ${error.message}`,
      data: null,
    }, 500);
  }
};

// 获取素材上传URL
export const getMaterialUploadUrlHandler = async (c: Context) => {
  try {
    const { fileName, contentType } = await c.req.json();
    
    if (!fileName || !contentType) {
      return c.json({
        code: 400,
        message: '文件名和内容类型不能为空',
        data: null,
      }, 400);
    }
    
    // 生成文件路径
    const filePath = `advertisements/${Date.now()}-${fileName}`;
    
    // 获取上传签名URL
    const presignedUrl = await generateR2PresignedUrl(c.env.STORAGE, filePath, contentType, 'PUT');
    
    // 获取文件访问URL
    const fileUrl = await getObjectSignedUrl(c.env.STORAGE, filePath);
    
    return c.json({
      code: 200,
      data: {
        uploadUrl: presignedUrl,
        fileUrl: fileUrl,
        filePath: filePath,
      },
    });
  } catch (error:any) {
    return c.json({
      code: 500,
      message: `获取上传URL失败: ${error.message}`,
      data: null,
    }, 500);
  }
}; 