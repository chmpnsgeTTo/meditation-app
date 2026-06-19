import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  FiArrowLeft, 
  FiClock, 
  FiStar, 
  FiUsers, 
  FiBookOpen, 
  FiCheckCircle, 
  FiInfo,
  FiAlertCircle,
  FiHeart,
  FiTarget,
  FiFeather
} from 'react-icons/fi';
import { 
  GiLotus, 
  GiMeditation, 
  GiSittingDog, 
  GiSnake, 
  GiLungs,
  GiPalm,
  GiLotusFlower,
  GiHealing,
  GiYoga,
  GiBreath
} from 'react-icons/gi';
import { WiDaySunny } from 'react-icons/wi';
import { FaFeatherAlt, FaYinYang, FaOm } from 'react-icons/fa';
import { IoWaterOutline } from 'react-icons/io5';
import { yogaDirections } from '../data/yogaData';

const YogaDirectionPage = () => {
  const { directionId } = useParams();
  const direction = yogaDirections.find(d => d.id === directionId);

  const getDirectionIcon = (id) => {
    const iconMap = {
      'hatha': <GiMeditation size={28} />,
      'vinyasa': <WiDaySunny size={28} />,
      'kundalini': <GiSnake size={28} />,
      'ashtanga': <GiSittingDog size={28} />,
      'yoga-nidra': <FaFeatherAlt size={28} />,
      'iyengar': <GiLotus size={28} />,
      'bikram': <WiDaySunny size={28} />,
      'pranayama': <GiLungs size={28} />,
      'yin': <FaYinYang size={28} />,
      'restorative': <IoWaterOutline size={28} />
    };
    return iconMap[id] || <GiLotus size={28} />;
  };

  const getDirectionColor = (id) => {
    const colorMap = {
      'hatha': '#667eea',
      'vinyasa': '#f6ad55',
      'kundalini': '#9f7aea',
      'ashtanga': '#48bb78',
      'yoga-nidra': '#4299e1',
      'iyengar': '#ed64a6',
      'bikram': '#ed8936',
      'pranayama': '#fc8181',
      'yin': '#38b2ac',
      'restorative': '#68d391'
    };
    return colorMap[id] || '#667eea';
  };

  const getDifficultyLabel = (difficulty) => {
    const map = {
      'beginner': 'Начинающий',
      'intermediate': 'Средний',
      'advanced': 'Продвинутый'
    };
    return map[difficulty] || difficulty;
  };

  if (!direction) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="direction-error">
            <FiAlertCircle size={48} />
            <h2>Направление не найдено</h2>
            <p>Попробуйте выбрать другое направление</p>
            <Link to="/learning" className="btn-primary">
              <FiArrowLeft size={16} />
              Вернуться к направлениям
            </Link>
          </div>
        </div>
      </>
    );
  }

  const color = getDirectionColor(direction.id);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="direction-detail-container">
          <Link to="/learning" className="back-link">
            <FiArrowLeft size={16} />
            Все направления
          </Link>

          <div className="direction-detail-header">
            <div 
              className="direction-detail-icon"
              style={{
                background: color + '15',
                color: color,
                borderColor: color + '30'
              }}
            >
              {getDirectionIcon(direction.id)}
            </div>
            <h1 style={{ color }}>{direction.name}</h1>
            <p className="direction-detail-short">
              <GiYoga size={16} style={{ opacity: 0.5 }} />
              {direction.shortDescription}
            </p>
          </div>

          <div className="direction-detail-meta">
            {direction.difficulty && (
              <span className="direction-meta-item">
                <FiTarget size={16} />
                {getDifficultyLabel(direction.difficulty)}
              </span>
            )}
            {direction.duration && (
              <span className="direction-meta-item">
                <FiClock size={16} />
                {direction.duration} мин
              </span>
            )}
            {direction.practitioners && (
              <span className="direction-meta-item">
                <FiUsers size={16} />
                {direction.practitioners}
              </span>
            )}
            <span className="direction-meta-item">
              <FiStar size={16} />
              {direction.asanas?.length || 0} асан
            </span>
          </div>

          <div className="direction-detail-section">
            <h2>
              <FiInfo size={20} />
              Историческая справка
            </h2>
            <p>{direction.history}</p>
          </div>

          <div className="direction-detail-section">
            <h2>
              <FiCheckCircle size={20} />
              Основные практики
            </h2>
            <ul className="direction-practices-list">
              {direction.practices.map((practice, idx) => (
                <li key={idx}>
                  <FiCheckCircle size={16} color={color} />
                  {practice}
                </li>
              ))}
            </ul>
          </div>

          <div className="direction-detail-section">
            <h2>
              <FiBookOpen size={20} />
              Ключевые асаны
            </h2>
            <ul className="direction-asanas-list">
              {direction.asanas.map((asana, idx) => (
                <li key={idx}>
                  <GiLotus size={16} color={color} />
                  {asana}
                </li>
              ))}
            </ul>
          </div>

          {direction.benefits && (
            <div className="direction-detail-section">
              <h2>
                <FiHeart size={20} />
                Польза
              </h2>
              <ul className="direction-benefits-list">
                {direction.benefits.map((benefit, idx) => (
                  <li key={idx}>
                    <FiCheckCircle size={16} color="#48bb78" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div 
            className="direction-detail-tips"
            style={{
              borderColor: color + '30',
              background: color + '08'
            }}
          >
            <h3>
              <FaOm size={18} color={color} />
              Совет
            </h3>
            <p>Помните: йога — это не соревнование. Слушайте своё тело и дышите спокойно.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default YogaDirectionPage;