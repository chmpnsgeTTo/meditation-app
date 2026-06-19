import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
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
  FiTarget
} from 'react-icons/fi';
import { GiMeditation, GiLotus, GiSittingDog } from 'react-icons/gi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/courses`, {
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

  const getDifficultyBadge = (difficulty) => {
    const labelMap = {
      'Начинающий': '🌱 Начинающий',
      'Средний': '📘 Средний',
      'Продвинутый': '🔥 Продвинутый'
    };
    return labelMap[difficulty] || difficulty;
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.difficulty === filter;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
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
              <FiBookOpen size={48} color="#e53e3e" />
              <h3>Ошибка загрузки</h3>
              <p>{error}</p>
              <button onClick={fetchCourses} className="btn-primary">
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
              <FiBookOpen size={28} />
              Выберите курс и начните свое обучение
            </h1>
            <p className="courses-subtitle">
              Изучайте йогу с нуля или углубляйте свою практику с опытными наставниками
            </p>
          </div>

          <div className="courses-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Все
            </button>
            <button
              className={`filter-btn ${filter === 'Начинающий' ? 'active' : ''}`}
              onClick={() => setFilter('Начинающий')}
              style={filter === 'Начинающий' ? { background: '#48bb78', color: 'white' } : {}}
            >
              Начинающий
            </button>
            <button
              className={`filter-btn ${filter === 'Средний' ? 'active' : ''}`}
              onClick={() => setFilter('Средний')}
              style={filter === 'Средний' ? { background: '#f6ad55', color: 'white' } : {}}
            >
              Средний
            </button>
            <button
              className={`filter-btn ${filter === 'Продвинутый' ? 'active' : ''}`}
              onClick={() => setFilter('Продвинутый')}
              style={filter === 'Продвинутый' ? { background: '#fc8181', color: 'white' } : {}}
            >
              Продвинутый
            </button>
          </div>

          <div className="courses-stats">
            <div className="courses-stat">
              <FiBarChart2 size={18} />
              <span>Всего курсов: {courses.length}</span>
            </div>
            <div className="courses-stat">
              <FiTrendingUp size={18} />
              <span>Показано: {filteredCourses.length}</span>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="courses-empty">
              <FiBookOpen size={48} />
              <h3>Курсы не найдены</h3>
              <p>Попробуйте выбрать другой фильтр</p>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map(course => (
                <Link
                  to={`/courses/${course.id}`}
                  key={course.id}
                  className="course-card"
                >
                  <div className="course-card-image">
                    <GiMeditation size={48} color="#667eea" />
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
                        {getDifficultyBadge(course.difficulty)}
                      </span>
                      <span className="course-card-lessons">
                        <FiBookOpen size={14} />
                        {course.total_lessons || 0} уроков
                      </span>
                    </div>
                    <div className="course-card-footer">
                      <span className="course-card-read-more">
                        Начать обучение
                        <FiChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursesPage;