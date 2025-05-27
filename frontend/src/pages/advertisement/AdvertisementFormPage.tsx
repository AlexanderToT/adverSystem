import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Card,
  message,
  Switch,
  Space,
  Row,
  Col,
  Tabs,
  Divider,
  Image,
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { RootState } from '@/store';
import {
  fetchAdvertisementById,
  createAdvertisement,
  updateAdvertisement,
  getMaterialUploadUrl,
} from '@/store/slices/advertisementSlice';

const { Option } = Select;
const { TextArea } = Input;

// 广告类型选项
const AD_TYPES = [
  { value: 'popup_image', label: '弹窗图片' },
  { value: 'popup_video', label: '弹窗视频' },
  { value: 'banner_multiple_image', label: '横幅多图' },
  { value: 'strip_multiple_image', label: '信息流多图' },
];

// 国家/地区选项
const COUNTRY_OPTIONS = [
  { value: 'CN', label: '中国' },
  { value: 'US', label: '美国' },
  { value: 'JP', label: '日本' },
  { value: 'KR', label: '韩国' },
  { value: 'GB', label: '英国' },
  { value: 'DE', label: '德国' },
  { value: 'FR', label: '法国' },
  { value: 'IT', label: '意大利' },
  { value: 'CA', label: '加拿大' },
  { value: 'AU', label: '澳大利亚' },
];

// 定义广告表单数据接口
interface AdvertisementFormData {
  name: string;
  adType: string;
  targetUrl?: string;
  isDisplayed: boolean;
  countryCodes: string[];
  materialConfig?: any;
  displayConfig?: any[];
}

// 素材配置接口
interface MaterialConfig {
  url: string;
  filePath: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  targetUrl?: string;
}

const AdvertisementFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { loading, currentAd, uploadLoading, uploadUrls } = useSelector(
    (state: RootState) => state.advertisement
  );
  
  const [activeTab, setActiveTab] = useState('1');
  const [uploadedMaterial, setUploadedMaterial] = useState<MaterialConfig | null>(null);
  const [adType, setAdType] = useState<string>('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [currentUploadingField, setCurrentUploadingField] = useState<number | null>(null);
  const [isManualVideoUrl, setIsManualVideoUrl] = useState(false);
  const [manualVideoUrl, setManualVideoUrl] = useState('');

  const isEdit = !!id;

  // 获取广告详情
  useEffect(() => {
    if (isEdit && id) {
      dispatch(fetchAdvertisementById(id) as any);
    }
  }, [dispatch, isEdit, id]);

  // 当编辑模式且广告数据加载完成时，填充表单
  useEffect(() => {
    if (isEdit && currentAd) {
      const formData: AdvertisementFormData = {
        name: currentAd.name,
        adType: currentAd.adType,
        isDisplayed: currentAd.isDisplayed,
        countryCodes: currentAd.countryCodes 
          ? (typeof currentAd.countryCodes === 'string' 
              ? JSON.parse(currentAd.countryCodes) 
              : currentAd.countryCodes)
          : [],
      };

      // 设置广告类型
      setAdType(currentAd.adType);

      // 处理素材配置
      if (currentAd.materialConfig) {
        let materialConfigData;
        if (typeof currentAd.materialConfig === 'string') {
          materialConfigData = JSON.parse(currentAd.materialConfig);
        } else {
          materialConfigData = currentAd.materialConfig;
        }
        
        setUploadedMaterial(materialConfigData);
        
        // 如果素材配置中有目标URL，设置目标URL状态
        if (materialConfigData.targetUrl) {
          setTargetUrl(materialConfigData.targetUrl);
        }
        
        // 如果是视频类型且没有filePath，认为是手动输入的视频URL
        if (materialConfigData.fileType?.startsWith('video/') && !materialConfigData.filePath) {
          setIsManualVideoUrl(true);
          setManualVideoUrl(materialConfigData.url || '');
        }
        
        formData.materialConfig = materialConfigData;
      }

      // 处理显示配置
      if (currentAd.displayConfig) {
        let displayConfigData;
        if (typeof currentAd.displayConfig === 'string') {
          displayConfigData = JSON.parse(currentAd.displayConfig);
        } else {
          displayConfigData = currentAd.displayConfig;
        }
        
        if (Array.isArray(displayConfigData)) {
          formData.displayConfig = displayConfigData;
        }
      }

      form.setFieldsValue(formData);
    }
  }, [form, isEdit, currentAd]);

  // 当获取到预签名URL后自动执行上传
  useEffect(() => {
    const performUpload = async () => {
      if (uploadUrls && fileList.length > 0 && !uploading) {
        await handleUpload();
      }
    };

    performUpload();
  }, [uploadUrls]);

  // 处理表单提交
  const handleSubmit = async (values: AdvertisementFormData) => {
    try {
      const formData: AdvertisementFormData = {
        ...values,
      };

      // 根据广告类型处理不同的配置
      if (adType === 'popup_image' || adType === 'popup_video') {
        if (!uploadedMaterial && !currentAd?.materialConfig) {
          message.error('请上传素材');
          return;
        }
        
        // 将目标URL添加到素材配置中
        const materialConfig = uploadedMaterial || currentAd?.materialConfig;
        formData.materialConfig = {
          ...materialConfig,
          targetUrl: targetUrl
        };
      }

      if (isEdit && id) {
        await dispatch(updateAdvertisement({ id, data: formData }) as any);
        message.success('广告更新成功');
      } else {
        await dispatch(createAdvertisement(formData) as any);
        message.success('广告创建成功');
      }
      navigate('/advertisements');
    } catch (error: any) {
      message.error(`提交失败: ${error.message}`);
    }
  };

  // 处理广告类型变更
  const handleAdTypeChange = (value: string) => {
    setAdType(value);
    // 重置相关字段
    if (value === 'popup_image' || value === 'popup_video') {
      form.setFieldsValue({
        displayConfig: undefined,
      });
    } else {
      form.setFieldsValue({
        targetUrl: undefined,
        materialConfig: undefined,
      });
    }
  };

  // 获取上传URL
  const handleBeforeUpload = async (file: File) => {
    try {
      setUploading(true);
      setFileList([file]);
      setCurrentUploadingField(null);
      
      const fileName = file.name;
      const contentType = file.type;
      
      await dispatch(getMaterialUploadUrl({ fileName, contentType }) as any);
      return false; // 阻止自动上传
    } catch (error) {
      setUploading(false);
      message.error('获取上传URL失败');
      return false;
    }
  };
  
  // 获取上传URL (多素材)
  const handleMultipleBeforeUpload = (fieldIndex: number) => {
    return async (file: File) => {
      try {
        setUploading(true);
        setFileList([file]);
        setCurrentUploadingField(fieldIndex);
        
        const fileName = file.name;
        const contentType = file.type;
        
        await dispatch(getMaterialUploadUrl({ fileName, contentType }) as any);
        return false; // 阻止自动上传
      } catch (error) {
        setUploading(false);
        message.error('获取上传URL失败');
        return false;
      }
    };
  };

  // 执行文件上传
  const handleUpload = async () => {
    if (!uploadUrls || fileList.length === 0) {
      message.error('请先选择文件');
      return;
    }

    setUploading(true);

    try {
      const file = fileList[0];
      
      // 使用预签名URL上传文件
      const response = await fetch(uploadUrls.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      // 上传成功后设置素材信息
      const materialConfig: MaterialConfig = {
        url: uploadUrls.fileUrl,
        filePath: uploadUrls.filePath,
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size,
      };

      // 如果是多素材中的某一项
      if (currentUploadingField !== null) {
        // 更新表单中对应字段的值
        const displayConfig = form.getFieldValue('displayConfig') || [];
        displayConfig[currentUploadingField] = {
          ...displayConfig[currentUploadingField],
          materialUrl: uploadUrls.fileUrl
        };
        form.setFieldValue('displayConfig', [...displayConfig]);
        setCurrentUploadingField(null);
      } else {
        setUploadedMaterial(materialConfig);
      }
      
      message.success('上传成功');
      
      // 清空文件列表
      setFileList([]);
    } catch (error: any) {
      message.error(`上传失败: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // 处理目标URL变更
  const handleTargetUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTargetUrl(e.target.value);
  };

  // 处理手动视频URL变更
  const handleManualVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualVideoUrl(e.target.value);
  };

  // 应用手动视频URL
  const applyManualVideoUrl = () => {
    if (!manualVideoUrl) {
      message.error('请输入视频URL');
      return;
    }
    
    const materialConfig: MaterialConfig = {
      url: manualVideoUrl,
      filePath: '',
      fileType: 'video/mp4', // 假设为mp4格式
      fileName: manualVideoUrl.split('/').pop() || 'video.mp4',
      fileSize: 0,
    };
    
    setUploadedMaterial(materialConfig);
    message.success('视频URL已设置');
  };

  // 检查文件是否为图片
  const isImageFile = (fileType: string | undefined) => {
    return fileType?.startsWith('image/');
  };

  // 检查URL是否为图片
  const isImageUrl = (url: string | undefined) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  // 渲染基本信息表单
  const renderBasicInfoForm = () => {
    return (
      <>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="广告名称"
              name="name"
              rules={[{ required: true, message: '请输入广告名称' }]}
            >
              <Input placeholder="请输入广告名称" />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="广告类型"
              name="adType"
              rules={[{ required: true, message: '请选择广告类型' }]}
            >
              <Select 
                placeholder="请选择广告类型" 
                onChange={handleAdTypeChange}
                disabled={isEdit} // 编辑时不允许修改类型
              >
                {AD_TYPES.map(type => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              label="目标国家/地区"
              name="countryCodes"
            >
              <Select 
                placeholder="请选择目标国家/地区" 
                mode="multiple" 
                allowClear
              >
                {COUNTRY_OPTIONS.map(country => (
                  <Option key={country.value} value={country.value}>
                    {country.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              label="是否显示"
              name="isDisplayed"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  };

  // 渲染素材配置表单
  const renderMaterialConfigForm = () => {
    if (adType === 'popup_image' || adType === 'popup_video') {
      return (
        <div>
          <h3>单素材上传</h3>
          <p>当前广告类型: {AD_TYPES.find(t => t.value === adType)?.label}</p>
          
          {uploadedMaterial ? (
            <div style={{ marginBottom: 16 }}>
              <p>已上传素材:</p>
              <div style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                <p>文件名: {uploadedMaterial.fileName || '未知'}</p>
                <p>文件类型: {uploadedMaterial.fileType || '未知'}</p>
                <p>
                  URL: <a href={uploadedMaterial.url} target="_blank" rel="noopener noreferrer">
                    {uploadedMaterial.url || '未知'}
                  </a>
                </p>
                {uploadedMaterial.fileType?.startsWith('image/') && (
                  <div style={{ marginTop: 10 }}>
                    <Image 
                      src={uploadedMaterial.url} 
                      alt="素材预览" 
                      style={{ maxWidth: '300px', maxHeight: '200px' }} 
                    />
                  </div>
                )}
                {uploadedMaterial.fileType?.startsWith('video/') && (
                  <div style={{ marginTop: 10 }}>
                    <video 
                      src={uploadedMaterial.url} 
                      controls 
                      style={{ maxWidth: '300px', maxHeight: '200px' }} 
                    />
                  </div>
                )}
              </div>
              <Button 
                style={{ marginTop: 10 }} 
                onClick={() => setUploadedMaterial(null)}
              >
                重新上传
              </Button>
            </div>
          ) : (
            <div>
              {adType === 'popup_video' && (
                <div style={{ marginBottom: 16 }}>
                  <Switch 
                    checked={isManualVideoUrl} 
                    onChange={(checked) => setIsManualVideoUrl(checked)} 
                    checkedChildren="手动输入视频URL" 
                    unCheckedChildren="上传视频文件" 
                  />
                </div>
              )}
              
              {adType === 'popup_video' && isManualVideoUrl ? (
                <Form.Item
                  label="视频URL"
                  required
                >
                  <Input.Group compact>
                    <Input 
                      style={{ width: 'calc(100% - 100px)' }} 
                      placeholder="请输入视频URL" 
                      value={manualVideoUrl}
                      onChange={handleManualVideoUrlChange}
                    />
                    <Button 
                      type="primary" 
                      onClick={applyManualVideoUrl}
                    >
                      确定
                    </Button>
                  </Input.Group>
                </Form.Item>
              ) : (
                <Form.Item
                  label="素材上传"
                  required
                >
                  <Input 
                    placeholder="选择文件后自动上传" 
                    readOnly 
                    value={fileList.length > 0 ? fileList[0].name : ''}
                    addonAfter={
                      <Upload
                        beforeUpload={handleBeforeUpload}
                        showUploadList={false}
                        maxCount={1}
                        onChange={({ fileList }) => setFileList(fileList)}
                      >
                        <Button 
                          size="small" 
                          icon={<UploadOutlined />}
                          loading={uploading && currentUploadingField === null}
                        >
                          {uploading && currentUploadingField === null ? '上传中' : '上传'}
                        </Button>
                      </Upload>
                    }
                  />
                </Form.Item>
              )}
            </div>
          )}
          
          <div style={{ marginTop: 16 }}>
            <Form.Item
              label="目标URL"
              rules={[
                adType === 'popup_image' 
                  ? { required: true, message: '请输入目标URL' } 
                  : {}
              ]}
            >
              <Input 
                placeholder="请输入广告点击后跳转的URL"
                value={targetUrl}
                onChange={handleTargetUrlChange}
              />
            </Form.Item>
          </div>
        </div>
      );
    } else if (adType === 'banner_multiple_image' || adType === 'strip_multiple_image') {
      return (
        <div>
          <h3>多素材配置</h3>
          <p>针对横幅或信息流广告，可配置多个素材及其对应的目标URL</p>
          
          <Form.List name="displayConfig">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card 
                    key={key} 
                    style={{ marginBottom: 16 }} 
                    type="inner"
                    extra={
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    }
                    title={`素材项 #${name + 1}`}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'materialUrl']}
                      label="素材URL"
                      rules={[{ required: true, message: '请上传素材或输入素材URL' }]}
                    >
                      <Input 
                        placeholder="上传素材后自动填充URL" 
                        readOnly 
                        addonAfter={
                          <Upload
                            beforeUpload={handleMultipleBeforeUpload(name)}
                            showUploadList={false}
                            maxCount={1}
                          >
                            <Button 
                              size="small" 
                              icon={<UploadOutlined />}
                              loading={uploading && currentUploadingField === name}
                            >
                              {uploading && currentUploadingField === name ? '上传中' : '上传'}
                            </Button>
                          </Upload>
                        }
                      />
                    </Form.Item>
                    
                    {form.getFieldValue(['displayConfig', name, 'materialUrl']) && 
                      isImageUrl(form.getFieldValue(['displayConfig', name, 'materialUrl'])) && (
                      <div style={{ marginBottom: 16 }}>
                        <p>素材预览:</p>
                        <Image 
                          src={form.getFieldValue(['displayConfig', name, 'materialUrl'])} 
                          alt="素材预览" 
                          style={{ maxWidth: '200px', maxHeight: '150px' }} 
                        />
                      </div>
                    )}
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'targetUrl']}
                      label="目标URL"
                      rules={[{ required: true, message: '请输入目标URL' }]}
                    >
                      <Input placeholder="请输入点击后跳转的URL" />
                    </Form.Item>
                    
                    <Form.Item
                      {...restField}
                      name={[name, 'order']}
                      label="排序(可选)"
                    >
                      <Input type="number" placeholder="数字越小越靠前" />
                    </Form.Item>
                  </Card>
                ))}
                
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add({ order: fields.length + 1 })} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    添加素材项
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
      );
    } else {
      return (
        <div>请先在"基本信息"标签页选择广告类型</div>
      );
    }
  };

  // 标签页配置项
  const tabItems = [
    {
      key: '1',
      label: '基本信息',
      children: renderBasicInfoForm()
    },
    {
      key: '2',
      label: '素材配置',
      children: renderMaterialConfigForm()
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{isEdit ? '编辑广告' : '创建广告'}</h2>
      </div>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isDisplayed: true,
            countryCodes: [],
          }}
        >
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
          />
          
          <Divider />
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '更新广告' : '创建广告'}
              </Button>
              <Button onClick={() => navigate('/advertisements')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AdvertisementFormPage; 