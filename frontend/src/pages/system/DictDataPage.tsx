import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Divider,
  InputNumber,
  Switch,
  Typography,
  Spin
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { RootState } from '@/store';
import { 
  fetchDictTypeById,
  fetchDictDataList,
  createDictData,
  updateDictData,
  deleteDictData,
  clearDictError
} from '@/store/slices/dictSlice';
import { DictData } from '@/services/dictApi';

const FormItem = Form.Item;
const { Option } = Select;
const { Title, Text } = Typography;

const DictDataPage: React.FC = () => {
  const { dictTypeId } = useParams<{ dictTypeId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增字典数据');
  const [editingRecord, setEditingRecord] = useState<DictData | null>(null);

  // 从Redux获取状态
  const { 
    currentDictType,
    dictDataList, 
    loadingTypes,
    loadingData, 
    dataListPagination, 
    error 
  } = useSelector((state: RootState) => state.dict);

  // 查询参数状态
  const [queryParams, setQueryParams] = useState({
    page: 1,
    pageSize: 10,
    dictTypeId: dictTypeId || '',
    dictLabel: '',
    status: ''
  });

  // 页面加载时获取字典类型详情和字典数据列表
  useEffect(() => {
    if (dictTypeId) {
      dispatch(fetchDictTypeById(dictTypeId) as any);
      dispatch(fetchDictDataList({
        ...queryParams,
        dictTypeId
      }) as any);
    }
  }, [dispatch, dictTypeId, queryParams]);

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
      dictLabel: values.dictLabel || '',
      status: values.status || ''
    });
  };

  // 重置查询表单
  const handleReset = () => {
    form.resetFields();
    setQueryParams({
      ...queryParams,
      page: 1,
      dictLabel: '',
      status: ''
    });
  };

  // 打开模态框创建新字典数据
  const handleAdd = () => {
    setModalTitle('新增字典数据');
    setEditingRecord(null);
    modalForm.resetFields();
    setModalVisible(true);
  };

  // 打开模态框编辑字典数据
  const handleEdit = (record: DictData) => {
    setModalTitle('编辑字典数据');
    setEditingRecord(record);
    modalForm.setFieldsValue({
      dictLabel: record.dictLabel,
      dictValue: record.dictValue,
      dictSort: record.dictSort,
      cssClass: record.cssClass,
      listClass: record.listClass,
      isDefault: record.isDefault,
      status: record.status,
      remark: record.remark
    });
    setModalVisible(true);
  };

  // 处理删除字典数据
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteDictData({ id, dictTypeId: dictTypeId! }) as any);
      message.success('字典数据删除成功');
    } catch (error: any) {
      message.error(`删除失败: ${error.message}`);
    }
  };

  // 返回字典类型列表
  const handleBackToTypes = () => {
    navigate('/system/dict-type');
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await modalForm.validateFields();
      
      if (editingRecord) {
        // 更新字典数据
        await dispatch(updateDictData({
          id: editingRecord.id,
          data: values,
          dictTypeId: dictTypeId!
        }) as any);
        message.success('字典数据更新成功');
      } else {
        // 创建新字典数据
        const data = {
          ...values,
          dictTypeId: dictTypeId!
        };
        await dispatch(createDictData(data) as any);
        message.success('字典数据创建成功');
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
      title: '字典标签',
      dataIndex: 'dictLabel',
      key: 'dictLabel'
    },
    {
      title: '字典键值',
      dataIndex: 'dictValue',
      key: 'dictValue'
    },
    {
      title: '字典排序',
      dataIndex: 'dictSort',
      key: 'dictSort',
      sorter: (a: DictData, b: DictData) => a.dictSort - b.dictSort
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
      title: '是否默认',
      dataIndex: 'isDefault',
      key: 'isDefault',
      render: (isDefault: boolean) => (
        isDefault ? <Tag color="blue">是</Tag> : <Tag>否</Tag>
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
      render: (_: any, record: DictData) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)} 
            type="primary"
            title="编辑"
          />
          <Popconfirm
            title="确定要删除这个字典数据吗？"
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
      <div className="page-header" style={{ display: 'flex', alignItems: 'center' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToTypes}
          style={{ marginRight: '16px' }}
        >
          返回
        </Button>
        <div>
          <Title level={4} style={{ margin: 0 }}>字典数据管理</Title>
          {currentDictType && (
            <Text type="secondary">
              字典名称: {currentDictType.dictName} | 字典类型: {currentDictType.dictType}
            </Text>
          )}
        </div>
      </div>

      {loadingTypes && !currentDictType ? (
        <Card variant="borderless">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p>正在加载字典类型信息...</p>
          </div>
        </Card>
      ) : (
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
                <FormItem label="字典标签" name="dictLabel">
                  <Input placeholder="请输入字典标签" />
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
              <Col span={12}>
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
            dataSource={dictDataList}
            rowKey="id"
            loading={loadingData}
            onChange={handleTableChange}
            pagination={{
              current: queryParams.page,
              pageSize: queryParams.pageSize,
              total: dataListPagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`
            }}
          />
        </Card>
      )}

      {/* 新增/编辑模态框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
        maskClosable={false}
        width={600}
      >
        <Form
          form={modalForm}
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
        >
          <FormItem
            name="dictLabel"
            label="字典标签"
            rules={[{ required: true, message: '请输入字典标签' }]}
          >
            <Input placeholder="请输入字典标签" />
          </FormItem>
          <FormItem
            name="dictValue"
            label="字典键值"
            rules={[{ required: true, message: '请输入字典键值' }]}
          >
            <Input placeholder="请输入字典键值" disabled={!!editingRecord} />
          </FormItem>
          <FormItem
            name="dictSort"
            label="字典排序"
            initialValue={0}
          >
            <InputNumber min={0} step={1} style={{ width: '100%' }} />
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
            name="isDefault"
            label="是否默认"
            initialValue={false}
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </FormItem>
          <FormItem
            name="cssClass"
            label="CSS样式类"
          >
            <Input placeholder="请输入样式类" />
          </FormItem>
          <FormItem
            name="listClass"
            label="列表样式类"
          >
            <Input placeholder="请输入列表样式类" />
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

export default DictDataPage; 