import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { fetchUsers, addUser, editUser, removeUser, modifyPassword } from '@/store/slices/userSlice';
import { fetchRoles } from '@/store/slices/roleSlice';
import AdminLayout from '@/layouts/AdminLayout';
import { User, CreateUserRequest, UpdateUserRequest } from '@/types';
import styles from './AccountListPage.module.less';

const { Option } = Select;

const AccountListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, pagination, loading, error } = useAppSelector(state => state.users);
  const { roles } = useAppSelector(state => state.roles);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // 获取用户列表和角色列表
  useEffect(() => {
    dispatch(fetchUsers({}));
    dispatch(fetchRoles());
  }, [dispatch]);

  // 显示错误消息
  useEffect(() => {
    if (error) {
      messageApi.error(error);
    }
  }, [error, messageApi]);

  // 处理表格分页
  const handleTableChange = (pagination: any) => {
    dispatch(fetchUsers({ 
      page: pagination.current, 
      limit: pagination.pageSize 
    }));
  };

  // 打开创建用户模态框
  const showCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 打开编辑用户模态框
  const showEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      loginType: user.loginType,
      isActive: user.isActive,
      roleIds: user.roles && user.roles.length > 0 ? user.roles[0].id : undefined,
    });
    setIsModalVisible(true);
  };

  // 打开修改密码模态框
  const showPasswordModal = (userId: string) => {
    setCurrentUserId(userId);
    passwordForm.resetFields();
    setIsPasswordModalVisible(true);
  };

  // 处理模态框取消
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  // 处理密码模态框取消
  const handlePasswordCancel = () => {
    setIsPasswordModalVisible(false);
    setCurrentUserId(null);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingUser) {
        // 更新用户
        const updateData: UpdateUserRequest = {
          displayName: values.displayName,
          email: values.email,
          isActive: values.isActive,
          roleIds: [values.roleIds],
        };
        await dispatch(editUser({ id: editingUser.id, data: updateData })).unwrap();
        messageApi.success('用户更新成功');
      } else {
        // 创建用户
        const createData: CreateUserRequest = {
          username: values.username,
          password: values.password,
          displayName: values.displayName,
          email: values.email,
          loginType: values.loginType || 'password',
          roleIds: [values.roleIds],
        };
        await dispatch(addUser(createData)).unwrap();
        messageApi.success('用户创建成功');
      }
      
      setIsModalVisible(false);
      setEditingUser(null);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理密码修改
  const handlePasswordChange = async () => {
    try {
      const values = await passwordForm.validateFields();
      
      if (currentUserId) {
        await dispatch(modifyPassword({ 
          id: currentUserId, 
          data: { newPassword: values.newPassword } 
        })).unwrap();
        messageApi.success('密码修改成功');
        setIsPasswordModalVisible(false);
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理删除用户
  const handleDelete = async (userId: string) => {
    try {
      await dispatch(removeUser(userId)).unwrap();
      messageApi.success('用户删除成功');
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 220,
    },
    {
      title: '登录账号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '用户名称',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: '登录账号类型',
      dataIndex: 'loginType',
      key: 'loginType',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? '#52c41a' : '#ff4d4f' }}>
          {isActive ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: any[]) => roles?.map(role => role.name).join(', ') || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => showEditModal(record)}
          >
            编辑
          </Button>
          <Button 
            icon={<LockOutlined />} 
            size="small"
            onClick={() => showPasswordModal(record.id)}
          >
            修改密码
          </Button>
          <Popconfirm
            title="确定要删除此用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      {contextHolder}
      <div className={styles.pageHeader}>
        <h2>账号管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          新增账号
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        loading={loading}
        onChange={handleTableChange}
      />

      {/* 创建/编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '创建用户'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          {!editingUser && (
            <>
              <Form.Item
                name="username"
                label="登录账号"
                rules={[{ required: true, message: '请输入登录账号' }]}
              >
                <Input placeholder="请输入登录账号" />
              </Form.Item>

              <Form.Item
                name="password"
                label="登录密码"
                rules={[{ required: true, message: '请输入登录密码' }]}
              >
                <Input.Password placeholder="请输入登录密码" />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="displayName"
            label="用户名称"
          >
            <Input placeholder="请输入用户名称" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="loginType"
              label="登录账号类型"
              initialValue="password"
            >
              <Select placeholder="请选择登录账号类型">
                <Option value="password">密码登录</Option>
                <Option value="oauth">OAuth登录</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item
            name="isActive"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item
            name="roleIds"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select 
              placeholder="请选择角色"
              loading={!roles.length}
            >
              {roles.map(role => (
                <Option key={role.id} value={role.id}>{role.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={isPasswordModalVisible}
        onOk={handlePasswordChange}
        onCancel={handlePasswordCancel}
        confirmLoading={loading}
      >
        <Form
          form={passwordForm}
          layout="vertical"
        >
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码长度不能少于6个字符' }
            ]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请确认密码" />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

export default AccountListPage; 