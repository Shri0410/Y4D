const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/management/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Get all management team members
router.get('/', (req, res) => {
  const query = 'SELECT * FROM management ORDER BY name';
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get single management member
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM management WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Management member not found' });
    }
    res.json(results[0]);
  });
});

// Create management member
router.post('/', upload.single('image'), (req, res) => {
  const { name, position, bio, social_links } = req.body;
  const image = req.file ? req.file.filename : null;
  const socialLinksJson = social_links ? JSON.parse(social_links) : null;
  
  const query = 'INSERT INTO management (name, position, bio, image, social_links) VALUES (?, ?, ?, ?, ?)';
  
  db.query(query, [name, position, bio, image, socialLinksJson], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      id: results.insertId, 
      message: 'Management member created successfully',
      management: { id: results.insertId, name, position, bio, image, social_links: socialLinksJson }
    });
  });
});

// Update management member
router.put('/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  const { name, position, bio, social_links } = req.body;
  
  db.query('SELECT * FROM management WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Management member not found' });
    }
    
    let image = results[0].image;
    if (req.file) {
      image = req.file.filename;
    }
    
    const socialLinksJson = social_links ? JSON.parse(social_links) : results[0].social_links;
    
    const query = 'UPDATE management SET name = ?, position = ?, bio = ?, image = ?, social_links = ? WHERE id = ?';
    
    db.query(query, [name, position, bio, image, JSON.stringify(socialLinksJson), id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Management member updated successfully' });
    });
  });
});

// Delete management member
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM management WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Management member not found' });
    }
    res.json({ message: 'Management member deleted successfully' });
  });
});

module.exports = router;