import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { asanas } from '../data/asanasData';

const AsanaDetailPage = () => {
  const { id } = useParams();
  const asana = asanas.find(a => a.id === parseInt(id));

  if (!asana) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="error-message">
            <h2>Асана не найдена</h2>
            <Link to="/catalog" className="btn-primary">Вернуться в каталог</Link>
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
          <Link to="/catalog" className="back-link">← Все асаны</Link>
          <div className="asana-detail-header">
            <h1>{asana.name}</h1>
            <p className="sanskrit">{asana.sanskrit}</p>
          </div>

          {asana.image && (
            <div className="asana-detail-image">
              <img src={asana.image} alt={asana.name} />
            </div>
          )}

          <div className="asana-detail-section">
            <h2>Краткое описание</h2>
            <p>{asana.shortDescription}</p>
          </div>

          <div className="asana-detail-section">
            <h2>Полное описание</h2>
            <p>{asana.fullDescription}</p>
          </div>

          <div className="asana-detail-section">
            <h2>Техника выполнения</h2>
            <ul>
              {asana.technique.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="asana-detail-section">
            <h2>Польза</h2>
            <p>{asana.benefits}</p>
          </div>

          <div className="asana-detail-section">
            <h2>Противопоказания</h2>
            <p>{asana.contraindications}</p>
          </div>

          <div className="asana-detail-tags">
            <span className="tag">{asana.category}</span>
            {asana.subcategory && <span className="tag">{asana.subcategory}</span>}
          </div>
        </div>
      </div>
    </>
  );
};

export default AsanaDetailPage;