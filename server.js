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

// ============================================================
// 1. НАСТРОЙКА ПУТЕЙ ДЛЯ TIMEWEB CLOUD
// ============================================================
const appRoot = process.cwd();
console.log('📁 App root:', appRoot);

// Определяем папку со статикой (для React сборки)
const staticDir = path.join(appRoot, 'dist');
const publicDir = path.join(appRoot, 'public');

console.log('📁 Static dir (dist):', staticDir);
console.log('📁 Public dir:', publicDir);

// Проверяем, какая папка существует
let staticPath = null;
if (fs.existsSync(staticDir)) {
  staticPath = staticDir;
  console.log('✅ Использую папку dist для статики');
} else if (fs.existsSync(publicDir)) {
  staticPath = publicDir;
  console.log('✅ Использую папку public для статики');
} else {
  console.log('⚠️ Папка со статикой не найдена!');
  fs.mkdirSync(publicDir, { recursive: true });
  staticPath = publicDir;
  console.log('📁 Создана папка public');
}

// Папка для загрузок (внутри public)
const uploadDir = path.join(appRoot, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Создана папка uploads:', uploadDir);
} else {
  console.log('📁 Папка uploads существует:', uploadDir);
}

// Создаем default-avatar.png если его нет
const defaultAvatarPath = path.join(uploadDir, 'default-avatar.png');
if (!fs.existsSync(defaultAvatarPath)) {
  console.log('⚠️ default-avatar.png не найден, создаю заглушку...');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="50" fill="#667eea"/><text x="50" y="65" font-size="40" text-anchor="middle" fill="white" font-family="Arial">👤</text></svg>`;
  fs.writeFileSync(defaultAvatarPath, svgContent);
  console.log('✅ Создан default-avatar.png');
}

// ============================================================
// 2. НАСТРОЙКА MULTER
// ============================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = unique + path.extname(file.originalname);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValidType = allowedTypes.test(file.mimetype);
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (isValidType && isValidExt) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения (jpeg, jpg, png, gif, webp)'), false);
    }
  }
});

// ============================================================
// 3. MIDDLEWARE
// ============================================================

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// CORS
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
app.use(express.urlencoded({ extended: true }));

// ============================================================
// 4. РАЗДАЧА СТАТИКИ
// ============================================================

// СНАЧАЛА раздаем папку uploads
app.use('/uploads', (req, res, next) => {
  console.log('🖼️ Запрос к /uploads:', req.url);
  console.log('📂 Путь к файлу:', path.join(uploadDir, req.url));
  next();
});

app.use('/uploads', express.static(uploadDir, {
  maxAge: 0,
  etag: true,
  lastModified: true
}));

// ПОТОМ раздаем всю статику (dist или public)
if (staticPath) {
  app.use(express.static(staticPath, {
    maxAge: 0,
    etag: true,
    lastModified: true
  }));
  console.log('✅ Статика раздается из:', staticPath);
}

// ============================================================
// 5. ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК MULTER
// ============================================================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ error: 'Файл слишком большой. Максимум 5MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ============================================================
// 6. ВСЕ API-ЭНДПОИНТЫ
// ============================================================

// ---------- АВТОРИЗАЦИЯ ----------
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Пароль минимум 6 символов' });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: 'Имя пользователя минимум 3 символа' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashed]
    );
    res.json({ message: 'Регистрация успешна', userId: result.rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    console.error('❌ Ошибка регистрации:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role || 'user' },
      SECRET_KEY,
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      username: user.username, 
      userId: user.id, 
      role: user.role || 'user' 
    });
  } catch (err) {
    console.error('❌ Ошибка логина:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

app.get('/api/user', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, avatar, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Ошибка получения пользователя:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Новый пароль минимум 6 символов' });
  }
  
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный старый пароль' });
    }
    
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.userId]);
    
    res.json({ message: 'Пароль изменен' });
  } catch (err) {
    console.error('❌ Ошибка смены пароля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/change-username', authMiddleware, async (req, res) => {
  const { newUsername, password } = req.body;
  
  if (!newUsername) {
    return res.status(400).json({ error: 'Введите новое имя' });
  }
  if (newUsername.length < 3) {
    return res.status(400).json({ error: 'Имя пользователя минимум 3 символа' });
  }
  
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    const user = userRes.rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }
    
    await pool.query('UPDATE users SET username = $1 WHERE id = $2', [newUsername, req.user.userId]);
    
    const token = jwt.sign(
      { userId: req.user.userId, username: newUsername, role: user.role || 'user' },
      SECRET_KEY,
      { expiresIn: '7d' }
    );
    
    res.json({ message: 'Имя изменено', username: newUsername, token });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Имя уже занято' });
    }
    console.error('❌ Ошибка смены имени:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ---------- ЗАГРУЗКА АВАТАРА ----------
app.post('/api/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  console.log('📥 Запрос на загрузку аватара от пользователя:', req.user.userId);
  
  if (!req.file) {
    console.log('❌ Файл не загружен');
    return res.status(400).json({ error: 'Файл не загружен' });
  }
  
  const avatarUrl = `/uploads/${req.file.filename}`;
  console.log('✅ Аватар сохранен:', avatarUrl);
  console.log('📂 Полный путь:', req.file.path);
  
  try {
    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatarUrl, req.user.userId]);
    console.log('✅ БД обновлена для пользователя:', req.user.userId);
    res.json({ avatarUrl });
  } catch (err) {
    console.error('❌ Ошибка обновления БД:', err);
    res.status(500).json({ error: 'Ошибка сохранения аватара' });
  }
});

// ---------- МЕДИТАЦИИ И СТАТИСТИКА ----------
app.post('/api/sessions', authMiddleware, async (req, res) => {
  const { duration, completed } = req.body;
  
  if (!completed) {
    return res.status(400).json({ error: 'Медитация не завершена' });
  }
  if (!duration || duration < 1) {
    return res.status(400).json({ error: 'Некорректная длительность' });
  }
  
  try {
    await pool.query(
      'INSERT INTO meditation_sessions (user_id, duration) VALUES ($1, $2)',
      [req.user.userId, duration]
    );
    res.json({ message: 'Сессия сохранена' });
  } catch (err) {
    console.error('❌ Ошибка сохранения сессии:', err);
    res.status(500).json({ error: 'Ошибка сохранения сессии' });
  }
});

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
    console.error('❌ Ошибка получения статистики:', err);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

// ---------- КУРСЫ ----------
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка получения курсов:', err);
    res.status(500).json({ error: 'Ошибка получения курсов' });
  }
});

app.get('/api/courses/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  try {
    const courseRes = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Курс не найден' });
    }
    
    const lessonsRes = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_num',
      [id]
    );
    
    const completedRes = await pool.query(`
      SELECT lesson_id 
      FROM user_lesson_completions 
      WHERE user_id = $1 AND lesson_id IN (
        SELECT id FROM lessons WHERE course_id = $2
      )
    `, [userId, id]);
    
    const completedLessonIds = completedRes.rows.map(row => row.lesson_id);
    
    const progressRes = await pool.query(`
      SELECT completed_lessons, is_completed 
      FROM user_course_progress 
      WHERE user_id = $1 AND course_id = $2
    `, [userId, id]);
    
    const progress = progressRes.rows[0] || { completed_lessons: 0, is_completed: false };
    
    res.json({
      ...courseRes.rows[0],
      lessons: lessonsRes.rows,
      total_lessons: lessonsRes.rows.length,
      completedLessonIds: completedLessonIds,
      progress: {
        completed_lessons: parseInt(progress.completed_lessons) || 0,
        is_completed: progress.is_completed || false
      }
    });
  } catch (err) {
    console.error('❌ Ошибка получения курса:', err);
    res.status(500).json({ error: 'Ошибка получения курса' });
  }
});

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
    console.error('❌ Ошибка получения достижений:', err);
    res.status(500).json({ error: 'Ошибка получения достижений' });
  }
});

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
    console.error('❌ Ошибка получения прогресса:', err);
    res.status(500).json({ error: 'Ошибка получения прогресса' });
  }
});

app.post('/api/courses/:courseId/lessons/:lessonId/complete', authMiddleware, async (req, res) => {
  const { courseId, lessonId } = req.params;
  const userId = req.user.userId;
  
  try {
    const lessonCheck = await pool.query('SELECT id FROM lessons WHERE id = $1 AND course_id = $2', [lessonId, courseId]);
    if (lessonCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Урок не найден' });
    }
    
    const alreadyCompleted = await pool.query(
      'SELECT id FROM user_lesson_completions WHERE user_id = $1 AND lesson_id = $2',
      [userId, lessonId]
    );
    
    if (alreadyCompleted.rows.length > 0) {
      return res.status(400).json({ error: 'Урок уже отмечен как пройденный' });
    }
    
    await pool.query(`
      INSERT INTO user_lesson_completions (user_id, lesson_id)
      VALUES ($1, $2)
    `, [userId, lessonId]);
    
    const completedCountRes = await pool.query(`
      SELECT COUNT(*) as count 
      FROM user_lesson_completions 
      WHERE user_id = $1 
        AND lesson_id IN (SELECT id FROM lessons WHERE course_id = $2)
    `, [userId, courseId]);
    
    const completedCount = parseInt(completedCountRes.rows[0].count);
    
    const totalLessonsRes = await pool.query(`
      SELECT COUNT(*) as count 
      FROM lessons 
      WHERE course_id = $1
    `, [courseId]);
    
    const totalLessons = parseInt(totalLessonsRes.rows[0].count);
    const isCompleted = completedCount >= totalLessons;
    
    const existingProgress = await pool.query(
      'SELECT id FROM user_course_progress WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );
    
    if (existingProgress.rows.length === 0) {
      if (isCompleted) {
        await pool.query(
          'INSERT INTO user_course_progress (user_id, course_id, completed_lessons, is_completed, completed_at) VALUES ($1, $2, $3, $4, NOW())',
          [userId, courseId, completedCount, isCompleted]
        );
      } else {
        await pool.query(
          'INSERT INTO user_course_progress (user_id, course_id, completed_lessons, is_completed) VALUES ($1, $2, $3, $4)',
          [userId, courseId, completedCount, isCompleted]
        );
      }
    } else {
      if (isCompleted) {
        await pool.query(
          'UPDATE user_course_progress SET completed_lessons = $1, is_completed = $2, completed_at = NOW() WHERE user_id = $3 AND course_id = $4',
          [completedCount, isCompleted, userId, courseId]
        );
      } else {
        await pool.query(
          'UPDATE user_course_progress SET completed_lessons = $1, is_completed = $2 WHERE user_id = $3 AND course_id = $4',
          [completedCount, isCompleted, userId, courseId]
        );
      }
    }
    
    res.json({ 
      completedCount, 
      totalLessons, 
      isCompleted,
      message: 'Урок отмечен как пройденный'
    });
  } catch (err) {
    console.error('❌ Ошибка отметки урока:', err);
    res.status(500).json({ error: 'Ошибка сохранения прогресса' });
  }
});

// ---------- СОЦИАЛЬНАЯ ЛЕНТА ----------
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
    console.error('❌ Ошибка получения ленты:', err);
    res.status(500).json({ error: 'Ошибка получения ленты' });
  }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
  const { content, meditation_duration } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Введите текст поста' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO posts (user_id, content, meditation_duration) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, content.trim(), meditation_duration || null]
    );
    res.json({ post: result.rows[0], message: 'Пост опубликован' });
  } catch (err) {
    console.error('❌ Ошибка создания поста:', err);
    res.status(500).json({ error: 'Ошибка создания поста' });
  }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  try {
    const post = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Пост не найден' });
    }
    if (post.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Нет прав на удаление' });
    }
    
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Пост удалён' });
  } catch (err) {
    console.error('❌ Ошибка удаления поста:', err);
    res.status(500).json({ error: 'Ошибка удаления поста' });
  }
});

app.post('/api/posts/:id/like', authMiddleware, async (req, res) => {
  const { id } = req.params;
  
  try {
    const existing = await pool.query(
      'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    
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
    console.error('❌ Ошибка лайка:', err);
    res.status(500).json({ error: 'Ошибка обработки лайка' });
  }
});

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
    console.error('❌ Ошибка получения комментариев:', err);
    res.status(500).json({ error: 'Ошибка получения комментариев' });
  }
});

app.post('/api/posts/:id/comments', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Введите текст комментария' });
  }
  
  try {
    await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)',
      [id, req.user.userId, content.trim()]
    );
    await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [id]);
    res.json({ message: 'Комментарий добавлен' });
  } catch (err) {
    console.error('❌ Ошибка добавления комментария:', err);
    res.status(500).json({ error: 'Ошибка добавления комментария' });
  }
});

// ---------- АДМИН ПАНЕЛЬ ----------
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещён. Требуются права администратора.' });
  }
  next();
};

app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const postsCount = await pool.query('SELECT COUNT(*) FROM posts');
    const sessionsCount = await pool.query('SELECT COUNT(*) FROM meditation_sessions');
    const totalMinutes = await pool.query('SELECT COALESCE(SUM(duration), 0) FROM meditation_sessions');
    
    res.json({
      total_users: parseInt(usersCount.rows[0].count),
      total_posts: parseInt(postsCount.rows[0].count),
      total_sessions: parseInt(sessionsCount.rows[0].count),
      total_minutes: parseInt(totalMinutes.rows[0].sum) || 0
    });
  } catch (err) {
    console.error('❌ Ошибка получения статистики админа:', err);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        username, 
        avatar, 
        role, 
        is_blocked,
        block_reason,
        blocked_at,
        created_at,
        (SELECT COUNT(*) FROM meditation_sessions WHERE user_id = users.id) as total_sessions,
        (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as total_posts
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка получения пользователей:', err);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
});

app.post('/api/admin/users/:id/toggle-block', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { blocked, reason } = req.body;
  
  console.log(`🔄 Блокировка пользователя ${id}:`, blocked, 'Причина:', reason);
  
  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({ error: 'Нельзя заблокировать самого себя' });
  }
  
  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    await pool.query(
      'UPDATE users SET is_blocked = $1, block_reason = $2, blocked_at = $3 WHERE id = $4',
      [blocked, blocked ? reason : null, blocked ? new Date() : null, id]
    );
    
    console.log(`✅ Пользователь ${id} ${blocked ? 'заблокирован' : 'разблокирован'}`);
    res.json({ 
      message: `Пользователь ${blocked ? 'заблокирован' : 'разблокирован'}`,
      blocked: blocked,
      reason: blocked ? reason : null
    });
  } catch (err) {
    console.error('❌ Ошибка блокировки пользователя:', err);
    res.status(500).json({ error: 'Ошибка изменения статуса блокировки' });
  }
});

app.post('/api/admin/users/:id/toggle-role', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  console.log(`🔄 Смена роли пользователя ${id} на:`, role);
  
  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({ error: 'Нельзя изменить свои права' });
  }
  
  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    
    console.log(`✅ Пользователь ${id} теперь ${role === 'admin' ? 'администратор' : 'пользователь'}`);
    res.json({ 
      message: `Пользователь ${role === 'admin' ? 'назначен администратором' : 'лишён прав администратора'}`,
      role: role
    });
  } catch (err) {
    console.error('❌ Ошибка смены роли:', err);
    res.status(500).json({ error: 'Ошибка изменения роли' });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  
  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({ error: 'Нельзя удалить самого себя' });
  }
  
  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    console.error('❌ Ошибка удаления пользователя:', err);
    res.status(500).json({ error: 'Ошибка удаления пользователя' });
  }
});

app.get('/api/admin/posts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*, 
        u.username, 
        u.avatar,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка получения постов:', err);
    res.status(500).json({ error: 'Ошибка получения постов' });
  }
});

app.delete('/api/admin/posts/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  
  try {
    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Пост не найден' });
    }
    
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Пост удалён' });
  } catch (err) {
    console.error('❌ Ошибка удаления поста:', err);
    res.status(500).json({ error: 'Ошибка удаления поста' });
  }
});

app.get('/api/admin/posts/:id/comments', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  
  try {
    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Пост не найден' });
    }
    
    const result = await pool.query(`
      SELECT 
        c.*,
        u.username,
        u.avatar
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
    `, [id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка получения комментариев:', err);
    res.status(500).json({ error: 'Ошибка получения комментариев' });
  }
});

app.delete('/api/admin/comments/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  
  console.log(`🗑️ Удаление комментария ${id}, причина:`, reason);
  
  try {
    const comment = await pool.query(`
      SELECT c.*, u.username 
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = $1
    `, [id]);
    
    if (comment.rows.length === 0) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }
    
    const postId = comment.rows[0].post_id;
    const commentData = comment.rows[0];
    
    console.log(`📝 Удалён комментарий #${id} от ${commentData.username}: "${commentData.content}"`);
    console.log(`📝 Причина: ${reason || 'Не указана'}`);
    
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    await pool.query('UPDATE posts SET comments_count = comments_count - 1 WHERE id = $1', [postId]);
    
    res.json({ 
      message: 'Комментарий удалён',
      deletedComment: {
        id: commentData.id,
        content: commentData.content,
        author: commentData.username,
        reason: reason || 'Не указана'
      }
    });
  } catch (err) {
    console.error('❌ Ошибка удаления комментария:', err);
    res.status(500).json({ error: 'Ошибка удаления комментария' });
  }
});

