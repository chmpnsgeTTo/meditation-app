import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { 
  FiBookOpen, 
  FiClock, 
  FiStar, 
  FiUsers, 
  FiAward,
  FiFilter,
  FiChevronRight,
  FiTrendingUp,
  FiBarChart2,
  FiCheckCircle,
  FiCalendar,
  FiTarget,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { GiMeditation, GiLotus, GiSittingDog, GiSnake, GiLungs } from 'react-icons/gi';

const CoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('Все');

  const difficultyLevels = ['Все', 'Начинающий', 'Средний', 'Продвинутый'];

  // Массив цветов для карточек
  const cardColors = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: <GiMeditation size={48} /> },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: <GiLotus size={48} /> },
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: <GiSittingDog size={48} /> },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: <GiSnake size={48} /> },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: <GiLungs size={48} /> },
    { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', icon: <GiHealing size={48} /> },
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/courses', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('✅ Загружено курсов:', data.length);
      setCourses(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки курсов:', err);
      setError(err.response?.data?.error || 'Ошибка загрузки курсов');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colorMap = {
      'Начинающий': '#48bb78',
      'Средний': '#f6ad55',
      'Продвинутый': '#fc8181'
    };
    return colorMap[difficulty] || '#667eea';
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'Все') return true;
    return course.difficulty === filter;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="courses-loading">
            <div className="courses-loading-spinner">
              <GiMeditation size={48} className="spinning" />
            </div>
            <p>Загрузка курсов...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="courses-container">
            <div className="courses-error">
              <FiAlertCircle size={48} />
              <h3>Ошибка загрузки</h3>
              <p>{error}</p>
              <button onClick={fetchCourses} className="btn-primary">
                <FiRefreshCw size={16} />
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="courses-container">
          <div className="courses-header">
            <h1>
              <FiBookOpen size={28} style={{ marginRight: '12px', color: '#667eea' }} />
              Выберите курс и начните свое обучение
            </h1>
            <p className="courses-subtitle">
              Изучайте йогу с нуля или углубляйте свою практику с опытными наставниками
            </p>
          </div>

          {/* Фильтр категорий */}
          <div className="courses-filters">
            <div className="courses-filters-header">
              <FiFilter size={16} />
              <span>Сложность:</span>
            </div>
            <div className="courses-filters-list">
              {difficultyLevels.map(level => (
                <button
                  key={level}
                  className={`courses-filter-btn ${filter === level ? 'active' : ''}`}
                  onClick={() => setFilter(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Результаты */}
          {filteredCourses.length === 0 ? (
            <div className="courses-empty">
              <FiBookOpen size={48} />
              <h3>Курсы не найдены</h3>
              <p>Попробуйте выбрать другой фильтр</p>
              <button 
                className="btn-secondary" 
                onClick={() => setFilter('Все')}
              >
                <FiRefreshCw size={16} />
                Сбросить фильтр
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course, index) => {
                const colorIndex = index % cardColors.length;
                return (
                  <Link
                    to={`/courses/${course.id}`}
                    key={course.id}
                    className="course-card"
                  >
                    <div className="course-card-image-wrapper">
                      <div 
                        className="course-card-image"
                        style={{
                          background: cardColors[colorIndex].bg,
                        }}
                      >
                        <div className="course-card-image-icon">
                          {cardColors[colorIndex].icon}
                        </div>
                        <div className="course-card-image-overlay">
                          <span className="course-card-badge">{course.difficulty || 'Общий'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="course-card-content">
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      
                      <div className="course-card-meta">
                        <span 
                          className="course-card-difficulty"
                          style={{
                            backgroundColor: getDifficultyColor(course.difficulty) + '20',
                            color: getDifficultyColor(course.difficulty)
                          }}
                        >
                          {course.difficulty || 'Не указан'}
                        </span>
                        <span className="course-card-lessons">
                          {course.total_lessons || 0} уроков
                        </span>
                        {course.duration && (
                          <span className="course-card-duration">
                            {course.duration} мин
                          </span>
                        )}
                      </div>
                      
                      <div className="course-card-footer">
                        <span className="course-card-read-more">
                          Начать обучение
                          <FiChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursesPage;