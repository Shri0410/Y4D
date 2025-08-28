// backend/check-users.js
const db = require('./config/database');

console.log('🔍 Checking users in database...');

// Check if users table exists and has data
db.query('SELECT * FROM users', (err, results) => {
  if (err) {
    console.error('❌ Error accessing users table:', err.message);
    
    // Try to create the table if it doesn't exist
    console.log('Attempting to create users table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'editor', 'viewer') DEFAULT 'viewer',
        status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `;
    
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err.message);
        process.exit(1);
      }
      
      console.log('✅ Users table created successfully');
      createDefaultAdmin();
    });
  } else {
    console.log(`✅ Found ${results.length} users in database:`);
    results.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - Role: ${user.role}, Status: ${user.status}`);
    });
    
    if (results.length === 0) {
      console.log('No users found. Creating default admin...');
      createDefaultAdmin();
    } else {
      db.end();
    }
  }
});

function createDefaultAdmin() {
  const bcrypt = require('bcrypt');
  
  // Create default super admin
  const password = 'admin123';
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('❌ Error hashing password:', err);
      process.exit(1);
    }
    
    const insertQuery = `
      INSERT INTO users (username, email, password, role, status) 
      VALUES ('admin', 'admin@y4d.org', ?, 'super_admin', 'approved')
    `;
    
    db.query(insertQuery, [hashedPassword], (err, results) => {
      if (err) {
        console.error('❌ Error creating default admin:', err.message);
        
        // Check if admin already exists but with different credentials
        if (err.code === 'ER_DUP_ENTRY') {
          console.log('ℹ️ Admin user already exists. Checking credentials...');
          checkAdminCredentials();
        }
      } else {
        console.log('✅ Default admin user created successfully!');
        console.log('📋 Login credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        db.end();
      }
    });
  });
}

function checkAdminCredentials() {
  const query = 'SELECT * FROM users WHERE username = "admin" OR email = "admin@y4d.org"';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error checking admin user:', err.message);
    } else if (results.length > 0) {
      console.log('✅ Found existing admin user:');
      results.forEach(user => {
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
      });
    }
    db.end();
  });
}