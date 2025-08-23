const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all career openings
router.get('/', (req, res) => {
  const query = 'SELECT * FROM careers ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get active career openings
router.get('/active', (req, res) => {
  const query = 'SELECT * FROM careers WHERE is_active = TRUE ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get single career opening
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM careers WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Career opening not found' });
    }
    res.json(results[0]);
  });
});

// Create career opening
router.post('/', (req, res) => {
  const { title, description, requirements, location, type } = req.body;
  
  const query = 'INSERT INTO careers (title, description, requirements, location, type) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [title, description, requirements, location, type], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      id: results.insertId, 
      message: 'Career opening created successfully',
      career: { id: results.insertId, title, description, requirements, location, type, is_active: true }
    });
  });
});

// Update career opening
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, requirements, location, type, is_active } = req.body;
  
  db.query('SELECT * FROM careers WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Career opening not found' });
    }
    
    const query = 'UPDATE careers SET title = ?, description = ?, requirements = ?, location = ?, type = ?, is_active = ? WHERE id = ?';
    
    db.query(query, [title, description, requirements, location, type, is_active, id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Career opening updated successfully' });
    });
  });
});

// Delete career opening
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM careers WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Career opening not found' });
    }
    res.json({ message: 'Career opening deleted successfully' });
  });
});

module.exports = router;