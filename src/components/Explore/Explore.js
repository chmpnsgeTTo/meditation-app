import React, { useState, useEffect, useMemo } from 'react';
import './Explore.css';

const Explore = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [news, setNews] = useState([]);

  // Позитивные новости для демонстрации
  const positiveNews = useMemo(() => [
    {
      id: 1,
      category: 'nature',
      title: 'Восстановление коралловых рифов показывает удивительные результаты',
      description: 'Ученые сообщают о 40% увеличении популяции кораллов в Большом Барьерном рифе благодаря новым методам восстановления.',
      image: '🐠',
      date: '2024-01-15',
      readTime: '3 мин',
      source: 'Экология сегодня'
    },
    {
      id: 2,
      category: 'health',
      title: 'Медитация снижает уровень стресса на 60%',
      description: 'Новое исследование показало, что регулярная практика медитации значительно улучшает психическое здоровье.',
      image: '🧘‍♀️',
      date: '2024-01-14',
      readTime: '5 мин',
      source: 'Здоровье и наука'
    },
    {
      id: 3,
      category: 'technology',
      title: 'ИИ помогает очищать океаны от пластика',
      description: 'Новая система на основе искусственного интеллекта удалила 80 тонн пластикового мусора из Тихого океана.',
      image: '🌊',
      date: '2024-01-13',
      readTime: '4 мин',
      source: 'Технологии будущего'
    },
    {
      id: 4,
      category: 'science',
      title: 'Открыт новый способ выращивания пищи в космосе',
      description: 'Астронавты успешно вырастили помидоры и салат на Международной космической станции.',
      image: '🚀',
      date: '2024-01-12',
      readTime: '6 мин',
      source: 'Космические новости'
    },
    {
      id: 5,
      category: 'nature',
      title: 'Популяция панд увеличилась на 17%',
      description: 'Благодаря усилиям по сохранению, количество гигантских панд в дикой природе достигло рекордного уровня.',
      image: '🐼',
      date: '2024-01-11',
      readTime: '3 мин',
      source: 'Дикая природа'
    },
    {
      id: 6,
      category: 'health',
      title: 'Новое лекарство излечивает редкую форму слепоты',
      description: 'Революционная генная терапия вернула зрение 95% пациентов с врожденной слепотой.',
      image: '👁️',
      date: '2024-01-10',
      readTime: '7 мин',
      source: 'Медицинские открытия'
    },
    {
      id: 7,
      category: 'technology',
      title: 'Солнечные панели стали на 30% эффективнее',
      description: 'Новая технология перовскитных солнечных элементов обещает революцию в возобновляемой энергетике.',
      image: '☀️',
      date: '2024-01-09',
      readTime: '5 мин',
      source: 'Зеленая энергия'
    },
    {
      id: 8,
      category: 'science',
      title: 'Ученые создали материал, поглощающий CO2',
      description: 'Новый материал может извлекать углекислый газ из воздуха в 1000 раз эффективнее существующих методов.',
      image: '🌱',
      date: '2024-01-08',
      readTime: '4 мин',
      source: 'Климатические решения'
    },
    {
      id: 9,
      category: 'nature',
      title: 'Восстановлен лес площадью 10,000 гектаров',
      description: 'Крупнейший проект лесовосстановления в Европе успешно завершен, посажено 2 миллиона деревьев.',
      image: '🌳',
      date: '2024-01-07',
      readTime: '4 мин',
      source: 'Экологические проекты'
    },
    {
      id: 10,
      category: 'health',
      title: 'Физические упражнения улучшают память на 25%',
      description: 'Исследование показало, что всего 30 минут активности в день значительно улучшают когнитивные функции.',
      image: '🏃‍♂️',
      date: '2024-01-06',
      readTime: '3 мин',
      source: 'Спорт и здоровье'
    }
  ], []);

  const categories = [
    { id: 'all', name: 'Все', icon: '🌟' },
    { id: 'nature', name: 'Природа', icon: '🌿' },
    { id: 'health', name: 'Здоровье', icon: '💚' },
    { id: 'technology', name: 'Технологии', icon: '🔬' },
    { id: 'science', name: 'Наука', icon: '🧪' }
  ];

  useEffect(() => {
    // Фильтруем новости по категории
    const filteredNews = selectedCategory === 'all' 
      ? positiveNews 
      : positiveNews.filter(item => item.category === selectedCategory);
    
    setNews(filteredNews);
  }, [selectedCategory, positiveNews]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="explore-page">
      <div className="explore-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2>Исследуй мир</h2>
        <div className="header-icon">✨</div>
      </div>

      <div className="explore-subtitle">
        <p>Позитивные новости для вдохновения</p>
      </div>

      <div className="categories-scroll">
        <div className="categories-list">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="news-grid">
        {news.map((article, index) => (
          <div 
            key={article.id} 
            className="news-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="news-image">
              <span className="news-emoji">{article.image}</span>
              <div className="news-category-badge">
                {categories.find(cat => cat.id === article.category)?.icon}
              </div>
            </div>
            
            <div className="news-content">
              <div className="news-meta">
                <span className="news-date">{formatDate(article.date)}</span>
                <span className="news-read-time">{article.readTime}</span>
              </div>
              
              <h3 className="news-title">{article.title}</h3>
              <p className="news-description">{article.description}</p>
              
              <div className="news-footer">
                <span className="news-source">{article.source}</span>
                <button className="read-more-btn">
                  Читать →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📰</span>
          <h3>Новости не найдены</h3>
          <p>Попробуйте выбрать другую категорию</p>
        </div>
      )}
    </div>
  );
};

export default Explore;
