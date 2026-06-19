import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { 
  GiDuration, 
  GiMeditation, 
  GiLotus, 
  GiBreath, 
  GiPalm, 
  GiFlowerStar 
} from 'react-icons/gi';
import { 
  FaCheckCircle, 
  FaClock, 
  FaLeaf, 
  FaStar, 
  FaFire, 
  FaAward, 
  FaArrowLeft,
  FaBookOpen,
  FaInfoCircle,
  FaExclamationTriangle,
  FaLightbulb
} from 'react-icons/fa';
import { MdOutlineEmojiObjects } from 'react-icons/md';
import { IoRibbonOutline } from 'react-icons/io5';

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
      
      console.log('📦 Данные курса:', data);
      
      const normalizedCourse = {
        ...data,
        lessons: data.lessons || [],
        total_lessons: data.total_lessons || data.lessons?.length || 0,
        completedLessonIds: data.completedLessonIds || [],
        progress: data.progress || { completed_lessons: 0, is_completed: false },
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
      
      console.log('✅ Урок отмечен:', data);
      
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
    switch(difficulty) {
      case 'Начинающий': return <FaLeaf size={16} color="#48bb78" />;
      case 'Средний': return <FaStar size={16} color="#fbbf24" />;
      case 'Продвинутый': return <FaFire size={16} color="#ef4444" />;
      default: return <GiLotus size={16} color="#667eea" />;
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

  const completedLessons = course?.progress?.completed_lessons ?? 0;
  const totalLessons = course?.total_lessons ?? 1;
  const progressPercent = Math.min((completedLessons / totalLessons) * 100, 100);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <GiMeditation size={48} color="#667eea" style={{ animation: 'spin 2s linear infinite' }} />
            <p style={{ marginTop: '16px', color: '#4a5568' }}>Загрузка курса...</p>
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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FaExclamationTriangle size={48} color="#e53e3e" />
            <h2 style={{ color: '#e53e3e', marginTop: '16px' }}>Ошибка</h2>
            <p style={{ color: '#4a5568' }}>{error}</p>
            <button 
              onClick={loadCourse}
              style={{
                padding: '10px 24px',
                marginTop: '20px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaArrowLeft size={14} />
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
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FaBookOpen size={48} color="#94a3b8" />
            <h2 style={{ marginTop: '16px' }}>Курс не найден</h2>
            <Link to="/courses" style={{ color: '#667eea', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <FaArrowLeft size={14} />
              Вернуться к курсам
            </Link>
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
          <Link to="/courses" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '20px', 
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            <FaArrowLeft size={14} />
            Все курсы
          </Link>
          
          <div className="course-detail-header">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <GiLotus size={32} color="#667eea" />
              {course.title || 'Курс'}
            </h1>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', margin: '12px 0' }}>
              {course.difficulty && (
                <span style={{ 
                  background: getDifficultyColor(course.difficulty) + '20', 
                  color: getDifficultyColor(course.difficulty),
                  padding: '4px 14px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {getDifficultyIcon(course.difficulty)} {course.difficulty}
                </span>
              )}
              <span style={{
                padding: '4px 14px',
                borderRadius: '20px',
                background: '#f0f0f0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}>
                <FaClock size={14} color="#718096" /> {course.duration_minutes || 0} мин
              </span>
              <span style={{
                padding: '4px 14px',
                borderRadius: '20px',
                background: '#f0f0f0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px'
              }}>
                <GiDuration size={14} color="#718096" /> {course.total_lessons || 0} уроков
              </span>
            </div>
            
            <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4a5568', marginTop: '8px' }}>
              {course.description || 'Описание курса будет добавлено позже'}
            </p>
          </div>

          {/* Информационные карточки */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            margin: '24px 0'
          }}>
            <div style={{ 
              padding: '16px', 
              background: '#f7fafc', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaInfoCircle size={16} color="#667eea" />
                Польза курса
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#2d3748' }}>{course.benefits}</p>
            </div>
            <div style={{ 
              padding: '16px', 
              background: '#f7fafc', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaExclamationTriangle size={16} color="#ed8936" />
                Противопоказания
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#2d3748' }}>{course.contraindications}</p>
            </div>
            <div style={{ 
              padding: '16px', 
              background: '#f7fafc', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaLightbulb size={16} color="#fbbf24" />
                Советы
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#2d3748' }}>{course.tips}</p>
            </div>
          </div>

          {/* Прогресс */}
          <div style={{ 
            margin: '24px 0',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                <IoRibbonOutline size={20} color="#667eea" />
                Ваш прогресс
              </span>
              <span style={{ 
                fontSize: '14px', 
                color: '#4a5568',
                background: 'white',
                padding: '2px 12px',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                {completedLessons}/{totalLessons} уроков
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>
            {course.progress?.is_completed && (
              <div style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#48bb78',
                fontWeight: '500'
              }}>
                <FaAward size={20} />
                Курс успешно завершён! 🎉
              </div>
            )}
          </div>

          {/* Список уроков */}
          <div className="lessons-list">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <FaBookOpen size={20} color="#667eea" />
              Уроки курса
            </h2>
            
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons.map((lesson, index) => {
                const isCompleted = course.completedLessonIds?.includes(lesson.id) || false;
                
                return (
                  <div key={lesson.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    marginBottom: '12px',
                    background: isCompleted ? '#f0fff4' : 'white',
                    border: isCompleted ? '1px solid #c6f6d5' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    gap: '16px',
                    flexWrap: 'wrap',
                    transition: 'all 0.2s ease',
                    boxShadow: isCompleted ? '0 1px 3px rgba(72, 187, 120, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
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
                      {isCompleted ? <FaCheckCircle size={18} /> : index + 1}
                    </div>
                    
                    <div style={{ flex: '1 1 200px' }}>
                      <h3 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {lesson.title}
                        {isCompleted && (
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#48bb78',
                            background: '#f0fff4',
                            padding: '2px 10px',
                            borderRadius: '12px'
                          }}>
                            Пройдено
                          </span>
                        )}
                      </h3>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#4a5568' }}>
                        {lesson.content}
                      </p>
                      <span style={{ fontSize: '12px', color: '#718096', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FaClock size={12} /> {lesson.duration_minutes || 0} мин
                      </span>
                    </div>
                    
                    <div style={{ flexShrink: 0 }}>
                      {!isCompleted ? (
                        <button 
                          onClick={() => completeLesson(lesson.id)} 
                          disabled={completing[lesson.id]} 
                          style={{
                            padding: '8px 20px',
                            background: completing[lesson.id] ? '#a0aec0' : '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: completing[lesson.id] ? 'not-allowed' : 'pointer',
                            opacity: completing[lesson.id] ? 0.7 : 1,
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (!completing[lesson.id]) {
                              e.target.style.background = '#764ba2';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!completing[lesson.id]) {
                              e.target.style.background = '#667eea';
                            }
                          }}
                        >
                          {completing[lesson.id] ? (
                            <>
                              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                              ...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle size={14} />
                              Отметить пройденным
                            </>
                          )}
                        </button>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#48bb78',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          <FaCheckCircle size={16} />
                          Пройдено ✅
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ 
                textAlign: 'center', 
                color: '#718096', 
                padding: '40px 20px',
                background: '#f7fafc',
                borderRadius: '12px'
              }}>
                <FaBookOpen size={32} color="#cbd5e0" />
                <p style={{ marginTop: '12px' }}>Уроки пока не добавлены</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default CourseDetailPage;