const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const db = require('../config/database');
const logger = require('../services/logger');
const consoleLogger = require('../utils/logger');
const { authLimiter } = require('../middleware/rateLimiter');
const { sendError, sendSuccess, sendUnauthorized, sendInternalError } = require('../utils/response');
const { validateLogin, validateRegistration } = require('../middleware/validation');
const nodemailer = require("nodemailer");

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
      await logger.warning(
        'authentication',
        `Login attempt by unapproved user: ${user.username}`,
        {
          type: logger.LogType.LOGIN,
          user_id: user.id,
          ip_address: req.ip || req.connection.remoteAddress,
          metadata: { status: user.status }
        }
      );

      return sendError(res, 401, 'Account not approved. Please contact administrator.');
    }

    // Check password
    consoleLogger.log('🔑 Checking password...');
    const validPassword = await bcrypt.compare(password, user.password);
    consoleLogger.log('Password valid:', validPassword);

    if (!validPassword) {
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

    const attemptQuery =
      'INSERT INTO login_attempts (user_id, ip_address, user_agent, success) VALUES (?, ?, ?, TRUE)';
    await db.query(attemptQuery, [user.id, req.ip, req.get('User-Agent')]);

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

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
// REGISTER
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

    return sendSuccess(
      res,
      { userId: result.insertId },
      'User registered successfully. Waiting for admin approval.',
      201
    );
  } catch (error) {
    return sendInternalError(res, error, 'Registration failed');
  }
});

// ===============================
// VERIFY TOKEN
// ===============================
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token required' });

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


// ===================================================================
// 🔵 NEW SECTION: PASSWORD RESET WITH EMAIL OTP (NO WORKFLOW CHANGED)
// ===================================================================

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

// ============ SEND OTP ============
router.post("/send-reset-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const [user] = await db.query("SELECT id FROM users WHERE email = ?", [email]);

    if (user.length === 0)
      return sendError(res, 404, "Email not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await db.query(
      "UPDATE users SET reset_otp=?, reset_otp_expiry=DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE email=?",
      [otpHash, email]
    );

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    });

    sendSuccess(res, { otpToken: otpHash }, "OTP sent successfully");
  } catch (err) {
    console.log(err);
    sendInternalError(res, err, "Failed to send OTP");
  }
});

// ============ VERIFY OTP ============
router.post("/verify-reset-otp", async (req, res) => {
  const { email, otp } = req.body;

  const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

  const [rows] = await db.query(
    "SELECT reset_otp, reset_otp_expiry FROM users WHERE email=?",
    [email]
  );

  if (rows.length === 0) return sendError(res, 404, "User not found");

  if (rows[0].reset_otp !== hashedOtp)
    return sendError(res, 400, "Invalid OTP");

  if (new Date() > new Date(rows[0].reset_otp_expiry))
    return sendError(res, 400, "OTP expired");

  sendSuccess(res, {}, "OTP verified");
});

// ============ FINAL PASSWORD RESET ============
router.post("/reset-password-final", async (req, res) => {
  const { email, newPassword } = req.body;

  const hash = await bcrypt.hash(newPassword, 10);

  await db.query(
    "UPDATE users SET password=?, reset_otp=NULL, reset_otp_expiry=NULL WHERE email=?",
    [hash, email]
  );

  sendSuccess(res, {}, "Password updated successfully");
});


module.exports = router;
