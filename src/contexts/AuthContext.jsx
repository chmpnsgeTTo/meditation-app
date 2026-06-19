import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

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
    
    console.log('🔍 Проверка localStorage при загрузке:', {
      token: token ? '✅ есть' : '❌ нет',
      username: username ? '✅ есть' : '❌ нет',
      userId: userId ? '✅ есть' : '❌ нет',
      role: role ? '✅ есть' : '❌ нет'
    });
    
    if (token && username) {
      console.log('👤 Восстанавливаем пользователя из localStorage:', username);
      setUser({ token, username, userId, role });
      checkUserBlocked(token);
    } else {
      console.log('👤 Пользователь не найден в localStorage');
    }
    setLoading(false);
  }, []);

  const checkUserBlocked = async (token) => {
    try {
      console.log('🔍 Проверка блокировки пользователя...');
      const response = await api.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlockedInfo(null);
      console.log('✅ Пользователь не заблокирован');
      return { isBlocked: false };
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.isBlocked) {
        const blockReason = error.response.data.blockReason || 'Причина не указана';
        console.log('🔒 Пользователь заблокирован:', blockReason);
        setBlockedInfo({ isBlocked: true, reason: blockReason });
        logout();
        return { isBlocked: true, reason: blockReason };
      }
      console.log('⚠️ Ошибка проверки блокировки:', error.message);
      return { isBlocked: false };
    }
  };

  const login = async (username, password) => {
    console.log('🔑 === ВХОД В AuthContext ===');
    console.log('👤 Имя пользователя:', username);
    
    try {
      const { data } = await api.post('/api/login', { username, password });
      
      console.log('✅ Ответ сервера:', {
        token: data.token ? data.token.substring(0, 20) + '...' : '❌ нет',
        username: data.username,
        userId: data.userId,
        role: data.role
      });
      
      if (!data.token) {
        console.error('❌ Токен отсутствует в ответе!');
        return { success: false, error: 'Токен не получен' };
      }
      
      console.log('💾 Сохраняем в localStorage...');
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      
      console.log('✅ localStorage сохранён');
      console.log('🔑 Токен:', data.token.substring(0, 30) + '...');
      console.log('👤 Имя:', data.username);
      console.log('🆔 userId:', data.userId);
      console.log('🎭 role:', data.role);
      
      setUser({ 
        token: data.token, 
        username: data.username, 
        userId: data.userId, 
        role: data.role 
      });
      setBlockedInfo(null);
      
      console.log('✅ Пользователь установлен в state');
      console.log('👤 Текущий user:', user);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка входа в AuthContext:', error);
      console.error('❌ Статус ошибки:', error.response?.status);
      console.error('❌ Данные ошибки:', error.response?.data);
      
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
    console.log('🚪 Выход из аккаунта');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
    setBlockedInfo(null);
    console.log('✅ Данные удалены из localStorage');
  };

  const isUserBlocked = () => {
    return blockedInfo?.isBlocked || false;
  };

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

  console.log('🔄 AuthProvider состояние:', { 
    user: user ? user.username : 'null', 
    loading, 
    blockedInfo 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};