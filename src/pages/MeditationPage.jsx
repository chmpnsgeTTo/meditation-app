import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { GiMeditation } from 'react-icons/gi';

const API_URL = 'https://chmpnsgetto-meditation-app-5f61.twc1.net';

const MeditationPage = () => {
  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const intervalRef = useRef(null);
  const savedRef = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  const saveSession = async (minutes) => {
    if (!minutes || minutes <= 0) return;
    try {
      await axios.post(`${API_URL}/api/sessions`, 
        { duration: minutes, completed: true },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const playSound = () => {
    new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==').play().catch(() => {});
  };

  const startMeditation = (minutes) => {
    if (isActive) return;
    savedRef.current = false;
    const seconds = minutes * 60;
    setDuration(seconds);
    setRemaining(seconds);
    setIsActive(true);
    setStatus('Медитация... Дышите спокойно');

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1 && !savedRef.current) {
          savedRef.current = true;
          clearInterval(intervalRef.current);
          setIsActive(false);
          setStatus('Медитация завершена, отлично поработал!');
          saveSession(minutes);
          playSound();
          return 0;
        }
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
  };

  const stopMeditation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsActive(false);
    setStatus('Медитация прервана');
    setRemaining(0);
    setShowConfirm(false);
  };

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percent = duration > 0 ? (remaining / duration) * 100 : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="meditation-container">
          <h2 className="meditation-title">
            <GiMeditation size={28} style={{ marginRight: '12px' }} />
            Начни свою практику
          </h2>
          
          <div className="timer-wrapper">
            {/* Анимированные фоновые круги */}
            {isActive && (
              <div className="pulse-circles">
                <div className="pulse-circle delay-1"></div>
                <div className="pulse-circle delay-2"></div>
                <div className="pulse-circle delay-3"></div>
              </div>
            )}

            {/* Основной круговой таймер */}
            <div className="beautiful-timer">
              <svg className="timer-ring" width="280" height="280" viewBox="0 0 280 280">
                {/* Анимированная аура */}
                <circle
                  className="timer-aura"
                  cx="140"
                  cy="140"
                  r="130"
                  fill="url(#auraGradient)"
                  opacity="0"
                />
                
                {/* Фоновый круг */}
                <circle
                  className="timer-bg"
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="8"
                  fill="none"
                />
                
                {/* Прогресс-бар с градиентом */}
                <circle
                  className="timer-progress"
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="url(#timerGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90 140 140)"
                />
                
                {/* Градиенты */}
                <defs>
                  <radialGradient id="auraGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#667eea" stopOpacity="0.3">
                      <animate attributeName="stop-opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="#667eea" stopOpacity="0" />
                  </radialGradient>
                  
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea">
                      <animate attributeName="stop-color" values="#667eea;#764ba2;#667eea" dur="4s" repeatCount="indefinite" />
                    </stop>
                    <stop offset="100%" stopColor="#764ba2">
                      <animate attributeName="stop-color" values="#764ba2;#667eea;#764ba2" dur="4s" repeatCount="indefinite" />
                    </stop>
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Внутреннее свечение */}
              <div className="timer-glow"></div>
              
              {/* Цифры и иконка */}
              <div className="timer-center">
                {!isActive && remaining === 0 ? (
                  <GiMeditation className="meditation-icon" size={64} color="#667eea" />
                ) : (
                  <div className="timer-digits">{formatTime(remaining)}</div>
                )}
              </div>
            </div>

            {/* Кнопки выбора времени */}
            <div className="time-buttons">
              {[5, 10, 15, 20, 30].map(min => (
                <button
                  key={min}
                  onClick={() => startMeditation(min)}
                  className={`time-btn ${isActive ? 'disabled' : ''}`}
                  disabled={isActive}
                >
                  <span className="time-number">{min}</span>
                  <span className="time-unit">мин</span>
                </button>
              ))}
            </div>

            {/* Кнопка остановки */}
            {isActive && (
              <button onClick={() => setShowConfirm(true)} className="stop-meditation-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Остановить
              </button>
            )}

            {/* Статус */}
            {status && (
              <div className={`meditation-status ${isActive ? 'active' : 'completed'}`}>
                {status}
              </div>
            )}
          </div>

          {/* Советы для медитации */}
          <div className="meditation-tips">
            <h3>Советы для медитации</h3>
            <ul>
              <li>Найди тихое место</li>
              <li>Сядь удобно, держи спину прямой</li>
              <li>Сосредоточься на дыхании</li>
              <li>Не осуждай отвлекающие мысли</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения */}
      {showConfirm && (
        <div className="modal show" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Завершить медитацию?</h3>
            <p>Если вы завершите медитацию раньше времени, прогресс не будет засчитан.</p>
            <div className="modal-buttons">
              <button onClick={stopMeditation} className="btn-danger">Да, завершить</button>
              <button onClick={() => setShowConfirm(false)} className="btn-secondary">Продолжить</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeditationPage;