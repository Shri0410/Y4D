// routes/banners.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/banners/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'banner-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for videos
  }
});

// GET all banners with filtering (for dashboard - shows all banners)
router.get('/', async (req, res) => {
  try {
    const { page, section, category, active_only } = req.query;
    
    let query = 'SELECT * FROM banners WHERE 1=1';
    const params = [];
    
    // Only filter by is_active if active_only is explicitly true
    if (active_only === 'true') {
      query += ' AND is_active = true';
    }
    
    if (page && page !== 'all') {
      query += ' AND page = ?';
      params.push(page);
    }
    
    if (section && section !== 'all') {
      query += ' AND section = ?';
      params.push(section);
    }
    
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    console.log('📋 Fetching banners with filters:', { page, section, category, active_only });
    const [results] = await db.query(query, params);
    
    console.log(`✅ Successfully fetched ${results.length} banners`);
    res.json(results);
  } catch (error) {
    console.error('❌ Error fetching banners:', error);
    res.status(500).json({ 
      error: 'Failed to fetch banners',
      details: error.message 
    });
  }
});

// GET banners by page (for frontend - only active banners)
router.get('/page/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const { section } = req.query;
    
    let query = 'SELECT * FROM banners WHERE is_active = true AND page = ?';
    const params = [page];
    
    if (section) {
      query += ' AND section = ?';
      params.push(section);
    }
    
    query += ' ORDER BY created_at DESC';
    
    console.log(`📋 Fetching active banners for page: ${page}, section: ${section}`);
    const [results] = await db.query(query, params);
    
    console.log(`✅ Successfully fetched ${results.length} active banners for ${page}`);
    res.json(results);
  } catch (error) {
    console.error('❌ Error fetching page banners:', error);
    res.status(500).json({ 
      error: 'Failed to fetch page banners',
      details: error.message 
    });
  }
});

// GET all unique pages (for dashboard)
router.get('/pages/list', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT page FROM banners ORDER BY page';
    const [results] = await db.query(query);
    
    const pages = results.map(row => row.page);
    res.json(pages);
  } catch (error) {
    console.error('❌ Error fetching pages list:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pages list',
      details: error.message 
    });
  }
});

// GET active banners for frontend
router.get('/active', async (req, res) => {
  try {
    console.log('📋 Fetching active banners for frontend');
    
    const query = 'SELECT * FROM banners WHERE is_active = true ORDER BY created_at DESC';
    const [results] = await db.query(query);
    
    console.log(`✅ Successfully fetched ${results.length} active banners`);
    res.json(results);
  } catch (error) {
    console.error('❌ Error fetching active banners:', error);
    res.status(500).json({ 
      error: 'Failed to fetch active banners',
      details: error.message 
    });
  }
});

// GET single banner by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching banner with ID: ${id}`);
    
    const query = 'SELECT * FROM banners WHERE id = ?';
    const [results] = await db.query(query, [id]);
    
    if (results.length === 0) {
      console.log(`❌ Banner not found with ID: ${id}`);
      return res.status(404).json({ error: 'Banner not found' });
    }
    
    console.log(`✅ Successfully fetched banner ID: ${id}`);
    res.json(results[0]);
  } catch (error) {
    console.error('❌ Error fetching banner:', error);
    res.status(500).json({ 
      error: 'Failed to fetch banner',
      details: error.message 
    });
  }
});

