const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');
const fs = require('fs').promises;
const { authenticateToken: auth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.params.category;
    const uploadPath = `uploads/our-work/${category}/`;
    
    // Create directory if it doesn't exist
    fs.mkdir(uploadPath, { recursive: true })
      .then(() => cb(null, uploadPath))
      .catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
}).any();

// Our Work categories configuration with separate tables
const ourWorkTables = {
  quality_education: {
    fields: ['title', 'description', 'content', 'image_url', 'video_url', 'additional_images', 'meta_title', 'meta_description', 'meta_keywords', 'is_active', 'display_order']
  },
  livelihood: {
    fields: ['title', 'description', 'content', 'image_url', 'video_url', 'additional_images', 'meta_title', 'meta_description', 'meta_keywords', 'is_active', 'display_order']
  },
  healthcare: {
    fields: ['title', 'description', 'content', 'image_url', 'video_url', 'additional_images', 'meta_title', 'meta_description', 'meta_keywords', 'is_active', 'display_order']
  },
  environment_sustainability: {
    fields: ['title', 'description', 'content', 'image_url', 'video_url', 'additional_images', 'meta_title', 'meta_description', 'meta_keywords', 'is_active', 'display_order']
  },
  integrated_development: {
    fields: ['title', 'description', 'content', 'image_url', 'video_url', 'additional_images', 'meta_title', 'meta_description', 'meta_keywords', 'is_active', 'display_order']
  }
};

// Helper function to validate category
const isValidCategory = (category) => {
  return ourWorkTables.hasOwnProperty(category);
};

// Get all published items for a specific category (for frontend)
router.get('/published/:category', async (req, res) => {
  const { category } = req.params;
  
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const query = `SELECT * FROM ${category} WHERE is_active = TRUE ORDER BY display_order ASC, created_at DESC`;
    const [results] = await db.query(query);
    return res.status(200).json(results || []);
  } catch (error) {
    console.error(`Error fetching published ${category}:`, error);
    res.status(500).json({ 
      error: `Failed to fetch ${category}`,
      details: error.message 
    });
  }
});

// Get all items for a specific category (for admin)
router.get('/admin/:category', auth, async (req, res) => {
  const { category } = req.params;
  
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const query = `SELECT * FROM ${category} ORDER BY display_order ASC, created_at DESC`;
    const [results] = await db.query(query);
    return res.status(200).json(results || []);
  } catch (error) {
    console.error(`Error fetching ${category}:`, error);
    res.status(500).json({ 
      error: `Failed to fetch ${category}`,
      details: error.message 
    });
  }
});

// Get single item
router.get('/admin/:category/:id', auth, async (req, res) => {
  const { category, id } = req.params;
  
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const query = `SELECT * FROM ${category} WHERE id = ?`;
    const [results] = await db.query(query, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    return res.status(200).json(results || []);
  } catch (error) {
    console.error(`Error fetching ${category} item:`, error);
    res.status(500).json({ 
      error: `Failed to fetch ${category} item`,
      details: error.message 
    });
  }
});

// Create item
router.post('/admin/:category', auth, (req, res, next) => {
  upload(req, res, function(err) {
    if (err) {
      return res.status(500).json({ error: 'File upload error', details: err.message });
    }
    createItem(req, res).catch(next);
  });
});

