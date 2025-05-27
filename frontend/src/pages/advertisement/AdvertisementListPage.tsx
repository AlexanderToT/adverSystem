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
  Col 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckOutlined,
  StopOutlined
} from '@ant-design/icons';
import { RootState } from '@/store';
import { 
  fetchAdvertisements, 
  deleteAdvertisement, 
  batchUpdateAdsStatus, 
  Advertisement 
} from '@/store/slices/advertisementSlice';

const AdvertisementListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  const { advertisements, loading, pagination } = useSelector((state: RootState) => state.advertisement);
  
  // 查询参数状态
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    adType: '',
    isDisplayed: undefined as boolean | undefined
  });
  
  // 页面加载时获取广告列表
  useEffect(() => {
    dispatch(fetchAdvertisements(queryParams) as any);
  }, [dispatch, queryParams]);
  
  // 处理表格分页变化
  const handleTableChange = (pagination: any) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current,
      limit: pagination.pageSize
    });
  };
  
  // 处理查询表单提交
  const handleSearch = (values: any) => {
    setQueryParams({
      ...queryParams,
      page: 1,  // 重置到第一页
      search: values.search || '',
      adType: values.adType || '',
      isDisplayed: values.isDisplayed
    });
  };
  
  // 重置查询表单
  const handleReset = () => {
    form.resetFields();
    setQueryParams({
      page: 1,
      limit: 10,
      search: '',
      adType: '',
      isDisplayed: undefined
    });
  };
  
  // 处理删除广告
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteAdvertisement(id) as any);
      message.success('广告删除成功');
    } catch (error: any) {
      message.error(`删除失败: ${error.message}`);
    }
  };
  
  // 批量更新广告状态
  const handleBatchUpdateStatus = async (isDisplayed: boolean) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一条广告记录');
      return;
    }
    
    try {
      await dispatch(batchUpdateAdsStatus({
        adIds: selectedRowKeys.map(key => String(key)),
        isDisplayed
      }) as any);
      message.success(`已成功${isDisplayed ? '显示' : '隐藏'}所选广告`);
      setSelectedRowKeys([]);
    } catch (error: any) {
      message.error(`操作失败: ${error.message}`);
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '广告名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Advertisement) => (
        <a onClick={() => navigate(`/advertisements/${record.id}`)}>{text}</a>
      )
    },
    {
      title: '广告类型',
      dataIndex: 'adType',
      key: 'adType',
      render: (type: string) => {
        let label = '未知';
        let color = 'default';
        
        switch (type) {
          case 'popup_image':
            label = '弹窗图片';
            color = 'blue';
            break;
          case 'popup_video':
            label = '弹窗视频';
            color = 'purple';
            break;
          case 'banner_multiple_image':
            label = '横幅多图';
            color = 'green';
            break;
          case 'strip_multiple_image':
            label = '信息流多图';
            color = 'orange';
            break;
        }
        
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '目标国家',
      dataIndex: 'countryCodes',
      key: 'countryCodes',
      render: (codes: string) => {
        if (!codes) return '-';
        
        try {
          const countryCodes = JSON.parse(codes);
          if (Array.isArray(countryCodes)) {
            return countryCodes.join(', ');
          }
          return countryCodes || '-';
        } catch (e) {
          return codes || '-';
        }
      }
    },
    {
      title: '总点击数',
      dataIndex: 'totalClicks',
      key: 'totalClicks',
      sorter: (a: Advertisement, b: Advertisement) => a.totalClicks - b.totalClicks
    },
    {
      title: '状态',
      dataIndex: 'isDisplayed',
      key: 'isDisplayed',
      render: (isDisplayed: boolean) => (
        isDisplayed ? <Tag color="success">显示中</Tag> : <Tag color="error">已隐藏</Tag>
      )
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
      render: (_: any, record: Advertisement) => (
        <Space size="small">
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => navigate(`/advertisements/${record.id}`)}
            title="查看详情"
          />
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => navigate(`/advertisements/${record.id}/edit`)}
            type="primary"
            title="编辑"
          />
          <Popconfirm
            title="确定要删除这个广告吗？"
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
  
  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>广告管理</h2>
      </div>
      {/* 查询表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSearch}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="search" label="广告名称">
                <Input placeholder="请输入广告名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="adType" label="广告类型">
                <Select 
                  placeholder="请选择广告类型" 
                  allowClear
                  options={[
                    { value: 'popup_image', label: '弹窗图片' },
                    { value: 'popup_video', label: '弹窗视频' },
                    { value: 'banner_multiple_image', label: '横幅多图' },
                    { value: 'strip_multiple_image', label: '信息流多图' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="isDisplayed" label="状态">
                <Select 
                  placeholder="请选择状态" 
                  allowClear
                  options={[
                    { value: true, label: '显示中' },
                    { value: false, label: '已隐藏' }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button onClick={handleReset}>重置</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      
      {/* 操作按钮区 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/advertisements/new')}
          >
            新建广告
          </Button>
          <Button 
            icon={<CheckOutlined />}
            onClick={() => handleBatchUpdateStatus(true)}
            disabled={selectedRowKeys.length === 0}
          >
            批量显示
          </Button>
          <Button 
            icon={<StopOutlined />}
            onClick={() => handleBatchUpdateStatus(false)}
            disabled={selectedRowKeys.length === 0}
          >
            批量隐藏
          </Button>
        </Space>
      </Card>
      
      {/* 数据表格 */}
      <Card>
        <Table
          rowKey="id"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={advertisements}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default AdvertisementListPage; 