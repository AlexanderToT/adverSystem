import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Descriptions, Spin, Empty, Divider, Tag, Space } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { RootState } from '@/store';
import { fetchAdvertisementById } from '@/store/slices/advertisementSlice';

const AdvertisementDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentAd, loading } = useSelector((state: RootState) => state.advertisement);

  useEffect(() => {
    if (id) {
      dispatch(fetchAdvertisementById(id) as any);
    }
  }, [dispatch, id]);

  // 广告类型中文映射
  const getAdTypeName = (type: string): string => {
    const types: Record<string, string> = {
      'popup_image': '弹窗图片',
      'popup_video': '弹窗视频',
      'banner_multiple_image': '横幅多图',
      'strip_multiple_image': '信息流多图'
    };
    return types[type] || type;
  };

  const handleEdit = () => {
    navigate(`/advertisements/${id}/edit`);
  };

  // 解析国家代码
  const parseCountryCodes = (codes: string | string[] | null | undefined): string[] => {
    if (!codes) return [];
    
    if (typeof codes === 'string') {
      try {
        return JSON.parse(codes);
      } catch (e) {
        return [];
      }
    }
    
    return Array.isArray(codes) ? codes : [];
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading-container"><Spin size="large" /></div>;
    }

    if (!currentAd) {
      return <Empty description="未找到广告信息" />;
    }

    const countryCodes = parseCountryCodes(currentAd.countryCodes);

    return (
      <>
        <Descriptions bordered={true} column={2} size="middle">
          <Descriptions.Item label="广告名称" span={2}>{currentAd.name}</Descriptions.Item>
          <Descriptions.Item label="广告类型">{getAdTypeName(currentAd.adType)}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {currentAd.isDisplayed ? 
              <Tag color="green">显示中</Tag> : 
              <Tag color="red">已隐藏</Tag>
            }
          </Descriptions.Item>
          {currentAd.targetUrl && (
            <Descriptions.Item label="目标链接" span={2}>
              <a href={currentAd.targetUrl} target="_blank" rel="noopener noreferrer">{currentAd.targetUrl}</a>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="目标国家/地区" span={2}>
            {countryCodes.length > 0 ? 
              countryCodes.map((code: string) => <Tag key={code}>{code}</Tag>) : 
              '全球'
            }
          </Descriptions.Item>
          <Descriptions.Item label="点击量">{currentAd.totalClicks || 0}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{new Date(currentAd.createdAt).toLocaleString()}</Descriptions.Item>
        </Descriptions>

        {(currentAd.adType === 'popup_image' || currentAd.adType === 'popup_video') && currentAd.materialConfig && (
          <>
            <Divider orientation="left">素材预览</Divider>
            <div className="material-preview">
              {typeof currentAd.materialConfig === 'string' ? (
                <pre>{currentAd.materialConfig}</pre>
              ) : currentAd.materialConfig.fileType?.startsWith('image/') ? (
                <img 
                  src={currentAd.materialConfig.url} 
                  alt="素材预览" 
                  style={{ maxWidth: '100%', maxHeight: '400px' }} 
                />
              ) : (
                <div>
                  <p>素材类型: {currentAd.materialConfig.fileType}</p>
                  <p>素材URL: <a href={currentAd.materialConfig.url} target="_blank" rel="noopener noreferrer">{currentAd.materialConfig.url}</a></p>
                </div>
              )}
            </div>
          </>
        )}

        {(currentAd.adType === 'banner_multiple_image' || currentAd.adType === 'strip_multiple_image') && currentAd.displayConfig && (
          <>
            <Divider orientation="left">多素材配置</Divider>
            <div className="display-config">
              {Array.isArray(currentAd.displayConfig) ? (
                currentAd.displayConfig.map((item, index) => (
                  <Card key={index} title={`素材 #${index + 1}`} size="small" style={{ marginBottom: 16 }}>
                    <p><strong>素材URL:</strong> <a href={item.materialUrl} target="_blank" rel="noopener noreferrer">{item.materialUrl}</a></p>
                    <p><strong>目标链接:</strong> <a href={item.targetUrl} target="_blank" rel="noopener noreferrer">{item.targetUrl}</a></p>
                    {item.title && <p><strong>标题:</strong> {item.title}</p>}
                    {item.description && <p><strong>描述:</strong> {item.description}</p>}
                    {item.order && <p><strong>排序:</strong> {item.order}</p>}
                  </Card>
                ))
              ) : (
                <Empty description="无素材配置" />
              )}
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>广告详情</h2>
      </div>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/advertisements/list')}
            >
              返回列表
            </Button>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={handleEdit}
            >
              编辑广告
            </Button>
          </Space>
        </div>
        {renderContent()}
      </Card>
    </div>
  );
};

export default AdvertisementDetailsPage; 