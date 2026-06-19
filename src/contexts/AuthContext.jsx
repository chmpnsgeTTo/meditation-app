import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios'; // ← Импортируем настроенный axios

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockedInfo, setBlockedInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    
    if (token && username) {
      setUser({ token, username, userId, role });
      // Проверяем, не заблокирован ли пользователь
      checkUserBlocked(token);
    }
    setLoading(false);
  }, []);

  // Проверка блокировки пользователя
  const checkUserBlocked = async (token) => {
    try {
      const response = await api.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Пользователь не заблокирован
      setBlockedInfo(null);
      return { isBlocked: false };
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.isBlocked) {
        const blockReason = error.response.data.blockReason || 'Причина не указана';
        setBlockedInfo({ isBlocked: true, reason: blockReason });
        // Разлогиниваем пользователя, если он заблокирован
        logout();
        return { isBlocked: true, reason: blockReason };
      }
      return { isBlocked: false };
    }
  };

  const login = async (username, password) => {
    try {
      // Используем api вместо axios
      const { data } = await api.post('/api/login', { username, password });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      
      setUser({ 
        token: data.token, 
        username: data.username, 
        userId: data.userId, 
        role: data.role 
      });
      setBlockedInfo(null);
      
      return { success: true };
    } catch (error) {
      // Проверяем, не заблокирован ли пользователь
      if (error.response?.status === 403 && error.response?.data?.isBlocked) {
        return { 
          success: false, 
          isBlocked: true,
          blockReason: error.response.data.blockReason || 'Причина не указана',
          error: 'Аккаунт заблокирован'
        };
      }
      return { 
        success: false, 
        error: error.response?.data?.error || 'Ошибка входа' 
      };
    }
  };

  const register = async (username, password) => {
    try {
      await api.post('/api/register', { username, password });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Ошибка регистрации' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
    setBlockedInfo(null);
  };

  // Проверка, заблокирован ли текущий пользователь
  const isUserBlocked = () => {
    return blockedInfo?.isBlocked || false;
  };

  // Получение причины блокировки
  const getBlockReason = () => {
    return blockedInfo?.reason || null;
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    blockedInfo,
    isUserBlocked,
    getBlockReason,
    checkUserBlocked
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};