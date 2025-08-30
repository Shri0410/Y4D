// routes/ourWork.js - Updated for multiple items
const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all items for a section (Public endpoint)
router.get('/public/:category', (req, res) => {
  const { category } = req.params;
  const { limit = 50, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  const validCategories = ['quality_education', 'livelihood', 'healthcare', 'environment_sustainability', 'integrated_development'];
  
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const query = `
    SELECT id, section_category, title, description, content, image_url, video_url, 
           additional_images, created_at, updated_at
    FROM our_work_items 
    WHERE section_category = ? AND is_active = true
    ORDER BY display_order ASC, created_at DESC
    LIMIT ? OFFSET ?
  `;

  db.query(query, [category, parseInt(limit), offset], (err, results) => {
    if (err) {
      console.error('Database error fetching public items:', err);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }

    // Parse additional_images
    const items = results.map(item => {
      if (item.additional_images && typeof item.additional_images === 'string') {
        try {
          item.additional_images = JSON.parse(item.additional_images);
        } catch (e) {
          item.additional_images = [];
        }
      }
      return item;
    });

    // Get total count for pagination
    const countQuery = 'SELECT COUNT(*) as total FROM our_work_items WHERE section_category = ? AND is_active = true';
    db.query(countQuery, [category], (countErr, countResults) => {
      if (countErr) {
        console.error('Count error:', countErr);
        return res.json({ items, pagination: { page, limit, total: items.length } });
      }

      res.json({
        items,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResults[0].total,
          pages: Math.ceil(countResults[0].total / limit)
        }
      });
    });
  });
});

// Get single item (Public endpoint)
router.get('/public/item/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT id, section_category, title, description, content, image_url, video_url, 
           additional_images, created_at, updated_at
    FROM our_work_items 
    WHERE id = ? AND is_active = true
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database error fetching item:', err);
      return res.status(500).json({ error: 'Failed to fetch item' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = results[0];
    if (item.additional_images && typeof item.additional_images === 'string') {
      try {
        item.additional_images = JSON.parse(item.additional_images);
      } catch (e) {
        item.additional_images = [];
      }
    }

    res.json(item);
  });
});

// ADMIN ENDPOINTS - CRUD Operations

// Get all items for admin management
router.get('/admin/:category', authenticateToken, requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
  const { category } = req.params;

  const query = `
    SELECT owi.*, 
           creator.username as created_by_name,
           updater.username as updated_by_name
    FROM our_work_items owi
    LEFT JOIN users creator ON owi.created_by = creator.id
    LEFT JOIN users updater ON owi.updated_by = updater.id
    WHERE owi.section_category = ?
    ORDER BY owi.display_order ASC, owi.created_at DESC
  `;

  db.query(query, [category], (err, results) => {
    if (err) {
      console.error('Database error fetching admin items:', err);
      return res.status(500).json({ error: 'Failed to fetch items' });
    }

    // Parse additional_images
    const items = results.map(item => {
      if (item.additional_images && typeof item.additional_images === 'string') {
        try {
          item.additional_images = JSON.parse(item.additional_images);
        } catch (e) {
          item.additional_images = [];
        }
      }
      return item;
    });

    res.json(items);
  });
});

// Create new item
router.post('/admin/:category', authenticateToken, requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
  const { category } = req.params;
  const {
    title,
    description,
    content,
    image_url,
    video_url,
    additional_images,
    meta_title,
    meta_description,
    meta_keywords,
    is_active,
    display_order
  } = req.body;

  const query = `
    INSERT INTO our_work_items 
      (section_category, title, description, content, image_url, video_url, 
       additional_images, meta_title, meta_description, meta_keywords, 
       is_active, display_order, created_by, updated_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    category,
    title,
    description,
    content,
    image_url,
    video_url,
    JSON.stringify(additional_images || []),
    meta_title,
    meta_description,
    meta_keywords,
    is_active !== false,
    display_order || 0,
    req.user.id,
    req.user.id
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Database error creating item:', err);
      return res.status(500).json({ error: 'Failed to create item' });
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
      'our_work_item', 
      results.insertId, 
      `Created ${category} item: ${title}`
    ]);

    res.status(201).json({ 
      message: 'Item created successfully',
      id: results.insertId
    });
  });
});

// Update item
router.put('/admin/item/:id', authenticateToken, requireRole(['super_admin', 'admin', 'editor']), (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    content,
    image_url,
    video_url,
    additional_images,
    meta_title,
    meta_description,
    meta_keywords,
    is_active,
    display_order
  } = req.body;

  const query = `
    UPDATE our_work_items 
    SET title = ?, description = ?, content = ?, image_url = ?, video_url = ?, 
        additional_images = ?, meta_title = ?, meta_description = ?, meta_keywords = ?,
        is_active = ?, display_order = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const values = [
    title,
    description,
    content,
    image_url,
    video_url,
    JSON.stringify(additional_images || []),
    meta_title,
    meta_description,
    meta_keywords,
    is_active !== false,
    display_order || 0,
    req.user.id,
    id
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Database error updating item:', err);
      return res.status(500).json({ error: 'Failed to update item' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Log the action
    const auditQuery = `
      INSERT INTO audit_logs 
        (user_id, action, resource_type, resource_id, details) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(auditQuery, [
      req.user.id, 
      'update', 
      'our_work_item', 
      id, 
      `Updated ${category} item: ${title}`
    ]);

    res.json({ message: 'Item updated successfully' });
  });
});

// Delete item
router.delete('/admin/item/:id', authenticateToken, requireRole(['super_admin', 'admin']), (req, res) => {
  const { id } = req.params;

  // First get item details for logging
  const getQuery = 'SELECT section_category, title FROM our_work_items WHERE id = ?';
  db.query(getQuery, [id], (getErr, getResults) => {
    if (getErr) {
      console.error('Database error fetching item for deletion:', getErr);
      return res.status(500).json({ error: 'Failed to fetch item' });
    }

    if (getResults.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { section_category, title } = getResults[0];

    const deleteQuery = 'DELETE FROM our_work_items WHERE id = ?';
    db.query(deleteQuery, [id], (deleteErr, deleteResults) => {
      if (deleteErr) {
        console.error('Database error deleting item:', deleteErr);
        return res.status(500).json({ error: 'Failed to delete item' });
      }

      if (deleteResults.affectedRows === 0) {
        return res.status(404).json({ error: 'Item not found' });
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
        'our_work_item', 
        id, 
        `Deleted ${section_category} item: ${title}`
      ]);

      res.json({ message: 'Item deleted successfully' });
    });
  });
});

module.exports = router;