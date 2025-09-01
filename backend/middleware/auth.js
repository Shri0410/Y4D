const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_here_change_in_production';

/**
 * Middleware: Authenticate JWT token and check user status
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Auth middleware called. Token:', token ? 'present' : 'missing');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);

    // Check if user exists in DB
    const query = 'SELECT id, username, role, status FROM users WHERE id = ?';
    const [results] = await db.query(query, [decoded.id]);

    if (!results || results.length === 0) {
      console.log('User not found in database');
      return res.status(403).json({ error: 'User not found' });
    }

    const user = results[0];

    if (user.status !== 'approved') {
      console.log('User not approved. Status:', user.status);
      return res.status(403).json({ error: 'Account not approved' });
    }

    console.log('User authenticated successfully:', user.username);
    req.user = user;
    next();
  } catch (err) {
    console.log('Token verification failed or DB error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware: Require specific roles
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole, JWT_SECRET };
