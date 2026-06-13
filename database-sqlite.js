const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'meditation.db'), (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err.message);
  } else {
    console.log('✅ Подключено к базе данных SQLite');
  }
});

db.serialize(() => {
  // Таблица пользователей с аватаром по умолчанию (PNG)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT '/uploads/default-avatar.png',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы users:', err.message);
    } else {
      console.log('✅ Таблица users готова');
    }
  });

  // Таблица сессий медитаций
  db.run(`
    CREATE TABLE IF NOT EXISTS meditation_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы sessions:', err.message);
    } else {
      console.log('✅ Таблица meditation_sessions готова');
    }
  });
});

module.exports = db;