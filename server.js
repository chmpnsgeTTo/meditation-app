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

// Multer настройки
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
    'https://chmpnsgetto-meditation-app-6618.twc1.net',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

// ==================== API МАРШРУТЫ ====================

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

// Сохранение сессии
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

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});