import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { yogaDirections } from '../data/yogaData';

const YogaDirectionPage = () => {
  const { directionId } = useParams();
  const direction = yogaDirections.find(d => d.id === directionId);

  if (!direction) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="error-message">
            <h2>Направление не найдено</h2>
            <Link to="/learning" className="btn-primary">Вернуться к списку</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="direction-detail">
          <Link to="/learning" className="back-link">← Все направления</Link>
          <div className="direction-header">
            <h1>{direction.name}</h1>
            <p className="direction-short">{direction.shortDescription}</p>
          </div>

          <div className="direction-section">
            <h2>Историческая справка</h2>
            <p>{direction.history}</p>
          </div>

          <div className="direction-section">
            <h2>Основные практики</h2>
            <ul>
              {direction.practices.map((practice, idx) => (
                <li key={idx}>{practice}</li>
              ))}
            </ul>
          </div>

          <div className="direction-section">
            <h2>Ключевые асаны (движения)</h2>
            <ul>
              {direction.asanas.map((asana, idx) => (
                <li key={idx}>{asana}</li>
              ))}
            </ul>
          </div>

          <div className="direction-note">
            <p>Помните: йога — это не соревнование. Слушайте своё тело и дышите спокойно.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default YogaDirectionPage;