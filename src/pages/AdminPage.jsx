import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiTrash2, 
  FiUserX, 
  FiShield, 
  FiEye,
  FiUserPlus,
  FiMessageSquare,
  FiLock,
  FiUnlock,
  FiUserCheck
} from 'react-icons/fi';

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [postComments, setPostComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [activeTab, user]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

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
      console.error('❌ Ошибка загрузки:', err);
      showMessage(err.response?.data?.error || 'Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ========== ЗАГРУЗКА КОММЕНТАРИЕВ К ПОСТУ ==========
  const loadPostComments = async (postId) => {
    setLoadingComments(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPostComments(data);
    } catch (err) {
      console.error('❌ Ошибка загрузки комментариев:', err);
      showMessage('Ошибка загрузки комментариев', 'error');
    } finally {
      setLoadingComments(false);
    }
  };

  // ========== УДАЛЕНИЕ КОММЕНТАРИЯ ==========
  const deleteComment = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showMessage('Комментарий удалён', 'success');
      if (selectedPost) {
        await loadPostComments(selectedPost.id);
      }
      await loadData();
    } catch (err) {
      console.error('❌ Ошибка удаления комментария:', err);
      showMessage(err.response?.data?.error || 'Ошибка удаления комментария', 'error');
    }
  };

  // ========== УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ==========
  const deleteUser = async (userId) => {
    if (!window.confirm('⚠️ Удалить пользователя? Все его посты, комментарии и сессии будут удалены безвозвратно.')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showMessage('Пользователь удалён', 'success');
      loadData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Ошибка удаления', 'error');
    }
  };

  // ========== БЛОКИРОВКА/РАЗБЛОКИРОВКА ==========
  const toggleUserBlock = async (userId, currentBlocked) => {
    if (!window.confirm(`⚠️ ${currentBlocked ? 'Разблокировать' : 'Заблокировать'} пользователя?`)) return;
    
    try {
      const response = await axios.post(`${API_URL}/api/admin/users/${userId}/toggle-block`, 
        { blocked: !currentBlocked },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log('✅ Ответ сервера:', response.data);
      showMessage(`Пользователь ${currentBlocked ? 'разблокирован' : 'заблокирован'}`, 'success');
      loadData();
    } catch (err) {
      console.error('❌ Ошибка блокировки:', err);
      console.error('❌ Детали:', err.response?.data);
      showMessage(err.response?.data?.error || 'Ошибка изменения статуса', 'error');
    }
  };

  // ========== НАЗНАЧЕНИЕ АДМИНИСТРАТОРА ==========
  const toggleAdminRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!window.confirm(`⚠️ ${currentRole === 'admin' ? 'Лишить прав администратора' : 'Назначить администратором'} пользователя?`)) return;
    
    try {
      await axios.post(`${API_URL}/api/admin/users/${userId}/toggle-role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showMessage(`Пользователь ${currentRole === 'admin' ? 'лишён прав администратора' : 'назначен администратором'}`, 'success');
      loadData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Ошибка', 'error');
    }
  };

  // ========== УДАЛЕНИЕ ПОСТА ==========
  const deletePost = async (postId) => {
    if (!window.confirm('Удалить пост?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showMessage('Пост удалён', 'success');
      loadData();
      setShowPostModal(false);
      setSelectedPost(null);
    } catch (err) {
      showMessage(err.response?.data?.error || 'Ошибка удаления', 'error');
    }
  };

  // ========== ОТКРЫТИЕ МОДАЛКИ ПОСТА ==========
  const viewFullPost = async (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
    await loadPostComments(post.id);
  };

  // ========== ЗАКРЫТИЕ МОДАЛКИ ПОСТА ==========
  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    setPostComments([]);
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  if (user?.role !== 'admin') {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="admin-access-denied">
            <FiShield size={64} />
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
            <FiShield size={28} />
            Админ-панель
          </h1>

          {message && (
            <div className={`admin-message admin-message-${messageType}`}>
              {messageType === 'success' ? '✅' : '❌'} {message}
            </div>
          )}

          <div className="admin-tabs">
            <button 
              onClick={() => setActiveTab('stats')} 
              className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
            >
              <FiBarChart2 size={16} /> Статистика
            </button>
            <button 
              onClick={() => setActiveTab('users')} 
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            >
              <FiUsers size={16} /> Пользователи
            </button>
            <button 
              onClick={() => setActiveTab('posts')} 
              className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`}
            >
              <FiFileText size={16} /> Посты
            </button>
          </div>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <>
              {/* ========== СТАТИСТИКА ========== */}
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

              {/* ========== ПОЛЬЗОВАТЕЛИ ========== */}
              {activeTab === 'users' && (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Имя</th>
                        <th>Роль</th>
                        <th>Статус</th>
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
                          <td><strong>{u.username}</strong></td>
                          <td>
                            <span className={`admin-badge ${u.role === 'admin' ? 'admin-badge-admin' : 'admin-badge-user'}`}>
                              {u.role === 'admin' ? 'Админ' : 'Пользователь'}
                            </span>
                          </td>
                          <td>
                            <span className={`admin-badge ${u.is_blocked ? 'admin-badge-blocked' : 'admin-badge-active'}`}>
                              {u.is_blocked ? <FiLock size={12} /> : <FiUnlock size={12} />}
                              {u.is_blocked ? 'Заблокирован' : 'Активен'}
                            </span>
                          </td>
                          <td>{new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
                          <td>{u.total_sessions}</td>
                          <td>{u.total_posts}</td>
                          <td>
                            <div className="admin-btn-group">
                              {u.id !== parseInt(user.userId) && (
                                <>
                                  <button
                                    onClick={() => toggleAdminRole(u.id, u.role)}
                                    className={`admin-btn ${u.role === 'admin' ? 'admin-btn-danger' : 'admin-btn-success'}`}
                                    title={u.role === 'admin' ? 'Лишить прав админа' : 'Назначить админом'}
                                  >
                                    {u.role === 'admin' ? <FiUserX size={12} /> : <FiUserPlus size={12} />}
                                    {u.role === 'admin' ? 'Лишить админа' : 'Сделать админом'}
                                  </button>
                                  <button
                                    onClick={() => toggleUserBlock(u.id, u.is_blocked)}
                                    className={`admin-btn ${u.is_blocked ? 'admin-btn-success' : 'admin-btn-warning'}`}
                                    title={u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                                  >
                                    {u.is_blocked ? <FiUnlock size={12} /> : <FiLock size={12} />}
                                    {u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                                  </button>
                                  <button
                                    onClick={() => deleteUser(u.id)}
                                    className="admin-btn admin-btn-danger"
                                  >
                                    <FiTrash2 size={12} /> Удалить
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => viewUserDetails(u)}
                                className="admin-btn admin-btn-primary"
                              >
                                <FiEye size={12} /> Детали
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ========== ПОСТЫ ========== */}
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
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map(p => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td><strong>{p.username}</strong></td>
                          <td className="post-preview">{p.content?.substring(0, 80)}...</td>
                          <td>❤️ {p.likes_count}</td>
                          <td>
                            <span className="admin-badge-comments">
                              <FiMessageSquare size={12} /> {parseInt(p.comments_count)}
                            </span>
                          </td>
                          <td>{new Date(p.created_at).toLocaleDateString('ru-RU')}</td>
                          <td>
                            <div className="admin-btn-group">
                              <button
                                onClick={() => viewFullPost(p)}
                                className="view-post-btn"
                              >
                                <FiEye size={12} /> Читать
                              </button>
                              <button
                                onClick={() => deletePost(p.id)}
                                className="admin-btn admin-btn-danger"
                              >
                                <FiTrash2 size={12} /> Удалить
                              </button>
                            </div>
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

      {/* ========== МОДАЛКА ПОСТА С КОММЕНТАРИЯМИ ========== */}
      {showPostModal && selectedPost && (
        <div className="modal-overlay" onClick={closePostModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FiFileText size={20} />
                Пост от {selectedPost.username}
              </h3>
              <button className="modal-close" onClick={closePostModal}>✕</button>
            </div>
            
            <div className="post-full-text">{selectedPost.content}</div>
            {selectedPost.meditation_duration && (
              <div className="post-meditation-info">
                🧘 Медитация {selectedPost.meditation_duration} минут
              </div>
            )}
            <div className="post-stats-info">
              <span>❤️ {selectedPost.likes_count} лайков</span>
              <span>💬 {selectedPost.comments_count} комментариев</span>
              <span>📅 {new Date(selectedPost.created_at).toLocaleString('ru-RU')}</span>
            </div>

            {/* ===== КОММЕНТАРИИ ===== */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <FiMessageSquare size={18} />
                Комментарии ({postComments.length})
              </h4>
              
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#718096' }}>
                  Загрузка комментариев...
                </div>
              ) : postComments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#718096' }}>
                  Нет комментариев
                </div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {postComments.map(comment => (
                    <div key={comment.id} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{comment.username}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {new Date(comment.created_at).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568' }}>{comment.content}</p>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="admin-btn admin-btn-danger"
                        style={{ flexShrink: 0 }}
                        title="Удалить комментарий"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-buttons" style={{ marginTop: '1.5rem' }}>
              <button onClick={() => deletePost(selectedPost.id)} className="admin-btn admin-btn-danger">
                <FiTrash2 size={16} /> Удалить пост
              </button>
              <button onClick={closePostModal} className="admin-btn admin-btn-secondary">
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== МОДАЛКА ПОЛЬЗОВАТЕЛЯ ========== */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FiUsers size={20} />
                {selectedUser.username}
              </h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            <div className="user-details-grid">
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Имя:</strong> {selectedUser.username}</p>
              <p>
                <strong>Роль:</strong>{' '}
                <span className={`admin-badge ${selectedUser.role === 'admin' ? 'admin-badge-admin' : 'admin-badge-user'}`}>
                  {selectedUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
              </p>
              <p>
                <strong>Статус:</strong>{' '}
                <span className={`admin-badge ${selectedUser.is_blocked ? 'admin-badge-blocked' : 'admin-badge-active'}`}>
                  {selectedUser.is_blocked ? <FiLock size={12} /> : <FiUnlock size={12} />}
                  {selectedUser.is_blocked ? 'Заблокирован' : 'Активен'}
                </span>
              </p>
              <p><strong>Дата регистрации:</strong> {new Date(selectedUser.created_at).toLocaleDateString('ru-RU')}</p>
              <p><strong>Сессий медитации:</strong> {selectedUser.total_sessions}</p>
              <p><strong>Постов:</strong> {selectedUser.total_posts}</p>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowUserModal(false)} className="admin-btn admin-btn-primary">
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