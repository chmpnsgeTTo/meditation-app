import React, { useState } from 'react';
import './YogaExercises.css';

const YogaExercises = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('yogaFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [practiceTimer, setPracticeTimer] = useState(null);

  const yogaCategories = [
    { id: 'all', name: 'Все', icon: '🧘‍♀️' },
    { id: 'morning', name: 'Утренняя', icon: '🌅' },
    { id: 'evening', name: 'Вечерняя', icon: '🌙' },
    { id: 'beginner', name: 'Для начинающих', icon: '🌱' },
    { id: 'advanced', name: 'Продвинутая', icon: '💪' },
    { id: 'relaxation', name: 'Расслабление', icon: '😌' }
  ];

  const yogaExercises = [
    {
      id: 1,
      name: 'Приветствие солнцу',
      category: 'morning',
      duration: '10 мин',
      difficulty: 'Начальный',
      description: 'Классическая последовательность асан для пробуждения тела и энергии',
      benefits: ['Улучшает гибкость', 'Повышает энергию', 'Укрепляет мышцы'],
      poses: [
        'Поза молитвы (Пранамасана)',
        'Поза поднятых рук (Хастауттанасана)',
        'Поза наклона вперед (Падахастасана)',
        'Поза всадника (Ашва Санчаланасана)',
        'Поза горы (Парватасана)',
        'Поза восьми точек (Аштанга Намаскара)',
        'Поза кобры (Бхуджангасана)'
      ],
      icon: '☀️'
    },
    {
      id: 2,
      name: 'Поза дерева',
      category: 'beginner',
      duration: '5 мин',
      difficulty: 'Начальный',
      description: 'Асана для развития баланса и концентрации',
      benefits: ['Улучшает равновесие', 'Укрепляет ноги', 'Развивает концентрацию'],
      poses: [
        'Встаньте прямо, ноги вместе',
        'Согните правую ногу и поставьте стопу на внутреннюю сторону левого бедра',
        'Соедините ладони перед грудью',
        'Дышите глубоко и удерживайте позу',
        'Повторите на другую ногу'
      ],
      icon: '🌳'
    },
    {
      id: 3,
      name: 'Поза ребенка',
      category: 'relaxation',
      duration: '3 мин',
      difficulty: 'Начальный',
      description: 'Восстанавливающая поза для расслабления и отдыха',
      benefits: ['Снимает стресс', 'Расслабляет спину', 'Успокаивает ум'],
      poses: [
        'Встаньте на колени',
        'Сядьте на пятки',
        'Наклонитесь вперед, вытянув руки',
        'Положите лоб на пол',
        'Дышите глубоко и расслабьтесь'
      ],
      icon: '👶'
    },
    {
      id: 4,
      name: 'Поза кошки-коровы',
      category: 'beginner',
      duration: '5 мин',
      difficulty: 'Начальный',
      description: 'Динамическая последовательность для мобилизации позвоночника',
      benefits: ['Улучшает гибкость позвоночника', 'Массирует органы', 'Снимает напряжение'],
      poses: [
        'Встаньте на четвереньки',
        'Прогните спину, поднимите голову (поза коровы)',
        'Округлите спину, опустите голову (поза кошки)',
        'Плавно переходите между позами',
        'Синхронизируйте с дыханием'
      ],
      icon: '🐱'
    },
    {
      id: 5,
      name: 'Поза воина I',
      category: 'advanced',
      duration: '8 мин',
      difficulty: 'Средний',
      description: 'Мощная поза для укрепления ног и развития стабильности',
      benefits: ['Укрепляет ноги', 'Улучшает баланс', 'Раскрывает грудь'],
      poses: [
        'Встаньте в широкий выпад',
        'Поверните заднюю стопу под углом 45°',
        'Согните переднее колено под прямым углом',
        'Поднимите руки вверх',
        'Удерживайте позу, затем смените сторону'
      ],
      icon: '⚔️'
    },
    {
      id: 6,
      name: 'Скручивание сидя',
      category: 'evening',
      duration: '7 мин',
      difficulty: 'Средний',
      description: 'Мягкое скручивание для детоксикации и расслабления',
      benefits: ['Улучшает пищеварение', 'Массирует органы', 'Снимает напряжение в спине'],
      poses: [
        'Сядьте с прямой спиной',
        'Согните правую ногу и поставьте стопу за левое колено',
        'Поверните корпус вправо',
        'Левой рукой обхватите правое колено',
        'Дышите глубоко, затем смените сторону'
      ],
      icon: '🌀'
    },
    {
      id: 7,
      name: 'Поза лотоса',
      category: 'advanced',
      duration: '15 мин',
      difficulty: 'Продвинутый',
      description: 'Классическая медитативная поза для глубокой практики',
      benefits: ['Улучшает осанку', 'Успокаивает ум', 'Развивает гибкость бедер'],
      poses: [
        'Сядьте со скрещенными ногами',
        'Положите правую стопу на левое бедро',
        'Положите левую стопу на правое бедро',
        'Выпрямите спину',
        'Положите руки на колени'
      ],
      icon: '🪷'
    },
    {
      id: 8,
      name: 'Поза трупа',
      category: 'relaxation',
      duration: '10 мин',
      difficulty: 'Начальный',
      description: 'Завершающая поза для глубокого расслабления',
      benefits: ['Полное расслабление', 'Снижает стресс', 'Восстанавливает энергию'],
      poses: [
        'Лягте на спину',
        'Руки вдоль тела, ладони вверх',
        'Ноги слегка разведены',
        'Закройте глаза',
        'Расслабьте все мышцы тела'
      ],
      icon: '💀'
    }
  ];

  const filteredExercises = selectedCategory === 'all' 
    ? yogaExercises 
    : yogaExercises.filter(exercise => exercise.category === selectedCategory);

  const startExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  const closeExerciseDetail = () => {
    setSelectedExercise(null);
    setIsTimerMode(false);
    if (practiceTimer) {
      clearInterval(practiceTimer);
      setPracticeTimer(null);
    }
  };

  const toggleFavorite = (exerciseId) => {
    const newFavorites = favorites.includes(exerciseId)
      ? favorites.filter(id => id !== exerciseId)
      : [...favorites, exerciseId];
    
    setFavorites(newFavorites);
    localStorage.setItem('yogaFavorites', JSON.stringify(newFavorites));
  };

  const startPractice = (exercise) => {
    setIsTimerMode(true);
    
    // Простая имитация таймера практики
    const duration = parseInt(exercise.duration) * 60; // конвертируем минуты в секунды
    let timeLeft = duration;
    
    const timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timer);
        setPracticeTimer(null);
        setIsTimerMode(false);
        alert(`Практика "${exercise.name}" завершена! 🧘‍♀️`);
      }
    }, 1000);
    
    setPracticeTimer(timer);
  };

  if (selectedExercise) {
    return (
      <div className="yoga-exercise-detail">
        <div className="exercise-header">
          <button className="back-button" onClick={closeExerciseDetail}>
            ← Назад
          </button>
          <h1>{selectedExercise.name}</h1>
          <div className="exercise-meta">
            <span className="duration">{selectedExercise.duration}</span>
            <span className="difficulty">{selectedExercise.difficulty}</span>
          </div>
        </div>

        <div className="exercise-content">
          <div className="exercise-icon">
            {selectedExercise.icon}
          </div>
          
          <div className="exercise-description">
            <p>{selectedExercise.description}</p>
          </div>

          <div className="exercise-benefits">
            <h3>Польза:</h3>
            <ul>
              {selectedExercise.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </div>

          <div className="exercise-poses">
            <h3>Пошаговая инструкция:</h3>
            <ol>
              {selectedExercise.poses.map((pose, index) => (
                <li key={index}>{pose}</li>
              ))}
            </ol>
          </div>

          <div className="exercise-actions">
            <button 
              className="start-exercise-btn"
              onClick={() => startPractice(selectedExercise)}
              disabled={isTimerMode}
            >
              {isTimerMode ? 'Практика идет... ⏰' : 'Начать практику ▶️'}
            </button>
            <button 
              className="favorite-btn"
              onClick={() => toggleFavorite(selectedExercise.id)}
            >
              {favorites.includes(selectedExercise.id) ? '💖 Убрать из избранного' : '❤️ В избранное'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="yoga-exercises">
      <div className="yoga-header">
        <button className="back-button" onClick={onBack}>
          ← Назад
        </button>
        <h1>Упражнения йоги</h1>
        <div className="yoga-subtitle">
          Найди гармонию тела и духа 🧘‍♀️
        </div>
      </div>

      <div className="yoga-categories">
        {yogaCategories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="yoga-grid">
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className={`yoga-card ${favorites.includes(exercise.id) ? 'favorite' : ''}`}>
            <div className="card-header">
              <div className="exercise-icon">{exercise.icon}</div>
              <div className="card-meta">
                <span className="duration">{exercise.duration}</span>
                <span className="difficulty">{exercise.difficulty}</span>
                {favorites.includes(exercise.id) && <span className="favorite-indicator">💖</span>}
              </div>
            </div>
            
            <div className="card-content">
              <h3>{exercise.name}</h3>
              <p>{exercise.description}</p>
              
              <div className="benefits-preview">
                <span>💚 {exercise.benefits[0]}</span>
              </div>
            </div>
            
            <div className="card-actions">
              <button 
                className="start-btn"
                onClick={() => startExercise(exercise)}
              >
                Подробнее
              </button>
              <button className="quick-start-btn">
                ▶️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="yoga-tips">
        <div className="tip-card">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <h3>Совет дня</h3>
            <p>Начинайте практику йоги с 5-10 минут в день. Регулярность важнее продолжительности!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YogaExercises;
