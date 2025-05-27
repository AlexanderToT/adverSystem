import { Hono } from 'hono';
import {
  getAdvertisementsHandler,
  getAdvertisementByIdHandler,
  createAdvertisementHandler,
  updateAdvertisementHandler,
  deleteAdvertisementHandler,
  getAdStatsHandler,
  batchUpdateAdsStatusHandler,
  getMaterialUploadUrlHandler,
  uploadDirectHandler,
  getFileHandler
} from '../controllers/advertisement.controller';
import { auth } from '../middleware/auth-unified.middleware';

// 创建不需要认证的公共路由
const publicRouter = new Hono();
// 文件上传和获取（这些端点不需要认证）
publicRouter.post('/upload-direct', uploadDirectHandler);
publicRouter.get('/files/*', getFileHandler);

// 创建需要认证的广告路由
const advertisementRouter = new Hono();

// 添加公共路由
advertisementRouter.route('/', publicRouter);

// 为广告相关路由添加身份验证中间件
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