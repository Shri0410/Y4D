const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all quality education items
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM integrated_development ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active quality education items
router.get('/active', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM integrated_development WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one quality education item
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM integrated_development WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create quality education item
router.post('/', async (req, res) => {
  try {
    const { title, description, content, image_url, video_url, additional_images, meta_title, meta_description, meta_keywords, is_active, display_order } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO integrated_development (title, description, content, image_url, video_url, additional_images, meta_title, meta_description, meta_keywords, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, content, image_url, video_url, JSON.stringify(additional_images || []), meta_title, meta_description, meta_keywords, is_active !== false, display_order || 0]
    );
    
    res.json({
      id: result.insertId,
      message: 'Item created successfully',
      item: { id: result.insertId, title, description, content, image_url, video_url, additional_images, meta_title, meta_description, meta_keywords, is_active, display_order }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quality education item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, image_url, video_url, additional_images, meta_title, meta_description, meta_keywords, is_active, display_order } = req.body;

    const [rows] = await db.query('SELECT * FROM integrated_development WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });

    await db.query(
      'UPDATE integrated_development SET title = ?, description = ?, content = ?, image_url = ?, video_url = ?, additional_images = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, is_active = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, content, image_url, video_url, JSON.stringify(additional_images || []), meta_title, meta_description, meta_keywords, is_active !== false, display_order || 0, id]
    );

    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete quality education item
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM integrated_development WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;