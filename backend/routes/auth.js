const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../services/logger');
const consoleLogger = require('../utils/logger');
const { authLimiter } = require('../middleware/rateLimiter');
const { sendError, sendSuccess, sendUnauthorized, sendInternalError } = require('../utils/response');
const { validateLogin, validateRegistration } = require('../middleware/validation');

const router = express.Router();

// ===============================
// LOGIN
// ===============================
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  const { username, password } = req.body;
  consoleLogger.log('🔐 Login attempt:', { username, password: password ? '***' : 'missing' });

  try {
    // Optimized: Select only needed fields
    const query = 'SELECT id, username, email, password, role, status, created_at FROM users WHERE username = ? OR email = ?';
    consoleLogger.log('🔍 Searching for user:', username);

    const [results] = await db.query(query, [username, username]);
    consoleLogger.log(`📊 Found ${results.length} users matching: ${username}`);

    if (results.length === 0) {
      // log failed attempt without username_attempted
      const attemptQuery =
        'INSERT INTO login_attempts (ip_address, user_agent, success) VALUES (?, ?, FALSE)';
      await db.query(attemptQuery, [req.ip, req.get('User-Agent')]);

      await logger.logLogin(
        null,
        username,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent'),
        false,
        'User not found'
      );

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    consoleLogger.log('👤 User found:', {
      id: user.id,
      username: user.username,
      status: user.status,
      role: user.role,
    });

    // Check approval
    if (user.status !== 'approved') {
      await logger.warning('authentication', `Login attempt by unapproved user: ${user.username}`, {
        type: logger.LogType.LOGIN,
        user_id: user.id,
        ip_address: req.ip || req.connection.remoteAddress,
        metadata: { status: user.status }
      });

      return sendError(res, 401, 'Account not approved. Please contact administrator.');
    }

    // Check password
    consoleLogger.log('🔑 Checking password...');
    const validPassword = await bcrypt.compare(password, user.password);
    consoleLogger.log('Password valid:', validPassword);

    if (!validPassword) {
      // Log failed login attempt
      const attemptQuery =
        'INSERT INTO login_attempts (user_id, ip_address, user_agent, success) VALUES (?, ?, ?, FALSE)';
      await db.query(attemptQuery, [user.id, req.ip, req.get('User-Agent')]);

      await logger.logLogin(
        user.id,
        user.username,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent'),
        false,
        'Invalid password'
      );

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log success
    const attemptQuery =
      'INSERT INTO login_attempts (user_id, ip_address, user_agent, success) VALUES (?, ?, ?, TRUE)';
    await db.query(attemptQuery, [user.id, req.ip, req.get('User-Agent')]);

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

    // Log successful login
    await logger.logLogin(
      user.id,
      user.username,
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent'),
      true
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    consoleLogger.error('❌ Login error:', error);
    return sendInternalError(res, error, 'Login failed');
  }
});

// ===============================
// REGISTER (Admin creates users)
// ===============================
router.post('/register', authLimiter, validateRegistration, async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
    const [existing] = await db.query(checkQuery, [username, email]);

    if (existing.length > 0) {
      return sendError(res, 409, 'Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'viewer';

    const insertQuery =
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(insertQuery, [
      username,
      email,
      hashedPassword,
      userRole,
    ]);

    return sendSuccess(res, {
      userId: result.insertId,
    }, 'User registered successfully. Waiting for admin approval.', 201);
  } catch (error) {
    return sendInternalError(res, error, 'Registration failed');
  }
});

// ===============================
// VERIFY TOKEN
// ===============================
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_here');

    const query =
      'SELECT id, username, email, role, status FROM users WHERE id = ? AND status = "approved"';
    const [results] = await db.query(query, [decoded.id]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ valid: true, user: results[0] });
  } catch (error) {
    consoleLogger.error('❌ Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
