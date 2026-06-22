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
  FiFeather,
  FiLayers,
  FiZap,
  FiAlertCircle,
  FiRefreshCw,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { GiMeditation, GiLotus, GiSittingDog } from 'react-icons/gi';
import { FaUserGraduate, FaBookOpen } from 'react-icons/fa';
import { IoTimeOutline } from 'react-icons/io5';

const CoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

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
      setCourses(data);
    } catch (err) {
      console.error('Ошибка загрузки курсов:', err);
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

  const getDifficultyIcon = (difficulty) => {
    const iconMap = {
      'Начинающий': <FiFeather size={14} />,
      'Средний': <FiLayers size={14} />,
      'Продвинутый': <FiZap size={14} />
    };
    return iconMap[difficulty] || <FiStar size={14} />;
  };

  const getDifficultyBadge = (difficulty) => {
    const labelMap = {
      'Начинающий': 'Начинающий',
      'Средний': 'Средний',
      'Продвинутый': 'Продвинутый'
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
            <div className="courses-header-content">
              <h1>
                Выберите курс и начните свое обучение
              </h1>
              <p className="courses-subtitle">
                Изучайте йогу с нуля или углубляйте свою практику с опытными наставниками
              </p>
            </div>
            <div className="courses-header-actions">
              <div className="view-controls">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Сетка"
                >
                  <FiGrid size={18} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="Список"
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="courses-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <FiGrid size={14} />
              Все
            </button>
            <button
              className={`filter-btn ${filter === 'Начинающий' ? 'active' : ''}`}
              onClick={() => setFilter('Начинающий')}
            >
              <FiFeather size={14} />
              Начинающий
            </button>
            <button
              className={`filter-btn ${filter === 'Средний' ? 'active' : ''}`}
              onClick={() => setFilter('Средний')}
            >
              <FiLayers size={14} />
              Средний
            </button>
            <button
              className={`filter-btn ${filter === 'Продвинутый' ? 'active' : ''}`}
              onClick={() => setFilter('Продвинутый')}
            >
              <FiZap size={14} />
              Продвинутый
            </button>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="courses-empty">
              <FiBookOpen size={48} />
              <h3>Курсы не найдены</h3>
              <p>Попробуйте выбрать другой фильтр</p>
              <button 
                className="btn-secondary" 
                onClick={() => setFilter('all')}
              >
                <FiRefreshCw size={16} />
                Сбросить фильтр
              </button>
            </div>
          ) : (
            <div className={`courses-grid ${viewMode}`}>
              {filteredCourses.map(course => (
                <Link
                  to={`/courses/${course.id}`}
                  key={course.id}
                  className="course-card"
                >
                  <div className="course-card-image">
                    <GiMeditation size={48} />
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
                        {getDifficultyIcon(course.difficulty)}
                        {getDifficultyBadge(course.difficulty)}
                      </span>
                      <span className="course-card-lessons">
                        <FaBookOpen size={14} />
                        {course.total_lessons || 0} уроков
                      </span>
                      {course.duration && (
                        <span className="course-card-duration">
                          <IoTimeOutline size={14} />
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
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursesPage;