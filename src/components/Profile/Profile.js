import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import './Profile.css';

const Profile = ({ onBack }) => {
  const { user, logout, updateProfile } = useAuth();
  const { navigateWithReturn } = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  if (!user) return null;

  const achievements = [
    { id: 'first_session', name: 'Первые шаги', description: 'Завершили первую сессию медитации', icon: '🌱' },
    { id: 'week_streak', name: 'Неделя практики', description: '7 дней подряд медитации', icon: '🔥' },
    { id: 'month_streak', name: 'Месяц дисциплины', description: '30 дней подряд медитации', icon: '💎' },
    { id: 'hundred_sessions', name: 'Мастер медитации', description: '100 завершенных сессий', icon: '🏆' }
  ];

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
      }

      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла должен быть меньше 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Создаем canvas для изменения размера изображения
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Устанавливаем размер 300x300 для аватара
          const size = 300;
          canvas.width = size;
          canvas.height = size;
          
          // Вычисляем размеры для обрезки (квадрат по центру)
          const sourceSize = Math.min(img.width, img.height);
          const sourceX = (img.width - sourceSize) / 2;
          const sourceY = (img.height - sourceSize) / 2;
          
          // Рисуем изображение
          ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
          
          // Получаем data URL
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          setAvatarPreview(resizedDataUrl);
          setEditData({...editData, avatar: resizedDataUrl});
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setEditData({...editData, avatar: null});
  };

  const handleLogout = () => {
    logout();
    onBack();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStreakText = (streak) => {
    if (streak === 0) return 'Начните сегодня!';
    if (streak === 1) return '1 день';
    if (streak < 5) return `${streak} дня`;
    return `${streak} дней`;
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2>Профиль</h2>
        <button className="logout-btn" onClick={handleLogout}>Выйти</button>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="avatar-section">
            <div className="avatar-large">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" />
              ) : (
                <span className="avatar-initials">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              )}
            </div>
            
            {isEditing ? (
              <div className="edit-form">
                <div className="avatar-edit-section">
                  <div className="avatar-preview">
                    {(avatarPreview || editData.avatar) ? (
                      <img src={avatarPreview || editData.avatar} alt="Avatar preview" />
                    ) : (
                      <span className="avatar-initials">
                        {editData.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="avatar-controls">
                    <label className="avatar-upload-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                      📷 Выбрать фото
                    </label>
                    {(avatarPreview || editData.avatar) && (
                      <button type="button" onClick={removeAvatar} className="avatar-remove-btn">
                        🗑️ Удалить
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  placeholder="Имя"
                />
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  placeholder="Email"
                />
                <div className="edit-buttons">
                  <button onClick={handleSave} className="save-btn">Сохранить</button>
                  <button onClick={() => {
                    setIsEditing(false);
                    setAvatarPreview(null);
                    setEditData({
                      name: user?.name || '',
                      email: user?.email || '',
                      avatar: user?.avatar || null
                    });
                  }} className="cancel-btn">Отмена</button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <p className="join-date">Присоединился {formatDate(user.joinDate)}</p>
                <button onClick={() => setIsEditing(true)} className="edit-btn">
                  Редактировать
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🧘‍♀️</div>
            <div className="stat-content">
              <h3>{user.stats.totalSessions}</h3>
              <p>Сессий завершено</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>{user.stats.totalMinutes}</h3>
              <p>Минут медитации</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{getStreakText(user.stats.streak)}</h3>
              <p>Текущая серия</p>
            </div>
          </div>
          
          <div className="stat-card clickable" onClick={() => navigateWithReturn('notes')}>
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{user.notes?.length || 0}</h3>
              <p>Заметок создано</p>
            </div>
          </div>
        </div>

        <div className="achievements-section">
          <h3>Достижения</h3>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${
                  user.stats.achievements.includes(achievement.id) ? 'unlocked' : 'locked'
                }`}
              >
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-content">
                  <h4>{achievement.name}</h4>
                  <p>{achievement.description}</p>
                </div>
                {user.stats.achievements.includes(achievement.id) && (
                  <div className="unlocked-badge">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {user.stats.lastSessionDate && (
          <div className="last-session">
            <h3>Последняя сессия</h3>
            <p>{formatDate(user.stats.lastSessionDate)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
