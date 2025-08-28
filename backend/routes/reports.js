const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Get all reports
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reports WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create report
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const image = req.file ? req.file.filename : null;
    const [result] = await db.query(
      'INSERT INTO reports (title, description, content, image) VALUES (?, ?, ?, ?)',
      [title, description, content, image]
    );
    res.json({
      id: result.insertId,
      message: 'Report created successfully',
      report: { id: result.insertId, title, description, content, image }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update report
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content } = req.body;

    const [rows] = await db.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Report not found' });

    let image = rows[0].image;
    if (req.file) image = req.file.filename;

    await db.query(
      'UPDATE reports SET title = ?, description = ?, content = ?, image = ? WHERE id = ?',
      [title, description, content, image, id]
    );
    res.json({ message: 'Report updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete report
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
