import { Hono } from 'hono';
import {
  getAdvertisementsHandler,
  getAdvertisementByIdHandler,
  createAdvertisementHandler,
  updateAdvertisementHandler,
  deleteAdvertisementHandler,
  getAdStatsHandler,
  batchUpdateAdsStatusHandler,
  getMaterialUploadUrlHandler
} from '../controllers/advertisement.controller';
import { auth } from '../middleware/auth-unified.middleware';

// 创建广告路由
const advertisementRouter = new Hono();

// 为所有路由添加权限验证
advertisementRouter.use('*', auth());

// 广告CRUD操作
advertisementRouter.get('/', getAdvertisementsHandler);
advertisementRouter.get('/:id', getAdvertisementByIdHandler);
advertisementRouter.post('/', createAdvertisementHandler);
advertisementRouter.put('/:id', updateAdvertisementHandler);
advertisementRouter.delete('/:id', deleteAdvertisementHandler);

// 批量更新广告状态
advertisementRouter.post('/batch-status', batchUpdateAdsStatusHandler);

// 获取广告统计数据
advertisementRouter.get('/:id/stats', getAdStatsHandler);

// 获取素材上传URL
advertisementRouter.post('/materials/upload-url', getMaterialUploadUrlHandler);

export default advertisementRouter; 