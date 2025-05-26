import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GalleryVerticalEnd } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch"
import { login } from "../store/slices/authSlice"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

export function LoginForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  
  const { status, error } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(login(formData))
    if (login.fulfilled.match(result)) {
      navigate('/admin')
    }
  }

  return (
    <div className="bg-background rounded-lg shadow-lg p-8 w-full">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">登录</h1>
          <p className="text-gray-500 dark:text-gray-400">
            输入您的账号和密码登录系统
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              用户名
            </label>
            <Input
              id="username"
              name="username"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                密码
              </label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? '登录中...' : '登录'}
          </Button>
        </form>
      </div>
    </div>
  )
} 