import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './hooks/useAppDispatch'
import { fetchCurrentUser } from './store/slices/authSlice'
import LoginPage from './pages/account/LoginPage'

const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  // 如果有token，尝试获取当前用户信息
  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser())
    }
  }, [dispatch, token])

  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* 保护路由 - 暂时只重定向到登录页 */}
      <Route path="/admin/*" element={
        isAuthenticated ? <div>后台管理界面将在这里显示</div> : <Navigate to="/login" />
      } />
      
      {/* 其他路由重定向到登录页 */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App 