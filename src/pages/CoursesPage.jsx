import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { GiMeditation } from 'react-icons/gi';
import { FaStar, FaFire, FaLeaf } from 'react-icons/fa';

const API_URL = 'https://chmpnsgetto-meditation-app-5f61.twc1.net';

const CoursesPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/courses`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch(difficulty) {
      case 'Начинающий': return <FaLeaf color="#48bb78" />;
      case 'Средний': return <FaStar color="#fbbf24" />;
      case 'Продвинутый': return <FaFire color="#ef4444" />;
      default: return <GiMeditation color="#667eea" />;
    }
  };

  const filteredCourses = filter === 'all' 
    ? courses 
    : courses.filter(c => c.difficulty === filter);

  if (loading) return <><Navbar /><div className="container"><div className="loading">Загрузка...</div></div></>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="courses-container">
          <h1>Курсы йоги</h1>
          <p className="courses-subtitle">Выберите курс и начните своё обучение</p>
          
          {/* Фильтры по сложности */}
          <div className="courses-filters">
            <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>Все</button>
            <button onClick={() => setFilter('Начинающий')} className={`filter-btn ${filter === 'Начинающий' ? 'active' : ''}`}>Начинающий</button>
            <button onClick={() => setFilter('Средний')} className={`filter-btn ${filter === 'Средний' ? 'active' : ''}`}>Средний</button>
            <button onClick={() => setFilter('Продвинутый')} className={`filter-btn ${filter === 'Продвинутый' ? 'active' : ''}`}>Продвинутый</button>
          </div>
          
          {/* Сетка курсов */}
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <Link to={`/courses/${course.id}`} key={course.id} className="course-card">
                <div className="course-image-placeholder">
                  <GiMeditation size={48} color="#667eea" />
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p>{course.description?.substring(0, 100)}...</p>
                  <div className="course-meta">
                    <span className="difficulty">
                      {getDifficultyIcon(course.difficulty)}
                      {course.difficulty}
                    </span>
                    <span className="lessons-count">{course.total_lessons} уроков</span>
                  </div>
                  {course.user_completed > 0 && (
                    <div className="course-progress-mini">
                      <div className="progress-bar-mini">
                        <div 
                          className="progress-fill-mini" 
                          style={{ width: `${(course.user_completed / course.total_lessons) * 100}%` }}
                        ></div>
                      </div>
                      <span>Прогресс: {course.user_completed}/{course.total_lessons}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursesPage;