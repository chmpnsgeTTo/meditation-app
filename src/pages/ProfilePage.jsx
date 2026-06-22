import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  FiSettings, 
  FiBarChart2, 
  FiUser, 
  FiLock, 
  FiCamera, 
  FiCalendar, 
  FiStar, 
  FiTrendingUp, 
  FiActivity, 
  FiAward, 
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiTarget,
  FiUsers,
  FiHeart,
  FiZap,
  FiFeather
} from 'react-icons/fi';
import { GiMeditation, GiLotus, GiSittingDog, GiSnake, GiLungs } from 'react-icons/gi';
import { FaUserCircle, FaChartLine, FaFire } from 'react-icons/fa';
import { IoMdMedal } from 'react-icons/io';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
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
  const [messageType, setMessageType] = useState('success');
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
      const response = await api.get('/api/user', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUserData(response.data);
      setAvatarTimestamp(Date.now());
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      showMessage('Ошибка загрузки данных пользователя', 'error');
    }
  };

  const loadStatistics = async (p) => {
    setPeriod(p);
    try {
      const response = await api.get(`/api/statistics?period=${p}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      showMessage('Ошибка загрузки статистики', 'error');
    }
  };

  const loadUserCourses = async () => {
    setLoadingCourses(true);
    try {
      const { data } = await api.get('/api/user/courses', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUserCourses(data);
    } catch (err) {
      console.error('Ошибка загрузки курсов:', err);
      showMessage('Ошибка загрузки курсов', 'error');
    } finally {
      setLoadingCourses(false);
    }
  };

  const getAvatarUrl = () => {
    if (userData?.avatar && userData.avatar !== '/uploads/default-avatar.png') {
      if (userData.avatar.startsWith('http')) {
        return userData.avatar;
      }
      return `${userData.avatar}?t=${avatarTimestamp}`;
    }
    return `/uploads/default-avatar.png?t=${avatarTimestamp}`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      showMessage('Пожалуйста, выберите изображение (JPEG, PNG, GIF, WEBP)', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Файл слишком большой. Максимум 5MB', 'error');
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await api.post('/api/upload-avatar', formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.avatarUrl) {
        setUserData(prev => ({ ...prev, avatar: response.data.avatarUrl }));
        setAvatarTimestamp(Date.now());
        await loadUserData();
        showMessage('Аватар успешно обновлен!', 'success');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      showMessage(error.response?.data?.error || 'Ошибка загрузки аватара', 'error');
    } finally {
      setIsUploading(false);
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
      const response = await api.post('/api/change-username', 
        { newUsername, password: oldPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.message) {
        if (response.data.token) {
          login(response.data.token, response.data.username, user.userId);
        }
        await loadUserData();
        setNewUsername('');
        setOldPassword('');
        showMessage('Имя пользователя изменено!', 'success');
      }
    } catch (error) {
      console.error('Ошибка смены имени:', error);
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
      const response = await api.post('/api/change-password',
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
      console.error('Ошибка смены пароля:', error);
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

  // Цвета для иконок статистики
  const metricColors = ['#667eea', '#48bb78', '#f6ad55', '#fc8181'];

  const keyMetrics = [
    { 
      title: 'Всего минут', 
      value: stats?.total_minutes || 0, 
      icon: <FiTrendingUp size={24} />,
      color: '#667eea',
      bg: 'rgba(102, 126, 234, 0.1)'
    },
    { 
      title: 'Всего сессий', 
      value: stats?.total_sessions || 0, 
      icon: <FiActivity size={24} />,
      color: '#48bb78',
      bg: 'rgba(72, 187, 120, 0.1)'
    },
    { 
      title: 'Средняя длительность', 
      value: `${stats?.avg_duration || 0} мин`, 
      icon: <FiClock size={24} />,
      color: '#f6ad55',
      bg: 'rgba(246, 173, 85, 0.1)'
    },
    { 
      title: 'Самая длинная', 
      value: `${stats?.longest_session || 0} мин`, 
      icon: <FiStar size={24} />,
      color: '#fc8181',
      bg: 'rgba(252, 129, 129, 0.1)'
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
            <div className={`profile-message profile-message-${messageType}`}>
              {messageType === 'success' ? (
                <FiCheckCircle size={16} />
              ) : (
                <FiAlertCircle size={16} />
              )}
              {message}
            </div>
          )}

          {/* ========== ШАПКА ПРОФИЛЯ ========== */}
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="profile-avatar-wrapper">
                {userData?.avatar && userData.avatar !== '/uploads/default-avatar.png' ? (
                  <img 
                    src={getAvatarUrl()}
                    alt="Avatar"
                    className="profile-avatar"
                    onError={(e) => {
                      e.target.src = `/uploads/default-avatar.png?t=${Date.now()}`;
                    }}
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <FaUserCircle size={80} />
                  </div>
                )}
                <div className="profile-avatar-overlay">
                  <input 
                    type="file" 
                    id="avatarInput" 
                    accept="image/*" 
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                  <button 
                    className="profile-avatar-btn"
                    onClick={() => document.getElementById('avatarInput').click()}
                    disabled={isUploading}
                  >
                    <FiCamera size={16} />
                    {isUploading ? 'Загрузка...' : 'Сменить'}
                  </button>
                </div>
              </div>
            </div>
            <div className="profile-user-info">
              <h2 className="profile-username">
                <FiUser size={18} />
                {userData?.username || user.username}
              </h2>
              <p className="profile-joined">
                <FiCalendar size={14} />
                Участник с: {userData?.created_at ? new Date(userData.created_at).toLocaleDateString('ru-RU') : 'Недавно'}
              </p>
              <div className="profile-badges">
                <span className="profile-badge">
                  <IoMdMedal size={14} />
                  {stats?.total_sessions || 0} сессий
                </span>
                <span className="profile-badge">
                  <FaFire size={14} />
                  {stats?.total_minutes || 0} минут
                </span>
              </div>
            </div>
          </div>

          {/* ========== ВКЛАДКИ - ПО ЦЕНТРУ ========== */}
          <div className="profile-tabs">
            <button 
              onClick={() => handleTabChange('stats')} 
              className={`profile-tab ${activeTab === 'stats' ? 'active' : ''}`}
            >
              <FiBarChart2 size={16} />
              Статистика
            </button>
            <button 
              onClick={() => handleTabChange('courses')} 
              className={`profile-tab ${activeTab === 'courses' ? 'active' : ''}`}
            >
              <FiAward size={16} />
              Курсы
            </button>
            <button 
              onClick={() => handleTabChange('settings')} 
              className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <FiSettings size={16} />
              Настройки
            </button>
          </div>

          {/* ========== СТАТИСТИКА ========== */}
          {activeTab === 'stats' && (
            <div className="profile-stats">
              <div className="profile-stats-filters">
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

              {/* Статистика - отдельные боксы с цветными иконками */}
              <div className="profile-metrics-grid">
                {keyMetrics.map((metric, idx) => (
                  <div key={idx} className="profile-metric-card">
                    <div 
                      className="profile-metric-icon"
                      style={{
                        background: metric.bg,
                        color: metric.color
                      }}
                    >
                      {metric.icon}
                    </div>
                    <div className="profile-metric-info">
                      <div className="profile-metric-value">{metric.value}</div>
                      <div className="profile-metric-title">{metric.title}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* График - улучшенная стилистика */}
              {chartData.length > 0 && (
                <div className="profile-chart-card">
                  <h3 className="profile-chart-title">
                    <FaChartLine size={18} />
                    Динамика медитаций
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.5} />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                        axisLine={{ stroke: 'var(--border-color)' }}
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                        axisLine={{ stroke: 'var(--border-color)' }}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'var(--bg-card)', 
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        iconType="circle"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="minutes" 
                        stroke="#667eea" 
                        strokeWidth={3}
                        name="Минуты"
                        dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sessions" 
                        stroke="#48bb78" 
                        strokeWidth={3}
                        name="Количество сессий"
                        dot={{ fill: '#48bb78', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#48bb78', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="profile-dates">
                <p>
                  <FiCalendar size={16} />
                  Первая медитация: {stats?.first_meditation ? new Date(stats.first_meditation).toLocaleDateString('ru-RU') : '—'}
                </p>
                <p>
                  <FiStar size={16} />
                  Последняя медитация: {stats?.last_meditation ? new Date(stats.last_meditation).toLocaleDateString('ru-RU') : '—'}
                </p>
              </div>
            </div>
          )}

          {/* ========== КУРСЫ / ДОСТИЖЕНИЯ ========== */}
          {activeTab === 'courses' && (
            <div className="profile-courses">
              <h3 className="profile-courses-title">
                <FiAward size={20} />
                Мои достижения
              </h3>
              {loadingCourses ? (
                <div className="profile-loading">
                  <FiRefreshCw size={24} className="spinning" />
                  <p>Загрузка...</p>
                </div>
              ) : userCourses.length === 0 ? (
                <div className="profile-no-courses">
                  <FiBookOpen size={48} />
                  <p>У вас пока нет завершённых курсов</p>
                  <Link to="/courses" className="btn-primary">
                    <FiBookOpen size={16} />
                    Начать обучение
                  </Link>
                </div>
              ) : (
                <div className="profile-achievements-grid">
                  {userCourses.map(course => (
                    <div key={course.id} className="profile-achievement-card">
                      <div className="profile-achievement-icon">
                        <GiMeditation size={32} />
                      </div>
                      <div className="profile-achievement-info">
                        <h4>{course.title}</h4>
                        <p>
                          <FiCalendar size={12} />
                          Завершён: {new Date(course.completed_at).toLocaleDateString('ru-RU')}
                        </p>
                        <div className="profile-achievement-progress">
                          <div className="progress-bar-small">
                            <div className="progress-fill-small completed" style={{ width: `${Math.round(course.progress_percent)}%` }}></div>
                          </div>
                          <span className="progress-percent">{Math.round(course.progress_percent)}%</span>
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
            <div className="profile-settings">
              <div className="profile-settings-section">
                <h3>
                  <FiUser size={20} />
                  Изменить имя пользователя
                </h3>
                <div className="profile-settings-form">
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
                    {isChangingUsername ? (
                      <>
                        <span className="spinner-small"></span>
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <FiUser size={16} />
                        Изменить имя
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="profile-settings-section">
                <h3>
                  <FiLock size={20} />
                  Сменить пароль
                </h3>
                <div className="profile-settings-form">
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
                    {isChangingPassword ? (
                      <>
                        <span className="spinner-small"></span>
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <FiLock size={16} />
                        Изменить пароль
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;