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
  FiUserCheck,
  FiAlertCircle,
  FiMessageCircle,
  FiClock,
  FiHash,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
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

  // ===== СОСТОЯНИЯ ДЛЯ БЛОКИРОВКИ =====
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockUser, setBlockUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);

  // ===== СОСТОЯНИЯ ДЛЯ УДАЛЕНИЯ КОММЕНТАРИЯ =====
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deleteCommentData, setDeleteCommentData] = useState(null);
  const [deleteCommentReason, setDeleteCommentReason] = useState('');
  const [isDeletingComment, setIsDeletingComment] = useState(false);

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
      } else if (activeTab === 'comments') {
        const { data } = await axios.get(`${API_URL}/api/admin/comments`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setComments(data);
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

  // ========== ОТКРЫТИЕ МОДАЛКИ УДАЛЕНИЯ КОММЕНТАРИЯ ==========
  const openDeleteCommentModal = (comment) => {
    setDeleteCommentData(comment);
    setDeleteCommentReason('');
    setShowDeleteCommentModal(true);
  };

  // ========== ЗАКРЫТИЕ МОДАЛКИ УДАЛЕНИЯ КОММЕНТАРИЯ ==========
  const closeDeleteCommentModal = () => {
    setShowDeleteCommentModal(false);
    setDeleteCommentData(null);
    setDeleteCommentReason('');
    setIsDeletingComment(false);
  };

  // ========== УДАЛЕНИЕ КОММЕНТАРИЯ С ПРИЧИНОЙ ==========
  const confirmDeleteComment = async () => {
    if (!deleteCommentReason.trim()) {
      showMessage('Пожалуйста, укажите причину удаления', 'error');
      return;
    }

    setIsDeletingComment(true);
    try {
      await axios.delete(`${API_URL}/api/admin/comments/${deleteCommentData.id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        data: { reason: deleteCommentReason.trim() }
      });
      
      showMessage('Комментарий удалён', 'success');
      closeDeleteCommentModal();
      loadData();
    } catch (err) {
      console.error('❌ Ошибка удаления комментария:', err);
      showMessage(err.response?.data?.error || 'Ошибка удаления комментария', 'error');
    } finally {
      setIsDeletingComment(false);
    }
  };

  // ========== УДАЛЕНИЕ КОММЕНТАРИЯ (старая версия для модалки поста) ==========
  const deleteComment = async (commentId) => {
    if (!window.confirm('Удалить комментарий?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        data: { reason: 'Удалено администратором' }
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
    if (!window.confirm('Удалить пользователя? Все его посты, комментарии и сессии будут удалены безвозвратно.')) return;
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

  // ========== ОТКРЫТИЕ МОДАЛКИ БЛОКИРОВКИ ==========
  const openBlockModal = (user) => {
    setBlockUser(user);
    setBlockReason('');
    setShowBlockModal(true);
  };

  // ========== ЗАКРЫТИЕ МОДАЛКИ БЛОКИРОВКИ ==========
  const closeBlockModal = () => {
    setShowBlockModal(false);
    setBlockUser(null);
    setBlockReason('');
    setIsBlocking(false);
  };

  // ========== БЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ С ПРИЧИНОЙ ==========
  const confirmBlockUser = async () => {
    if (!blockReason.trim()) {
      showMessage('Пожалуйста, укажите причину блокировки', 'error');
      return;
    }

    setIsBlocking(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/users/${blockUser.id}/toggle-block`,
        { 
          blocked: true,
          reason: blockReason.trim()
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      console.log('Ответ сервера:', response.data);
      showMessage(`Пользователь ${blockUser.username} заблокирован`, 'success');
      closeBlockModal();
      loadData();
    } catch (err) {
      console.error('Ошибка блокировки:', err);
      showMessage(err.response?.data?.error || 'Ошибка блокировки пользователя', 'error');
    } finally {
      setIsBlocking(false);
    }
  };

  // ========== РАЗБЛОКИРОВКА ==========
  const toggleUserUnblock = async (userId, username) => {
    if (!window.confirm(`Разблокировать пользователя ${username}?`)) return;
    
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/users/${userId}/toggle-block`,
        { 
          blocked: false,
          reason: null
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      console.log('Ответ сервера:', response.data);
      showMessage(`Пользователь ${username} разблокирован`, 'success');
      loadData();
    } catch (err) {
      console.error('Ошибка разблокировки:', err);
      showMessage(err.response?.data?.error || 'Ошибка разблокировки', 'error');
    }
  };

  // ========== НАЗНАЧЕНИЕ АДМИНИСТРАТОРА ==========
  const toggleAdminRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!window.confirm(`${currentRole === 'admin' ? 'Лишить прав администратора' : 'Назначить администратором'} пользователя?`)) return;
    
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
              {messageType === 'success' ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />} {message}
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
            <button 
              onClick={() => setActiveTab('comments')} 
              className={`admin-tab ${activeTab === 'comments' ? 'active' : ''}`}
            >
              <FiMessageCircle size={16} /> Комментарии
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
                        <th><FiHash size={14} /> ID</th>
                        <th><FiUser size={14} /> Имя</th>
                        <th><FiShield size={14} /> Роль</th>
                        <th><FiLock size={14} /> Статус</th>
                        <th><FiCalendar size={14} /> Дата регистрации</th>
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
                                    {u.role === 'admin' ? 'Лишить' : 'Сделать админом'}
                                  </button>
                                  {u.is_blocked ? (
                                    <button
                                      onClick={() => toggleUserUnblock(u.id, u.username)}
                                      className="admin-btn admin-btn-success"
                                      title="Разблокировать пользователя"
                                    >
                                      <FiUnlock size={12} /> Разблок.
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => openBlockModal(u)}
                                      className="admin-btn admin-btn-warning"
                                      title="Заблокировать пользователя"
                                    >
                                      <FiLock size={12} /> Заблок.
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteUser(u.id)}
                                    className="admin-btn admin-btn-danger"
                                    title="Удалить пользователя"
                                  >
                                    <FiTrash2 size={12} /> Удалить
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => viewUserDetails(u)}
                                className="admin-btn admin-btn-primary"
                                title="Просмотр деталей"
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
                        <th><FiHash size={14} /> ID</th>
                        <th><FiUser size={14} /> Автор</th>
                        <th><FiFileText size={14} /> Текст (предпросмотр)</th>
                        <th>Лайков</th>
                        <th><FiMessageSquare size={14} /> Комментариев</th>
                        <th><FiCalendar size={14} /> Дата</th>
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

              {/* ========== КОММЕНТАРИИ ========== */}
              {activeTab === 'comments' && (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th><FiHash size={14} /> ID</th>
                        <th><FiUser size={14} /> Автор</th>
                        <th><FiFileText size={14} /> Пост</th>
                        <th><FiMessageCircle size={14} /> Текст комментария</th>
                        <th><FiClock size={14} /> Дата и время</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comments.map(c => (
                        <tr key={c.id}>
                          <td>{c.id}</td>
                          <td><strong>{c.username}</strong></td>
                          <td>
                            <span style={{ fontSize: '12px', color: '#718096' }}>
                              Пост #{c.post_id}
                            </span>
                          </td>
                          <td className="post-preview" style={{ maxWidth: '300px' }}>
                            {c.content}
                          </td>
                          <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                            {new Date(c.created_at).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <div className="admin-btn-group">
                              <button
                                onClick={() => openDeleteCommentModal(c)}
                                className="admin-btn admin-btn-danger"
                                title="Удалить комментарий"
                              >
                                <FiTrash2 size={12} /> Удалить
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {comments.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
                      <FiMessageCircle size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                      <p>Комментариев пока нет</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========== МОДАЛКА БЛОКИРОВКИ ========== */}
      {showBlockModal && blockUser && (
        <div className="modal-overlay" onClick={closeBlockModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e53e3e' }}>
                <FiLock size={24} />
                Блокировка пользователя
              </h3>
              <button className="modal-close" onClick={closeBlockModal}>✕</button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                <strong>Пользователь:</strong> {blockUser.username}
              </p>
              <p style={{ fontSize: '14px', color: '#718096' }}>
                <FiAlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                После блокировки пользователь не сможет входить в систему, 
                создавать посты и оставлять комментарии.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="blockReason" style={{ 
                display: 'block', 
                fontWeight: '500', 
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Причина блокировки <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <textarea
                id="blockReason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Укажите причину блокировки пользователя..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                disabled={isBlocking}
                autoFocus
              />
              <div style={{ 
                fontSize: '12px', 
                color: '#718096', 
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {blockReason.length}/500 символов
              </div>
            </div>

            <div className="modal-buttons" style={{ 
              display: 'flex', 
              gap: '10px',
              justifyContent: 'flex-end',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '16px'
            }}>
              <button
                onClick={closeBlockModal}
                className="admin-btn admin-btn-secondary"
                disabled={isBlocking}
              >
                Отмена
              </button>
              <button
                onClick={confirmBlockUser}
                className="admin-btn admin-btn-danger"
                disabled={isBlocking || !blockReason.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isBlocking ? (
                  <>
                    <span className="spinner" style={{ 
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}></span>
                    Блокировка...
                  </>
                ) : (
                  <>
                    <FiLock size={16} />
                    Заблокировать
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== МОДАЛКА УДАЛЕНИЯ КОММЕНТАРИЯ ========== */}
      {showDeleteCommentModal && deleteCommentData && (
        <div className="modal-overlay" onClick={closeDeleteCommentModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e53e3e' }}>
                <FiTrash2 size={24} />
                Удаление комментария
              </h3>
              <button className="modal-close" onClick={closeDeleteCommentModal}>✕</button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                <strong>Автор:</strong> {deleteCommentData.username}
              </p>
              <p style={{ fontSize: '14px', color: '#4a5568', marginBottom: '8px' }}>
                <strong>Комментарий:</strong>
              </p>
              <div style={{
                padding: '12px',
                background: '#f8fafc',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#2d3748',
                marginBottom: '12px'
              }}>
                {deleteCommentData.content}
              </div>
              <p style={{ fontSize: '12px', color: '#718096' }}>
                <strong>Дата:</strong> {new Date(deleteCommentData.created_at).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p style={{ fontSize: '14px', color: '#718096', marginTop: '12px' }}>
                <FiAlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                Комментарий будет удалён безвозвратно.
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="deleteCommentReason" style={{ 
                display: 'block', 
                fontWeight: '500', 
                marginBottom: '8px',
                fontSize: '14px'
              }}>
                Причина удаления <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <textarea
                id="deleteCommentReason"
                value={deleteCommentReason}
                onChange={(e) => setDeleteCommentReason(e.target.value)}
                placeholder="Укажите причину удаления комментария..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                disabled={isDeletingComment}
                autoFocus
              />
              <div style={{ 
                fontSize: '12px', 
                color: '#718096', 
                marginTop: '4px',
                textAlign: 'right'
              }}>
                {deleteCommentReason.length}/500 символов
              </div>
            </div>

            <div className="modal-buttons" style={{ 
              display: 'flex', 
              gap: '10px',
              justifyContent: 'flex-end',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '16px'
            }}>
              <button
                onClick={closeDeleteCommentModal}
                className="admin-btn admin-btn-secondary"
                disabled={isDeletingComment}
              >
                Отмена
              </button>
              <button
                onClick={confirmDeleteComment}
                className="admin-btn admin-btn-danger"
                disabled={isDeletingComment || !deleteCommentReason.trim()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isDeletingComment ? (
                  <>
                    <span className="spinner" style={{ 
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}></span>
                    Удаление...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    Удалить комментарий
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <FiClock size={14} style={{ marginRight: '6px' }} />
                Медитация {selectedPost.meditation_duration} минут
              </div>
            )}
            <div className="post-stats-info">
              <span>❤️ {selectedPost.likes_count} лайков</span>
              <span><FiMessageSquare size={14} style={{ marginRight: '4px' }} /> {selectedPost.comments_count} комментариев</span>
              <span><FiCalendar size={14} style={{ marginRight: '4px' }} /> {new Date(selectedPost.created_at).toLocaleString('ru-RU')}</span>
            </div>

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
                            <FiClock size={12} style={{ marginRight: '4px' }} />
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
              {selectedUser.is_blocked && selectedUser.block_reason && (
                <p>
                  <strong>Причина блокировки:</strong>{' '}
                  <span style={{ color: '#e53e3e' }}>{selectedUser.block_reason}</span>
                </p>
              )}
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

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default AdminPage;