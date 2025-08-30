const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  console.log('🔍 Fetching all users...');
  
  // Fixed query to match your actual table structure
  const query = `
    SELECT 
      u.id, 
      u.username, 
      u.email, 
      u.role, 
      u.status, 
      u.mobile_number, 
      u.address,
      u.created_at,
      u.created_by,
      creator.username as created_by_name 
    FROM users u 
    LEFT JOIN users creator ON u.created_by = creator.id 
    ORDER BY u.created_at DESC
  `;
  
  console.log('📊 Executing query:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Database error fetching users:', err);
      console.error('❌ SQL Error:', err.sqlMessage);
      return res.status(500).json({ 
        error: 'Failed to fetch users',
        details: err.message,
        sqlMessage: err.sqlMessage
      });
    }
    
    console.log(`✅ Found ${results.length} users in database`);
    
    // Check if created_by_name is null and handle it
    const usersWithFallbackCreator = results.map(user => ({
      ...user,
      created_by_name: user.created_by_name || 'System' // Fallback for null values
    }));
    
    console.log('📋 Users data sample:', usersWithFallbackCreator.slice(0, 3));
    
    res.json(usersWithFallbackCreator);
  });
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  console.log('Fetching user profile for ID:', req.user.id);
  
  const query = `
    SELECT 
      id, 
      username, 
      email, 
      role, 
      status, 
      mobile_number, 
      address, 
      created_at,
      created_by
    FROM users 
    WHERE id = ?
  `;
  
  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error('Database error fetching user profile:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch user profile',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User profile fetched successfully');
    res.json(results[0]);
  });
});

