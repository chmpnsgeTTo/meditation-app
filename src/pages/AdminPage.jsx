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
  FiUserCheck,
  FiUserPlus,
  FiMessageSquare,
  FiLock,
  FiUnlock,
  FiAlertCircle
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

  // ========== БЛОКИРОВКА/РАЗБЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ ==========
  const toggleUserBlock = async (userId, currentBlocked) => {
    const action = currentBlocked ? 'разблокировать' : 'заблокировать';
    if (!window.confirm(`⚠️ ${currentBlocked ? 'Разблокировать' : 'Заблокировать'} пользователя?`)) return;
    
    try {
      await axios.post(`${API_URL}/api/admin/users/${userId}/toggle-block`, 
        { blocked: !currentBlocked },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      showMessage(`Пользователь ${currentBlocked ? 'разблокирован' : 'заблокирован'}`, 'success');
      loadData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Ошибка', 'error');
    }
  };

  // ========== НАЗНАЧЕНИЕ АДМИНИСТРАТОРА ==========
  const toggleAdminRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'назначить администратором' : 'лишить прав администратора';
    
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
    } catch (err) {
      showMessage(err.response?.data?.error || 'Ошибка удаления', 'error');
    }
  };

  // ========== УДАЛЕНИЕ КОММЕНТАРИЯ ==========
  const deleteComment = async (commentId, postId) => {
    if (!window.confirm('Удалить комментарий?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      showMessage('Комментарий удалён', 'success');
      // Обновляем список постов или комментариев
      if (activeTab === 'posts') {
        loadData();
      }
      // Если модалка с постом открыта, обновляем посты
      if (showPostModal) {
        loadData();
      }
    } catch (err) {
      showMessage(err.response?.data?.error || 'Ошибка удаления комментария', 'error');
    }
  };

  const viewFullPost = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
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
          <div className="admin-access-denied" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FiShield size={64} color="#ef4444" />
            <h2 style={{ marginTop: '20px' }}>Доступ запрещён</h2>
            <p style={{ color: '#718096' }}>Эта страница доступна только администраторам.</p>
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
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiShield size={28} color="#667eea" />
            Админ-панель
          </h1>

          {/* Сообщения */}
          {message && (
            <div style={{
              padding: '12px 20px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: messageType === 'success' ? '#48bb78' : '#e53e3e',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {messageType === 'success' ? '✅' : '❌'} {message}
            </div>
          )}

          <div className="admin-tabs" style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('stats')} 
              className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: activeTab === 'stats' ? '#667eea' : '#e2e8f0',
                color: activeTab === 'stats' ? 'white' : '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FiBarChart2 size={16} /> Статистика
            </button>
            <button 
              onClick={() => setActiveTab('users')} 
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: activeTab === 'users' ? '#667eea' : '#e2e8f0',
                color: activeTab === 'users' ? 'white' : '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FiUsers size={16} /> Пользователи
            </button>
            <button 
              onClick={() => setActiveTab('posts')} 
              className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: activeTab === 'posts' ? '#667eea' : '#e2e8f0',
                color: activeTab === 'posts' ? 'white' : '#4a5568',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FiFileText size={16} /> Посты
            </button>
          </div>

          {loading ? (
            <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>
          ) : (
            <>
              {/* ========== СТАТИСТИКА ========== */}
              {activeTab === 'stats' && stats && (
                <div className="admin-stats-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  <div className="admin-stat-card" style={{
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                  }}>
                    <div className="admin-stat-value" style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
                      {stats.total_users}
                    </div>
                    <div className="admin-stat-label" style={{ color: '#718096' }}>Пользователей</div>
                  </div>
                  <div className="admin-stat-card" style={{
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                  }}>
                    <div className="admin-stat-value" style={{ fontSize: '32px', fontWeight: 'bold', color: '#48bb78' }}>
                      {stats.total_posts}
                    </div>
                    <div className="admin-stat-label" style={{ color: '#718096' }}>Постов</div>
                  </div>
                  <div className="admin-stat-card" style={{
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                  }}>
                    <div className="admin-stat-value" style={{ fontSize: '32px', fontWeight: 'bold', color: '#ed8936' }}>
                      {stats.total_sessions}
                    </div>
                    <div className="admin-stat-label" style={{ color: '#718096' }}>Сессий медитации</div>
                  </div>
                  <div className="admin-stat-card" style={{
                    padding: '20px',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center'
                  }}>
                    <div className="admin-stat-value" style={{ fontSize: '32px', fontWeight: 'bold', color: '#9f7aea' }}>
                      {stats.total_minutes}
                    </div>
                    <div className="admin-stat-label" style={{ color: '#718096' }}>Всего минут</div>
                  </div>
                </div>
              )}

              {/* ========== ПОЛЬЗОВАТЕЛИ ========== */}
              {activeTab === 'users' && (
                <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f7fafc' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Имя</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Роль</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Статус</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Дата регистрации</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Сессий</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Постов</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 16px' }}>{u.id}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '500' }}>{u.username}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              background: u.role === 'admin' ? '#ebf8ff' : '#f0fff4',
                              color: u.role === 'admin' ? '#2b6cb0' : '#38a169',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}>
                              {u.role === 'admin' ? 'Админ' : 'Пользователь'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              background: u.is_blocked ? '#fff5f5' : '#f0fff4',
                              color: u.is_blocked ? '#e53e3e' : '#38a169',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {u.is_blocked ? <FiLock size={12} /> : <FiUnlock size={12} />}
                              {u.is_blocked ? 'Заблокирован' : 'Активен'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{new Date(u.created_at).toLocaleDateString('ru-RU')}</td>
                          <td style={{ padding: '12px 16px' }}>{u.total_sessions}</td>
                          <td style={{ padding: '12px 16px' }}>{u.total_posts}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {/* Назначить/лишить админа */}
                              {u.id !== parseInt(user.userId) && (
                                <button
                                  onClick={() => toggleAdminRole(u.id, u.role)}
                                  style={{
                                    padding: '4px 10px',
                                    background: u.role === 'admin' ? '#fc8181' : '#68d391',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title={u.role === 'admin' ? 'Лишить прав админа' : 'Назначить админом'}
                                >
                                  {u.role === 'admin' ? <FiUserX size={12} /> : <FiUserPlus size={12} />}
                                  {u.role === 'admin' ? 'Лишить админа' : 'Сделать админом'}
                                </button>
                              )}
                              
                              {/* Блокировка/разблокировка */}
                              {u.id !== parseInt(user.userId) && (
                                <button
                                  onClick={() => toggleUserBlock(u.id, u.is_blocked)}
                                  style={{
                                    padding: '4px 10px',
                                    background: u.is_blocked ? '#68d391' : '#fc8181',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title={u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                                >
                                  {u.is_blocked ? <FiUnlock size={12} /> : <FiLock size={12} />}
                                  {u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                                </button>
                              )}
                              
                              {/* Удаление */}
                              {u.id !== parseInt(user.userId) && (
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  style={{
                                    padding: '4px 10px',
                                    background: '#fc8181',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <FiTrash2 size={12} /> Удалить
                                </button>
                              )}
                              
                              {/* Просмотр */}
                              <button
                                onClick={() => viewUserDetails(u)}
                                style={{
                                  padding: '4px 10px',
                                  background: '#667eea',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
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
                <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f7fafc' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Автор</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Текст (предпросмотр)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Лайков</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Комментариев</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Дата</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posts.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '12px 16px' }}>{p.id}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '500' }}>{p.username}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {p.content?.substring(0, 80)}...
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>❤️ {p.likes_count}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#ebf8ff',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}>
                              <FiMessageSquare size={12} /> {parseInt(p.comments_count)}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px' }}>{new Date(p.created_at).toLocaleDateString('ru-RU')}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                onClick={() => viewFullPost(p)}
                                style={{
                                  padding: '4px 10px',
                                  background: '#667eea',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <FiEye size={12} /> Читать
                              </button>
                              <button
                                onClick={() => deletePost(p.id)}
                                style={{
                                  padding: '4px 10px',
                                  background: '#fc8181',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
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

      {/* ========== МОДАЛЬНОЕ ОКНО ПОСТА ========== */}
      {showPostModal && selectedPost && (
        <div 
          className="modal show" 
          onClick={() => setShowPostModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="modal-content post-view-modal" 
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '24px'
            }}
          >
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiFileText size={20} color="#667eea" />
                Пост от {selectedPost.username}
              </h3>
              <button 
                className="modal-close" 
                onClick={() => setShowPostModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#a0aec0'
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="post-full-content">
              <p className="post-full-text" style={{ fontSize: '16px', lineHeight: '1.6', color: '#2d3748' }}>
                {selectedPost.content}
              </p>
              {selectedPost.meditation_duration && (
                <div style={{
                  margin: '12px 0',
                  padding: '8px 16px',
                  background: '#ebf8ff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#2b6cb0'
                }}>
                  🧘 Медитация {selectedPost.meditation_duration} минут
                </div>
              )}
              <div style={{
                margin: '12px 0',
                padding: '12px 0',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '16px',
                fontSize: '14px',
                color: '#718096',
                flexWrap: 'wrap'
              }}>
                <span>❤️ {selectedPost.likes_count} лайков</span>
                <span>💬 {selectedPost.comments_count} комментариев</span>
                <span>📅 {new Date(selectedPost.created_at).toLocaleString('ru-RU')}</span>
              </div>
            </div>
            
            <div className="modal-buttons" style={{
              display: 'flex',
              gap: '10px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => deletePost(selectedPost.id)}
                style={{
                  padding: '8px 16px',
                  background: '#fc8181',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiTrash2 size={16} /> Удалить пост
              </button>
              <button
                onClick={() => setShowPostModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#e2e8f0',
                  color: '#4a5568',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== МОДАЛЬНОЕ ОКНО ПОЛЬЗОВАТЕЛЯ ========== */}
      {showUserModal && selectedUser && (
        <div 
          className="modal show"
          onClick={() => setShowUserModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div 
            className="modal-content user-view-modal"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              maxWidth: '400px',
              width: '100%',
              padding: '24px'
            }}
          >
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiUsers size={20} color="#667eea" />
                {selectedUser.username}
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowUserModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#a0aec0'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p><strong>ID:</strong> {selectedUser.id}</p>
              <p><strong>Имя:</strong> {selectedUser.username}</p>
              <p>
                <strong>Роль:</strong>{' '}
                <span style={{
                  background: selectedUser.role === 'admin' ? '#ebf8ff' : '#f0fff4',
                  color: selectedUser.role === 'admin' ? '#2b6cb0' : '#38a169',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {selectedUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
              </p>
              <p>
                <strong>Статус:</strong>{' '}
                <span style={{
                  background: selectedUser.is_blocked ? '#fff5f5' : '#f0fff4',
                  color: selectedUser.is_blocked ? '#e53e3e' : '#38a169',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {selectedUser.is_blocked ? <FiLock size={12} /> : <FiUnlock size={12} />}
                  {selectedUser.is_blocked ? 'Заблокирован' : 'Активен'}
                </span>
              </p>
              <p><strong>Дата регистрации:</strong> {new Date(selectedUser.created_at).toLocaleDateString('ru-RU')}</p>
              <p><strong>Сессий медитации:</strong> {selectedUser.total_sessions}</p>
              <p><strong>Постов:</strong> {selectedUser.total_posts}</p>
            </div>
            
            <div className="modal-buttons" style={{
              display: 'flex',
              gap: '10px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setShowUserModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
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