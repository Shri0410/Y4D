// backend/routes/mentors.js
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Check if the file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Get all mentors
router.get('/', (req, res) => {
  console.log('📖 Fetching all mentors from database');
  
  const query = 'SELECT * FROM mentors ORDER BY name';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Database error fetching mentors:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch mentors',
        details: err.message,
        sqlMessage: err.sqlMessage 
      });
    }
    
    console.log(`✅ Found ${results.length} mentors`);
    
    // Parse social_links from JSON string to object for each mentor
    const mentorsWithParsedSocialLinks = results.map(mentor => {
      try {
        if (mentor.social_links && typeof mentor.social_links === 'string') {
          mentor.social_links = JSON.parse(mentor.social_links);
        } else if (!mentor.social_links) {
          mentor.social_links = {};
        }
      } catch (parseError) {
        console.error('❌ Error parsing social_links for mentor:', mentor.id, parseError);
        mentor.social_links = {};
      }
      return mentor;
    });
    
    res.json(mentorsWithParsedSocialLinks);
  });
});

// Get single mentor
router.get('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`📖 Fetching mentor with ID: ${id}`);
  
  const query = 'SELECT * FROM mentors WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Database error fetching mentor:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch mentor',
        details: err.message,
        sqlMessage: err.sqlMessage 
      });
    }
    
    if (results.length === 0) {
      console.log(`❌ Mentor not found with ID: ${id}`);
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    const mentor = results[0];
    
    // Parse social_links from JSON string to object
    try {
      if (mentor.social_links && typeof mentor.social_links === 'string') {
        mentor.social_links = JSON.parse(mentor.social_links);
      } else if (!mentor.social_links) {
        mentor.social_links = {};
      }
    } catch (parseError) {
      console.error('❌ Error parsing social_links:', parseError);
      mentor.social_links = {};
    }
    
    console.log(`✅ Found mentor: ${mentor.name}`);
    res.json(mentor);
  });
});

// Create mentor
router.post('/', upload.single('image'), (req, res) => {
  console.log('➕ Creating new mentor');
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.file);
  
  const { name, position, bio, social_links } = req.body;
  const image = req.file ? req.file.filename : null;
  
  // Validate required fields
  if (!name || name.trim() === '') {
    console.log('❌ Validation failed: Name is required');
    return res.status(400).json({ error: 'Name is required' });
  }
  
  // Handle social_links parsing with better error handling
  let socialLinksJson = null;
  try {
    if (social_links && social_links.trim() !== '') {
      socialLinksJson = JSON.parse(social_links);
    } else {
      socialLinksJson = {};
    }
    console.log('✅ Social links parsed successfully:', socialLinksJson);
  } catch (parseError) {
    console.error('❌ Error parsing social_links:', parseError);
    return res.status(400).json({ 
      error: 'Invalid JSON format in social links',
      details: 'Use format: {"twitter": "url", "linkedin": "url"} or leave empty for {}',
      example: '{"twitter": "https://twitter.com/username", "linkedin": "https://linkedin.com/in/username"}'
    });
  }
  
  const query = 'INSERT INTO mentors (name, position, bio, image, social_links) VALUES (?, ?, ?, ?, ?)';
  const values = [name.trim(), position ? position.trim() : null, bio ? bio.trim() : null, image, JSON.stringify(socialLinksJson)];
  
  console.log('🚀 Executing database query:', query);
  console.log('📋 Query values:', values);
  
  db.query(query, values, (err, results) => {
    if (err) {
      console.error('❌ Database error creating mentor:', err);
      return res.status(500).json({ 
        error: 'Failed to create mentor',
        details: err.message,
        sqlMessage: err.sqlMessage 
      });
    }
    
    console.log(`✅ Mentor created successfully with ID: ${results.insertId}`);
    
    // Return the created mentor with parsed social_links
    const createdMentor = {
      id: results.insertId,
      name: name.trim(),
      position: position ? position.trim() : null,
      bio: bio ? bio.trim() : null,
      image: image,
      social_links: socialLinksJson,
      created_at: new Date()
    };
    
    res.status(201).json({ 
      message: 'Mentor created successfully',
      mentor: createdMentor
    });
  });
});

