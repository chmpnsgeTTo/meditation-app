const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT DEFAULT '/uploads/default-avatar.png',
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS meditation_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        duration INTEGER NOT NULL,
        date TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        meditation_duration INTEGER,
        likes_count INTEGER DEFAULT 0,
        comments_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
      
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        difficulty TEXT CHECK (difficulty IN ('Начинающий', 'Средний', 'Продвинутый')),
        image_url TEXT,
        duration_minutes INTEGER DEFAULT 0,
        benefits TEXT,
        contraindications TEXT,
        tips TEXT,
        total_lessons INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT,
        video_url TEXT,
        duration_minutes INTEGER,
        order_num INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_course_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        completed_lessons INTEGER DEFAULT 0,
        is_completed BOOLEAN DEFAULT FALSE,
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        UNIQUE(user_id, course_id)
      );
      
      CREATE TABLE IF NOT EXISTS user_lesson_completions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, lesson_id)
      );
    `);
    
    console.log('✅ База данных готова');
  } catch (err) {
    console.error('❌ Ошибка БД:', err.message);
  }
};

initDb();
module.exports = pool;