async function createItem(req, res) {
  const { category } = req.params;
  
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    console.log('Uploaded files:', req.files);
    console.log('Request body:', req.body);

    // Get files from request
    const files = req.files || [];
    const imageFile = files.find(file => file.fieldname === 'image');

    const {
      title,
      description,
      content,
      image_url,
      video_url,
      additional_images,
      meta_title,
      meta_description,
      meta_keywords,
      is_active,
      display_order
    } = req.body;

    // Convert data types properly
    const isActiveBool = is_active === 'true' || is_active === '1' || is_active === true;
    const displayOrderInt = parseInt(display_order) || 0;

    // Handle image upload
    let finalImageUrl = image_url;
    if (imageFile) {
      // normalize path for DB (forward slashes, starts with /uploads)
      finalImageUrl = `/uploads/our-work/${category}/${imageFile.filename}`;
    }

    // Handle additional images
    let additionalImagesArray = [];
    if (additional_images) {
      try {
        additionalImagesArray = typeof additional_images === 'string' ? 
          JSON.parse(additional_images) : additional_images;
      } catch (error) {
        console.warn('Error parsing additional images:', error);
        additionalImagesArray = [];
      }
    }

    const fields = [
      'title', 'description', 'content', 'image_url', 'video_url', 
      'additional_images', 'meta_title', 'meta_description', 'meta_keywords', 
      'is_active', 'display_order'
    ];
    
    const values = [
      title || '', 
      description || '', 
      content || '', 
      finalImageUrl || '', 
      video_url || '',
      JSON.stringify(additionalImagesArray), 
      meta_title || '', 
      meta_description || '', 
      meta_keywords || '',
      isActiveBool ? 1 : 0, // Convert to MySQL tinyint (1 for true, 0 for false)
      displayOrderInt
    ];

    console.log('Fields to insert:', fields);
    console.log('Values to insert:', values);

    const placeholders = fields.map(() => '?').join(', ');
    const query = `INSERT INTO ${category} (${fields.join(', ')}) VALUES (${placeholders})`;
    
    console.log('SQL Query:', query);
    
    const [result] = await db.query(query, values);
    
    res.json({
      id: result.insertId,
      message: 'Item created successfully',
      is_active: isActiveBool
    });
  } catch (error) {
    console.error(`Error creating ${category} item:`, error);
    console.error('SQL Error details:', error.sqlMessage);
    
    // Clean up uploaded files if there was an error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
          console.log('Cleaned up file:', file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }
    
    res.status(500).json({ 
      error: `Failed to create ${category} item`,
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
}
// Update item
router.put('/admin/:category/:id', auth, (req, res, next) => {
  upload(req, res, function(err) {
    if (err) {
      return res.status(500).json({ error: 'File upload error', details: err.message });
    }
    updateItem(req, res).catch(next);
  });
});

async function updateItem(req, res) {
  const { category, id } = req.params;
  
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    // Get existing item first
    const [existingItems] = await db.query(`SELECT * FROM ${category} WHERE id = ?`, [id]);
    
    if (existingItems.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const existingItem = existingItems[0];
    
    // Get files from request
    const files = req.files || [];
    const imageFile = files.find(file => file.fieldname === 'image');

    const {
      title,
      description,
      content,
      image_url,
      video_url,
      additional_images,
      meta_title,
      meta_description,
      meta_keywords,
      is_active,
      display_order
    } = req.body;

    // Handle image upload
    let finalImageUrl = image_url || existingItem.image_url;
    if (imageFile) {
      finalImageUrl = `/uploads/our-work/${category}/${imageFile.filename}`;

      // Delete old image if it's being replaced
      if (existingItem.image_url && existingItem.image_url.startsWith('/uploads')) {
        try {
          // convert URL back to local path
          const oldPath = path.join(process.cwd(), existingItem.image_url);
          await fs.unlink(oldPath);
        } catch (unlinkError) {
          console.warn('Error deleting old image:', unlinkError);
        }
      }
    }


    // Handle additional images
    let additionalImagesArray = existingItem.additional_images;
    if (additional_images) {
      try {
        additionalImagesArray = typeof additional_images === 'string' ? JSON.parse(additional_images) : additional_images;
        if (!Array.isArray(additionalImagesArray)) {
          additionalImagesArray = [additionalImagesArray];
        }
      } catch (error) {
        console.warn('Error parsing additional images, keeping existing:', error);
      }
    }

    const updates = [
      'title = ?', 'description = ?', 'content = ?', 'image_url = ?', 'video_url = ?', 
      'additional_images = ?', 'meta_title = ?', 'meta_description = ?', 'meta_keywords = ?', 
      'is_active = ?', 'display_order = ?'
    ];
    
    const values = [
      title, description, content, finalImageUrl, video_url,
      JSON.stringify(additionalImagesArray), meta_title, meta_description, meta_keywords,
      is_active, display_order, id
    ];

    const query = `UPDATE ${category} SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(query, values);
    
    res.json({ 
      message: 'Item updated successfully',
      is_active: is_active
    });
  } catch (error) {
    console.error(`Error updating ${category} item:`, error);
    
    // Clean up uploaded files if there was an error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }
    
    res.status(500).json({ 
      error: `Failed to update ${category} item`,
      details: error.message,
      sqlMessage: error.sqlMessage 
    });
  }
}

// Delete item
router.delete('/admin/:category/:id', auth, async (req, res) => {
  const { category, id } = req.params;
  
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    // First get the item to check if it has files to delete
    const [items] = await db.query(`SELECT * FROM ${category} WHERE id = ?`, [id]);
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = items[0];
    
    // Delete associated image file
    if (item.image_url && item.image_url.startsWith('/uploads')) {
      try {
        const filePath = path.join(process.cwd(), item.image_url);
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.warn('Error deleting associated image:', unlinkError);
      }
    }


    // Delete additional images
    if (item.additional_images) {
      try {
        const additionalImages = typeof item.additional_images === 'string' ? 
          JSON.parse(item.additional_images) : item.additional_images;
        
        if (Array.isArray(additionalImages)) {
          for (const imageUrl of additionalImages) {
            if (imageUrl && typeof imageUrl === 'string') {
              try {
                await fs.unlink(`uploads/our-work/${category}/${imageUrl}`);
              } catch (unlinkError) {
                console.warn('Error deleting additional image:', unlinkError);
              }
            }
          }
        }
      } catch (error) {
        console.warn('Error parsing additional images for deletion:', error);
      }
    }

    const query = `DELETE FROM ${category} WHERE id = ?`;
    const [result] = await db.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting ${category} item:`, error);
    res.status(500).json({ 
      error: `Failed to delete ${category} item`,
      details: error.message 
    });
  }
});