// Update mentor
router.put('/:id', upload.single('image'), (req, res) => {
  const { id } = req.params;
  console.log(`✏️ Updating mentor with ID: ${id}`);
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.file);
  
  const { name, position, bio, social_links } = req.body;
  
  // First, get the existing mentor to preserve existing values if not provided
  db.query('SELECT * FROM mentors WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Database error fetching mentor for update:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch mentor for update',
        details: err.message,
        sqlMessage: err.sqlMessage 
      });
    }
    
    if (results.length === 0) {
      console.log(`❌ Mentor not found with ID: ${id}`);
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    const existingMentor = results[0];
    
    // Use new image if provided, otherwise keep existing
    let image = existingMentor.image;
    if (req.file) {
      image = req.file.filename;
    }
    
    // Use new values if provided, otherwise keep existing
    const updatedName = name ? name.trim() : existingMentor.name;
    const updatedPosition = position ? position.trim() : existingMentor.position;
    const updatedBio = bio ? bio.trim() : existingMentor.bio;
    
    // Handle social_links parsing
    let socialLinksJson;
    try {
      if (social_links && social_links.trim() !== '') {
        socialLinksJson = JSON.parse(social_links);
      } else if (existingMentor.social_links && typeof existingMentor.social_links === 'string') {
        // Parse existing social_links if it's a string
        socialLinksJson = JSON.parse(existingMentor.social_links);
      } else {
        socialLinksJson = existingMentor.social_links || {};
      }
    } catch (parseError) {
      console.error('❌ Error parsing social_links:', parseError);
      return res.status(400).json({ 
        error: 'Invalid JSON format in social links',
        details: 'Use format: {"twitter": "url", "linkedin": "url"}'
      });
    }
    
    const query = 'UPDATE mentors SET name = ?, position = ?, bio = ?, image = ?, social_links = ? WHERE id = ?';
    const values = [updatedName, updatedPosition, updatedBio, image, JSON.stringify(socialLinksJson), id];
    
    console.log('🚀 Executing update query:', query);
    console.log('📋 Update values:', values);
    
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('❌ Database error updating mentor:', err);
        return res.status(500).json({ 
          error: 'Failed to update mentor',
          details: err.message,
          sqlMessage: err.sqlMessage 
        });
      }
      
      if (results.affectedRows === 0) {
        console.log(`❌ No mentor found with ID: ${id} for update`);
        return res.status(404).json({ error: 'Mentor not found' });
      }
      
      console.log(`✅ Mentor updated successfully: ${updatedName}`);
      
      // Return the updated mentor with parsed social_links
      const updatedMentor = {
        id: parseInt(id),
        name: updatedName,
        position: updatedPosition,
        bio: updatedBio,
        image: image,
        social_links: socialLinksJson,
        updated_at: new Date()
      };
      
      res.json({ 
        message: 'Mentor updated successfully',
        mentor: updatedMentor
      });
    });
  });
});

// Delete mentor
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting mentor with ID: ${id}`);
  
  // First get the mentor to return details in response
  db.query('SELECT * FROM mentors WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('❌ Database error fetching mentor for deletion:', err);
      return res.status(500).json({ 
        error: 'Failed to fetch mentor for deletion',
        details: err.message,
        sqlMessage: err.sqlMessage 
      });
    }
    
    if (results.length === 0) {
      console.log(`❌ Mentor not found with ID: ${id}`);
      return res.status(404).json({ error: 'Mentor not found' });
    }
    
    const mentorToDelete = results[0];
    
    // Now delete the mentor
    const query = 'DELETE FROM mentors WHERE id = ?';
    
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('❌ Database error deleting mentor:', err);
        return res.status(500).json({ 
          error: 'Failed to delete mentor',
          details: err.message,
          sqlMessage: err.sqlMessage 
        });
      }
      
      if (results.affectedRows === 0) {
        console.log(`❌ No mentor found with ID: ${id} for deletion`);
        return res.status(404).json({ error: 'Mentor not found' });
      }
      
      console.log(`✅ Mentor deleted successfully: ${mentorToDelete.name}`);
      
      // Parse social_links for the response
      let socialLinks = {};
      try {
        if (mentorToDelete.social_links && typeof mentorToDelete.social_links === 'string') {
          socialLinks = JSON.parse(mentorToDelete.social_links);
        } else if (mentorToDelete.social_links) {
          socialLinks = mentorToDelete.social_links;
        }
      } catch (parseError) {
        console.error('Error parsing social_links for deleted mentor:', parseError);
      }
      
      res.json({ 
        message: 'Mentor deleted successfully',
        deletedMentor: {
          id: mentorToDelete.id,
          name: mentorToDelete.name,
          position: mentorToDelete.position,
          image: mentorToDelete.image
        }
      });
    });
  });
});

module.exports = router;