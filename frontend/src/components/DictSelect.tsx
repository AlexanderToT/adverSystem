import React, { useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import { useDispatch } from 'react-redux';
import { fetchDictDataByType } from '@/store/slices/dictSlice';
import dictApi, { DictData } from '@/services/dictApi';

interface DictSelectProps {
  dictType: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * 字典选择组件
 * 用于表单中快速选择字典值
 */
const DictSelect: React.FC<DictSelectProps> = ({
  dictType,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
  allowClear = true,
  style,
  className
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<DictData[]>([]);
  
  // 加载字典数据
  useEffect(() => {
    const loadDictData = async () => {
      setLoading(true);
      try {
        const response = await dictApi.getDictDataByType(dictType);
        // 只显示状态为正常的选项
        const activeOptions = response.data.filter(item => item.status === 'normal');
        setOptions(activeOptions);
      } catch (error) {
        console.error('加载字典数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (dictType) {
      loadDictData();
    }
  }, [dictType]);
  
  // 处理选择改变
  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
  };
  
  return (
    <Select
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled || loading}
      allowClear={allowClear}
      style={{ width: '100%', ...style }}
      className={className}
      notFoundContent={loading ? <Spin size="small" /> : null}
      options={options.map(item => ({
        label: item.dictLabel,
        value: item.dictValue,
        disabled: item.status === 'disabled'
      }))}
    />
  );
};

export default DictSelect;

