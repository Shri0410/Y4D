// backend/reset-admin-password.js
const db = require('./config/database');
const bcrypt = require('bcrypt');

console.log('🔄 Resetting admin password...');

const newPassword = 'admin123'; // Change this if needed

bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
  if (err) {
    console.error('❌ Error hashing password:', err);
    process.exit(1);
  }
  
  // First check if admin exists
  const checkQuery = 'SELECT id, username, email, mobile_number, address, password, role, status, created_by, created_at, updated_at, reset_otp, reset_otp_expiry FROM users WHERE username = "admin"';
  db.query(checkQuery, (err, results) => {
    if (err) {
      console.error('❌ Error checking admin user:', err);
      process.exit(1);
    }
    
    if (results.length === 0) {
      // Create admin user if doesn't exist
      const insertQuery = `
        INSERT INTO users (username, email, password, role, status) 
        VALUES ('admin', 'admin@y4d.org', ?, 'super_admin', 'approved')
      `;
      
      db.query(insertQuery, [hashedPassword], (err) => {
        if (err) {
          console.error('❌ Error creating admin user:', err);
        } else {
          console.log('✅ Admin user created successfully!');
          console.log('📋 Login credentials:');
          console.log('   Username: admin');
          console.log('   Password: admin123');
        }
        db.end();
      });
    } else {
      // Update existing admin password
      const updateQuery = 'UPDATE users SET password = ?, status = "approved" WHERE username = "admin"';
      
      db.query(updateQuery, [hashedPassword], (err) => {
        if (err) {
          console.error('❌ Error updating admin password:', err);
        } else {
          console.log('✅ Admin password reset successfully!');
          console.log('📋 New login credentials:');
          console.log('   Username: admin');
          console.log('   Password: admin123');
        }
        db.end();
      });
    }
  });
});