// Create new user (Admin only)
router.post('/', authenticateToken, requireRole(['super_admin', 'admin']), async (req, res) => {
  const { username, email, password, role, mobile_number, address } = req.body;
  
  console.log('Creating new user:', { username, email, role });
  
  // Validate input
  if (!username || !email || !password || !role) {
    console.log('Validation failed: Missing required fields');
    return res.status(400).json({ error: 'Username, email, password, and role are required' });
  }

  if (!['admin', 'editor', 'viewer'].includes(role)) {
    console.log('Validation failed: Invalid role');
    return res.status(400).json({ error: 'Invalid role. Must be admin, editor, or viewer' });
  }

  try {
    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
    db.query(checkQuery, [username, email], async (err, results) => {
      if (err) {
        console.error('Database error checking user existence:', err);
        return res.status(500).json({ 
          error: 'Failed to check user existence',
          details: err.message 
        });
      }
      
      if (results.length > 0) {
        console.log('User already exists:', results[0]);
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const insertQuery = `
        INSERT INTO users 
          (username, email, password, role, mobile_number, address, status, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, 'approved', ?)
      `;
      
      const values = [username, email, hashedPassword, role, mobile_number || null, address || null, req.user.id];
      
      db.query(insertQuery, values, (err, results) => {
        if (err) {
          console.error('Database error creating user:', err);
          return res.status(500).json({ 
            error: 'Failed to create user',
            details: err.message,
            sqlMessage: err.sqlMessage 
          });
        }
        
        // Log the action
        const auditQuery = `
          INSERT INTO audit_logs 
            (user_id, action, resource_type, resource_id, details) 
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.query(auditQuery, [
          req.user.id, 
          'create', 
          'user', 
          results.insertId, 
          `Created user ${username} with role ${role}`
        ]);
        
        console.log('User created successfully with ID:', results.insertId);
        
        res.status(201).json({ 
          message: 'User created successfully',
          user: { 
            id: results.insertId, 
            username, 
            email, 
            role, 
            status: 'approved',
            mobile_number: mobile_number || null,
            address: address || null
          }
        });
      });
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message 
    });
  }
});

// Update user status (Approve/Reject/Suspend)
router.patch('/:id/status', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log('Updating user status:', { userId: id, status });
  
  if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) {
    console.log('Validation failed: Invalid status');
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  // First check if user exists
  const checkQuery = 'SELECT username FROM users WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Database error checking user:', err);
      return res.status(500).json({ 
        error: 'Failed to check user existence',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      console.log('User not found with ID:', id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const username = results[0].username;
    
    const updateQuery = 'UPDATE users SET status = ? WHERE id = ?';
    db.query(updateQuery, [status, id], (err, results) => {
      if (err) {
        console.error('Database error updating user status:', err);
        return res.status(500).json({ 
          error: 'Failed to update user status',
          details: err.message 
        });
      }
      
      if (results.affectedRows === 0) {
        console.log('No rows affected during status update');
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Log the action
      const auditQuery = `
        INSERT INTO audit_logs 
          (user_id, action, resource_type, resource_id, details) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(auditQuery, [
        req.user.id, 
        'update_status', 
        'user', 
        id, 
        `Changed status of user ${username} to ${status}`
      ]);
      
      console.log('User status updated successfully');
      
      res.json({ 
        message: `User status updated to ${status} successfully`,
        userId: id,
        username,
        status
      });
    });
  });
});

// Update user role
router.patch('/:id/role', authenticateToken, requireRole(['super_admin']), (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  console.log('Updating user role:', { userId: id, role });
  
  if (!['super_admin', 'admin', 'editor', 'viewer'].includes(role)) {
    console.log('Validation failed: Invalid role');
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  // Prevent self-role change if it would remove super_admin privileges
  if (parseInt(id) === req.user.id && role !== 'super_admin') {
    console.log('Cannot remove super_admin role from yourself');
    return res.status(400).json({ error: 'Cannot remove super_admin role from your own account' });
  }
  
  // First check if user exists
  const checkQuery = 'SELECT username FROM users WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Database error checking user:', err);
      return res.status(500).json({ 
        error: 'Failed to check user existence',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      console.log('User not found with ID:', id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const username = results[0].username;
    
    const updateQuery = 'UPDATE users SET role = ? WHERE id = ?';
    db.query(updateQuery, [role, id], (err, results) => {
      if (err) {
        console.error('Database error updating user role:', err);
        return res.status(500).json({ 
          error: 'Failed to update user role',
          details: err.message 
        });
      }
      
      if (results.affectedRows === 0) {
        console.log('No rows affected during role update');
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Log the action
      const auditQuery = `
        INSERT INTO audit_logs 
          (user_id, action, resource_type, resource_id, details) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(auditQuery, [
        req.user.id, 
        'update_role', 
        'user', 
        id, 
        `Changed role of user ${username} to ${role}`
      ]);
      
      console.log('User role updated successfully');
      
      res.json({ 
        message: `User role updated to ${role} successfully`,
        userId: id,
        username,
        role
      });
    });
  });
});

// Update user profile (for own account)
router.put('/profile', authenticateToken, (req, res) => {
  const { email, mobile_number, address } = req.body;
  
  console.log('Updating user profile for ID:', req.user.id);
  
  const query = `
    UPDATE users 
    SET email = ?, mobile_number = ?, address = ? 
    WHERE id = ?
  `;
  
  db.query(query, [email, mobile_number, address, req.user.id], (err, results) => {
    if (err) {
      console.error('Database error updating profile:', err);
      return res.status(500).json({ 
        error: 'Failed to update profile',
        details: err.message 
      });
    }
    
    if (results.affectedRows === 0) {
      console.log('User not found for profile update');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User profile updated successfully');
    res.json({ message: 'Profile updated successfully' });
  });
});

// Delete user
router.delete('/:id', authenticateToken, requireRole(['super_admin']), (req, res) => {
  const { id } = req.params;
  
  console.log('Deleting user with ID:', id);
  
  // Prevent self-deletion
  if (parseInt(id) === req.user.id) {
    console.log('Cannot delete own account');
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  
  // First get user details for logging
  const checkQuery = 'SELECT username FROM users WHERE id = ?';
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Database error checking user:', err);
      return res.status(500).json({ 
        error: 'Failed to check user existence',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      console.log('User not found with ID:', id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const username = results[0].username;
    
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteQuery, [id], (err, results) => {
      if (err) {
        console.error('Database error deleting user:', err);
        return res.status(500).json({ 
          error: 'Failed to delete user',
          details: err.message 
        });
      }
      
      if (results.affectedRows === 0) {
        console.log('No rows affected during deletion');
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Log the action
      const auditQuery = `
        INSERT INTO audit_logs 
          (user_id, action, resource_type, resource_id, details) 
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.query(auditQuery, [
        req.user.id, 
        'delete', 
        'user', 
        id, 
        `Deleted user account: ${username}`
      ]);
      
      console.log('User deleted successfully');
      
      res.json({ 
        message: 'User deleted successfully',
        deletedUser: { id, username }
      });
    });
  });
});

// Add this to your Users.js for testing
router.get('/debug/schema', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  const testQuery = `
    SELECT 
      COLUMN_NAME, 
      DATA_TYPE, 
      IS_NULLABLE,
      COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'users' 
    AND TABLE_SCHEMA = DATABASE()
    ORDER BY ORDINAL_POSITION
  `;
  
  db.query(testQuery, (err, results) => {
    if (err) {
      console.error('Schema check error:', err);
      return res.status(500).json({ error: 'Failed to check schema' });
    }
    
    console.log('Users table schema:', results);
    res.json({ schema: results });
  });
});

// Get user by ID (Admin only)
router.get('/:id', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  const { id } = req.params;
  
  console.log('Fetching user by ID:', id);
  
  const query = `
    SELECT 
      id, 
      username, 
      email, 
      role, 
      status, 
      mobile_number, 
      address, 
      created_at 
    FROM users 
    WHERE id = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database error fetching user:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch user',
        details: err.message 
      });
    }
    
    if (results.length === 0) {
      console.log('User not found with ID:', id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User fetched successfully');
    res.json(results[0]);
  });
});

// Get user statistics
router.get('/stats/overview', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  console.log('Fetching user statistics');
  
  const queries = {
    total: 'SELECT COUNT(*) as count FROM users',
    approved: 'SELECT COUNT(*) as count FROM users WHERE status = "approved"',
    pending: 'SELECT COUNT(*) as count FROM users WHERE status = "pending"',
    rejected: 'SELECT COUNT(*) as count FROM users WHERE status = "rejected"',
    suspended: 'SELECT COUNT(*) as count FROM users WHERE status = "suspended"',
    byRole: `
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE status = "approved" 
      GROUP BY role
    `
  };
  
  // Execute all queries
  Promise.all([
    db.query(queries.total),
    db.query(queries.approved),
    db.query(queries.pending),
    db.query(queries.rejected),
    db.query(queries.suspended),
    db.query(queries.byRole)
  ]).then((results) => {
    const stats = {
      total: results[0][0][0].count,
      approved: results[1][0][0].count,
      pending: results[2][0][0].count,
      rejected: results[3][0][0].count,
      suspended: results[4][0][0].count,
      byRole: results[5][0].reduce((acc, row) => {
        acc[row.role] = row.count;
        return acc;
      }, {})
    };
    
    console.log('User statistics fetched successfully');
    res.json(stats);
  }).catch((error) => {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user statistics',
      details: error.message 
    });
  });
});

module.exports = router;