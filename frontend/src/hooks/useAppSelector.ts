import { useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState } from '@/store';

// 使用预先类型化的selector hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 