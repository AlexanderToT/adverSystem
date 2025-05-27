import React from 'react';
import { Layout } from 'antd';
import Spline from '@splinetool/react-spline';
import styles from './AuthLayout.module.less';

const { Content } = Layout;

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * 认证页面布局组件
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Layout className={styles.authLayout}>
      <div className={styles.splineContainer} style={{ transform: 'translateX(-20%)' }}>
        <Spline scene="https://prod.spline.design/JnfeYb9RiSPtDRxB/scene.splinecode" />
      </div>
      <Content className={styles.content}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>蓝鲸时代后台管理系统</h1>
          </div>
          <div className={styles.formContainer}>
            {children}
          </div>
          <div className={styles.footer}>
            <p>Copyright © {new Date().getFullYear()} 蓝鲸时代</p>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;