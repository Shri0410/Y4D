// backend/reset-admin-password.js
const db = require('./config/database');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    console.log('🔄 Resetting admin password...');
    const newPassword = 'admin123'; // Change this if needed
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // First check if admin exists
    const checkQuery = 'SELECT id FROM users WHERE username = "admin"';
    const [results] = await db.query(checkQuery);

    if (results.length === 0) {
      // Create admin user if doesn't exist
      const insertQuery = `
        INSERT INTO users (username, email, password, role, status) 
        VALUES ('admin', 'admin@y4d.org', ?, 'super_admin', 'approved')
      `;
      await db.query(insertQuery, [hashedPassword]);
      console.log('✅ Admin user created successfully!');
      console.log('📋 Login credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      // Update existing admin password
      const updateQuery = 'UPDATE users SET password = ?, status = "approved" WHERE username = "admin"';
      await db.query(updateQuery, [hashedPassword]);
      console.log('✅ Admin password reset successfully!');
      console.log('📋 New login credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    }
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    process.exit(0);
  }
}

resetAdminPassword();