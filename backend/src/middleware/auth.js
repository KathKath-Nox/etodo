const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET || 'your_secret_key');
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ msg: 'Invalid token' });
  }
};