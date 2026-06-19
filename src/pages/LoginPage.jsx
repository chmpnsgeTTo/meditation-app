import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn, FiArrowLeft } from 'react-icons/fi';
import { GiMeditation } from 'react-icons/gi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import BlockedModal from '../components/BlockedModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockedUserId, setBlockedUserId] = useState(null);
  const [blockedUsername, setBlockedUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('📤 Отправка логина:', { 
      username: username || 'пусто', 
      password: password ? '***' : 'пусто' 
    });
    
    try {
      const response = await axios.post(`${API_URL}/api/login`, { 
        username: username.trim(), 
        password: password.trim() 
      });
      
      console.log('✅ Ответ:', response.data);
      
      if (response.data.token) {
        login(response.data.token, response.data.username, response.data.userId);
        navigate('/meditation');
      }
    } catch (err) {
      console.error('❌ Ошибка:', err.response?.data);
      
      if (err.response?.status === 403 && err.response?.data?.isBlocked) {
        setBlockReason(err.response.data.blockReason || 'Причина не указана');
        setBlockedUserId(err.response.data.userId);
        setBlockedUsername(username);
        setShowBlockedModal(true);
      } else {
        setError(err.response?.data?.error || 'Ошибка входа. Проверьте данные.');
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowBlockedModal(false);
    setBlockReason('');
    setBlockedUserId(null);
    setBlockedUsername('');
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <Link to="/" className="back-home">
            <FiArrowLeft size={16} />
            На главную
          </Link>
          <div className="logo">
            <div className="logo-icon">
              <GiMeditation size={64} />
            </div>
            <h1>Yoga Practice</h1>
          </div>
          
          <h2>Вход в аккаунт</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <input 
                type="text" 
                id="username"
                placeholder="Имя пользователя" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
              <FiUser className="input-icon" />
            </div>
            <div className="input-wrapper">
              <input 
                type="password" 
                id="password"
                placeholder="Пароль" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <FiLock className="input-icon" />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              <FiLogIn size={18} />
              {loading ? 'Вход...' : 'Войти'}
            </button>
            {error && <div className="error-message">{error}</div>}
          </form>
          
          <p className="auth-link">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>

      <BlockedModal
        isOpen={showBlockedModal}
        onClose={closeModal}
        blockReason={blockReason}
        userId={blockedUserId}
        username={blockedUsername}
      />
    </>
  );
};

export default LoginPage;