import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';

// 页面组件
import LoginPage from '@/pages/account/LoginPage';
import AccountListPage from '@/pages/account/AccountListPage';

/**
 * 应用路由配置
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* 需要认证的路由 */}
      <Route path="/account/list" element={<AuthGuard><AccountListPage /></AuthGuard>} />
      
      {/* 默认重定向到账号列表 */}
      <Route path="/" element={<Navigate to="/account/list" replace />} />
      <Route path="*" element={<Navigate to="/account/list" replace />} />
    </Routes>
  );
};

export default AppRoutes;
