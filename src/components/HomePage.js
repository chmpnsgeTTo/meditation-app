import React from 'react';
import './HomePage.css';
import DailyQuote from './DailyQuote';

const HomePage = ({ onNavigate, onAuthClick, user }) => {
  return (
    <div className="home-page">
      <div className="header">
        <div className="profile-section">
          <div className="avatar" onClick={() => user ? onNavigate('profile') : onAuthClick('login')}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              <span className="avatar-text">
                {user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '👤'}
              </span>
            )}
          </div>
          <div className="greeting">
            <h2>Добрый день</h2>
            <p>{user ? user.name : 'Гость'}</p>
            {!user && (
              <button className="auth-hint" onClick={() => onAuthClick('login')}>
                Войти в аккаунт
              </button>
            )}
          </div>
          <div className="icons">
            <span className="notification-icon">🔔</span>
            <span className="heart-icon">❤️</span>
          </div>
        </div>
      </div>

      <DailyQuote />

      <div className="main-card">
        <div className="meditation-card">
          <div className="card-overlay">
            <div className="card-content">
              <span className="bell-icon">🔔</span>
              <div className="card-text">
                <h3>Моя следующая медитация:</h3>
                <p>Пятница, 20:27</p>
              </div>
            </div>
            <button className="play-button" onClick={() => onNavigate('timer')}>
              ▶️
            </button>
          </div>
          <div className="progress-section">
            <h3>Дыхание</h3>
            <p>0% завершено</p>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="action-btn blue" onClick={() => onNavigate('notes')}>
          <span>🗒️</span>
          <div>
            <p>Сделать заметку</p>
            <small>Как ты себя чувствуешь сегодня?</small>
          </div>
        </button>
        <button className="action-btn purple" onClick={() => onNavigate('explore')}>
          <span>✨</span>
          <div>
            <p>Позитивные новости</p>
            <p>Вдохновляющие истории</p>
            <small>🌟 Узнай что-то хорошее</small>
          </div>
        </button>
      </div>

      <div className="bottom-section">
        <h3>Главная</h3>
        <div className="main-image"></div>
      </div>

      <div className="bottom-nav">
        <div className="nav-item active">
          <span>🏠</span>
          <p>Сегодня</p>
        </div>
        <div className="nav-item" onClick={() => onNavigate('explore')}>
          <span>📊</span>
          <p>Исследуй</p>
        </div>
        <div className="nav-item" onClick={() => onNavigate('yoga')}>
          <span>🧘‍♀️</span>
          <p>Йога</p>
        </div>
        <div className="nav-item" onClick={() => onNavigate('sounds')}>
          <span>🎵</span>
          <p>Музыка</p>
        </div>
        <div className="nav-item" onClick={() => user ? onNavigate('profile') : onAuthClick('login')}>
          <span>👤</span>
          <p>Профиль</p>
        </div>
      </div>

      <div className="author-credit">
        <p>Сделано с ❤️ by Смотров Вячеслав ИС43/9 </p>
      </div>
    </div>
  );
};

export default HomePage;
