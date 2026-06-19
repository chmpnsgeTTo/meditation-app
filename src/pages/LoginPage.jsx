import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { GiMeditation, GiLotus } from 'react-icons/gi';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import BlockedModal from '../components/BlockedModal';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
      return;
    }
    
    setError('');
    setShowSuccess(false);
    
    if (!username.trim() || !password.trim()) {
      setError('Заполните все поля');
      return;
    }
    
    setIsSubmitting(true);
    submitLock.current = true;
    setLoading(true);
    
    try {
      const response = await api.post('/api/login', { 
        username: username.trim(), 
        password: password.trim() 
      });
      
      if (response.data.token) {
        const result = await login(username.trim(), password.trim());
        
        if (result.success) {
          setShowSuccess(true);
          submitLock.current = false;
          setIsSubmitting(false);
          
          // Небольшая задержка для показа успеха
          setTimeout(() => {
            navigate('/meditation');
          }, 500);
          return;
        } else {
          setError(result.error || 'Ошибка входа');
        }
      }
    } catch (err) {
      console.error('Ошибка входа:', err);
      
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
          
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <GiMeditation size={64} />
            </div>
            <h1 className="auth-title">Yoga Practice</h1>
            <p className="auth-subtitle">
              <GiLotus size={14} />
              Начни свой путь к гармонии
            </p>
          </div>
          
          <h2 className="auth-heading">Вход в аккаунт</h2>
          
          {showSuccess && (
            <div className="auth-success">
              <FiCheckCircle size={18} />
              Вход выполнен успешно!
            </div>
          )}
          
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
                className={error && !username.trim() ? 'input-error' : ''}
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
                className={error && !password.trim() ? 'input-error' : ''}
              />
              <FiLock className="input-icon" />
            </div>
            
            {error && (
              <div className="error-message">
                <FiAlertCircle size={16} />
                {error}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn-primary auth-submit-btn" 
              disabled={isSubmitting || loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Вход...
                </>
              ) : (
                <>
                  <FiLogIn size={18} />
                  Войти
                </>
              )}
            </button>
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