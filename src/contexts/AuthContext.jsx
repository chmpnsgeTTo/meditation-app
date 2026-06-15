import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://chmpnsgetto-meditation-app-6dfa.twc1.net';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (token && username) setUser({ token, username, userId, role });
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/login`, { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('role', data.role);
      setUser({ token: data.token, username: data.username, userId: data.userId, role: data.role });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка входа' };
    }
  };

  const register = async (username, password) => {
    try {
      await axios.post(`${API_URL}/api/register`, { username, password });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Ошибка регистрации' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};