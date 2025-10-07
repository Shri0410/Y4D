const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/accreditations/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'accreditation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET all accreditations
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all accreditations from database');
    
    const query = 'SELECT * FROM accreditations ORDER BY display_order ASC, created_at DESC';
    const [results] = await db.query(query);
    
    console.log(`✅ Successfully fetched ${results.length} accreditations`);
    res.json(results);
  } catch (error) {
    console.error('❌ Error fetching accreditations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accreditations',
      details: error.message 
    });
  }
});

// GET single accreditation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching accreditation with ID: ${id}`);
    
    const query = 'SELECT * FROM accreditations WHERE id = ?';
    const [results] = await db.query(query, [id]);
    
    if (results.length === 0) {
      console.log(`❌ Accreditation not found with ID: ${id}`);
      return res.status(404).json({ error: 'Accreditation not found' });
    }
    
    console.log(`✅ Successfully fetched accreditation: ${results[0].title}`);
    res.json(results[0]);
  } catch (error) {
    console.error('❌ Error fetching accreditation:', error);
    res.status(500).json({ 
      error: 'Failed to fetch accreditation',
      details: error.message 
    });
  }
});

// POST new accreditation
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('➕ Creating new accreditation');
    
    const { title, description, is_active, display_order } = req.body;
    const image = req.file ? req.file.filename : null;

    console.log('📤 Raw form data:', { title, description, is_active, display_order, image });

    // ✅ FIX: Convert string values to proper types
    const isActive = is_active === 'true' || is_active === true || is_active === '1';
    const displayOrder = parseInt(display_order) || 0;

    console.log('📤 Processed data:', { title, description, isActive, displayOrder, image });

    const query = `
      INSERT INTO accreditations (title, description, image, is_active, display_order) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      title, 
      description, 
      image, 
      isActive, // Use converted boolean
      displayOrder // Use converted number
    ]);
    
    console.log(`✅ Accreditation created successfully with ID: ${result.insertId}`);
    
    res.status(201).json({ 
      message: 'Accreditation created successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error creating accreditation:', error);
    console.error('❌ SQL Error details:', error.sqlMessage);
    res.status(500).json({ 
      error: 'Failed to create accreditation',
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});

// PUT update accreditation
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_active, display_order } = req.body;
    
    console.log(`✏️ Updating accreditation with ID: ${id}`);
    console.log('📤 Raw form data:', { title, description, is_active, display_order });

    // ✅ FIX: Convert string values to proper types
    const isActive = is_active === 'true' || is_active === true || is_active === '1';
    const displayOrder = parseInt(display_order) || 0;

    console.log('📤 Processed data:', { title, description, isActive, displayOrder });

    // First get current accreditation to handle image updates
    const getQuery = 'SELECT * FROM accreditations WHERE id = ?';
    const [currentResults] = await db.query(getQuery, [id]);
    
    if (currentResults.length === 0) {
      console.log(`❌ Accreditation not found with ID: ${id}`);
      return res.status(404).json({ error: 'Accreditation not found' });
    }

    const currentAccreditation = currentResults[0];
    let image = currentAccreditation.image;

    // If new image uploaded, use new image filename
    if (req.file) {
      image = req.file.filename;
      
      // Delete old image file
      if (currentAccreditation.image) {
        const oldImagePath = path.join('uploads/accreditations/', currentAccreditation.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`🗑️ Deleted old image: ${currentAccreditation.image}`);
        }
      }
      console.log(`🖼️ New image uploaded: ${image}`);
    }

    const updateQuery = `
      UPDATE accreditations 
      SET title = ?, description = ?, image = ?, is_active = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await db.query(updateQuery, [
      title, 
      description, 
      image, 
      isActive, // Use converted boolean
      displayOrder, // Use converted number
      id
    ]);
    
    console.log(`✅ Accreditation updated successfully: ${title}`);
    res.json({ message: 'Accreditation updated successfully' });
  } catch (error) {
    console.error('❌ Error updating accreditation:', error);
    console.error('❌ SQL Error details:', error.sqlMessage);
    res.status(500).json({ 
      error: 'Failed to update accreditation',
      details: error.message,
      sqlMessage: error.sqlMessage
    });
  }
});

// DELETE accreditation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting accreditation with ID: ${id}`);

    // First get accreditation to delete image file
    const getQuery = 'SELECT * FROM accreditations WHERE id = ?';
    const [results] = await db.query(getQuery, [id]);
    
    if (results.length === 0) {
      console.log(`❌ Accreditation not found with ID: ${id}`);
      return res.status(404).json({ error: 'Accreditation not found' });
    }

    const accreditation = results[0];
    
    // Delete image file if exists
    if (accreditation.image) {
      const imagePath = path.join('uploads/accreditations/', accreditation.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log(`🗑️ Deleted image file: ${accreditation.image}`);
      }
    }

    // Delete from database
    const deleteQuery = 'DELETE FROM accreditations WHERE id = ?';
    await db.query(deleteQuery, [id]);
    
    console.log(`✅ Accreditation deleted successfully: ${accreditation.title}`);
    res.json({ message: 'Accreditation deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting accreditation:', error);
    res.status(500).json({ 
      error: 'Failed to delete accreditation',
      details: error.message 
    });
  }
});

// PATCH - Toggle accreditation status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Toggling status for accreditation ID: ${id}`);

    // Get current status
    const getQuery = 'SELECT is_active FROM accreditations WHERE id = ?';
    const [results] = await db.query(getQuery, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Accreditation not found' });
    }

    const currentStatus = results[0].is_active;
    const newStatus = !currentStatus;

    const updateQuery = 'UPDATE accreditations SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await db.query(updateQuery, [newStatus, id]);

    console.log(`✅ Accreditation status updated to: ${newStatus}`);
    res.json({ 
      message: 'Accreditation status updated successfully',
      is_active: newStatus 
    });
  } catch (error) {
    console.error('❌ Error toggling accreditation status:', error);
    res.status(500).json({ 
      error: 'Failed to toggle accreditation status',
      details: error.message 
    });
  }
});

module.exports = router;