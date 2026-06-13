import React, { useState } from 'react';
import { Link } from 'react-router-dom';          // ← добавить импорт
import Navbar from '../components/Navbar';
import { asanas } from '../data/asanasData';

const AsanasCatalog = () => {
  const [activeFilter, setActiveFilter] = useState('все');

  // Уникальные категории для фильтрации
  const categories = [
    'все',
    ...new Set(asanas.map(a => a.category)),
  ];

  const filteredAsanas = activeFilter === 'все'
    ? asanas
    : asanas.filter(a => a.category === activeFilter);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="catalog-container">
          <h1>Каталог асан</h1>
          <p className="catalog-subtitle">Выбери категорию, чтобы найти подходящую позу</p>

          {/* Фильтры */}
          <div className="filters-wrapper">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${activeFilter === cat ? 'active' : ''}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Сетка асан – теперь каждая карточка – ссылка */}
          <div className="asanas-grid">
            {filteredAsanas.map(asana => (
              <Link 
                to={`/catalog/${asana.id}`} 
                key={asana.id} 
                className="asana-card-link"
              >
                <div className="asana-card">
                  <div className="asana-card-content">
                    <h3>{asana.name}</h3>
                    <p className="asana-sanskrit">{asana.sanskrit}</p>
                    <p className="asana-category">{asana.category}</p>
                    <p className="asana-description">
                      {asana.shortDescription || asana.description}
                    </p>
                    {asana.subcategory && (
                      <span className="asana-subcategory">{asana.subcategory}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredAsanas.length === 0 && (
            <div className="no-results">Нет асан в этой категории</div>
          )}
        </div>
      </div>
    </>
  );
};

export default AsanasCatalog;