// Toggle active status
router.patch('/admin/:category/:id/status', auth, async (req, res) => {
  const { category, id } = req.params;
  const { is_active } = req.body;
  
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const query = `UPDATE ${category} SET is_active = ? WHERE id = ?`;
    await db.query(query, [is_active, id]);
    
    res.json({ 
      message: `Item ${is_active ? 'activated' : 'deactivated'} successfully`,
      is_active 
    });
  } catch (error) {
    console.error(`Error toggling active status for ${category}:`, error);
    res.status(500).json({ 
      error: `Failed to update status`,
      details: error.message 
    });
  }
});

// Update display order
router.patch('/admin/:category/:id/order', auth, async (req, res) => {
  const { category, id } = req.params;
  const { display_order } = req.body;
  
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const query = `UPDATE ${category} SET display_order = ? WHERE id = ?`;
    await db.query(query, [display_order, id]);
    
    res.json({ 
      message: 'Display order updated successfully',
      display_order 
    });
  } catch (error) {
    console.error(`Error updating display order for ${category}:`, error);
    res.status(500).json({ 
      error: 'Failed to update display order',
      details: error.message 
    });
  }
});

// Get statistics for specific category
router.get('/admin/stats/:category', auth, async (req, res) => {
  const { category } = req.params;
  
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const totalQuery = `SELECT COUNT(*) as total FROM ${category}`;
    const activeQuery = `SELECT COUNT(*) as active FROM ${category} WHERE is_active = TRUE`;
    
    const [totalResult] = await db.query(totalQuery);
    const [activeResult] = await db.query(activeQuery);
    
    res.json({
      total: totalResult[0].total,
      active: activeResult[0].active,
      inactive: totalResult[0].total - activeResult[0].active
    });
  } catch (error) {
    console.error(`Error fetching stats for ${category}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error.message 
    });
  }
});

// Get all categories with item counts
router.get('/admin/categories/stats', auth, async (req, res) => {
  try {
    const stats = {};
    
    for (const category of Object.keys(ourWorkTables)) {
      try {
        const totalQuery = `SELECT COUNT(*) as total FROM ${category}`;
        const activeQuery = `SELECT COUNT(*) as active FROM ${category} WHERE is_active = TRUE`;
        
        const [totalResult] = await db.query(totalQuery);
        const [activeResult] = await db.query(activeQuery);
        
        stats[category] = {
          total: totalResult[0].total,
          active: activeResult[0].active,
          inactive: totalResult[0].total - activeResult[0].active
        };
      } catch (error) {
        console.error(`Error fetching stats for ${category}:`, error);
        stats[category] = { error: 'Failed to fetch statistics' };
      }
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching category statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch category statistics',
      details: error.message 
    });
  }
});

module.exports = router;