const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Доступ запрещен' });
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // теперь содержит { userId, username, role }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};