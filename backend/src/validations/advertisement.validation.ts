import { z } from 'zod';

// 通用广告字段验证
const commonAdFieldsSchema = z.object({
  name: z.string().min(1, '广告名称不能为空').max(255),
  adType: z.enum(['popup_image', 'popup_video', 'banner_multiple_image', 'strip_multiple_image']),
  countryCodes: z.array(z.string().max(10)).optional(),
  isDisplayed: z.boolean().optional(),
});

// 弹窗图片广告验证
const popupImageSchema = commonAdFieldsSchema.extend({
  adType: z.literal('popup_image'),
  targetUrl: z.string().url('请输入有效的URL'),
  materialConfig: z.object({
    url: z.string().url('请输入有效的URL'),
    type: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    mimeType: z.string().optional(),
  }),
});

// 弹窗视频广告验证
const popupVideoSchema = commonAdFieldsSchema.extend({
  adType: z.literal('popup_video'),
  targetUrl: z.string().url('请输入有效的URL').optional(),
  materialConfig: z.object({
    url: z.string().url('请输入有效的URL'),
    type: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    mimeType: z.string().optional(),
    duration: z.number().optional(),
  }),
});

// Banner多图广告验证
const bannerMultipleImageSchema = commonAdFieldsSchema.extend({
  adType: z.literal('banner_multiple_image'),
  displayConfig: z.array(z.object({
    materialUrl: z.string().url('请输入有效的URL'),
    targetUrl: z.string().url('请输入有效的URL'),
    order: z.number().optional(),
  })).min(1, '至少需要一个Banner图片'),
});

// 信息流多图广告验证
const stripMultipleImageSchema = commonAdFieldsSchema.extend({
  adType: z.literal('strip_multiple_image'),
  displayConfig: z.array(z.object({
    materialUrl: z.string().url('请输入有效的URL'),
    targetUrl: z.string().url('请输入有效的URL'),
    order: z.number().optional(),
  })).min(1, '至少需要一个信息流图片'),
});

// 创建广告验证，根据adType动态校验不同字段
export const createAdSchema = z.discriminatedUnion('adType', [
  popupImageSchema,
  popupVideoSchema,
  bannerMultipleImageSchema,
  stripMultipleImageSchema,
]);

// 更新广告验证，所有字段可选
export const updateAdSchema = z.object({
  name: z.string().min(1, '广告名称不能为空').max(255).optional(),
  adType: z.enum(['popup_image', 'popup_video', 'banner_multiple_image', 'strip_multiple_image']).optional(),
  targetUrl: z.string().url('请输入有效的URL').optional(),
  materialConfig: z.object({
    url: z.string().url('请输入有效的URL'),
    type: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    mimeType: z.string().optional(),
    duration: z.number().optional(),
  }).optional(),
  displayConfig: z.array(z.object({
    materialUrl: z.string().url('请输入有效的URL'),
    targetUrl: z.string().url('请输入有效的URL'),
    order: z.number().optional(),
  })).optional(),
  countryCodes: z.array(z.string().max(10)).optional(),
  isDisplayed: z.boolean().optional(),
});

// 批量更新广告状态验证
export const batchUpdateStatusSchema = z.object({
  adIds: z.array(z.string().uuid()),
  isDisplayed: z.boolean(),
});

// 获取广告列表参数验证
export const getAdsQuerySchema = z.object({
  search: z.string().optional(),
  adType: z.string().optional(),
  isDisplayed: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// 获取广告统计数据参数验证
export const getAdStatsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
}); 