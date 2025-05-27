import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import AdminLayout from '@/layouts/AdminLayout';

// 页面组件
import LoginPage from '@/pages/account/LoginPage';
import AccountListPage from '@/pages/account/AccountListPage';
import AdvertisementListPage from '@/pages/advertisement/AdvertisementListPage';
import AdvertisementFormPage from '@/pages/advertisement/AdvertisementFormPage';
import AdvertisementDetailsPage from '@/pages/advertisement/AdvertisementDetailsPage';

/**
 * 应用路由配置
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* 使用二级路由统一所有需要认证的页面 */}
      <Route 
        path="/" 
        element={
          <AuthGuard>
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </AuthGuard>
        }
      >
        {/* 默认路由 */}
        <Route index element={<Navigate to="/account/list" replace />} />
        
        {/* 账号管理路由 */}
        <Route path="account/list" element={<AccountListPage />} />
        
        {/* 广告管理路由 */}
        <Route path="advertisements/list" element={<AdvertisementListPage />} />
        <Route path="advertisements/new" element={<AdvertisementFormPage />} />
        <Route path="advertisements/:id" element={<AdvertisementDetailsPage />} />
        <Route path="advertisements/:id/edit" element={<AdvertisementFormPage />} />
      </Route>
      
      {/* 通配符路由 */}
      <Route path="*" element={<Navigate to="/account/list" replace />} />
    </Routes>
  );
};

export default AppRoutes;
