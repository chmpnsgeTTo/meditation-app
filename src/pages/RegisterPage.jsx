import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiUserPlus, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { GiMeditation } from 'react-icons/gi';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
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
      navigate('/login');
    } else {
      setError(result.error);
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
        <div className="logo">
          <div className="logo-icon">
            <GiMeditation size={64} />
          </div>
          <h1>Yoga Practice</h1>
        </div>
        
        <h2>Создать аккаунт</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input 
              type="text" 
              placeholder="Имя пользователя (мин. 3 символа)" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
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
            />
            <FiCheckCircle className="input-icon" />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <FiUserPlus size={18} />
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
        
        <p className="auth-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;