import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiSettings, FiBarChart2, FiUser, FiLock, FiCamera, FiCalendar, FiStar, FiTrendingUp, FiActivity, FiAward, FiBookOpen } from 'react-icons/fi';
import { GiMeditation } from 'react-icons/gi';
import { useAuth } from '../contexts/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('all');
  const [newUsername, setNewUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
  const [activeTab, setActiveTab] = useState('stats');
  const [userCourses, setUserCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    loadUserData();
    loadStatistics('all');
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 5000);
  };

  const loadUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('📦 Данные пользователя с сервера:', response.data);
      setUserData(response.data);
      setAvatarTimestamp(Date.now());
    } catch (error) {
      console.error('❌ Ошибка загрузки данных:', error);
      showMessage('Ошибка загрузки данных пользователя', 'error');
    }
  };

  const loadStatistics = async (p) => {
    setPeriod(p);
    try {
      const response = await axios.get(`${API_URL}/api/statistics?period=${p}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('❌ Ошибка загрузки статистики:', error);
      showMessage('Ошибка загрузки статистики', 'error');
    }
  };

  const loadUserCourses = async () => {
    setLoadingCourses(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/user/courses`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUserCourses(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки курсов:', err);
      showMessage('Ошибка загрузки курсов', 'error');
    } finally {
      setLoadingCourses(false);
    }
  };

  const getAvatarUrl = () => {
    // Проверяем, есть ли аватар у пользователя
    if (userData?.avatar && userData.avatar !== '/uploads/default-avatar.png') {
      // Если аватар - это полный URL (начинается с http), используем его
      if (userData.avatar.startsWith('http')) {
        return userData.avatar;
      }
      // Иначе добавляем timestamp для сброса кэша
      return `${userData.avatar}?t=${avatarTimestamp}`;
    }
    // Дефолтный аватар
    return `/uploads/default-avatar.png?t=${avatarTimestamp}`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('📄 Выбран файл:', file.name, file.size, file.type);
    
    // Проверка типа файла
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      showMessage('Пожалуйста, выберите изображение (JPEG, PNG, GIF, WEBP)', 'error');
      return;
    }
    
    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Файл слишком большой. Максимум 5MB', 'error');
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await axios.post(`${API_URL}/api/upload-avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Ответ сервера:', response.data);
      
      if (response.data.avatarUrl) {
        // Обновляем локальное состояние
        setUserData(prev => ({ ...prev, avatar: response.data.avatarUrl }));
        // Обновляем таймштамп для сброса кэша
        setAvatarTimestamp(Date.now());
        // Перезагружаем данные с сервера для синхронизации
        await loadUserData();
        showMessage('Аватар успешно обновлен!', 'success');
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      console.error('❌ Ответ ошибки:', error.response?.data);
      showMessage(error.response?.data?.error || 'Ошибка загрузки аватара', 'error');
    } finally {
      setIsUploading(false);
      // Очищаем input, чтобы можно было загрузить тот же файл повторно
      e.target.value = '';
    }
  };

  const changeUsername = async () => {
    if (!newUsername) {
      showMessage('Введите новое имя пользователя', 'error');
      return;
    }
    if (newUsername.length < 3) {
      showMessage('Имя пользователя должно быть минимум 3 символа', 'error');
      return;
    }
    if (!oldPassword) {
      showMessage('Введите пароль для подтверждения', 'error');
      return;
    }
    
    setIsChangingUsername(true);
    try {
      const response = await axios.post(`${API_URL}/api/change-username`, 
        { newUsername, password: oldPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.message) {
        // Обновляем токен, если он пришел в ответе
        if (response.data.token) {
          login(response.data.token, response.data.username, user.userId);
        }
        // Обновляем данные пользователя
        await loadUserData();
        setNewUsername('');
        setOldPassword('');
        showMessage('Имя пользователя изменено!', 'success');
      }
    } catch (error) {
      console.error('❌ Ошибка смены имени:', error);
      showMessage(error.response?.data?.error || 'Ошибка смены имени', 'error');
    } finally {
      setIsChangingUsername(false);
    }
  };

  const changePassword = async () => {
    if (!oldPassword) {
      showMessage('Введите старый пароль', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('Новый пароль должен быть минимум 6 символов', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage('Пароли не совпадают', 'error');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const response = await axios.post(`${API_URL}/api/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.message) {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showMessage('Пароль успешно изменен!', 'success');
      }
    } catch (error) {
      console.error('❌ Ошибка смены пароля:', error);
      showMessage(error.response?.data?.error || 'Ошибка смены пароля', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const prepareChartData = () => {
    if (!stats?.daily_data || stats.daily_data.length === 0) return [];
    return stats.daily_data.map(item => ({
      day: new Date(item.day).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      minutes: item.total_minutes,
      sessions: item.sessions_count
    })).reverse();
  };

  const chartData = prepareChartData();

  const keyMetrics = [
    { 
      title: 'Всего минут', 
      value: stats?.total_minutes || 0, 
      icon: <FiTrendingUp size={24} color="#667eea" />
    },
    { 
      title: 'Всего сессий', 
      value: stats?.total_sessions || 0, 
      icon: <FiActivity size={24} color="#48bb78" />
    },
    { 
      title: 'Средняя длительность', 
      value: `${stats?.avg_duration || 0} мин`, 
      icon: <FiCalendar size={24} color="#ed8936" />
    },
    { 
      title: 'Самая длинная', 
      value: `${stats?.longest_session || 0} мин`, 
      icon: <FiStar size={24} color="#fbbf24" />
    }
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'courses') {
      loadUserCourses();
    }
    if (tab === 'stats') {
      loadStatistics(period);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="profile-container">
          {/* ========== СООБЩЕНИЯ ========== */}
          {message && (
            <div 
              className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                marginBottom: '20px',
                backgroundColor: messageType === 'success' ? '#48bb78' : '#e53e3e',
                color: 'white',
                textAlign: 'center'
              }}
            >
              {message}
            </div>
          )}

          {/* ========== ШАПКА ПРОФИЛЯ ========== */}
          <div className="profile-header">
            <div className="avatar-section">
              <img 
                src={getAvatarUrl()}
                alt="Avatar"
                className="avatar"
                onError={(e) => {
                  console.log('⚠️ Ошибка загрузки аватара, использую дефолтный');
                  e.target.src = `/uploads/default-avatar.png?t=${Date.now()}`;
                }}
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <input 
                  type="file" 
                  id="avatarInput" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
                <button 
                  className="change-avatar-btn"
                  onClick={() => document.getElementById('avatarInput').click()}
                  disabled={isUploading}
                  aria-label="Изменить аватар профиля"
                  style={{
                    padding: '8px 16px',
                    marginTop: '10px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    opacity: isUploading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FiCamera size={14} />
                  {isUploading ? 'Загрузка...' : 'Сменить фото'}
                </button>
              </div>
            </div>
            <div className="user-info">
              <h2>
                <FiUser size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {userData?.username || user.username}
              </h2>
              <p>Участник с: {userData?.created_at ? new Date(userData.created_at).toLocaleDateString('ru-RU') : 'Недавно'}</p>
            </div>
          </div>

          {/* ========== ВКЛАДКИ ========== */}
          <div className="profile-tabs">
            <button 
              onClick={() => handleTabChange('stats')} 
              className={`profile-tab ${activeTab === 'stats' ? 'active' : ''}`}
            >
              <FiBarChart2 size={16} style={{ marginRight: '6px' }} />
              Статистика
            </button>
            <button 
              onClick={() => handleTabChange('courses')} 
              className={`profile-tab ${activeTab === 'courses' ? 'active' : ''}`}
            >
              <FiAward size={16} style={{ marginRight: '6px' }} />
              Курсы
            </button>
            <button 
              onClick={() => handleTabChange('settings')} 
              className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <FiSettings size={16} style={{ marginRight: '6px' }} />
              Настройки
            </button>
          </div>

          {/* ========== СТАТИСТИКА ========== */}
          {activeTab === 'stats' && (
            <div>
              <div className="stats-filters">
                <button 
                  onClick={() => loadStatistics('all')} 
                  className={`filter-btn ${period === 'all' ? 'active' : ''}`}
                >
                  Всё время
                </button>
                <button 
                  onClick={() => loadStatistics('month')} 
                  className={`filter-btn ${period === 'month' ? 'active' : ''}`}
                >
                  Месяц
                </button>
                <button 
                  onClick={() => loadStatistics('week')} 
                  className={`filter-btn ${period === 'week' ? 'active' : ''}`}
                >
                  Неделя
                </button>
              </div>

              <div className="stats-metrics-grid">
                {keyMetrics.map((metric, idx) => (
                  <div key={idx} className="stats-metric-card">
                    <div className="metric-icon">{metric.icon}</div>
                    <div className="metric-info">
                      <div className="metric-value">{metric.value}</div>
                      <div className="metric-title">{metric.title}</div>
                    </div>
                  </div>
                ))}
              </div>

              {chartData.length > 0 && (
                <div className="stats-chart-card">
                  <h3>
                    <FiTrendingUp size={18} style={{ marginRight: '8px' }} />
                    Динамика медитаций
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="minutes" 
                        stroke="#667eea" 
                        strokeWidth={2}
                        name="Минуты"
                        dot={{ fill: '#667eea', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#48bb78" 
                        strokeWidth={2}
                        name="Количество сессий"
                        dot={{ fill: '#48bb78', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="meditation-dates">
                <p>
                  <FiCalendar size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Первая медитация: {stats?.first_meditation ? new Date(stats.first_meditation).toLocaleDateString('ru-RU') : '—'}
                </p>
                <p>
                  <FiStar size={16} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#fbbf24' }} />
                  Последняя медитация: {stats?.last_meditation ? new Date(stats.last_meditation).toLocaleDateString('ru-RU') : '—'}
                </p>
              </div>
            </div>
          )}

          {/* ========== КУРСЫ / ДОСТИЖЕНИЯ ========== */}
          {activeTab === 'courses' && (
            <div className="user-courses-section">
              <h3>
                <FiAward size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                Мои достижения
              </h3>
              {loadingCourses ? (
                <div className="loading-courses">Загрузка...</div>
              ) : userCourses.length === 0 ? (
                <div className="no-courses">
                  <FiBookOpen size={48} color="#94a3b8" />
                  <p>У вас пока нет завершённых курсов</p>
                  <Link to="/courses" className="btn-primary">Начать обучение</Link>
                </div>
              ) : (
                <div className="achievements-grid">
                  {userCourses.map(course => (
                    <div key={course.id} className="achievement-card">
                      <div className="achievement-icon">
                        <GiMeditation size={32} color="#667eea" />
                      </div>
                      <div className="achievement-info">
                        <h4>{course.title}</h4>
                        <p>
                          <FiCalendar size={12} style={{ marginRight: '4px' }} />
                          Завершён: {new Date(course.completed_at).toLocaleDateString('ru-RU')}
                        </p>
                        <div className="achievement-progress">
                          <div className="progress-bar-small">
                            <div className="progress-fill-small" style={{ width: `${Math.round(course.progress_percent)}%` }}></div>
                          </div>
                          <span>{Math.round(course.progress_percent)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========== НАСТРОЙКИ ========== */}
          {activeTab === 'settings' && (
            <div>
              <div className="settings-section">
                <h3>
                  <FiUser size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Изменить имя пользователя
                </h3>
                <input 
                  type="text" 
                  placeholder="Новое имя пользователя (мин. 3 символа)"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={isChangingUsername}
                />
                <input 
                  type="password" 
                  placeholder="Введите пароль для подтверждения"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={isChangingUsername}
                />
                <button 
                  onClick={changeUsername} 
                  className="btn-primary"
                  disabled={isChangingUsername}
                >
                  {isChangingUsername ? 'Сохранение...' : 'Изменить имя'}
                </button>
              </div>

              <div className="settings-section">
                <h3>
                  <FiLock size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
                  Сменить пароль
                </h3>
                <input 
                  type="password" 
                  placeholder="Старый пароль"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                <input 
                  type="password" 
                  placeholder="Новый пароль (мин. 6 символов)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                <input 
                  type="password" 
                  placeholder="Подтвердите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                <button 
                  onClick={changePassword} 
                  className="btn-primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Сохранение...' : 'Изменить пароль'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;