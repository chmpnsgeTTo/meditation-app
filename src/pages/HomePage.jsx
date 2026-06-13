import React from 'react';
import { Link } from 'react-router-dom';
import { GiMeditation } from 'react-icons/gi';      // ← вместо GiYoga
import { FaChartLine, FaCalendarCheck, FaClock } from 'react-icons/fa';

const HomePage = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="logo">
          <div className="logo-icon">
            <GiMeditation size={80} />
          </div>
          <h1>Yoga Practice</h1>
        </div>
        
        <p className="tagline">Твой маленький помощник в мире медитаций :3</p>
        
        <div className="features">
          <div className="feature">
            <FaChartLine size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            <span>Персональная статистика</span>
          </div>
          <div className="feature">
            <FaCalendarCheck size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            <span>Отслеживание прогресса</span>
          </div>
          <div className="feature">
            <FaClock size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            <span>Удобный таймер</span>
          </div>
        </div>
        
        <div className="auth-buttons">
          <Link to="/login" className="btn-primary">Войти</Link>
          <Link to="/register" className="btn-secondary">Регистрация</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;