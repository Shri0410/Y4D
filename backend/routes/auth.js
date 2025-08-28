const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database'); // <- using your promisePool

const router = express.Router();

// ===============================
// LOGIN
// ===============================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('🔐 Login attempt:', { username, password: password ? '***' : 'missing' });

  if (!username || !password) {
    console.log('❌ Missing username or password');
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
    console.log('🔍 Searching for user:', username);

    const [results] = await db.query(query, [username, username]);
    console.log(`📊 Found ${results.length} users matching: ${username}`);

    if (results.length === 0) {
      console.log('❌ No user found with username/email:', username);

      // log failed attempt without username_attempted
      const attemptQuery =
        'INSERT INTO login_attempts (ip_address, user_agent, success) VALUES (?, ?, FALSE)';
      await db.query(attemptQuery, [req.ip, req.get('User-Agent')]);

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    console.log('👤 User found:', {
      id: user.id,
      username: user.username,
      status: user.status,
      role: user.role,
    });

    // Check approval
    if (user.status !== 'approved') {
      console.log('❌ User not approved. Status:', user.status);
      return res
        .status(401)
        .json({ error: 'Account not approved. Please contact administrator.' });
    }

    // Check password
    console.log('🔑 Checking password...');
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      console.log('❌ Invalid password for user:', user.username);

      const attemptQuery =
        'INSERT INTO login_attempts (user_id, ip_address, user_agent, success) VALUES (?, ?, ?, FALSE)';
      await db.query(attemptQuery, [user.id, req.ip, req.get('User-Agent')]);

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

    console.log('✅ Login successful for user:', user.username);

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
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ===============================
// REGISTER (Admin creates users)
// ===============================
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
    const [existing] = await db.query(checkQuery, [username, email]);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
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

    res.status(201).json({
      message: 'User registered successfully. Waiting for admin approval.',
      userId: result.insertId,
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
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
    console.error('❌ Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