// POST new banner
router.post('/', upload.single('media'), async (req, res) => {
  try {
    console.log('➕ Creating new banner');
    
    const { media_type, page, section, category, is_active } = req.body;
    const media = req.file ? req.file.filename : null;

    console.log('📤 Banner data:', { 
      media_type, 
      page, 
      section, 
      category, 
      is_active, 
      media: media ? 'file uploaded' : 'no file' 
    });

    // Validate required fields
    if (!media_type || !page || !section) {
      return res.status(400).json({ 
        error: 'Missing required fields: media_type, page, section' 
      });
    }

    if (!media) {
      return res.status(400).json({ 
        error: 'Media file is required' 
      });
    }

    // Convert string values to proper types
    const isActive = is_active === 'true' || is_active === true || is_active === '1';

    const query = `
      INSERT INTO banners (media_type, media, page, section, category, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      media_type,
      media, 
      page,
      section,
      category || 'main',
      isActive
    ]);
    
    console.log(`✅ Banner created successfully with ID: ${result.insertId}`);
    
    // Return the complete banner data
    const [newBanner] = await db.query('SELECT * FROM banners WHERE id = ?', [result.insertId]);
    
    res.status(201).json({ 
      message: 'Banner created successfully', 
      id: result.insertId,
      banner: newBanner[0]
    });
  } catch (error) {
    console.error('❌ Error creating banner:', error);
    res.status(500).json({ 
      error: 'Failed to create banner',
      details: error.message 
    });
  }
});

// PUT update banner
router.put('/:id', upload.single('media'), async (req, res) => {
  try {
    const { id } = req.params;
    const { media_type, page, section, category, is_active } = req.body;
    
    console.log(`✏️ Updating banner with ID: ${id}`);
    console.log('📤 Update data:', { media_type, page, section, category, is_active });

    // Validate required fields
    if (!media_type || !page || !section) {
      return res.status(400).json({ 
        error: 'Missing required fields: media_type, page, section' 
      });
    }

    // Convert string values to proper types
    const isActive = is_active === 'true' || is_active === true || is_active === '1';

    // First get current banner to handle media updates
    const getQuery = 'SELECT * FROM banners WHERE id = ?';
    const [currentResults] = await db.query(getQuery, [id]);
    
    if (currentResults.length === 0) {
      console.log(`❌ Banner not found with ID: ${id}`);
      return res.status(404).json({ error: 'Banner not found' });
    }

    const currentBanner = currentResults[0];
    let media = currentBanner.media;

    // If new media uploaded, use new media filename
    if (req.file) {
      media = req.file.filename;
      
      // Delete old media file
      if (currentBanner.media) {
        const oldMediaPath = path.join('uploads/banners/', currentBanner.media);
        if (fs.existsSync(oldMediaPath)) {
          fs.unlinkSync(oldMediaPath);
          console.log(`🗑️ Deleted old media: ${currentBanner.media}`);
        }
      }
      console.log(`🖼️ New media uploaded: ${media}`);
    }

    const updateQuery = `
      UPDATE banners 
      SET media_type = ?, media = ?, page = ?, section = ?, category = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await db.query(updateQuery, [
      media_type,
      media, 
      page,
      section,
      category || 'main',
      isActive,
      id
    ]);
    
    console.log(`✅ Banner updated successfully ID: ${id}`);
    
    // Return updated banner
    const [updatedBanner] = await db.query('SELECT * FROM banners WHERE id = ?', [id]);
    
    res.json({ 
      message: 'Banner updated successfully',
      banner: updatedBanner[0]
    });
  } catch (error) {
    console.error('❌ Error updating banner:', error);
    res.status(500).json({ 
      error: 'Failed to update banner',
      details: error.message 
    });
  }
});

// DELETE banner
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting banner with ID: ${id}`);

    // First get banner to delete media file
    const getQuery = 'SELECT * FROM banners WHERE id = ?';
    const [results] = await db.query(getQuery, [id]);
    
    if (results.length === 0) {
      console.log(`❌ Banner not found with ID: ${id}`);
      return res.status(404).json({ error: 'Banner not found' });
    }

    const banner = results[0];
    
    // Delete media file if exists
    if (banner.media) {
      const mediaPath = path.join('uploads/banners/', banner.media);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
        console.log(`🗑️ Deleted media file: ${banner.media}`);
      }
    }

    // Delete from database
    const deleteQuery = 'DELETE FROM banners WHERE id = ?';
    await db.query(deleteQuery, [id]);
    
    console.log(`✅ Banner deleted successfully ID: ${id}`);
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting banner:', error);
    res.status(500).json({ 
      error: 'Failed to delete banner',
      details: error.message 
    });
  }
});

module.exports = router;