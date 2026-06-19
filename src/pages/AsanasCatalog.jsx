import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios'; // ← Импортируем настроенный axios
import { 
  FiSearch, 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiStar,
  FiClock,
  FiAward,
  FiTag,
  FiChevronRight,
  FiBookOpen,
  FiActivity,
  FiUsers,
  FiHeart,
  FiEye,
  FiAlertCircle
} from 'react-icons/fi';
import { GiLotus, GiMeditation, GiSittingDog } from 'react-icons/gi';

const AsanasCatalog = () => {
  const { user } = useAuth();
  const [asanas, setAsanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    'Все',
    'Балансы',
    'Асаны сидя',
    'Асаны стоя',
    'Упоры',
    'Балансы на руках',
    'Прогибы',
    'Наклоны',
    'Асаны лёжа',
    'Балансы на ногах',
    'Скручивания',
    'Перевёрнутые позы'
  ];

  useEffect(() => {
    fetchAsanas();
  }, []);

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
      console.error('❌ Статус:', err.response?.status);
      console.error('❌ Ответ:', err.response?.data);
      setError(err.response?.data?.error || 'Ошибка загрузки асан. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'балансы': <FiActivity size={18} />,
      'асаны сидя': <GiSittingDog size={18} />,
      'асаны стоя': <GiMeditation size={18} />,
      'упоры': <FiBookOpen size={18} />,
      'балансы на руках': <FiUsers size={18} />,
      'прогибы': <FiStar size={18} />,
      'наклоны': <FiChevronRight size={18} />,
      'асаны лёжа': <GiLotus size={18} />,
      'балансы на ногах': <FiActivity size={18} />,
      'скручивания': <FiGrid size={18} />,
      'перевёрнутые позы': <FiEye size={18} />
    };
    return iconMap[category?.toLowerCase()] || <FiTag size={18} />;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'балансы': '#667eea',
      'асаны сидя': '#48bb78',
      'асаны стоя': '#ed8936',
      'упоры': '#9f7aea',
      'балансы на руках': '#fc8181',
      'прогибы': '#f6ad55',
      'наклоны': '#4299e1',
      'асаны лёжа': '#68d391',
      'балансы на ногах': '#ed64a6',
      'скручивания': '#38b2ac',
      'перевёрнутые позы': '#805ad5'
    };
    return colorMap[category?.toLowerCase()] || '#667eea';
  };

  const filteredAsanas = asanas.filter(asana => {
    const matchesSearch = asana.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asana.sanskrit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asana.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          asana.category?.toLowerCase() === selectedCategory.toLowerCase();
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
              <FiBookOpen size={28} />
              Каталог асан
            </h1>
            <p className="catalog-subtitle">
              Выбери категорию, чтобы найти подходящую позу
            </p>
          </div>

          <div className="catalog-controls">
            <div className="catalog-search">
              <FiSearch className="catalog-search-icon" />
              <input
                type="text"
                placeholder="Поиск асан по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="catalog-search-input"
              />
            </div>

            <div className="catalog-view-toggle">
              <button
                className={`catalog-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Сетка"
              >
                <FiGrid size={18} />
              </button>
              <button
                className={`catalog-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Список"
              >
                <FiList size={18} />
              </button>
            </div>
          </div>

          <div className="catalog-categories">
            {categories.map(category => (
              <button
                key={category}
                className={`catalog-category-btn ${selectedCategory === category.toLowerCase() || (category === 'Все' && selectedCategory === 'all') ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category === 'Все' ? 'all' : category.toLowerCase())}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredAsanas.length === 0 ? (
            <div className="catalog-empty">
              <FiSearch size={48} />
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить параметры поиска или выберите другую категорию</p>
            </div>
          ) : (
            <div className={`catalog-${viewMode}`}>
              {filteredAsanas.map(asana => (
                <Link
                  to={`/catalog/${asana.id}`}
                  key={asana.id}
                  className={`catalog-item catalog-item-${viewMode}`}
                >
                  <div className="catalog-item-content">
                    <div className="catalog-item-header">
                      <h3>{asana.name}</h3>
                      <span className="catalog-item-sanskrit">{asana.sanskrit}</span>
                    </div>
                    
                    <div className="catalog-item-meta">
                      <span 
                        className="catalog-item-category"
                        style={{
                          backgroundColor: getCategoryColor(asana.category) + '20',
                          color: getCategoryColor(asana.category)
                        }}
                      >
                        {getCategoryIcon(asana.category)}
                        {asana.category}
                      </span>
                      {asana.difficulty && (
                        <span className="catalog-item-difficulty">
                          <FiStar size={14} />
                          {asana.difficulty}
                        </span>
                      )}
                      {asana.duration && (
                        <span className="catalog-item-duration">
                          <FiClock size={14} />
                          {asana.duration} мин
                        </span>
                      )}
                    </div>

                    <p className="catalog-item-description">{asana.description}</p>

                    <div className="catalog-item-footer">
                      <span className="catalog-item-read-more">
                        Подробнее
                        <FiChevronRight size={16} />
                      </span>
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