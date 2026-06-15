import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { FiUsers, FiFileText, FiBarChart2, FiTrash2, FiUserX, FiShield, FiEye } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [activeTab, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const { data } = await axios.get(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStats(data);
      } else if (activeTab === 'users') {
        const { data } = await axios.get(`${API_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setUsers(data);
      } else if (activeTab === 'posts') {
        const { data } = await axios.get(`${API_URL}/api/admin/posts`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPosts(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Удалить пользователя? Все его посты и сессии будут удалены.')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Удалить пост?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      loadData();
      setShowPostModal(false);
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  const viewFullPost = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  if (user?.role !== 'admin') {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="admin-access-denied">
            <FiShield size={48} color="#ef4444" />
            <h2>Доступ запрещён</h2>
            <p>Эта страница доступна только администраторам.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="admin-container">
          <h1>
            <FiShield size={28} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
            Админ-панель
          </h1>
          
          <div className="admin-tabs">
            <button onClick={() => setActiveTab('stats')} className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}>
              <FiBarChart2 size={16} /> Статистика
            </button>
            <button onClick={() => setActiveTab('users')} className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}>
              <FiUsers size={16} /> Пользователи
            </button>
            <button onClick={() => setActiveTab('posts')} className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`}>
              <FiFileText size={16} /> Посты
            </button>
          </div>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <>
              {activeTab === 'stats' && stats && (
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-value">{stats.total_users}</div>
                    <div className="admin-stat-label">Пользователей</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-value">{stats.total_posts}</div>
                    <div className="admin-stat-label">Постов</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-value">{stats.total_sessions}</div>
                    <div className="admin-stat-label">Сессий медитации</div>
                  </div>
                  <div className="admin-stat-card">
                    <div className="admin-stat-value">{stats.total_minutes}</div>
                    <div className="admin-stat-label">Всего минут</div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Роль</th>
                        <th>Дата регистрации</th>
                        <th>Сессий</th>
                        <th>Постов</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.username}</td>
                          <td>{u.role === 'admin' ? 'Админ' : 'Пользователь'}</td>
                          <td>{new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
                          <td>{u.total_sessions}</td>
                          <td>{u.total_posts}</td>
                          <td>
                            {u.role !== 'admin' && (
                              <button onClick={() => deleteUser(u.id)} className="admin-delete-btn">
                                <FiUserX size={14} /> Удалить
                              </button>
                            )}
                            {u.role === 'admin' && u.id !== parseInt(user.userId) && (
                              <button onClick={() => deleteUser(u.id)} className="admin-delete-btn">
                                <FiUserX size={14} /> Удалить
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'posts' && (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Автор</th>
                        <th>Текст (предпросмотр)</th>
                        <th>Лайков</th>
                        <th>Комментариев</th>
                        <th>Дата</th>
                        <th>Просмотр</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map(p => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.username}</td>
                          <td className="post-preview">{p.content?.substring(0, 80)}...</td>
                          <td>{p.likes_count}</td>
                          <td>{parseInt(p.comments_count)}</td>
                          <td>{new Date(p.created_at).toLocaleDateString('ru-RU')}</td>
                          <td className="post-action-cell">
                            <button onClick={() => viewFullPost(p)} className="view-post-btn">
                              <FiEye size={14} /> Читать
                            </button>
                          </td>
                          <td>
                            <button onClick={() => deletePost(p.id)} className="admin-delete-btn">
                              <FiTrash2 size={14} /> Удалить
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showPostModal && selectedPost && (
        <div className="modal show" onClick={() => setShowPostModal(false)}>
          <div className="modal-content post-view-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Пост от {selectedPost.username}</h3>
              <button className="modal-close" onClick={() => setShowPostModal(false)}>✕</button>
            </div>
            <div className="post-full-content">
              <p className="post-full-text">{selectedPost.content}</p>
              {selectedPost.meditation_duration && (
                <div className="post-meditation-info">
                  Медитация {selectedPost.meditation_duration} минут
                </div>
              )}
              <div className="post-stats-info">
                <span>❤️ {selectedPost.likes_count} лайков</span>
                <span>💬 {selectedPost.comments_count} комментариев</span>
                <span>Дата создания: {new Date(selectedPost.created_at).toLocaleString('ru-RU')}</span>
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={() => deletePost(selectedPost.id)} className="btn-danger">
                <FiTrash2 size={16} /> Удалить пост
              </button>
              <button onClick={() => setShowPostModal(false)} className="btn-secondary">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPage;