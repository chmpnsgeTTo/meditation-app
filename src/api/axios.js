// src/api/axios.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔥 Interceptor для авторизации
api.interceptors.request.use(
  (config) => {
    // ⛔ ВАЖНО: НЕ добавляем токен к /login и /register
    const url = config.url || '';
    const isLogin = url === '/api/login' || url.includes('/login');
    const isRegister = url === '/api/register' || url.includes('/register');
    
    if (isLogin || isRegister) {
      console.log('⛔ Пропускаем добавление токена для:', url);
      return config;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔑 Добавляем токен для:', url);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔥 Interceptor для обработки 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истёк — разлогиниваем
      console.log('⛔ 401 Unauthorized — разлогиниваем');
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      // Не перенаправляем, если это запрос на /login
      if (!error.config?.url?.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;