// ---------- СПИСОК ВСЕХ КОММЕНТАРИЕВ ----------
app.get('/api/admin/comments', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.post_id,
        u.id as user_id,
        u.username,
        u.avatar
      FROM comments c
      JOIN users u ON u.id = c.user_id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка получения всех комментариев:', err);
    res.status(500).json({ error: 'Ошибка получения комментариев' });
  }
});

// ============================================================
// 7. ОБРАБОТКА ЗАПРОСОВ НА ФРОНТЕНД (SPA)
// ============================================================
// ВАЖНО: ЭТО ДОЛЖНО БЫТЬ ПОСЛЕ ВСЕХ API-ЭНДПОИНТОВ!

// Проверяем существование index.html в разных папках
const indexHtmlPaths = [
  path.join(staticPath, 'index.html'),
  path.join(staticPath, '..', 'public', 'index.html'),
  path.join(appRoot, 'public', 'index.html'),
  path.join(appRoot, 'dist', 'index.html')
];

let indexHtmlPath = null;
for (const testPath of indexHtmlPaths) {
  if (fs.existsSync(testPath)) {
    indexHtmlPath = testPath;
    console.log('✅ Найден index.html:', indexHtmlPath);
    break;
  }
}

if (!indexHtmlPath) {
  console.log('⚠️ index.html не найден! Создаю заглушку...');
  const fallbackHtml = `<!DOCTYPE html><html><head><title>Meditation App</title></head><body><div id="root">Loading...</div></body></html>`;
  const fallbackPath = path.join(staticPath || appRoot, 'index.html');
  fs.writeFileSync(fallbackPath, fallbackHtml);
  indexHtmlPath = fallbackPath;
  console.log('✅ Создан fallback index.html:', fallbackPath);
}

app.get('*', (req, res) => {
  // Проверяем, не запрос ли это к существующему файлу
  const filePath = path.join(staticPath || appRoot, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  // Иначе отдаем index.html
  res.sendFile(indexHtmlPath);
});

// ============================================================
// 8. ГЛОБАЛЬНЫЙ ОБРАБОТЧИК ОШИБОК (должен быть последним)
// ============================================================
app.use((err, req, res, next) => {
  console.error('❌ Глобальная ошибка:', err);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================
// 9. ЗАПУСК СЕРВЕРА
// ============================================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📁 Рабочая директория: ${appRoot}`);
  console.log(`📁 Папка uploads: ${uploadDir}`);
  console.log(`📁 Статика из: ${staticPath || 'не найдена'}`);
  console.log(`📄 index.html: ${indexHtmlPath || 'не найден'}`);
  console.log(`🌐 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🖼️ Аватары доступны по: /uploads/`);
});