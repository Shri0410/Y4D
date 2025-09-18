// backend/routes/mentors.js - UPDATED VERSION
const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/mentors/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Convert all routes to async/await for consistency
// Get all mentors
router.get('/', async (req, res) => {
  try {
    console.log('📖 Fetching all mentors from database');
    const [results] = await db.query('SELECT * FROM mentors ORDER BY name');
    
    const mentorsWithParsedSocialLinks = results.map(mentor => {
      try {
        mentor.social_links = mentor.social_links ? 
          (typeof mentor.social_links === 'string' ? JSON.parse(mentor.social_links) : mentor.social_links) 
          : {};
      } catch (parseError) {
        console.error('Error parsing social_links:', parseError);
        mentor.social_links = {};
      }
      return mentor;
    });
    
    res.json(mentorsWithParsedSocialLinks);
  } catch (err) {
    console.error('Database error fetching mentors:', err);
    res.status(500).json({ 
      error: 'Failed to fetch mentors',
      details: err.message
    });
  }
});

// Get single mentor
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.query('SELECT * FROM mentors WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    const mentor = results[0];
    try {
      mentor.social_links = mentor.social_links ? 
        (typeof mentor.social_links === 'string' ? JSON.parse(mentor.social_links) : mentor.social_links) 
        : {};
    } catch (parseError) {
      console.error('Error parsing social_links:', parseError);
      mentor.social_links = {};
    }
    
    res.json(mentor);
  } catch (err) {
    console.error('Database error fetching mentor:', err);
    res.status(500).json({ 
      error: 'Failed to fetch mentor',
      details: err.message
    });
  }
});

// Create mentor
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, position, bio, social_links } = req.body;
    const image = req.file ? req.file.filename : null;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Handle social_links safely
    let socialLinksJson = {};
    try {
      if (social_links && social_links.trim() !== '') {
        socialLinksJson = JSON.parse(social_links);
      }
    } catch (parseError) {
      return res.status(400).json({ 
        error: 'Invalid social links format',
        details: 'Use valid JSON format for social links'
      });
    }
    
    const [result] = await db.query(
      'INSERT INTO mentors (name, position, bio, image, social_links) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), position?.trim() || null, bio?.trim() || null, image, JSON.stringify(socialLinksJson)]
    );
    
    const createdMentor = {
      id: result.insertId,
      name: name.trim(),
      position: position?.trim() || null,
      bio: bio?.trim() || null,
      image: image,
      social_links: socialLinksJson
    };
    
    res.status(201).json({ 
      message: 'Mentor created successfully',
      mentor: createdMentor
    });
    
  } catch (err) {
    console.error('Database error creating mentor:', err);
    res.status(500).json({ 
      error: 'Failed to create mentor',
      details: err.message
    });
  }
});

// Update mentor
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, bio, social_links } = req.body;
    
    // Get existing mentor
    const [existingRows] = await db.query('SELECT * FROM mentors WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    const existingMentor = existingRows[0];
    const image = req.file ? req.file.filename : existingMentor.image;
    
    // Parse social_links safely
    let socialLinksJson;
    try {
      if (social_links && social_links.trim() !== '') {
        socialLinksJson = JSON.parse(social_links);
      } else {
        socialLinksJson = typeof existingMentor.social_links === 'string' ? 
          JSON.parse(existingMentor.social_links) : existingMentor.social_links;
      }
    } catch (parseError) {
      return res.status(400).json({ 
        error: 'Invalid social links format',
        details: 'Use valid JSON format for social links'
      });
    }
    
    const [result] = await db.query(
      'UPDATE mentors SET name = ?, position = ?, bio = ?, image = ?, social_links = ? WHERE id = ?',
      [
        name?.trim() || existingMentor.name,
        position?.trim() || existingMentor.position,
        bio?.trim() || existingMentor.bio,
        image,
        JSON.stringify(socialLinksJson),
        id
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    res.json({ 
      message: 'Mentor updated successfully',
      mentor: {
        id: parseInt(id),
        name: name?.trim() || existingMentor.name,
        position: position?.trim() || existingMentor.position,
        bio: bio?.trim() || existingMentor.bio,
        image: image,
        social_links: socialLinksJson
      }
    });
    
  } catch (err) {
    console.error('Database error updating mentor:', err);
    res.status(500).json({ 
      error: 'Failed to update mentor',
      details: err.message
    });
  }
});

// Delete mentor
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query('DELETE FROM mentors WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    res.json({ 
      message: 'Mentor deleted successfully',
      deletedId: id
    });
    
  } catch (err) {
    console.error('Database error deleting mentor:', err);
    res.status(500).json({ 
      error: 'Failed to delete mentor',
      details: err.message
    });
  }
});

// Multer error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

module.exports = router;