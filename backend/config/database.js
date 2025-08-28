const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool instead of single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'y4d_dashboard',
  waitForConnections: true,
  connectionLimit: 20, // Adjust based on your needs
  queueLimit: 0,
  acquireTimeout: 60000, // 60 seconds timeout
  timeout: 60000, // 60 seconds
});

// Get a promise based interface to the pool
const promisePool = pool.promise();

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
  connection.release(); // Release the connection back to the pool
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.log('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.log('Database connection was refused.');
  }
});

module.exports = promisePool;