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

const API_URL = 'http://localhost:3000';

const ProfilePage = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('all');
  const [newUsername, setNewUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('stats');
  const [userCourses, setUserCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    loadUserData();
    loadStatistics('all');
  }, []);

  const loadUserData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUserData(response.data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
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
      console.error('Ошибка загрузки статистики:', error);
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
      console.error(err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await axios.post(`${API_URL}/api/upload-avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.avatarUrl) {
        setUserData({ ...userData, avatar: response.data.avatarUrl });
        setMessage('Аватар успешно обновлен!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Ошибка загрузки');
    }
  };

  const changeUsername = async () => {
    if (!newUsername) {
      setMessage('Введите новое имя пользователя');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/change-username`, 
        { newUsername, password: oldPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.message) {
        setMessage('Имя пользователя изменено!');
        localStorage.setItem('username', newUsername);
        loadUserData();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Ошибка');
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 6) {
      setMessage('Новый пароль должен быть минимум 6 символов');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('Пароли не совпадают');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (response.data.message) {
        setMessage('Пароль успешно изменен!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Ошибка');
    }
  };

  const getAvatarUrl = () => {
    if (userData?.avatar) {
      return userData.avatar;
    }
    return '/uploads/default-avatar.png';
  };

  const prepareChartData = () => {
    if (!stats?.daily_data) return [];
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
          {/* ========== ШАПКА ПРОФИЛЯ ========== */}
          <div className="profile-header">
            <div className="avatar-section">
              <img 
                className="avatar" 
                src={getAvatarUrl()} 
                alt="Avatar"
                onError={(e) => {
                  e.target.src = '/uploads/default-avatar.png';
                }}
              />
              <div>
                <input 
                  type="file" 
                  id="avatarInput" 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <button 
                  className="change-avatar-btn"
                  onClick={() => document.getElementById('avatarInput').click()}
                >
                  <FiCamera size={14} style={{ marginRight: '6px' }} />
                  Сменить фото
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
                <button onClick={() => loadStatistics('all')} className={`filter-btn ${period === 'all' ? 'active' : ''}`}>Всё время</button>
                <button onClick={() => loadStatistics('month')} className={`filter-btn ${period === 'month' ? 'active' : ''}`}>Месяц</button>
                <button onClick={() => loadStatistics('week')} className={`filter-btn ${period === 'week' ? 'active' : ''}`}>Неделя</button>
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
                  placeholder="Новое имя пользователя"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Введите пароль для подтверждения"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button onClick={changeUsername} className="btn-primary">Изменить имя</button>
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
                />
                <input 
                  type="password" 
                  placeholder="Новый пароль (мин. 6 символов)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Подтвердите пароль"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button onClick={changePassword} className="btn-primary">Изменить пароль</button>
              </div>
            </div>
          )}
          
          {/* ========== СООБЩЕНИЯ ОБ УСПЕХЕ / ОШИБКЕ ========== */}
          {message && (
            <div className="message" style={{color: message.includes('успешно') ? '#48bb78' : '#e53e3e'}}>
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;