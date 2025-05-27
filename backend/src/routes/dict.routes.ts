import { Hono } from 'hono';
import {
  validateDictTypeCreate,
  validateDictTypeUpdate,
  validateDictDataCreate,
  validateDictDataUpdate,
  getTypesListHandler,
  getTypeDetailHandler,
  createTypeHandler,
  updateTypeHandler,
  deleteTypeHandler,
  exportTypesHandler,
  getDataListHandler,
  getDataByTypeHandler,
  getDataDetailHandler,
  createDataHandler,
  updateDataHandler,
  deleteDataHandler,
  initSystemDictHandler
} from '../controllers/dict.controller';
import { auth } from '../middleware/auth-unified.middleware';

// 创建数据字典路由
const dictRouter = new Hono();

// 创建公共路由（如有必要）
const publicRouter = new Hono();

// 添加初始化系统字典的公共路由（可选，取决于业务需求）
publicRouter.post('/init', initSystemDictHandler);

// 添加公共路由到主路由
dictRouter.route('/', publicRouter);

// 为需要认证的路由添加身份验证中间件
dictRouter.use('*', auth());

// 字典类型路由
dictRouter.get('/types', getTypesListHandler);
dictRouter.get('/types/:id', getTypeDetailHandler);
dictRouter.post('/types', validateDictTypeCreate, createTypeHandler);
dictRouter.put('/types/:id', validateDictTypeUpdate, updateTypeHandler);
dictRouter.delete('/types/:id', deleteTypeHandler);
dictRouter.get('/types/export', exportTypesHandler);

// 字典数据路由
dictRouter.get('/data', getDataListHandler);
dictRouter.get('/data/type/:type', getDataByTypeHandler);
dictRouter.get('/data/:id', getDataDetailHandler);
dictRouter.post('/data', validateDictDataCreate, createDataHandler);
dictRouter.put('/data/:id', validateDictDataUpdate, updateDataHandler);
dictRouter.delete('/data/:id', deleteDataHandler);

export default dictRouter; 