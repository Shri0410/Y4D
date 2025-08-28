const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  const query = `
    SELECT u.*, creator.username as created_by_name 
    FROM users u 
    LEFT JOIN users creator ON u.created_by = creator.id 
    ORDER BY u.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  const query = 'SELECT id, username, email, role, status, created_at FROM users WHERE id = ?';
  
  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error('Database error fetching user profile:', err);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

// Create new user (Admin only)
router.post('/', authenticateToken, requireRole(['super_admin', 'admin']), async (req, res) => {
  const { username, email, password, role } = req.body;
  
  // Validate input
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (!['admin', 'editor', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  try {
    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
    db.query(checkQuery, [username, email], async (err, results) => {
      if (err) {
        console.error('Database error checking user existence:', err);
        return res.status(500).json({ error: 'Failed to check user existence' });
      }
      
      if (results.length > 0) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const insertQuery = 'INSERT INTO users (username, email, password, role, created_by) VALUES (?, ?, ?, ?, ?)';
      db.query(insertQuery, [username, email, hashedPassword, role, req.user.id], (err, results) => {
        if (err) {
          console.error('Database error creating user:', err);
          return res.status(500).json({ error: 'Failed to create user' });
        }
        
        // Log the action
        const auditQuery = 'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)';
        db.query(auditQuery, [req.user.id, 'create', 'user', results.insertId, `Created user ${username} with role ${role}`]);
        
        res.status(201).json({ 
          message: 'User created successfully',
          user: { id: results.insertId, username, email, role, status: 'pending' }
        });
      });
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user status (Approve/Reject/Suspend)
router.patch('/:id/status', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['approved', 'rejected', 'suspended', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const query = 'UPDATE users SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err, results) => {
    if (err) {
      console.error('Database error updating user status:', err);
      return res.status(500).json({ error: 'Failed to update user status' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Log the action
    const auditQuery = 'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)';
    db.query(auditQuery, [req.user.id, 'update_status', 'user', id, `Changed status to ${status}`]);
    
    res.json({ message: `User status updated to ${status} successfully` });
  });
});

// Update user role
router.patch('/:id/role', authenticateToken, requireRole(['super_admin']), (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!['super_admin', 'admin', 'editor', 'viewer'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  const query = 'UPDATE users SET role = ? WHERE id = ?';
  db.query(query, [role, id], (err, results) => {
    if (err) {
      console.error('Database error updating user role:', err);
      return res.status(500).json({ error: 'Failed to update user role' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Log the action
    const auditQuery = 'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)';
    db.query(auditQuery, [req.user.id, 'update_role', 'user', id, `Changed role to ${role}`]);
    
    res.json({ message: `User role updated to ${role} successfully` });
  });
});

// Delete user
router.delete('/:id', authenticateToken, requireRole(['super_admin']), (req, res) => {
  const { id } = req.params;
  
  // Prevent self-deletion
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Log the action
    const auditQuery = 'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)';
    db.query(auditQuery, [req.user.id, 'delete', 'user', id, 'Deleted user account']);
    
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;