import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiUserPlus, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { GiMeditation, GiLotus } from 'react-icons/gi';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowSuccess(false);
    
    if (username.length < 3) {
      setError('Имя пользователя должно быть минимум 3 символа');
      return;
    }
    
    if (password.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    const result = await register(username, password);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } else {
      setError(result.error || 'Ошибка регистрации');
    }
    setLoading(false);
  };

  return (
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
        
        <h2 className="auth-heading">Создать аккаунт</h2>
        
        {showSuccess && (
          <div className="auth-success">
            <FiCheckCircle size={18} />
            Регистрация успешна! Перенаправление...
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder="Имя пользователя (мин. 3 символа)" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              disabled={loading}
              className={error && !username ? 'input-error' : ''}
            />
            <FiUser className="input-icon" />
          </div>
          
          <div className="input-wrapper">
            <input 
              type="password" 
              placeholder="Пароль (мин. 6 символов)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={loading}
              className={error && !password ? 'input-error' : ''}
            />
            <FiLock className="input-icon" />
          </div>
          
          <div className="input-wrapper">
            <input 
              type="password" 
              placeholder="Подтвердите пароль" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              disabled={loading}
              className={error && confirmPassword && password !== confirmPassword ? 'input-error' : ''}
            />
            <FiCheckCircle className="input-icon" />
          </div>
          
          {error && (
            <div className="error-message">
              <FiAlertCircle size={16} />
              {error}
            </div>
          )}
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Регистрация...
              </>
            ) : (
              <>
                <FiUserPlus size={18} />
                Зарегистрироваться
              </>
            )}
          </button>
        </form>
        
        <p className="auth-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;