import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { 
  FiSearch, 
  FiGrid, 
  FiList, 
  FiClock,
  FiChevronRight,
  FiAlertCircle,
  FiTag,
  FiFilter
} from 'react-icons/fi';
import { GiMeditation } from 'react-icons/gi';

const AsanasCatalog = () => {
  const { user } = useAuth();
  const [asanas, setAsanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все'); // ← ИСПРАВЛЕНО: 'all' → 'Все'
  const [viewMode, setViewMode] = useState('grid');

  // Список категорий (уникальные из данных)
  const [categories, setCategories] = useState(['Все']);

  useEffect(() => {
    fetchAsanas();
  }, []);

  useEffect(() => {
    // Извлекаем уникальные категории из данных
    if (asanas.length > 0) {
      const uniqueCategories = [...new Set(asanas.map(a => a.category).filter(Boolean))];
      setCategories(['Все', ...uniqueCategories]);
    }
  }, [asanas]);

  const fetchAsanas = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/api/asanas', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('✅ Загружено асан:', data.length);
      setAsanas(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки асан:', err);
      setError(err.response?.data?.error || 'Ошибка загрузки асан. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация по поиску и категории
  const filteredAsanas = asanas.filter(asana => {
    const matchesSearch = searchTerm === '' || 
      asana.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asana.sanskrit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asana.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Все' || 
      asana.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка асан...</p>
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
          <div className="catalog-container">
            <div className="catalog-error">
              <FiAlertCircle size={48} color="#e53e3e" />
              <h3>Ошибка загрузки</h3>
              <p>{error}</p>
              <button 
                onClick={fetchAsanas}
                className="btn-primary"
                style={{ marginTop: '1rem' }}
              >
                Попробовать снова
              </button>
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
        <div className="catalog-container">
          <div className="catalog-header">
            <h1>
              Каталог асан
            </h1>
            <p className="catalog-subtitle">
              Выбери категорию, чтобы найти подходящую позу
            </p>
          </div>

          {/* Поиск + кнопки вида */}
          <div className="catalog-controls">
            <div className="catalog-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Поиск асан по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm('')}
                >
                  ×
                </button>
              )}
            </div>

            <div className="catalog-view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Сетка"
              >
                <FiGrid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="Список"
              >
                <FiList size={18} />
              </button>
            </div>
          </div>

          {/* Фильтр категорий */}
          <div className="catalog-categories">
            <div className="catalog-categories-header">
              <FiFilter size={16} />
              <span>Категории:</span>
            </div>
            <div className="catalog-categories-list">
              {categories.map(category => (
                <button
                  key={category}
                  className={`catalog-category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Результаты */}
          {filteredAsanas.length === 0 ? (
            <div className="catalog-empty">
              <GiMeditation size={48} />
              <h3>Асаны не найдены</h3>
              <p>Попробуйте изменить поисковый запрос или выберите другую категорию</p>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Все');
                }}
                style={{ marginTop: '1rem' }}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className={`catalog-grid ${viewMode}`}>
              {filteredAsanas.map((asana) => (
                <Link 
                  to={`/catalog/${asana.id}`}
                  key={asana.id}
                  className="catalog-item"
                >
                  <div className="catalog-item-content">
                    <div className="catalog-item-icon">
                      <GiMeditation size={28} />
                    </div>
                    <div className="catalog-item-info">
                      <h3 className="catalog-item-name">{asana.name}</h3>
                      {asana.sanskrit && (
                        <p className="catalog-item-sanskrit">{asana.sanskrit}</p>
                      )}
                      <p className="catalog-item-description">
                        {asana.description || 'Описание асаны'}
                      </p>
                      <div className="catalog-item-meta">
                        {asana.duration && (
                          <span className="catalog-item-duration">
                            <FiClock size={14} />
                            {asana.duration} мин
                          </span>
                        )}
                        {asana.category && (
                          <span className="catalog-item-category">
                            <FiTag size={12} />
                            {asana.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="catalog-item-arrow">
                      <FiChevronRight size={20} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AsanasCatalog;