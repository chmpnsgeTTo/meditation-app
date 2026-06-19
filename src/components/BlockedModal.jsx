import React from 'react';
import { FiAlertCircle, FiMail, FiX } from 'react-icons/fi';

const BlockedModal = ({ isOpen, onClose, blockReason }) => {
  if (!isOpen) return null;

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
          Для разблокировки аккаунта необходимо связаться с администратором.
        </p>

        <button onClick={handleContactAdmin} className="blocked-modal-contact-btn">
          <FiMail size={18} />
          Связаться с администратором
        </button>

        <p className="blocked-modal-email-hint">
          Или напишите на почту: support@meditation-app.tw1.ru
        </p>
      </div>
    </div>
  );
};

export default BlockedModal;