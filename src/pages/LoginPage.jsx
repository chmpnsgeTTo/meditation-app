import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn, FiArrowLeft, FiAlertCircle, FiMail, FiSend, FiCheckCircle, FiX } from 'react-icons/fi';
import { GiMeditation } from 'react-icons/gi';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Состояния для модального окна блокировки
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockedUserId, setBlockedUserId] = useState(null);
  const [blockedUsername, setBlockedUsername] = useState('');

  // Состояния для формы отправки запроса
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/login`, { username, password });
      
      if (response.data.token) {
        login(response.data.token, response.data.username, response.data.userId);
        navigate('/meditation');
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
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!message.trim()) {
      setSubmitError('Пожалуйста, напишите сообщение для администратора');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await axios.post(`${API_URL}/api/unblock-request`, {
        userId: blockedUserId,
        username: blockedUsername,
        email: email || null,
        message: message.trim()
      });
      
      setIsSubmitted(true);
    } catch (err) {
      console.error('Ошибка отправки запроса:', err);
      setSubmitError(err.response?.data?.error || 'Ошибка отправки запроса. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactAdmin = () => {
    const subject = encodeURIComponent('Запрос на разблокировку аккаунта');
    const body = encodeURIComponent(
      'Здравствуйте! Мой аккаунт был заблокирован.\n\n' +
      'Причина блокировки: ' + (blockReason || 'Не указана') + '\n\n' +
      'Прошу рассмотреть возможность разблокировки.\n\n' +
      'С уважением, пользователь.'
    );
    window.location.href = `mailto:support@meditation-app.tw1.ru?subject=${subject}&body=${body}`;
  };

  const closeModal = () => {
    setShowBlockedModal(false);
    setBlockReason('');
    setBlockedUserId(null);
    setBlockedUsername('');
    setEmail('');
    setMessage('');
    setIsSubmitted(false);
    setSubmitError('');
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

      {/* ========== МОДАЛЬНОЕ ОКНО БЛОКИРОВКИ ========== */}
      {showBlockedModal && (
        <div className="blocked-modal-overlay" onClick={closeModal}>
          <div className="blocked-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="blocked-modal-close" onClick={closeModal}>
              <FiX size={24} />
            </button>

            {!isSubmitted ? (
              <>
                <div className="blocked-modal-icon">
                  <div className="blocked-modal-icon-wrapper">
                    <FiAlertCircle size={40} color="#e53e3e" />
                  </div>
                </div>

                <h2 className="blocked-modal-title">Аккаунт заблокирован</h2>

                <div className="blocked-modal-reason">
                  <p className="blocked-modal-reason-label">Причина блокировки:</p>
                  <p className="blocked-modal-reason-text">{blockReason || 'Причина не указана'}</p>
                </div>

                <p className="blocked-modal-description">
                  Для разблокировки аккаунта отправьте запрос администратору.
                </p>

                <form onSubmit={handleSubmitRequest}>
                  <div className="blocked-modal-field">
                    <label className="blocked-modal-label">
                      Ваш email (необязательно):
                    </label>
                    <input
                      type="email"
                      className="blocked-modal-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.ru"
                    />
                  </div>

                  <div className="blocked-modal-field">
                    <label className="blocked-modal-label">
                      Сообщение администратору <span className="blocked-modal-required">*</span>:
                    </label>
                    <textarea
                      className="blocked-modal-textarea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Опишите причину, по которой вы хотите разблокировать аккаунт..."
                      required
                    />
                  </div>

                  {submitError && (
                    <div className="blocked-modal-error">{submitError}</div>
                  )}

                  <button
                    type="submit"
                    className="blocked-modal-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner"></span>
                        Отправка...
                      </>
                    ) : (
                      <>
                        <FiSend size={18} />
                        Отправить запрос
                      </>
                    )}
                  </button>
                </form>

                <div className="blocked-modal-divider">
                  <hr />
                  <span>или</span>
                  <hr />
                </div>

                <button
                  onClick={handleContactAdmin}
                  className="blocked-modal-email-btn"
                >
                  <FiMail size={18} />
                  Написать на почту
                </button>
              </>
            ) : (
              <div className="blocked-modal-success">
                <div className="blocked-modal-success-icon">
                  <FiCheckCircle size={40} color="#48bb78" />
                </div>

                <h2 className="blocked-modal-success-title">Запрос отправлен!</h2>

                <p className="blocked-modal-success-text">
                  Администратор рассмотрит ваш запрос и свяжется с вами.
                </p>

                <button
                  onClick={closeModal}
                  className="blocked-modal-close-btn"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;