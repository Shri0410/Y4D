const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_here_change_in_production';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth middleware called. Token:', token ? 'present' : 'missing');
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    console.log('Token decoded:', decoded);
    
    // Verify user exists and is approved
    const query = 'SELECT id, username, role, status FROM users WHERE id = ?';
    db.query(query, [decoded.id], (err, results) => {
      if (err) {
        console.log('Database error during auth:', err);
        return res.status(500).json({ error: 'Authentication error' });
      }
      
      if (results.length === 0) {
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
    });
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateToken, requireRole, JWT_SECRET };