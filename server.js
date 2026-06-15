require('dotenv').config();

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pool = require('./database');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY;

// Папка для загрузок
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer настройки для аватаров
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.userId + '-' + unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const isValid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    cb(null, isValid);
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://chmpnsgetto-meditation-app-6dfa.twc1.net',
    'https://meditation-app.tw1.ru'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

// Middleware для проверки прав администратора
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора.' });
  }
  next();
};

// ==================== АВТОРИЗАЦИЯ ====================

// Регистрация
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Заполните все поля' });
  if (password.length < 6) return res.status(400).json({ error: 'Пароль минимум 6 символов' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashed]
    );
    res.json({ message: 'Регистрация успешна', userId: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Пользователь уже существует' });
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Логин
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Неверные учетные данные' });
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Неверные учетные данные' });
    
    const token = jwt.sign({ userId: user.id, username: user.username, role: user.role || 'user' }, SECRET_KEY);
    res.json({ token, username: user.username, userId: user.id, role: user.role || 'user' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение пользователя
app.get('/api/user', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, avatar, created_at FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Смена пароля
app.post('/api/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Новый пароль минимум 6 символов' });
  
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) return res.status(401).json({ error: 'Неверный старый пароль' });
    
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.userId]);
    res.json({ message: 'Пароль изменен' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Смена имени
app.post('/api/change-username', authMiddleware, async (req, res) => {
  const { newUsername, password } = req.body;
  if (!newUsername) return res.status(400).json({ error: 'Введите новое имя' });
  
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Неверный пароль' });
    
    await pool.query('UPDATE users SET username = $1 WHERE id = $2', [newUsername, req.user.userId]);
    res.json({ message: 'Имя изменено', username: newUsername });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Имя уже занято' });
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Загрузка аватара
app.post('/api/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
  const avatarUrl = `/uploads/${req.file.filename}`;
  await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatarUrl, req.user.userId]);
  res.json({ avatarUrl });
});

// Сохранение сессии медитации
app.post('/api/sessions', authMiddleware, async (req, res) => {
  const { duration, completed } = req.body;
  if (!completed) return res.status(400).json({ error: 'Медитация не завершена' });
  await pool.query('INSERT INTO meditation_sessions (user_id, duration) VALUES ($1, $2)', [req.user.userId, duration]);
  res.json({ message: 'Сессия сохранена' });
});

// Получение статистики
app.get('/api/statistics', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { period = 'all' } = req.query;
  
  let dateFilter = '';
  if (period === 'week') dateFilter = 'AND date >= NOW() - INTERVAL \'7 days\'';
  if (period === 'month') dateFilter = 'AND date >= NOW() - INTERVAL \'30 days\'';
  
  try {
    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration), 0) as total_minutes,
        COALESCE(AVG(duration), 0) as avg_duration,
        COALESCE(MAX(duration), 0) as longest_session,
        DATE(MAX(date)) as last_meditation,
        DATE(MIN(date)) as first_meditation
      FROM meditation_sessions 
      WHERE user_id = $1 ${dateFilter}
    `, [userId]);
    
    const dailyRes = await pool.query(`
      SELECT 
        DATE(date) as day,
        SUM(duration) as total_minutes,
        COUNT(*) as sessions_count
      FROM meditation_sessions 
      WHERE user_id = $1 AND date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(date) ORDER BY day DESC LIMIT 30
    `, [userId]);
    
    res.json({
      total_minutes: Number(statsRes.rows[0].total_minutes),
      total_sessions: Number(statsRes.rows[0].total_sessions),
      avg_duration: Math.round(Number(statsRes.rows[0].avg_duration)),
      longest_session: Number(statsRes.rows[0].longest_session),
      last_meditation: statsRes.rows[0].last_meditation,
      first_meditation: statsRes.rows[0].first_meditation,
      daily_data: dailyRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// ==================== КУРСЫ ====================

// Получить все курсы
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения курсов' });
  }
});

// Получить один курс с уроками
app.get('/api/courses/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const courseRes = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Курс не найден' });
    
    const lessonsRes = await pool.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_num', [id]);
    
    res.json({
      ...courseRes.rows[0],
      lessons: lessonsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения курса' });
  }
});

// Получить достижения пользователя (завершённые курсы)
app.get('/api/user/courses', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, ucp.completed_lessons, ucp.completed_at,
        (ucp.completed_lessons::float / NULLIF(c.total_lessons, 0)::float) * 100 as progress_percent
      FROM user_course_progress ucp
      JOIN courses c ON c.id = ucp.course_id
      WHERE ucp.user_id = $1 AND ucp.is_completed = true
      ORDER BY ucp.completed_at DESC
    `, [req.user.userId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения достижений' });
  }
});

