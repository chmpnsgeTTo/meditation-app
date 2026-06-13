import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Timer = () => {
  const [duration, setDuration] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && remaining > 0) {
      interval = setInterval(() => {
        setRemaining(prev => {
          const newRemaining = prev - 1;
          const newProgress = ((duration - newRemaining) / duration) * 100;
          setProgress(newProgress);
          
          if (newRemaining <= 0) {
            setIsActive(false);
            saveSession();
            playSound();
          }
          return newRemaining;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, remaining, duration]);

  const startMeditation = (minutes) => {
    const seconds = minutes * 60;
    setDuration(seconds);
    setRemaining(seconds);
    setIsActive(true);
    setProgress(0);
  };

  const saveSession = async () => {
    const minutes = Math.floor(duration / 60);
    try {
      await axios.post('/api/sessions', 
        { duration: minutes, completed: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const playSound = () => {
    const audio = new Audio('/sounds/bell.mp3');
    audio.play().catch(e => console.log('Звук не воспроизведен'));
  };

  return (
    <div className="timer-section">
      <div className="timer-display">{formatTime(remaining)}</div>
      
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      
      <div className="timer-buttons">
        {[5, 10, 15, 20, 30].map(min => (
          <button 
            key={min}
            onClick={() => startMeditation(min)} 
            className="time-btn"
            disabled={isActive}
          >
            {min} мин
          </button>
        ))}
      </div>
      
      {isActive && (
        <button 
          onClick={() => setIsActive(false)} 
          className="stop-btn"
        >
          Остановить
        </button>
      )}
    </div>
  );
};

export default Timer;