const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all careers
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM careers ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active careers
router.get('/active', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM careers WHERE is_active = TRUE ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one career
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM careers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Career not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create career
router.post('/', async (req, res) => {
  try {
    const { title, description, requirements, location, type } = req.body;
    const [result] = await db.query(
      'INSERT INTO careers (title, description, requirements, location, type) VALUES (?, ?, ?, ?, ?)',
      [title, description, requirements, location, type]
    );
    res.json({
      id: result.insertId,
      message: 'Career created successfully',
      career: { id: result.insertId, title, description, requirements, location, type, is_active: true }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update career
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, location, type, is_active } = req.body;

    const [rows] = await db.query('SELECT * FROM careers WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Career not found' });

    await db.query(
      'UPDATE careers SET title = ?, description = ?, requirements = ?, location = ?, type = ?, is_active = ? WHERE id = ?',
      [title, description, requirements, location, type, is_active, id]
    );

    res.json({ message: 'Career updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete career
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM careers WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Career not found' });
    res.json({ message: 'Career deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
