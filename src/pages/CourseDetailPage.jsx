import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { GiDuration } from 'react-icons/gi';
import { FaPlay, FaCheckCircle, FaClock, FaLeaf, FaStar, FaFire, FaAward } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_URL}/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      // ✅ Нормализуем данные, чтобы избежать ошибок
      const normalizedCourse = {
        ...data,
        lessons: data.lessons || [],
        total_lessons: data.total_lessons || data.lessons?.length || 0,
        progress: data.progress || { completed_lessons: 0, is_completed: false },
        completedLessonIds: data.completedLessonIds || [],
        benefits: data.benefits || 'Польза курса будет добавлена позже',
        contraindications: data.contraindications || 'Противопоказания будут добавлены позже',
        tips: data.tips || 'Советы будут добавлены позже'
      };
      
      setCourse(normalizedCourse);
    } catch (err) {
      console.error('❌ Ошибка загрузки курса:', err);
      setError(err.response?.data?.error || 'Ошибка загрузки курса');
      if (err.response?.status === 404) navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const completeLesson = async (lessonId) => {
    // Проверяем, не завершен ли уже урок
    if (course.completedLessonIds?.includes(lessonId)) {
      return;
    }

    setCompleting(prev => ({ ...prev, [lessonId]: true }));
    setError(null);
    
    try {
      const { data } = await axios.post(
        `${API_URL}/api/courses/${id}/lessons/${lessonId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // ✅ Обновляем состояние безопасно
      setCourse(prev => {
        if (!prev) return prev;
        
        const newCompletedIds = [...(prev.completedLessonIds || []), lessonId];
        const completedCount = data.completedCount || newCompletedIds.length;
        const isCompleted = data.isCompleted || (completedCount >= (prev.total_lessons || 1));
        
        return {
          ...prev,
          progress: {
            completed_lessons: completedCount,
            is_completed: isCompleted
          },
          completedLessonIds: newCompletedIds
        };
      });
      
    } catch (err) {
      console.error('❌ Ошибка отметки урока:', err);
      setError(err.response?.data?.error || 'Ошибка при отметке урока');
    } finally {
      setCompleting(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  const getDifficultyIcon = (difficulty) => {
    if (!difficulty) return null;
    switch(difficulty) {
      case 'Начинающий': return <FaLeaf color="#48bb78" />;
      case 'Средний': return <FaStar color="#fbbf24" />;
      case 'Продвинутый': return <FaFire color="#ef4444" />;
      default: return null;
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return '#667eea';
    switch(difficulty) {
      case 'Начинающий': return '#48bb78';
      case 'Средний': return '#fbbf24';
      case 'Продвинутый': return '#ef4444';
      default: return '#667eea';
    }
  };

  // ✅ Безопасное получение прогресса
  const completedLessons = course?.progress?.completed_lessons ?? 0;
  const totalLessons = course?.total_lessons ?? 1;
  const progressPercent = Math.min((completedLessons / totalLessons) * 100, 100);

  // Состояния загрузки и ошибок
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>
            Загрузка курса...
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
          <div className="error" style={{ 
            textAlign: 'center', 
            padding: '40px',
            color: '#e53e3e'
          }}>
            <h2>❌ Ошибка</h2>
            <p>{error}</p>
            <button 
              onClick={loadCourse}
              style={{
                padding: '10px 20px',
                marginTop: '20px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="error" style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Курс не найден</h2>
            <Link to="/courses" style={{ color: '#667eea' }}>Вернуться к курсам</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="course-detail-container">
          <Link to="/courses" className="back-link" style={{ display: 'inline-block', marginBottom: '20px', color: '#667eea' }}>
            ← Все курсы
          </Link>
          
          <div className="course-detail-header">
            <h1>{course.title || 'Курс'}</h1>
            <div className="course-detail-meta" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '12px 0' }}>
              {course.difficulty && (
                <span className="difficulty-badge" style={{ 
                  background: getDifficultyColor(course.difficulty) + '20', 
                  color: getDifficultyColor(course.difficulty),
                  padding: '4px 12px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {getDifficultyIcon(course.difficulty)} {course.difficulty}
                </span>
              )}
              <span className="duration-badge" style={{
                padding: '4px 12px',
                borderRadius: '20px',
                background: '#f0f0f0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <FaClock size={14} /> {course.duration_minutes || 0} мин
              </span>
              <span className="lessons-badge" style={{
                padding: '4px 12px',
                borderRadius: '20px',
                background: '#f0f0f0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <GiDuration size={14} /> {course.total_lessons || 0} уроков
              </span>
            </div>
            <p className="course-full-description" style={{ fontSize: '16px', lineHeight: '1.6', color: '#4a5568' }}>
              {course.description || 'Описание курса будет добавлено позже'}
            </p>
          </div>

          <div className="course-info-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            margin: '24px 0'
          }}>
            <div className="info-card" style={{ padding: '16px', background: '#f7fafc', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4a5568' }}>Польза курса</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>{course.benefits}</p>
            </div>
            <div className="info-card" style={{ padding: '16px', background: '#f7fafc', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4a5568' }}>Противопоказания</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>{course.contraindications}</p>
            </div>
            <div className="info-card" style={{ padding: '16px', background: '#f7fafc', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4a5568' }}>Советы</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>{course.tips}</p>
            </div>
          </div>

          <div className="course-progress-section" style={{ 
            margin: '24px 0',
            padding: '20px',
            background: '#f7fafc',
            borderRadius: '12px'
          }}>
            <div className="progress-header" style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <FaAward size={16} style={{ marginRight: '8px' }} /> Ваш прогресс
              </span>
              <span>{completedLessons}/{totalLessons} уроков</span>
            </div>
            <div className="progress-bar-large" style={{
              width: '100%',
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div className="progress-fill-large" style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: '#667eea',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            {course.progress?.is_completed && (
              <div className="completion-badge" style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                color: '#48bb78'
              }}>
                <FaCheckCircle size={20} style={{ marginRight: '8px' }} />
                Курс успешно завершён! 🎉
              </div>
            )}
          </div>

          <div className="lessons-list">
            <h2>Уроки курса</h2>
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons.map((lesson, index) => {
                const isCompleted = course.completedLessonIds?.includes(lesson.id) || false;
                
                return (
                  <div key={lesson.id} className={`lesson-item ${isCompleted ? 'completed' : ''}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    marginBottom: '12px',
                    background: isCompleted ? '#f0fff4' : 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    gap: '16px'
                  }}>
                    <div className="lesson-number" style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCompleted ? '#48bb78' : '#e2e8f0',
                      color: isCompleted ? 'white' : '#4a5568',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </div>
                    <div className="lesson-info" style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{lesson.title}</h3>
                      <p className="lesson-content" style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#4a5568' }}>
                        {lesson.content}
                      </p>
                      <span className="lesson-duration" style={{ fontSize: '12px', color: '#718096' }}>
                        <FaClock size={12} style={{ marginRight: '4px' }} /> {lesson.duration_minutes || 0} мин
                      </span>
                    </div>
                    <div className="lesson-action" style={{ flexShrink: 0 }}>
                      {!isCompleted ? (
                        <button 
                          onClick={() => completeLesson(lesson.id)} 
                          disabled={completing[lesson.id]} 
                          className="complete-btn"
                          style={{
                            padding: '8px 16px',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: completing[lesson.id] ? 'not-allowed' : 'pointer',
                            opacity: completing[lesson.id] ? 0.7 : 1
                          }}
                        >
                          {completing[lesson.id] ? '...' : 'Отметить пройденным'}
                        </button>
                      ) : (
                        <span className="completed-check" style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: '#48bb78'
                        }}>
                          <FaCheckCircle size={16} style={{ marginRight: '6px' }} />
                          Пройдено
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ textAlign: 'center', color: '#718096', padding: '20px' }}>
                Уроки пока не добавлены
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;