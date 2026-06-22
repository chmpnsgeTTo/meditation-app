import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { 
  FiArrowLeft, 
  FiClock, 
  FiStar, 
  FiAlertCircle,
  FiBookOpen,
  FiInfo,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiHeart,
  FiTag,        // ← ДОБАВЛЕНО
  FiRefreshCw   // ← ДОБАВЛЕНО для кнопки "Попробовать снова"
} from 'react-icons/fi';
import { GiLotus, GiMeditation } from 'react-icons/gi';

const AsanaDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [asana, setAsana] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAsana();
  }, [id]);

  const fetchAsana = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/api/asanas/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('✅ Загружена асана:', data);
      setAsana(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки асаны:', err);
      setError(err.response?.data?.error || 'Ошибка загрузки асаны');
      if (err.response?.status === 404) navigate('/catalog');
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка асаны...</p>
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
          <div className="asana-detail-container">
            <div className="catalog-error">
              <FiAlertCircle size={48} color="#e53e3e" />
              <h3>Ошибка загрузки</h3>
              <p>{error}</p>
              <button onClick={fetchAsana} className="btn-primary">
                <FiRefreshCw size={16} />
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!asana) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="asana-detail-container">
            <div className="course-detail-not-found">
              <FiBookOpen size={48} color="#94a3b8" />
              <h2>Асана не найдена</h2>
              <Link to="/catalog" className="course-detail-back-link">
                <FiArrowLeft size={14} />
                Вернуться к каталогу
              </Link>
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
        <div className="asana-detail-container">
          <Link to="/catalog" className="back-link">
            <FiArrowLeft size={16} />
            Каталог асан
          </Link>

          <div className="asana-detail-header">
            <h1>{asana.name}</h1>
            {asana.sanskrit && (
              <p className="asana-sanskrit">{asana.sanskrit}</p>
            )}
          </div>

          {/* Изображение */}
          {asana.image_url && (
            <div className="asana-detail-image">
              <img 
                src={asana.image_url} 
                alt={asana.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Мета-информация */}
          <div className="course-detail-meta">
            {asana.category && (
              <span className="difficulty-badge">
                <FiTag size={14} style={{ marginRight: '4px' }} />
                {asana.category}
              </span>
            )}
            {asana.difficulty && (
              <span 
                className="difficulty-badge"
                style={{
                  backgroundColor: getDifficultyColor(asana.difficulty) + '20',
                  color: getDifficultyColor(asana.difficulty)
                }}
              >
                <FiStar size={14} style={{ marginRight: '4px' }} />
                {asana.difficulty}
              </span>
            )}
            {asana.duration && (
              <span className="duration-badge">
                <FiClock size={14} style={{ marginRight: '4px' }} />
                {asana.duration} мин
              </span>
            )}
          </div>

          {/* Краткое описание */}
          <div className="asana-detail-section">
            <h2>
              <FiInfo size={18} style={{ marginRight: '8px' }} />
              Краткое описание
            </h2>
            <p>{asana.description || 'Описание отсутствует'}</p>
          </div>

          {/* Полное описание */}
          {asana.full_description && (
            <div className="asana-detail-section">
              <h2>
                <FiBookOpen size={18} style={{ marginRight: '8px' }} />
                Полное описание
              </h2>
              <p>{asana.full_description}</p>
            </div>
          )}

          {/* Техника выполнения */}
          {asana.technique && (
            <div className="asana-detail-section">
              <h2>
                <GiMeditation size={18} style={{ marginRight: '8px' }} />
                Техника выполнения
              </h2>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                {asana.technique}
              </div>
            </div>
          )}

          {/* Польза */}
          {asana.benefits && (
            <div className="asana-detail-section">
              <h2>
                <FiHeart size={18} color="#e53e3e" style={{ marginRight: '8px' }} />
                Польза
              </h2>
              <p>{asana.benefits}</p>
            </div>
          )}

          {/* Противопоказания */}
          {asana.contraindications && (
            <div className="asana-detail-section">
              <h2>
                <FiXCircle size={18} color="#e53e3e" style={{ marginRight: '8px' }} />
                Противопоказания
              </h2>
              <p>{asana.contraindications}</p>
            </div>
          )}

          {/* Теги */}
          {(asana.category || asana.difficulty) && (
            <div className="asana-detail-tags">
              {asana.category && (
                <span className="asana-tag">#{asana.category}</span>
              )}
              {asana.difficulty && (
                <span className="asana-tag">#{asana.difficulty}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AsanaDetailPage;