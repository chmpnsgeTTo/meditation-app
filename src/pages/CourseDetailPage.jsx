import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { 
  GiDuration, 
  GiMeditation, 
  GiLotus, 
  GiLungs, 
  GiPalm, 
  GiFlowerStar,
  GiSittingDog,
  GiSnake
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
  FaLightbulb,
  FaUserGraduate,
  FaRegClock
} from 'react-icons/fa';
import { IoRibbonOutline, IoTimeOutline } from 'react-icons/io5';
import { MdCelebration, MdOutlineEmojiEvents } from 'react-icons/md';
import { FiCheck, FiLoader, FiAlertCircle } from 'react-icons/fi';

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
      const { data } = await api.get(`/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
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
      console.error('Ошибка загрузки курса:', err);
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
      const { data } = await api.post(
        `/api/courses/${id}/lessons/${lessonId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
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
      console.error('Ошибка отметки урока:', err);
      setError(err.response?.data?.error || 'Ошибка при отметке урока');
    } finally {
      setCompleting(prev => ({ ...prev, [lessonId]: false }));
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

  const getLessonIcon = (index) => {
    const icons = [
      <GiMeditation size={18} />,
      <GiLotus size={18} />,
      <GiSittingDog size={18} />,
      <GiSnake size={18} />,
      <GiLungs size={18} />,
      <GiPalm size={18} />,
      <GiFlowerStar size={18} />
    ];
    return icons[index % icons.length];
  };

  const completedLessons = course?.progress?.completed_lessons ?? 0;
  const totalLessons = course?.total_lessons ?? 1;
  const progressPercent = Math.min((completedLessons / totalLessons) * 100, 100);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="course-detail-loading">
            <GiMeditation size={48} className="course-detail-spinner" />
            <p>Загрузка курса...</p>
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
          <div className="course-detail-error">
            <FiAlertCircle size={48} />
            <h2>Ошибка</h2>
            <p>{error}</p>
            <button onClick={loadCourse} className="course-detail-retry-btn">
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
          <div className="course-detail-not-found">
            <FaBookOpen size={48} />
            <h2>Курс не найден</h2>
            <Link to="/courses" className="course-detail-back-link">
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
          <Link to="/courses" className="course-detail-back-link">
            <FaArrowLeft size={14} />
            Все курсы
          </Link>
          
          <div className="course-detail-header">
            <h1>
              {course.title || 'Курс'}
            </h1>
            
            {/* МЕТА-ИНФОРМАЦИЯ В РАМКАХ КАК НА СТРАНИЦЕ АСАН */}
            <div className="course-detail-meta">
              {course.difficulty && (
                <span 
                  className="course-detail-meta-badge"
                  style={{
                    backgroundColor: getDifficultyColor(course.difficulty) + '20',
                    color: getDifficultyColor(course.difficulty)
                  }}
                >
                  {course.difficulty}
                </span>
              )}
              <span className="course-detail-meta-badge">
                {course.duration_minutes || 0} мин
              </span>
              <span className="course-detail-meta-badge">
                {course.total_lessons || 0} уроков
              </span>
              {course.students_count !== undefined && (
                <span className="course-detail-meta-badge">
                  {course.students_count} студентов
                </span>
              )}
            </div>
            
            <p className="course-full-description">
              {course.description || 'Описание курса будет добавлено позже'}
            </p>
          </div>

          {/* ИНФО-КАРТОЧКИ - БЕЗ ИКОНОК */}
          <div className="course-info-grid">
            <div className="info-card">
              <h3>Польза курса</h3>
              <p>{course.benefits}</p>
            </div>
            <div className="info-card">
              <h3>Противопоказания</h3>
              <p>{course.contraindications}</p>
            </div>
            <div className="info-card">
              <h3>Советы</h3>
              <p>{course.tips}</p>
            </div>
          </div>

          {/* ПРОГРЕСС - В ОТДЕЛЬНОЙ РАМКЕ */}
          <div className="course-progress-section">
            <div className="progress-header">
              <span>
                <IoRibbonOutline size={20} />
                Ваш прогресс
              </span>
              <span className="progress-count">
                {completedLessons}/{totalLessons} уроков
              </span>
            </div>
            <div className="progress-bar-large">
              <div className="progress-fill-large" style={{ width: `${progressPercent}%` }}></div>
            </div>
            {course.progress?.is_completed && (
              <div className="completion-badge">
                <FaAward size={20} />
                <MdOutlineEmojiEvents size={20} />
                Курс успешно завершён!
              </div>
            )}
          </div>

          {/* УРОКИ - С ОБРАМЛЕНИЕМ И ПОДСВЕТКОЙ */}
          <div className="lessons-list">
            <h2>
              <FaBookOpen size={20} />
              Уроки курса
            </h2>
            
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons.map((lesson, index) => {
                const isCompleted = course.completedLessonIds?.includes(lesson.id) || false;
                
                return (
                  <div key={lesson.id} className={`lesson-item ${isCompleted ? 'completed' : ''}`}>
                    <div className="lesson-number">
                      {isCompleted ? (
                        <FaCheckCircle size={18} />
                      ) : (
                        getLessonIcon(index)
                      )}
                    </div>
                    
                    <div className="lesson-info">
                      <h3>
                        {lesson.title}
                        {isCompleted && (
                          <span className="lesson-completed-badge">
                            <FiCheck size={12} />
                            Пройдено
                          </span>
                        )}
                      </h3>
                      <p className="lesson-content">{lesson.content}</p>
                      <span className="lesson-duration">
                        <IoTimeOutline size={12} /> {lesson.duration_minutes || 0} мин
                      </span>
                    </div>
                    
                    <div className="lesson-action">
                      {!isCompleted ? (
                        <button 
                          onClick={() => completeLesson(lesson.id)} 
                          disabled={completing[lesson.id]} 
                          className="complete-btn"
                        >
                          {completing[lesson.id] ? (
                            <>
                              <FiLoader size={14} className="spinning" />
                              Отметка...
                            </>
                          ) : (
                            <>
                              <FaCheckCircle size={14} />
                              Отметить пройденным
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="completed-check">
                          <FaCheckCircle size={16} />
                          Пройдено
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="lessons-empty">
                <FaBookOpen size={32} />
                <p>Уроки пока не добавлены</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;