import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { GiMeditation, GiLotus } from 'react-icons/gi';
import { FiClock, FiHeart, FiCheckCircle, FiXCircle, FiInfo, FiTarget, FiWind } from 'react-icons/fi';
import { FaPlay, FaStop, FaPause } from 'react-icons/fa';
import { IoMdTimer } from 'react-icons/io';
import { MdCelebration } from 'react-icons/md';

const MeditationPage = () => {
  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [completedMinutes, setCompletedMinutes] = useState(0);
  const intervalRef = useRef(null);
  const savedRef = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, []);

  const saveSession = async (minutes) => {
    if (!minutes || minutes <= 0) return;
    try {
      await api.post('/api/sessions', 
        { duration: minutes, completed: true },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const playSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,U3RlYWx0aCBzb3VuZA==');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const startMeditation = (minutes) => {
    if (isActive) return;
    savedRef.current = false;
    const seconds = minutes * 60;
    setDuration(seconds);
    setRemaining(seconds);
    setIsActive(true);
    setStatus('Медитация... Дышите спокойно');
    setShowComplete(false);
    setCompletedMinutes(0);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1 && !savedRef.current) {
          savedRef.current = true;
          clearInterval(intervalRef.current);
          setIsActive(false);
          setStatus('Медитация завершена, отлично поработал!');
          setCompletedMinutes(minutes);
          setShowComplete(true);
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
          <div className="meditation-header">
            <h2 className="meditation-title">
              Начни свою практику
            </h2>
            <p className="meditation-subtitle">
              Погрузись в мир спокойствия и гармонии
            </p>
          </div>
          
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
                <circle
                  className="timer-aura"
                  cx="140"
                  cy="140"
                  r="130"
                  fill="url(#auraGradient)"
                  opacity="0"
                />
                
                <circle
                  className="timer-bg"
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="8"
                  fill="none"
                />
                
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
              
              <div className="timer-glow"></div>
              
              <div className="timer-center">
                {!isActive && remaining === 0 && !showComplete ? (
                  <GiMeditation className="meditation-icon" size={64} />
                ) : showComplete ? (
                  <div className="timer-complete">
                    <MdCelebration size={48} />
                    <span className="timer-complete-text">Готово!</span>
                  </div>
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
                <FaStop size={16} />
                Остановить
              </button>
            )}

            {/* Статус */}
            {status && (
              <div className={`meditation-status ${isActive ? 'active' : 'completed'}`}>
                {isActive ? (
                  <FiHeart size={16} />
                ) : (
                  <FiCheckCircle size={16} />
                )}
                {status}
              </div>
            )}
          </div>

          {/* Советы для медитации */}
          <div className="meditation-tips">
            <h3>
              <FiInfo size={18} />
              Советы для медитации
            </h3>
            <ul>
              <li>
                Найди тихое место
              </li>
              <li>
                Сядь удобно, держи спину прямой
              </li>
              <li>
                Сосредоточься на дыхании
              </li>
              <li>
                Не осуждай отвлекающие мысли
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения */}
      {showConfirm && (
        <div className="modal show" onClick={() => setShowConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FiXCircle size={20} color="#e53e3e" />
                Завершить медитацию?
              </h3>
              <button className="modal-close" onClick={() => setShowConfirm(false)}>
                <FiXCircle size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p>Если вы завершите медитацию раньше времени, прогресс не будет засчитан.</p>
            </div>
            <div className="modal-buttons">
              <button onClick={stopMeditation} className="btn-danger">
                <FaStop size={14} />
                Да, завершить
              </button>
              <button onClick={() => setShowConfirm(false)} className="btn-secondary">
                <FiClock size={14} />
                Продолжить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно завершения */}
      {showComplete && (
        <div className="modal show" onClick={() => setShowComplete(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title-success">
                <MdCelebration size={24} />
                Медитация завершена!
              </h3>
              <button className="modal-close" onClick={() => setShowComplete(false)}>
                <FiXCircle size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="completion-summary">
                <div className="completion-icon">
                  <GiMeditation size={48} />
                </div>
                <p className="completion-text">
                  Вы успешно завершили медитацию на <strong>{completedMinutes}</strong> минут!
                </p>
                <p className="completion-subtext">
                  <FiHeart size={14} />
                  Отличная работа! Продолжайте в том же духе.
                </p>
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowComplete(false)} className="btn-primary">
                <FiCheckCircle size={14} />
                Отлично!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeditationPage;