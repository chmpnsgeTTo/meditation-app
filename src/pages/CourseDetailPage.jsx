import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { GiDuration } from 'react-icons/gi';
import { FaPlay, FaCheckCircle, FaClock, FaLeaf, FaStar, FaFire, FaAward } from 'react-icons/fa';

const API_URL = 'http://localhost:3000';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState({});

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCourse(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const completeLesson = async (lessonId) => {
    setCompleting(prev => ({ ...prev, [lessonId]: true }));
    try {
      const { data } = await axios.post(
        `${API_URL}/api/courses/${id}/lessons/${lessonId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      setCourse(prev => ({
        ...prev,
        progress: {
          completed_lessons: data.completedCount,
          is_completed: data.isCompleted
        },
        completedLessonIds: [...prev.completedLessonIds, lessonId]
      }));
    } catch (err) {
      console.error('Ошибка:', err.response?.data || err.message);
    } finally {
      setCompleting(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch(difficulty) {
      case 'Начинающий': return <FaLeaf color="#48bb78" />;
      case 'Средний': return <FaStar color="#fbbf24" />;
      case 'Продвинутый': return <FaFire color="#ef4444" />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Начинающий': return '#48bb78';
      case 'Средний': return '#fbbf24';
      case 'Продвинутый': return '#ef4444';
      default: return '#667eea';
    }
  };

  const completedLessons = course?.progress?.completed_lessons || 0;
  const totalLessons = course?.total_lessons || 1;
  const progressPercent = (completedLessons / totalLessons) * 100;

  if (loading) return <><Navbar /><div className="container"><div className="loading">Загрузка...</div></div></>;
  if (!course) return <><Navbar /><div className="container"><div className="error">Курс не найден</div></div></>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="course-detail-container">
          <Link to="/courses" className="back-link">← Все курсы</Link>
          
          <div className="course-detail-header">
            <h1>{course.title}</h1>
            <div className="course-detail-meta">
              <span className="difficulty-badge" style={{ background: getDifficultyColor(course.difficulty) + '20', color: getDifficultyColor(course.difficulty) }}>
                {getDifficultyIcon(course.difficulty)} {course.difficulty}
              </span>
              <span className="duration-badge">
                <FaClock size={14} style={{ marginRight: '6px' }} /> {course.duration_minutes} мин
              </span>
              <span className="lessons-badge">
                <GiDuration size={14} style={{ marginRight: '6px' }} /> {course.total_lessons} уроков
              </span>
            </div>
            <p className="course-full-description">{course.description}</p>
          </div>

          <div className="course-info-grid">
            <div className="info-card benefits"><h3>Польза курса</h3><p>{course.benefits}</p></div>
            <div className="info-card contraindications"><h3>Противопоказания</h3><p>{course.contraindications}</p></div>
            <div className="info-card tips"><h3>Советы</h3><p>{course.tips}</p></div>
          </div>

          <div className="course-progress-section">
            <div className="progress-header">
              <span><FaAward size={16} style={{ marginRight: '8px' }} /> Ваш прогресс</span>
              <span>{completedLessons}/{totalLessons} уроков</span>
            </div>
            <div className="progress-bar-large">
              <div className="progress-fill-large" style={{ width: `${progressPercent}%` }}></div>
            </div>
            {course.progress?.is_completed && (
              <div className="completion-badge">
                <FaCheckCircle size={20} color="#48bb78" style={{ marginRight: '8px' }} />
                Курс успешно завершён!
              </div>
            )}
          </div>

          <div className="lessons-list">
            <h2>Уроки курса</h2>
            {course.lessons.map((lesson, index) => {
              const isCompleted = course.completedLessonIds?.includes(lesson.id);
              
              return (
                <div key={lesson.id} className={`lesson-item ${isCompleted ? 'completed' : ''}`}>
                  <div className="lesson-number">{index + 1}</div>
                  <div className="lesson-info">
                    <h3>{lesson.title}</h3>
                    <p className="lesson-content">{lesson.content}</p>
                    <span className="lesson-duration"><FaClock size={12} style={{ marginRight: '4px' }} /> {lesson.duration_minutes} мин</span>
                  </div>
                  <div className="lesson-action">
                    {!isCompleted ? (
                      <button onClick={() => completeLesson(lesson.id)} disabled={completing[lesson.id]} className="complete-btn">
                        {completing[lesson.id] ? '...' : 'Отметить пройденным'}
                      </button>
                    ) : (
                      <span className="completed-check">
                        <FaCheckCircle size={16} color="#48bb78" style={{ marginRight: '6px' }} />
                        Пройдено
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;