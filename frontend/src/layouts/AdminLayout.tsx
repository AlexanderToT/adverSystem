import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, theme, Button, type MenuProps } from 'antd';
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  PictureOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import styles from './AdminLayout.module.less';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * 管理后台布局组件
 */
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector(state => state.auth);
  const { token } = theme.useToken();

  // 当路径改变时更新面包屑
  useEffect(() => {
    const path = location.pathname;
    const paths = path.split('/').filter(p => p);
    
    // 路径映射为中文
    const pathNameMap: Record<string, string> = {
      'account': '账号管理',
      'list': '列表',
      'advertisements': '广告管理',
      'new': '新增',
      'edit': '编辑',
      'application': '应用管理',
    };
    
    const chinesePaths = paths.map(path => {
      // 检查是否是ID形式的路径段（针对详情页、编辑页等）
      if (path.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        return '详情';
      }
      return pathNameMap[path] || path;
    });
    setBreadcrumbs(chinesePaths);
  }, [location]);

  // 菜单项配置
  const menuItems: MenuProps['items'] = [
    {
      key: 'account',
      icon: <UserOutlined />,
      label: '账号管理',
      children: [
        {
          key: 'account/list',
          label: '账号列表',
        },
      ],
    },
    {
      key: 'application',
      icon: <AppstoreOutlined />,
      label: '应用管理',
      children: [
        {
          key: 'application/list',
          label: '应用列表',
        },
      ],
    },
    {
      key: 'advertisements',
      icon: <PictureOutlined />,
      label: '广告管理',
      children: [
        {
          key: 'advertisements',
          label: '广告列表',
        },
        {
          key: 'advertisements/new',
          label: '新建广告',
        },
      ],
    },
  ];
  
  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(`/${key}`);
  };

  // 处理登出
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout className={styles.adminLayout}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        className={styles.sider}
      >
        <div className={styles.logo}>
          {!collapsed && <span>蓝鲸后台系统</span>}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname.substring(1)]}
          defaultOpenKeys={['account', 'advertisements', 'application']}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className={styles.header} style={{ background: token.colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={styles.trigger}
          />
          <div className={styles.headerRight}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className={styles.userInfo}>
                <Avatar icon={<UserOutlined />} size="small" className={styles.avatar} />
                <span className={styles.username}>{user?.displayName || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className={styles.content}>
          <Breadcrumb className={styles.breadcrumb} items={breadcrumbs.map(item => ({ title: item }))} />
          <div className={styles.contentWrapper}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 