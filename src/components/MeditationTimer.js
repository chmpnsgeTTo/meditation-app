import React, { useState, useEffect, useRef } from 'react';
import './MeditationTimer.css';
import AudioGenerator from '../utils/AudioGenerator';

const MeditationTimer = ({ selectedSound, onBack, onSessionComplete }) => {
  const [time, setTime] = useState(300); // 5 minutes default
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime] = useState(300);
  const intervalRef = useRef(null);
  const audioGeneratorRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            setIsRunning(false);
            // Останавливаем реальный аудио файл
            if (audioRef.current) {
              audioRef.current.pause();
            }
            // Останавливаем Web Audio API
            if (audioGeneratorRef.current) {
              audioGeneratorRef.current.stop();
            }
            
            // Отправляем данные о завершенной сессии
            if (onSessionComplete) {
              onSessionComplete({
                duration: initialTime,
                sound: selectedSound?.name,
                completedAt: new Date().toISOString()
              });
            }
            
            alert('🎉 Сессия медитации завершена! Отличная работа!');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, time, initialTime, onSessionComplete, selectedSound?.name]);

  useEffect(() => {
    // Инициализируем аудио генератор
    audioGeneratorRef.current = new AudioGenerator();
    audioGeneratorRef.current.init();

    return () => {
      if (audioGeneratorRef.current) {
        audioGeneratorRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playSelectedSound = async () => {
    if (!selectedSound) return;

    // Сначала пробуем воспроизвести реальный аудио файл
    const soundFileMap = {
      'Капли дождя': 'rain',
      'Под Дождем': 'rain',
      'Шум волн': 'ocean',
      'Под водой': 'ocean',
      'Лес': 'forest',
      'Неистовая природа': 'forest',
      'Тибетская Чаша': 'tibetan-bowl',
      'Дровяной Камин': 'fireplace',
      'Камин': 'fireplace'
    };

    const fileName = soundFileMap[selectedSound.name];
    
    if (fileName && audioRef.current) {
      try {
        // Пробуем разные форматы
        const formats = ['wav', 'mp3', 'ogg'];
        let audioLoaded = false;
        
        for (const format of formats) {
          try {
            audioRef.current.src = `/sounds/${fileName}.${format}`;
            await audioRef.current.load();
            await audioRef.current.play();
            audioLoaded = true;
            console.log(`Воспроизводится реальный файл: ${fileName}.${format}`);
            break;
          } catch (error) {
            console.log(`Файл ${fileName}.${format} не найден`);
          }
        }
        
        if (!audioLoaded) {
          throw new Error('Реальные файлы не найдены');
        }
      } catch (error) {
        console.log('Используется Web Audio API');
        // Если реальный файл не найден, используем Web Audio API
        if (audioGeneratorRef.current) {
          const soundMap = {
            'Капли дождя': 'playRain',
            'Шум волн': 'playOcean',
            'Лес': 'playForest',
            'Тибетская Чаша': 'playBowl',
            'Дровяной Камин': 'playFireplace',
            'Камин': 'playFireplace',
            'Под водой': 'playOcean',
            'Глубокое раздумье': 'playBowl',
            'Неистовая природа': 'playForest',
            'Под Дождем': 'playRain'
          };

          const soundMethod = soundMap[selectedSound.name] || 'playRain';
          if (audioGeneratorRef.current[soundMethod]) {
            audioGeneratorRef.current[soundMethod]();
          }
        }
      }
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    if (selectedSound) {
      playSelectedSound();
    }
  };

  const handlePause = () => {
    setIsRunning(false);
    // Останавливаем реальный аудио файл
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // Останавливаем Web Audio API
    if (audioGeneratorRef.current) {
      audioGeneratorRef.current.stop();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(initialTime);
    // Останавливаем реальный аудио файл
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    // Останавливаем Web Audio API
    if (audioGeneratorRef.current) {
      audioGeneratorRef.current.stop();
    }
  };

  const progress = ((initialTime - time) / initialTime) * 100;

  return (
    <div className="meditation-timer">
      <div className="timer-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2>День 1</h2>
        <button className="close-btn" onClick={onBack}>✕</button>
      </div>

      <div className="timer-content">
        <div className="lesson-info">
          <h1>Основы</h1>
          <p>Момент здесь и сейчас</p>
        </div>

        <div className="timer-circle">
          <svg viewBox="0 0 200 200" className="progress-ring">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              transform="rotate(-90 100 100)"
              className="progress-circle"
            />
          </svg>
          <div className="timer-display">
            <span className="time-text">{formatTime(time)}</span>
          </div>
        </div>

        <div className="timer-controls">
          <button className="control-btn" onClick={() => setTime(Math.max(60, time - 60))}>
            <span>-1м</span>
          </button>
          
          <button className="play-pause-btn" onClick={isRunning ? handlePause : handleStart}>
            {isRunning ? '⏸️' : '▶️'}
          </button>
          
          <button className="control-btn" onClick={() => setTime(time + 60)}>
            <span>+1м</span>
          </button>
        </div>

        <div className="current-time">
          {formatTime(time)}
        </div>

        {selectedSound && (
          <div className="sound-info">
            <p>Фоновая музыка</p>
            <p>{selectedSound.name}</p>
          </div>
        )}

        <button className="reset-btn" onClick={handleReset}>
          Сброс
        </button>
      </div>

      {/* Скрытый аудио элемент для реальных файлов */}
      <audio 
        ref={audioRef}
        loop
        style={{ display: 'none' }}
        preload="none"
      />
    </div>
  );
};

export default MeditationTimer;
