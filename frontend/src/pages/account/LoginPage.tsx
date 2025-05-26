import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { login } from '../../store/slices/authSlice';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const { status, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      navigate('/admin');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-violet-900">蓝鲸时代后台管理系统</h2>
        
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-800">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="username">
              用户名
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-md bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:bg-violet-300"
          >
            {status === 'loading' ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 