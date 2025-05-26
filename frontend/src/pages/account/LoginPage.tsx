import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { login, clearError } from '@/store/slices/authSlice';
import AuthLayout from '@/layouts/AuthLayout';
import styles from './LoginPage.module.less';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useAppSelector(state => state.auth);
  const [messageApi, contextHolder] = message.useMessage();

  // 从location.state获取"from"属性，默认为主页
  const from = (location.state as LocationState)?.from?.pathname || '/account/list';

  useEffect(() => {
    // 如果已经登录，重定向到来源页面或默认页面
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    // 显示错误消息
    if (error) {
      messageApi.error(error);
      dispatch(clearError());
    }
  }, [error, messageApi, dispatch]);

  const onFinish = async (values: { username: string; password: string }) => {
    dispatch(login(values));
  };

  return (
    <AuthLayout>
      {contextHolder}
      <div className={styles.loginForm}>
        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              loading={loading}
              className={styles.loginButton}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage; 