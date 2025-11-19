const mysql = require('mysql2');
require('dotenv').config();
const consoleLogger = require('../utils/logger');

// Note: Environment variables are validated in utils/validateEnv.js
// This file assumes validation has already been done

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // SSL configuration - only if DB_SSL is set to true
  ...(process.env.DB_SSL === 'true' ? {
    ssl: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false' 
      ? { rejectUnauthorized: false }
      : {}
  } : {})
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Get promise-based pool for async/await
const promisePool = pool.promise();

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
      consoleLogger.error('❌ Database connection error:', err.message);
      consoleLogger.error('Error code:', err.code);
    return;
  }
      consoleLogger.log('✅ Connected to database as id ' + connection.threadId);
  connection.release();
});

// Handle pool errors
pool.on('error', (err) => {
      consoleLogger.error('❌ Database pool error:', err.message);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        consoleLogger.log('⚠️  Database connection was closed. Reconnecting...');
      }
      if (err.code === 'ER_CON_COUNT_ERROR') {
        consoleLogger.log('⚠️  Database has too many connections.');
      }
      if (err.code === 'ECONNREFUSED') {
        consoleLogger.log('⚠️  Database connection was refused.');
      }
      if (err.fatal) {
        consoleLogger.error('❌ Fatal database error. Application may need to restart.');
      }
});

// Export promise pool for async/await usage
module.exports = promisePool;

// Also export the regular pool for backward compatibility if needed
module.exports.pool = pool;
