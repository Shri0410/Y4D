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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all reports
router.get('/', (req, res) => {
  const query = 'SELECT * FROM reports ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get single report
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM reports WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(results[0]);
  });
});

// Create report
router.post('/', upload.single('image'), (req, res) => {
  const { title, description, content } = req.body;
  const image = req.file ? req.file.filename : null;
  
  const query = 'INSERT INTO reports (title, description, content, image) VALUES (?, ?, ?, ?)';
  
  db.query(query, [title, description, content, image], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      id: results.insertId, 
      message: 'Report created successfully',
      report: { id: results.insertId, title, description, content, image }
    });
  });
});

// Update report
router.put('/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { title, description, content } = req.body;
  
  // Check if report exists
  db.query('SELECT * FROM reports WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    let image = results[0].image; // Keep existing image if not updated
    if (req.file) {
      image = req.file.filename;
    }
    
    const query = 'UPDATE reports SET title = ?, description = ?, content = ?, image = ? WHERE id = ?';
    
    db.query(query, [title, description, content, image, id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Report updated successfully' });
    });
  });
});

// Delete report
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM reports WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
  });
});

module.exports = router;