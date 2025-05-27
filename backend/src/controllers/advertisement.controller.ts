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
    console.log('开始处理创建广告请求');
    
    // 解析请求体
    const body = await c.req.json();
    console.log('请求体内容:', JSON.stringify(body, null, 2));
    
    // 进行验证
    try {
      const validator = zValidator('json', createAdSchema);
      await validator(c, async () => {});
      console.log('验证通过');
    } catch (validationError: any) {
      console.error('验证失败:', validationError);
      return c.json({
        code: 400,
        message: `验证失败: ${validationError.message}`,
        data: null,
      }, 400);
    }
    
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
    
    console.log('开始调用服务创建广告');
    const newAd = await advertisementService.createAdvertisement(body, c);
    console.log('创建广告成功:', newAd);
    
    return c.json({
      code: 201,
      data: newAd,
    }, 201);
  } catch (error: any) {
    console.error('创建广告失败:', error);
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
    
    // 输出环境信息以便调试
    console.log('环境变量:', Object.keys(c.env));
    console.log('STORAGE是否存在:', !!c.env.STORAGE);
    
    if (!c.env.STORAGE) {
      return c.json({
        code: 500,
        message: 'R2存储未正确配置',
        data: null,
      }, 500);
    }

    // 检查R2 bucket对象
    console.log('R2 bucket类型:', typeof c.env.STORAGE);
    console.log('R2 bucket方法:', Object.getOwnPropertyNames(Object.getPrototypeOf(c.env.STORAGE)));
    
    // 生成文件路径
    const filePath = `advertisements/${Date.now()}-${fileName}`;
    
    // 获取上传签名URL
    // const presignedUrl = await generateR2PresignedUrl(c.env.STORAGE, filePath, contentType, 'PUT');
    
    // 临时解决方案：检查可用的API
    let presignedUrl = null;
    let fileUrl = null;
    
    try {
      if (typeof c.env.STORAGE.put === 'function') {
        // 临时返回直接上传URL (后端上传)
        const baseUrl = c.req.url.split('/materials/upload-url')[0];
        presignedUrl = `${baseUrl}/upload-direct`;
        fileUrl = `${baseUrl}/files/${filePath}`;
      } else {
        throw new Error('R2 bucket 没有可用的上传方法');
      }
    } catch (uploadError: any) {
      console.error('获取上传URL方法失败:', uploadError);
      return c.json({
        code: 500,
        message: `R2存储配置问题: ${uploadError.message}`,
        data: null,
      }, 500);
    }
    
    return c.json({
      code: 200,
      data: {
        uploadUrl: presignedUrl,
        fileUrl: fileUrl,
        filePath: filePath,
      },
    });
  } catch (error:any) {
    console.error('获取上传URL失败:', error);
    return c.json({
      code: 500,
      message: `获取上传URL失败: ${error.message}`,
      data: null,
    }, 500);
  }
};

// 直接上传素材的处理程序
export const uploadDirectHandler = async (c: Context) => {
  try {
    console.log('收到文件上传请求');
    const formData = await c.req.formData();
    const file = formData.get('file');
    const pathFromClient = formData.get('filePath') as string;
    const contentType = formData.get('contentType') as string;
    
    console.log('文件上传信息:', {
      hasFile: !!file,
      pathFromClient,
      contentType,
      fileType: file ? (typeof file === 'string' ? 'string' : (file as any).type || 'unknown') : 'none'
    });
    
    if (!file || !pathFromClient) {
      return c.json({
        code: 400,
        message: '文件和路径不能为空',
        data: null,
      }, 400);
    }
    
    if (!c.env.STORAGE || typeof c.env.STORAGE.put !== 'function') {
      console.log('R2存储配置问题:', {
        hasStorage: !!c.env.STORAGE,
        hasPutMethod: c.env.STORAGE && typeof c.env.STORAGE.put === 'function'
      });
      return c.json({
        code: 500,
        message: 'R2存储未正确配置',
        data: null,
      }, 500);
    }
    
    // 从文件中获取arrayBuffer
    let arrayBuffer: ArrayBuffer;
    let fileContentType = contentType;
    
    try {
      if (typeof file === 'string') {
        console.log('处理字符串文件内容');
        // 处理字符串
        arrayBuffer = new TextEncoder().encode(file).buffer;
        if (!fileContentType) {
          fileContentType = 'text/plain';
        }
      } else {
        console.log('处理Blob/File文件');
        // 处理Blob/File (FormData会提供这些类型)
        // 使用any类型断言解决TypeScript的instanceof检查问题
        const blobFile = file as any;
        arrayBuffer = await blobFile.arrayBuffer();
        
        if (!fileContentType && blobFile.type) {
          fileContentType = blobFile.type;
        } else if (!fileContentType) {
          fileContentType = 'application/octet-stream';
        }
      }
      
      // 上传到R2
      console.log('开始上传文件到R2:', {
        filePath: pathFromClient, 
        contentType: fileContentType,
        bufferSize: arrayBuffer.byteLength
      });
      
      await c.env.STORAGE.put(pathFromClient, arrayBuffer, {
        httpMetadata: {
          contentType: fileContentType,
        },
      });
      
      console.log('文件上传到R2成功');
    } catch (error: any) {
      console.error('文件处理或上传过程出错:', error);
      return c.json({
        code: 500,
        message: `文件处理或上传失败: ${error.message}`,
        data: null,
      }, 500);
    }
    
    // 构建访问URL (简化版 - 实际应该生成签名URL或公共URL)
    const fileUrl = `${c.req.url.replace(/\/upload-direct$/, '')}/files/${pathFromClient}`;
    
    return c.json({
      code: 200,
      data: {
        fileUrl: fileUrl,
        filePath: pathFromClient,
      },
    });
  } catch (error: any) {
    console.error('获取上传URL失败:', error);
    return c.json({
      code: 500,
      message: `获取上传URL失败: ${error.message}`,
      data: null,
    }, 500);
  }
};

// 获取已上传文件
export const getFileHandler = async (c: Context) => {
  try {
    const filePath = c.req.param('*');
    
    if (!filePath) {
      return c.json({
        code: 400,
        message: '文件路径不能为空',
        data: null,
      }, 400);
    }
    
    if (!c.env.STORAGE || typeof c.env.STORAGE.get !== 'function') {
      return c.json({
        code: 500,
        message: 'R2存储未正确配置',
        data: null,
      }, 500);
    }
    
    // 从R2获取文件
    const object = await c.env.STORAGE.get(filePath);
    
    if (!object) {
      return c.json({
        code: 404,
        message: '文件不存在',
        data: null,
      }, 404);
    }
    
    // 获取文件内容和元数据
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    
    const data = await object.arrayBuffer();
    
    return new Response(data, {
      headers,
    });
  } catch (error: any) {
    console.error('获取文件失败:', error);
    return c.json({
      code: 500,
      message: `获取文件失败: ${error.message}`,
      data: null,
    }, 500);
  }
}; 