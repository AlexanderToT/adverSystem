import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/reduxHooks';
import { Spin } from 'antd';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 认证守卫组件，用于保护需要登录才能访问的路由
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // 重定向到登录页，并保存当前位置，以便登录后重定向回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard; 