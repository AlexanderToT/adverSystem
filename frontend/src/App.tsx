import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import { theme } from '@/config/theme';
import AppRoutes from '@/routes';

/**
 * 应用入口组件
 */
const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App; 