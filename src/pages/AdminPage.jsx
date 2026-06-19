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
  FiXCircle,
  FiMail,
  FiSend,
  FiX,
  FiHeart
} from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [unblockRequests, setUnblockRequests] = useState([]);
  const [requestStats, setRequestStats] = useState(null);
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
  const [refreshKey, setRefreshKey] = useState(0);

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

  // ===== СОСТОЯНИЯ ДЛЯ ОБРАТНОЙ СВЯЗИ =====
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestStatus, setRequestStatus] = useState('');
  const [requestComment, setRequestComment] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [activeTab, user, refreshKey]);

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
      } else if (activeTab === 'feedback') {
        const [statsData, requestsData] = await Promise.all([
          axios.get(`${API_URL}/api/admin/unblock-requests/stats`, {
            headers: { Authorization: `Bearer ${user.token}` }
          }),
          axios.get(`${API_URL}/api/admin/unblock-requests`, {
            headers: { Authorization: `Bearer ${user.token}` }
          })
        ]);
        setRequestStats(statsData.data);
        setUnblockRequests(requestsData.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      showMessage(err.response?.data?.error || 'Ошибка загрузки данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const reloadData = () => {
    setRefreshKey(prev => prev + 1);
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
      console.error('Ошибка загрузки комментариев:', err);
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
        headers: { Authorization: `Bearer ${user.token}` },
        data: { reason: 'Удалено администратором' }
      });
      showMessage('Комментарий удалён', 'success');
      if (selectedPost) {
        await loadPostComments(selectedPost.id);
      }
      reloadData();
    } catch (err) {
      console.error('Ошибка удаления комментария:', err);
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
      reloadData();
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

  const closeBlockModal = () => {
    setShowBlockModal(false);
    setBlockUser(null);
    setBlockReason('');
    setIsBlocking(false);
  };

  // ========== БЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ ==========
  const confirmBlockUser = async () => {
    if (!blockReason.trim()) {
      showMessage('Пожалуйста, укажите причину блокировки', 'error');
      return;
    }

    setIsBlocking(true);
    try {
      await axios.post(
        `${API_URL}/api/admin/users/${blockUser.id}/toggle-block`,
        { blocked: true, reason: blockReason.trim() },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showMessage(`Пользователь ${blockUser.username} заблокирован`, 'success');
      closeBlockModal();
      reloadData();
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
      await axios.post(
        `${API_URL}/api/admin/users/${userId}/toggle-block`,
        { blocked: false, reason: null },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showMessage(`Пользователь ${username} разблокирован`, 'success');
      reloadData();
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
      reloadData();
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
      setShowPostModal(false);
      setSelectedPost(null);
      reloadData();
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

  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    setPostComments([]);
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // ========== ОТКРЫТИЕ МОДАЛКИ УДАЛЕНИЯ КОММЕНТАРИЯ ==========
  const openDeleteCommentModal = (comment) => {
    setDeleteCommentData(comment);
    setDeleteCommentReason('');
    setShowDeleteCommentModal(true);
  };

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
      reloadData();
    } catch (err) {
      console.error('Ошибка удаления комментария:', err);
      showMessage(err.response?.data?.error || 'Ошибка удаления комментария', 'error');
    } finally {
      setIsDeletingComment(false);
    }
  };

  // ========== ОБРАТНАЯ СВЯЗЬ ==========
  const updateRequestStatus = async (requestId, status, comment) => {
    try {
      await axios.put(`${API_URL}/api/admin/unblock-requests/${requestId}`,
        { status, admin_comment: comment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showMessage(`Статус запроса обновлён на "${status}"`, 'success');
      setShowRequestModal(false);
      reloadData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Ошибка обновления', 'error');
    }
  };

  const deleteRequest = async (requestId) => {
    if (!window.confirm('Удалить запрос?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/unblock-requests/${requestId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showMessage('Запрос удалён', 'success');
      reloadData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Ошибка удаления', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Ожидает', color: '#ed8936', bg: '#fffaf0' },
      in_progress: { label: 'В работе', color: '#4299e1', bg: '#ebf8ff' },
      resolved: { label: 'Разблокирован', color: '#48bb78', bg: '#f0fff4' },
      rejected: { label: 'Отклонён', color: '#e53e3e', bg: '#fff5f5' }
    };
    return statusMap[status] || { label: status, color: '#718096', bg: '#f7fafc' };
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
            <button 
              onClick={() => setActiveTab('feedback')} 
              className={`admin-tab ${activeTab === 'feedback' ? 'active' : ''}`}
            >
              <FiMail size={16} /> Обратная связь
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
                        <th><FiHeart size={14} /> Лайков</th>
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
                          <td><FiHeart size={14} color="#e53e3e" /> {p.likes_count}</td>
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
                          <td className="comment-post-id">Пост #{c.post_id}</td>
                          <td className="comment-preview">{c.content}</td>
                          <td className="comment-date">
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
                    <div className="empty-state">
                      <FiMessageCircle size={48} />
                      <p>Комментариев пока нет</p>
                    </div>
                  )}
                </div>
              )}

              {/* ========== ОБРАТНАЯ СВЯЗЬ ========== */}
              {activeTab === 'feedback' && (
                <div>
                  {requestStats && (
                    <div className="admin-stats-grid">
                      <div className="admin-stat-card">
                        <div className="admin-stat-value" style={{ color: '#ed8936' }}>{requestStats.pending}</div>
                        <div className="admin-stat-label">Ожидают</div>
                      </div>
                      <div className="admin-stat-card">
                        <div className="admin-stat-value" style={{ color: '#4299e1' }}>{requestStats.in_progress}</div>
                        <div className="admin-stat-label">В работе</div>
                      </div>
                      <div className="admin-stat-card">
                        <div className="admin-stat-value" style={{ color: '#48bb78' }}>{requestStats.resolved}</div>
                        <div className="admin-stat-label">Разблокированы</div>
                      </div>
                      <div className="admin-stat-card">
                        <div className="admin-stat-value" style={{ color: '#e53e3e' }}>{requestStats.rejected}</div>
                        <div className="admin-stat-label">Отклонены</div>
                      </div>
                      <div className="admin-stat-card">
                        <div className="admin-stat-value" style={{ color: '#667eea' }}>{requestStats.total}</div>
                        <div className="admin-stat-label">Всего запросов</div>
                      </div>
                    </div>
                  )}

                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th><FiHash size={14} /> ID</th>
                          <th><FiUser size={14} /> Пользователь</th>
                          <th><FiMail size={14} /> Email</th>
                          <th><FiMessageSquare size={14} /> Сообщение</th>
                          <th><FiShield size={14} /> Статус</th>
                          <th><FiClock size={14} /> Дата</th>
                          <th>Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unblockRequests.map(req => {
                          const statusInfo = getStatusBadge(req.status);
                          return (
                            <tr key={req.id}>
                              <td>{req.id}</td>
                              <td><strong>{req.username}</strong></td>
                              <td>{req.email || '—'}</td>
                              <td className="request-preview">{req.message}</td>
                              <td>
                                <span className="request-status" style={{
                                  background: statusInfo.bg,
                                  color: statusInfo.color
                                }}>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="request-date">
                                {new Date(req.created_at).toLocaleString('ru-RU')}
                              </td>
                              <td>
                                <div className="admin-btn-group">
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(req);
                                      setRequestStatus(req.status);
                                      setRequestComment(req.admin_comment || '');
                                      setShowRequestModal(true);
                                    }}
                                    className="admin-btn admin-btn-primary"
                                  >
                                    <FiEye size={12} /> Обработать
                                  </button>
                                  <button
                                    onClick={() => deleteRequest(req.id)}
                                    className="admin-btn admin-btn-danger"
                                  >
                                    <FiTrash2 size={12} /> Удалить
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {unblockRequests.length === 0 && (
                      <div className="empty-state">
                        <FiMail size={48} />
                        <p>Запросов на разблокировку пока нет</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ========== МОДАЛКА БЛОКИРОВКИ ========== */}
      {showBlockModal && blockUser && (
        <div className="modal-overlay" onClick={closeBlockModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title-danger">
                <FiLock size={24} />
                Блокировка пользователя
              </h3>
              <button className="modal-close" onClick={closeBlockModal}>
                <FiX size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-user-name"><strong>Пользователь:</strong> {blockUser.username}</p>
              <p className="modal-warning">
                <FiAlertCircle size={16} />
                После блокировки пользователь не сможет входить в систему, создавать посты и оставлять комментарии.
              </p>
            </div>

            <div className="modal-field">
              <label htmlFor="blockReason" className="modal-label">
                Причина блокировки <span className="required">*</span>
              </label>
              <textarea
                id="blockReason"
                className="modal-textarea"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Укажите причину блокировки пользователя..."
                disabled={isBlocking}
                autoFocus
              />
              <div className="modal-char-counter">{blockReason.length}/500 символов</div>
            </div>

            <div className="modal-buttons">
              <button onClick={closeBlockModal} className="admin-btn admin-btn-secondary" disabled={isBlocking}>
                Отмена
              </button>
              <button onClick={confirmBlockUser} className="admin-btn admin-btn-danger" disabled={isBlocking || !blockReason.trim()}>
                {isBlocking ? (
                  <>
                    <span className="spinner"></span>
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
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title-danger">
                <FiTrash2 size={24} />
                Удаление комментария
              </h3>
              <button className="modal-close" onClick={closeDeleteCommentModal}>
                <FiX size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-user-name"><strong>Автор:</strong> {deleteCommentData.username}</p>
              <p className="modal-label">Комментарий:</p>
              <div className="modal-comment-preview">{deleteCommentData.content}</div>
              <p className="modal-date">
                <strong>Дата:</strong> {new Date(deleteCommentData.created_at).toLocaleString('ru-RU')}
              </p>
              <p className="modal-warning">
                <FiAlertCircle size={16} />
                Комментарий будет удалён безвозвратно.
              </p>
            </div>

            <div className="modal-field">
              <label htmlFor="deleteCommentReason" className="modal-label">
                Причина удаления <span className="required">*</span>
              </label>
              <textarea
                id="deleteCommentReason"
                className="modal-textarea"
                value={deleteCommentReason}
                onChange={(e) => setDeleteCommentReason(e.target.value)}
                placeholder="Укажите причину удаления комментария..."
                disabled={isDeletingComment}
                autoFocus
              />
              <div className="modal-char-counter">{deleteCommentReason.length}/500 символов</div>
            </div>

            <div className="modal-buttons">
              <button onClick={closeDeleteCommentModal} className="admin-btn admin-btn-secondary" disabled={isDeletingComment}>
                Отмена
              </button>
              <button onClick={confirmDeleteComment} className="admin-btn admin-btn-danger" disabled={isDeletingComment || !deleteCommentReason.trim()}>
                {isDeletingComment ? (
                  <>
                    <span className="spinner"></span>
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

      {/* ========== МОДАЛКА ОБРАБОТКИ ЗАПРОСА ========== */}
      {showRequestModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FiMail size={20} />
                Запрос на разблокировку #{selectedRequest.id}
              </h3>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <p><strong>Пользователь:</strong> {selectedRequest.username}</p>
              <p><strong>Email:</strong> {selectedRequest.email || 'Не указан'}</p>
              <p><strong>Дата:</strong> {new Date(selectedRequest.created_at).toLocaleString('ru-RU')}</p>
              <div className="modal-message-box">
                <strong>Сообщение:</strong>
                <p>{selectedRequest.message}</p>
              </div>
              {selectedRequest.admin_comment && (
                <div className="modal-admin-comment">
                  <strong>Комментарий администратора:</strong>
                  <p>{selectedRequest.admin_comment}</p>
                </div>
              )}
            </div>

            <div className="modal-field">
              <label className="modal-label">Новый статус:</label>
              <select
                className="modal-select"
                value={requestStatus}
                onChange={(e) => setRequestStatus(e.target.value)}
              >
                <option value="pending">Ожидает</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Разблокировать</option>
                <option value="rejected">Отклонить</option>
              </select>
            </div>

            <div className="modal-field">
              <label className="modal-label">Комментарий администратора:</label>
              <textarea
                className="modal-textarea"
                value={requestComment}
                onChange={(e) => setRequestComment(e.target.value)}
                placeholder="Добавьте комментарий..."
              />
            </div>

            <div className="modal-buttons">
              <button
                onClick={() => updateRequestStatus(selectedRequest.id, requestStatus, requestComment)}
                className="admin-btn admin-btn-primary"
              >
                <FiCheckCircle size={16} /> Сохранить
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="admin-btn admin-btn-secondary"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== МОДАЛКА ПОСТА ========== */}
      {showPostModal && selectedPost && (
        <div className="modal-overlay" onClick={closePostModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <FiFileText size={20} />
                Пост от {selectedPost.username}
              </h3>
              <button className="modal-close" onClick={closePostModal}>
                <FiX size={24} />
              </button>
            </div>
            
            <div className="post-full-text">{selectedPost.content}</div>
            {selectedPost.meditation_duration && (
              <div className="post-meditation-info">
                <FiClock size={14} />
                Медитация {selectedPost.meditation_duration} минут
              </div>
            )}
            <div className="post-stats-info">
              <span><FiHeart size={14} color="#e53e3e" /> {selectedPost.likes_count} лайков</span>
              <span><FiMessageSquare size={14} /> {selectedPost.comments_count} комментариев</span>
              <span><FiCalendar size={14} /> {new Date(selectedPost.created_at).toLocaleString('ru-RU')}</span>
            </div>

            <div className="post-comments-section">
              <h4>
                <FiMessageSquare size={18} />
                Комментарии ({postComments.length})
              </h4>
              
              {loadingComments ? (
                <div className="loading-comments">Загрузка комментариев...</div>
              ) : postComments.length === 0 ? (
                <div className="no-comments">Нет комментариев</div>
              ) : (
                <div className="comments-list">
                  {postComments.map(comment => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-username">{comment.username}</span>
                          <span className="comment-date">
                            <FiClock size={12} />
                            {new Date(comment.created_at).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="admin-btn admin-btn-danger"
                        title="Удалить комментарий"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-buttons">
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
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                <FiX size={24} />
              </button>
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
                  <span className="block-reason-text">{selectedUser.block_reason}</span>
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
    </>
  );
};

export default AdminPage;