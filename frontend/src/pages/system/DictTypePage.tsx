import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Tag,
  Form,
  Input,
  Select,
  Row,
  Col,
  Modal,
  Divider
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { RootState } from '@/store';
import { 
  fetchDictTypes, 
  createDictType, 
  updateDictType, 
  deleteDictType,
  clearDictError
} from '@/store/slices/dictSlice';
import { DictType } from '@/services/dictApi';

const FormItem = Form.Item;
const { Option } = Select;

interface FormValues extends Partial<DictType> {}

const DictTypePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增字典类型');
  const [editingRecord, setEditingRecord] = useState<DictType | null>(null);

  // 从Redux获取状态
  const { dictTypes, loadingTypes, typesPagination, error } = useSelector((state: RootState) => state.dict);

  // 查询参数状态
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
    dictName: '',
    dictType: '',
    status: ''
  });

  // 页面加载时获取字典类型列表
  useEffect(() => {
    dispatch(fetchDictTypes(queryParams) as any);
  }, [dispatch, queryParams]);

  // 处理错误信息
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearDictError());
    }
  }, [error, dispatch]);

  // 处理表格分页变化
  const handleTableChange = (pagination: any) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current,
      pageSize: pagination.pageSize
    });
  };

  // 处理查询表单提交
  const handleSearch = (values: any) => {
    setQueryParams({
      ...queryParams,
      page: 1, // 重置到第一页
      dictName: values.dictName || '',
      dictType: values.dictType || '',
      status: values.status || ''
    });
  };

  // 重置查询表单
  const handleReset = () => {
    form.resetFields();
    setQueryParams({
      page: 1,
      pageSize: 10,
      dictName: '',
      dictType: '',
      status: ''
    });
  };

  // 打开模态框创建新字典类型
  const handleAdd = () => {
    setModalTitle('新增字典类型');
    setEditingRecord(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  // 打开模态框编辑字典类型
  const handleEdit = (record: DictType) => {
    setModalTitle('编辑字典类型');
    setEditingRecord(record);
    modalForm.setFieldsValue({
      dictName: record.dictName,
      dictType: record.dictType,
      status: record.status,
      remark: record.remark
    });
    setModalVisible(true);
  };

  // 处理删除字典类型
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteDictType(id) as any);
      message.success('字典类型删除成功');
    } catch (error: any) {
      message.error(`删除失败: ${error.message}`);
    }
  };

  // 查看字典数据
  const handleViewData = (record: DictType) => {
    navigate(`/system/dict-data/${record.id}`);
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      
      if (editingRecord) {
        // 更新字典类型
        await dispatch(updateDictType({
          id: editingRecord.id,
          data: values
        }) as any);
        message.success('字典类型更新成功');
      } else {
        // 创建新字典类型
        await dispatch(createDictType(values) as any);
        message.success('字典类型创建成功');
      }
      
      setModalVisible(false);
      modalForm.resetFields();
    } catch (error) {
      // 表单校验错误，无需处理
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '字典名称',
      dataIndex: 'dictName',
      key: 'dictName'
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      key: 'dictType'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        status === 'normal' ? 
          <Tag color="success">正常</Tag> : 
          <Tag color="error">停用</Tag>
      )
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DictType) => (
        <Space size="small">
          <Button
            icon={<DatabaseOutlined />}
            size="small"
            onClick={() => handleViewData(record)}
            title="字典数据"
          />
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)} 
            type="primary"
            title="编辑"
          />
          <Popconfirm
            title="确定要删除这个字典类型吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              title="删除"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>字典类型管理</h2>
      </div>

      <Card variant="borderless">
        {/* 查询表单 */}
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: '20px' }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col span={6}>
              <FormItem label="字典名称" name="dictName">
                <Input placeholder="请输入字典名称" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="字典类型" name="dictType">
                <Input placeholder="请输入字典类型" />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="状态" name="status">
                <Select placeholder="请选择状态" allowClear>
                  <Option value="normal">正常</Option>
                  <Option value="disabled">停用</Option>
                </Select>
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={handleReset}>
                    重置
                  </Button>
                </Space>
              </FormItem>
            </Col>
          </Row>
        </Form>

        <Divider style={{ margin: '0 0 16px 0' }} />

        {/* 操作按钮 */}
        <div style={{ marginBottom: '16px' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增
          </Button>
        </div>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={dictTypes}
          rowKey="id"
          loading={loadingTypes}
          onChange={handleTableChange}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total: typesPagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
        maskClosable={false}
      >
        <Form
          form={modalForm}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
        >
          <FormItem
            name="dictName"
            label="字典名称"
            rules={[{ required: true, message: '请输入字典名称' }]}
          >
            <Input placeholder="请输入字典名称" />
          </FormItem>
          <FormItem
            name="dictType"
            label="字典类型"
            rules={[{ required: true, message: '请输入字典类型' }]}
          >
            <Input placeholder="请输入字典类型" disabled={!!editingRecord} />
          </FormItem>
          <FormItem
            name="status"
            label="状态"
            initialValue="normal"
          >
            <Select>
              <Option value="normal">正常</Option>
              <Option value="disabled">停用</Option>
            </Select>
          </FormItem>
          <FormItem
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </FormItem>
        </Form>
      </Modal>
    </div>
  );
};

export default DictTypePage; 