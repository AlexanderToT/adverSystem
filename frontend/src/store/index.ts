import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import roleReducer from './slices/roleSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    roles: roleReducer,
  },
  // 非生产环境开启Redux DevTools
  devTools: process.env.NODE_ENV !== 'production',
});

// 定义RootState和AppDispatch类型，用于TypeScript类型推断
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;