// Получить прогресс пользователя по конкретному курсу
app.get('/api/courses/:id/progress', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT completed_lessons, is_completed 
      FROM user_course_progress 
      WHERE user_id = $1 AND course_id = $2
    `, [req.user.userId, id]);
    
    res.json(result.rows[0] || { completed_lessons: 0, is_completed: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения прогресса' });
  }
});

// Отметить урок как пройденный (исправленная версия)
app.post('/api/courses/:courseId/lessons/:lessonId/complete', authMiddleware, async (req, res) => {
  const { courseId, lessonId } = req.params;
  const userId = req.user.userId;
  
  try {
    // 1. Добавляем запись о завершении урока
    await pool.query(`
      INSERT INTO user_lesson_completions (user_id, lesson_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, lesson_id) DO NOTHING
    `, [userId, lessonId]);
    
    // 2. Получаем количество завершённых уроков
    const completedCountRes = await pool.query(`
      SELECT COUNT(*) as count 
      FROM user_lesson_completions 
      WHERE user_id = $1 
        AND lesson_id IN (SELECT id FROM lessons WHERE course_id = $2)
    `, [userId, courseId]);
    
    const completedCount = parseInt(completedCountRes.rows[0].count);
    
    // 3. Получаем общее количество уроков в курсе
    const totalLessonsRes = await pool.query(`
      SELECT COUNT(*) as count 
      FROM lessons 
      WHERE course_id = $1
    `, [courseId]);
    
    const totalLessons = parseInt(totalLessonsRes.rows[0].count);
    const isCompleted = completedCount >= totalLessons;
    
    // 4. Обновляем прогресс — раздельно для INSERT и UPDATE, без двусмысленности
    if (isCompleted) {
      await pool.query(`
        INSERT INTO user_course_progress (user_id, course_id, completed_lessons, is_completed, completed_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (user_id, course_id) DO UPDATE SET
          completed_lessons = EXCLUDED.completed_lessons,
          is_completed = EXCLUDED.is_completed,
          completed_at = NOW()
      `, [userId, courseId, completedCount, isCompleted]);
    } else {
      await pool.query(`
        INSERT INTO user_course_progress (user_id, course_id, completed_lessons, is_completed)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, course_id) DO UPDATE SET
          completed_lessons = EXCLUDED.completed_lessons,
          is_completed = EXCLUDED.is_completed
      `, [userId, courseId, completedCount, isCompleted]);
    }
    
    res.json({ completedCount, totalLessons, isCompleted });
  } catch (err) {
    console.error('Ошибка отметки урока:', err);
    res.status(500).json({ error: 'Ошибка сохранения прогресса' });
  }
});

// ==================== СОЦИАЛЬНАЯ ЛЕНТА ====================

// Получить ленту постов
app.get('/api/feed', authMiddleware, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  try {
    const result = await pool.query(`
      SELECT p.*, u.username, u.avatar,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = $1) as is_liked
      FROM posts p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.userId, limit, offset]);
    
    const countResult = await pool.query('SELECT COUNT(*) FROM posts');
    
    res.json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения ленты' });
  }
});

// Создать пост
app.post('/api/posts', authMiddleware, async (req, res) => {
  const { content, meditation_duration } = req.body;
  if (!content) return res.status(400).json({ error: 'Введите текст поста' });
  
  try {
    const result = await pool.query(
      'INSERT INTO posts (user_id, content, meditation_duration) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, content, meditation_duration || null]
    );
    res.json({ post: result.rows[0], message: 'Пост опубликован' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка создания поста' });
  }
});

// Удалить пост
app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (post.rows.length === 0) return res.status(404).json({ error: 'Пост не найден' });
    if (post.rows[0].user_id !== req.user.userId) return res.status(403).json({ error: 'Нет прав' });
    
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Пост удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// Лайкнуть/убрать лайк с поста
app.post('/api/posts/:id/like', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await pool.query('SELECT id FROM likes WHERE post_id = $1 AND user_id = $2', [id, req.user.userId]);
    
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [id, req.user.userId]);
      await pool.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1', [id]);
      res.json({ liked: false });
    } else {
      await pool.query('INSERT INTO likes (post_id, user_id) VALUES ($1, $2)', [id, req.user.userId]);
      await pool.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [id]);
      res.json({ liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка' });
  }
});

// Получить комментарии к посту
app.get('/api/posts/:id/comments', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT c.*, u.username, u.avatar
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения комментариев' });
  }
});

// Добавить комментарий
app.post('/api/posts/:id/comments', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Введите текст комментария' });
  
  try {
    await pool.query('INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)', [id, req.user.userId, content]);
    await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [id]);
    res.json({ message: 'Комментарий добавлен' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка добавления комментария' });
  }
});

// ==================== АДМИН ПАНЕЛЬ ====================

// Статистика для админа
app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const postsCount = await pool.query('SELECT COUNT(*) FROM posts');
    const sessionsCount = await pool.query('SELECT COUNT(*) FROM meditation_sessions');
    const totalMinutes = await pool.query('SELECT SUM(duration) FROM meditation_sessions');
    
    res.json({
      total_users: parseInt(usersCount.rows[0].count),
      total_posts: parseInt(postsCount.rows[0].count),
      total_sessions: parseInt(sessionsCount.rows[0].count),
      total_minutes: parseInt(totalMinutes.rows[0].sum) || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// Список всех пользователей для админа
app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, username, avatar, role, created_at,
        (SELECT COUNT(*) FROM meditation_sessions WHERE user_id = users.id) as total_sessions,
        (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as total_posts
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});

// Список всех постов для админа
app.get('/api/admin/posts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.username, u.avatar,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения постов' });
  }
});

// Удалить пользователя (админ)
app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({ error: 'Нельзя удалить самого себя' });
  }
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// Удалить пост (админ)
app.delete('/api/admin/posts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Пост удалён' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления' });
  }
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});