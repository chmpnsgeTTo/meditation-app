import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { GiMeditation } from 'react-icons/gi';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(username, password);
    
    if (result.success) {
      navigate('/meditation');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="back-home">
          <FiArrowLeft size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
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
            <FiLogIn size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {loading ? 'Вход...' : 'Войти'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
        
        <p className="auth-link">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;