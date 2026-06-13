import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { GiMeditation, GiSittingDog, GiSnake, GiLotus } from 'react-icons/gi';
import { WiDaySunny } from 'react-icons/wi';
import { FaFeatherAlt } from 'react-icons/fa';
import { yogaDirections } from '../data/yogaData';

const LearningPage = () => {
  const getDirectionIcon = (id) => {
    switch(id) {
      case 'hatha': return <GiMeditation size={48} />;      // ← изменили на GiMeditation
      case 'vinyasa': return <WiDaySunny size={48} />;
      case 'kundalini': return <GiSnake size={48} />;
      case 'ashtanga': return <GiSittingDog size={48} />;
      case 'yoga-nidra': return <FaFeatherAlt size={48} />;
      default: return <GiLotus size={48} />;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="learning-container">
          <h1>Основные направления йоги</h1>
          <p className="learning-subtitle">
            Выберите направление, чтобы узнать его историю, основные практики и асаны
          </p>
          <div className="directions-grid">
            {yogaDirections.map((direction) => (
              <Link 
                to={`/learning/${direction.id}`} 
                key={direction.id}
                className="direction-card"
              >
                <div className="direction-icon">
                  {getDirectionIcon(direction.id)}
                </div>
                <h3>{direction.name}</h3>
                <p>{direction.shortDescription}</p>
                <span className="read-more">Узнать больше →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LearningPage;