import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';
import advertisementReducer from './slices/advertisementSlice';
import dictReducer from './slices/dictSlice';

// 配置和创建全局Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    roles: roleReducer,
    advertisement: advertisementReducer,
    dict: dictReducer,
  },
  // 非生产环境开启Redux DevTools
  devTools: process.env.NODE_ENV !== 'production',
});

// 从store本身推断出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 