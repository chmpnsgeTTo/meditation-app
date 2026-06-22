import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaUserCircle } from 'react-icons/fa';
import { MdSend, MdClose } from 'react-icons/md';
import { GiMeditation, GiLotus } from 'react-icons/gi';
import { IoMdMedal } from 'react-icons/io';
import { FiPlus, FiClock, FiCalendar, FiArrowUp, FiBarChart2 } from 'react-icons/fi';
import { BiTime } from 'react-icons/bi';

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostDuration, setNewPostDuration] = useState('');
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [statistics, setStatistics] = useState(null);

  // Загрузка статистики пользователя (для достижений)
  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await api.get('/api/statistics?period=all', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStatistics(data);
      } catch (err) { console.error(err); }
    };
    loadStats();
  }, []);

  // Загрузка ленты
  const loadFeed = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/feed?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (append) {
        setPosts(prev => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }
      setHasMore(pageNum < data.totalPages);
      setPage(pageNum);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadFeed(); }, []);

  // Загрузка комментариев к посту
  const loadComments = async (postId) => {
    if (comments[postId]) return;
    try {
      const { data } = await api.get(`/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (err) { console.error(err); }
  };

  const toggleComments = (postId) => {
    if (!showComments[postId]) loadComments(postId);
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Лайк / дизлайк
  const handleLike = async (postId) => {
    try {
      const { data } = await api.post(`/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, likes_count: p.likes_count + (data.liked ? 1 : -1), is_liked: data.liked }
          : p
      ));
    } catch (err) { console.error(err); }
  };

  // Добавление комментария
  const addComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      await api.post(`/api/posts/${postId}/comments`, { content: text }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Обновляем комментарии
      const { data } = await api.get(`/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setComments(prev => ({ ...prev, [postId]: data }));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      // Обновляем счётчик комментариев у поста
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      ));
    } catch (err) { console.error(err); }
  };

  // Создание поста
  const createPost = async () => {
    if (!newPostContent.trim()) return;
    try {
      await api.post('/api/posts', {
        content: newPostContent,
        meditation_duration: newPostDuration ? parseInt(newPostDuration) : null,
        image_url: null
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      
      setShowCreateModal(false);
      setNewPostContent('');
      setNewPostDuration('');
      loadFeed(); // Перезагружаем ленту
    } catch (err) {
      console.error(err);
      alert('Ошибка создания поста');
    }
  };

  // Удаление поста
  const deletePost = async (postId) => {
    if (!window.confirm('Удалить пост?')) return;
    try {
      await api.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) { console.error(err); }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return 'только что';
    if (diff < 60) return `${diff} мин назад`;
    if (diff < 1440) return `${Math.floor(diff / 60)} ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  if (loading) return <><Navbar /><div className="container"><div className="feed-loading"><FiClock size={32} /><p>Загрузка...</p></div></div></>;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="feed-container">
          {/* Шапка ленты - заголовок по центру */}
          <div className="feed-header">
            <h2 className="feed-title">
              Лента достижений
            </h2>
          </div>

          {/* Статистика + кнопка "Поделиться результатом" в одной строке */}
          <div className="feed-stats-row">
            <div className="feed-stats-wrapper">
              <div className="feed-stats-label">
                <FiBarChart2 size={18} />
                <span>Общая статистика</span>
              </div>
              {statistics && (
                <div className="feed-stats">
                  <div className="feed-stat-item">
                    <span>{statistics.total_minutes}</span>
                    <span className="feed-stat-label">минут</span>
                  </div>
                  <div className="feed-stat-item">
                    <span>{statistics.total_sessions}</span>
                    <span className="feed-stat-label">сессий</span>
                  </div>
                  <div className="feed-stat-item">
                    <span>{posts.reduce((acc, p) => acc + p.likes_count, 0)}</span>
                    <span className="feed-stat-label">лайков</span>
                  </div>
                </div>
              )}
            </div>
            <button className="create-post-btn" onClick={() => setShowCreateModal(true)}>
              <FiPlus size={20} />
              Поделиться результатом
            </button>
          </div>

          {/* Лента постов */}
          <div className="feed-posts">
            {posts.length === 0 ? (
              <div className="no-posts">
                <GiLotus size={48} className="no-posts-icon" />
                <p>Пока нет постов</p>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                  <FiPlus size={18} />
                  Создать первый пост
                </button>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="feed-post">
                  {/* Автор */}
                  <div className="post-header">
                    {post.avatar ? (
                      <img 
                        src={post.avatar} 
                        alt="avatar" 
                        className="post-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/uploads/default-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="post-avatar-placeholder">
                        <FaUserCircle size={40} />
                      </div>
                    )}
                    <div className="post-author">
                      <span className="post-username">{post.username}</span>
                      <span className="post-date">
                        <FiCalendar size={12} />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    {post.user_id === parseInt(user.userId) && (
                      <button className="post-delete" onClick={() => deletePost(post.id)}>
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>

                  {/* Контент поста */}
                  <div className="post-content">
                    <p>{post.content}</p>
                    {post.meditation_duration && (
                      <div className="post-meditation-badge">
                        <GiLotus size={16} />
                        <span>Медитация {post.meditation_duration} минут</span>
                      </div>
                    )}
                  </div>

                  {/* Кнопки действий */}
                  <div className="post-actions">
                    <button className="action-btn" onClick={() => handleLike(post.id)}>
                      {post.is_liked ? <FaHeart className="liked" size={20} /> : <FaRegHeart size={20} />}
                      <span>{post.likes_count}</span>
                    </button>
                    <button className="action-btn" onClick={() => toggleComments(post.id)}>
                      <FaComment size={20} />
                      <span>{post.comments_count}</span>
                    </button>
                  </div>

                  {/* Блок комментариев */}
                  {showComments[post.id] && (
                    <div className="post-comments">
                      <div className="comments-list">
                        {comments[post.id]?.length === 0 ? (
                          <div className="no-comments">
                            <p>Нет комментариев</p>
                          </div>
                        ) : (
                          comments[post.id]?.map(comment => (
                            <div key={comment.id} className="comment-item">
                              {comment.avatar ? (
                                <img 
                                  src={comment.avatar} 
                                  alt="" 
                                  className="comment-avatar"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/uploads/default-avatar.png';
                                  }}
                                />
                              ) : (
                                <div className="comment-avatar-placeholder">
                                  <FaUserCircle size={28} />
                                </div>
                              )}
                              <div className="comment-content">
                                <span className="comment-username">{comment.username}</span>
                                <span className="comment-text">{comment.content}</span>
                                <span className="comment-date">
                                  <FiClock size={10} />
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="comment-form">
                        <input
                          type="text"
                          placeholder="Написать комментарий..."
                          value={commentText[post.id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                        />
                        <button onClick={() => addComment(post.id)}>
                          <MdSend size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Кнопка "Загрузить ещё" */}
          {hasMore && posts.length > 0 && (
            <div className="load-more">
              <button onClick={() => loadFeed(page + 1, true)} className="btn-secondary">
                <FiArrowUp size={18} />
                Загрузить ещё
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания поста */}
      {showCreateModal && (
        <div className="modal show" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Поделиться результатом
              </h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <MdClose size={24} />
              </button>
            </div>
            <textarea
              className="post-textarea"
              placeholder="Расскажите о своих достижениях в йоге..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
            />
            <div className="post-options">
              <div className="option-group">
                <label>
                  <BiTime size={16} />
                  Длительность медитации (мин):
                </label>
                <input
                  type="number"
                  placeholder="Например: 15"
                  value={newPostDuration}
                  onChange={(e) => setNewPostDuration(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={createPost} className="btn-primary">
                <MdSend size={18} />
                Опубликовать
              </button>
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                <MdClose size={18} />
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedPage;