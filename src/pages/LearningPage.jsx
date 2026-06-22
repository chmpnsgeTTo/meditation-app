import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  GiMeditation,
  GiSittingDog,
  GiSnake,
  GiLotus,
  GiLungs,
} from 'react-icons/gi';
import { WiDaySunny } from 'react-icons/wi';
import { FaFeatherAlt, FaYinYang } from 'react-icons/fa';
import { IoWaterOutline } from 'react-icons/io5';
import { yogaDirections } from '../data/yogaData';

const LearningPage = () => {
  const getDirectionIcon = (id) => {
    const iconMap = {
      'hatha': <GiMeditation size={48} />,
      'vinyasa': <WiDaySunny size={48} />,
      'kundalini': <GiSnake size={48} />,
      'ashtanga': <GiSittingDog size={48} />,
      'yoga-nidra': <FaFeatherAlt size={48} />,
      'iyengar': <GiLotus size={48} />,
      'bikram': <WiDaySunny size={48} />,
      'pranayama': <GiLungs size={48} />,
      'yin': <FaYinYang size={48} />,
      'restorative': <IoWaterOutline size={48} />
    };
    return iconMap[id] || <GiLotus size={48} />;
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

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="learning-container">
          <div className="learning-header">
            <h1>
              <GiLotus size={32} className="learning-header-icon" />
              Основные направления йоги
            </h1>
            <p className="learning-subtitle">
              Выберите направление, чтобы узнать его историю, основные практики и асаны
            </p>
          </div>

          {/* СТАТИСТИКА - каждый в рамочке, по центру */}
          <div className="learning-stats">
            <div className="learning-stat">
              <GiLotus size={20} />
              <span>{yogaDirections.length} направлений</span>
            </div>
            <div className="learning-stat">
              <GiMeditation size={20} />
              <span>Древние практики</span>
            </div>
            <div className="learning-stat">
              <FaFeatherAlt size={20} />
              <span>Путь к гармонии</span>
            </div>
          </div>

          <div className="directions-grid">
            {yogaDirections.map((direction) => (
              <Link 
                to={`/learning/${direction.id}`} 
                key={direction.id}
                className="direction-card"
                style={{
                  borderColor: getDirectionColor(direction.id) + '40'
                }}
              >
                {/* ИКОНКА - БЕЗ ФОНА, ТОЛЬКО ЦВЕТНАЯ */}
                <div 
                  className="direction-icon"
                  style={{
                    color: getDirectionColor(direction.id)
                  }}
                >
                  {getDirectionIcon(direction.id)}
                </div>
                <h3 style={{ color: getDirectionColor(direction.id) }}>
                  {direction.name}
                </h3>
                <p>{direction.shortDescription}</p>
                <span className="read-more">
                  Узнать больше
                  <span className="read-more-arrow">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningPage;