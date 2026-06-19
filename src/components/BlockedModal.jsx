import React, { useState } from 'react';
import { FiAlertCircle, FiMail, FiX, FiSend, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios'; // ← Импортируем настроенный axios

const BlockedModal = ({ isOpen, onClose, blockReason, userId, username }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!message.trim()) {
      setSubmitError('Пожалуйста, напишите сообщение для администратора');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.post('/api/unblock-request', {
        userId: userId,
        username: username,
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

  return (
    <div className="blocked-modal-overlay" onClick={onClose}>
      <div className="blocked-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="blocked-modal-close" onClick={onClose}>
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
              onClick={onClose}
              className="blocked-modal-close-btn"
            >
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedModal;