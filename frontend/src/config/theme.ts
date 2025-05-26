import { ThemeConfig } from 'antd';

/**
 * Ant Design 主题配置
 * 紫色主题 (Violet)
 */
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#7c3aed', // 主色调 - 紫色
    colorLink: '#7c3aed', // 链接色
    colorSuccess: '#22c55e', // 成功色
    colorWarning: '#f59e0b', // 警告色
    colorError: '#ef4444', // 错误色
    colorInfo: '#3b82f6', // 信息色
    borderRadius: 4, // 圆角大小
    wireframe: false,
    fontSize: 14, // 字体大小
  },
  components: {
    Button: {
      borderRadius: 4,
      controlHeight: 36,
    },
    Input: {
      controlHeight: 36,
    },
    Select: {
      controlHeight: 36,
    }
  },
}; 