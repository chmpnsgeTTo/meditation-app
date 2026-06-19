import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn, FiArrowLeft } from 'react-icons/fi';
import { GiMeditation } from 'react-icons/gi';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios'; // ← Импортируем настроенный axios
import BlockedModal from '../components/BlockedModal';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockedUserId, setBlockedUserId] = useState(null);
  const [blockedUsername, setBlockedUsername] = useState('');

  const submitLock = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting || submitLock.current) {
      console.log('⛔ Предотвращена повторная отправка');
      return;
    }
    
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }
    
    setIsSubmitting(true);
    submitLock.current = true;
    setLoading(true);
    
    console.log('📤 Отправка логина:', { 
      username: username.trim(), 
      password: password ? '***' : 'пусто' 
    });
    
    try {
      // Используем api вместо axios
      const response = await api.post('/api/login', { 
        username: username.trim(), 
        password: password.trim() 
      });
      
      console.log('✅ Ответ сервера:', response.data);
      
      if (response.data.token) {
        login(response.data.token, response.data.username, response.data.userId);
        submitLock.current = false;
        setIsSubmitting(false);
        navigate('/meditation');
        return;
      }
    } catch (err) {
      console.error('❌ Ошибка входа:', err);
      
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
      setTimeout(() => {
        setIsSubmitting(false);
        submitLock.current = false;
      }, 500);
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
          
          <form onSubmit={handleSubmit} noValidate>
            <div className="input-wrapper">
              <input 
                type="text" 
                id="username"
                placeholder="Имя пользователя" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                required 
                autoComplete="username"
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
                disabled={isSubmitting}
                required 
                autoComplete="current-password"
              />
              <FiLock className="input-icon" />
            </div>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitting || loading}
            >
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