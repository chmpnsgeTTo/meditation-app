import React from 'react';
import { Link } from 'react-router-dom';
import { GiMeditation, GiLotus } from 'react-icons/gi';
import { FaChartLine, FaCalendarCheck, FaClock } from 'react-icons/fa';
import { FiArrowRight, FiChevronRight } from 'react-icons/fi';

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-logo">
          <div className="home-logo-icon">
            <GiMeditation size={80} />
          </div>
          <h1 className="home-title">Yoga Practice</h1>
          <p className="home-tagline">
            Твой маленький помощник в мире медитаций
            <GiLotus size={18} className="home-tagline-icon" />
          </p>
        </div>
        
        <div className="home-features">
          <div className="home-feature">
            <div className="home-feature-icon">
              <FaChartLine size={20} />
            </div>
            <span>Персональная статистика</span>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">
              <FaCalendarCheck size={20} />
            </div>
            <span>Отслеживание прогресса</span>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon">
              <FaClock size={20} />
            </div>
            <span>Удобный таймер</span>
          </div>
        </div>
        
        <div className="home-buttons">
          <Link to="/login" className="btn-primary">
            Войти
            <FiArrowRight />
          </Link>
          <Link to="/register" className="btn-secondary">
            Регистрация
            <FiChevronRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;