const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/database");
const fs = require("fs").promises;
const { authenticateToken: auth } = require("../middleware/auth");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.params.category;
    const uploadPath = `uploads/our-work/${category}/`;

    // Create directory if it doesn't exist
    fs.mkdir(uploadPath, { recursive: true })
      .then(() => cb(null, uploadPath))
      .catch((err) => cb(err));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
}).any();

// Our Work categories configuration with separate tables
const ourWorkTables = {
  quality_education: {
    fields: [
      "title",
      "description",
      "content",
      "image_url",
      "video_url",
      "additional_images",
      "meta_title",
      "meta_description",
      "meta_keywords",
      "is_active",
      "display_order",
    ],
  },
  livelihood: {
    fields: [
      "title",
      "description",
      "content",
      "image_url",
      "video_url",
      "additional_images",
      "meta_title",
      "meta_description",
      "meta_keywords",
      "is_active",
      "display_order",
    ],
  },
  healthcare: {
    fields: [
      "title",
      "description",
      "content",
      "image_url",
      "video_url",
      "additional_images",
      "meta_title",
      "meta_description",
      "meta_keywords",
      "is_active",
      "display_order",
    ],
  },
  environment_sustainability: {
    fields: [
      "title",
      "description",
      "content",
      "image_url",
      "video_url",
      "additional_images",
      "meta_title",
      "meta_description",
      "meta_keywords",
      "is_active",
      "display_order",
    ],
  },
  integrated_development: {
    fields: [
      "title",
      "description",
      "content",
      "image_url",
      "video_url",
      "additional_images",
      "meta_title",
      "meta_description",
      "meta_keywords",
      "is_active",
      "display_order",
    ],
  },
};

// Helper function to validate category
const isValidCategory = (category) => {
  return ourWorkTables.hasOwnProperty(category);
};

// Get all published items for a specific category (for frontend) - UPDATED: Include user info
router.get("/published/:category", async (req, res) => {
  const { category } = req.params;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const query = `SELECT ow.*, u.username as last_modified_by_name 
                   FROM ${category} ow 
                   LEFT JOIN users u ON ow.last_modified_by = u.id 
                   WHERE ow.is_active = TRUE 
                   ORDER BY ow.display_order ASC, ow.created_at DESC`;
    const [results] = await db.query(query);
    return res.status(200).json(results || []);
  } catch (error) {
    console.error(`Error fetching published ${category}:`, error);
    res.status(500).json({
      error: `Failed to fetch ${category}`,
      details: error.message,
    });
  }
});

// Get all items for a specific category (for admin) - UPDATED: Include user info
// Get all items for a specific category (for admin) - FILTERED by role
router.get("/admin/:category", auth, async (req, res) => {
  const { category } = req.params;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    let query;

    // If user is admin or super_admin, include last_modified_by_name
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      query = `
        SELECT ow.*, u.username as last_modified_by_name 
        FROM ${category} ow 
        LEFT JOIN users u ON ow.last_modified_by = u.id 
        ORDER BY ow.display_order ASC, ow.created_at DESC
      `;
    } else {
      query = `SELECT * FROM ${category} ORDER BY display_order ASC, created_at DESC`;
    }

    const [results] = await db.query(query);
    return res.status(200).json(results || []);
  } catch (error) {
    console.error(`Error fetching ${category}:`, error);
    res.status(500).json({
      error: `Failed to fetch ${category}`,
      details: error.message,
    });
  }
});

// Get single item - UPDATED: Include user info
router.get("/admin/:category/:id", auth, async (req, res) => {
  const { category, id } = req.params;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const query = `SELECT ow.*, u.username as last_modified_by_name 
                   FROM ${category} ow 
                   LEFT JOIN users u ON ow.last_modified_by = u.id 
                   WHERE ow.id = ?`;
    const [results] = await db.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.status(200).json(results[0]);
  } catch (error) {
    console.error(`Error fetching ${category} item:`, error);
    res.status(500).json({
      error: `Failed to fetch ${category} item`,
      details: error.message,
    });
  }
});

// Create item - UPDATED: Track who created the item
router.post("/admin/:category", auth, (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload error", details: err.message });
    }
    createItem(req, res).catch(next);
  });
});

async function createItem(req, res) {
  const { category } = req.params;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    console.log("Uploaded files:", req.files);
    console.log("Request body:", req.body);

    // Get files from request
    const files = req.files || [];
    const imageFile = files.find((file) => file.fieldname === "image");

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
      display_order,
    } = req.body;

    // Convert data types properly
    const isActiveBool =
      is_active === "true" || is_active === "1" || is_active === true;
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
        additionalImagesArray =
          typeof additional_images === "string"
            ? JSON.parse(additional_images)
            : additional_images;
      } catch (error) {
        console.warn("Error parsing additional images:", error);
        additionalImagesArray = [];
      }
    }

    const fields = [
      "title",
      "description",
      "content",
      "image_url",
      "video_url",
      "additional_images",
      "meta_title",
      "meta_description",
      "meta_keywords",
      "is_active",
      "display_order",
      "last_modified_by", // NEW: Add last_modified_by
    ];

    const values = [
      title || "",
      description || "",
      content || "",
      finalImageUrl || "",
      video_url || "",
      JSON.stringify(additionalImagesArray),
      meta_title || "",
      meta_description || "",
      meta_keywords || "",
      isActiveBool ? 1 : 0, // Convert to MySQL tinyint (1 for true, 0 for false)
      displayOrderInt,
      req.user.id, // NEW: Set the user who created it
    ];

    console.log("Fields to insert:", fields);
    console.log("Values to insert:", values);

    const placeholders = fields.map(() => "?").join(", ");
    const query = `INSERT INTO ${category} (${fields.join(
      ", "
    )}) VALUES (${placeholders})`;

    console.log("SQL Query:", query);

    const [result] = await db.query(query, values);

    res.json({
      id: result.insertId,
      message: "Item created successfully",
      is_active: isActiveBool,
    });
  } catch (error) {
    console.error(`Error creating ${category} item:`, error);
    console.error("SQL Error details:", error.sqlMessage);

    // Clean up uploaded files if there was an error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
          console.log("Cleaned up file:", file.path);
        } catch (unlinkError) {
          console.error("Error cleaning up file:", unlinkError);
        }
      }
    }

    res.status(500).json({
      error: `Failed to create ${category} item`,
      details: error.message,
      sqlMessage: error.sqlMessage,
    });
  }
}

// Update item - UPDATED: Track who modified the item
router.put("/admin/:category/:id", auth, (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      return res
        .status(500)
        .json({ error: "File upload error", details: err.message });
    }
    updateItem(req, res).catch(next);
  });
});

async function updateItem(req, res) {
  const { category, id } = req.params;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    // Get existing item first
    const [existingItems] = await db.query(
      `SELECT * FROM ${category} WHERE id = ?`,
      [id]
    );

    if (existingItems.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const existingItem = existingItems[0];

    // Get files from request
    const files = req.files || [];
    const imageFile = files.find((file) => file.fieldname === "image");

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
      display_order,
    } = req.body;

    // Handle image upload
    let finalImageUrl = image_url || existingItem.image_url;
    if (imageFile) {
      finalImageUrl = `/uploads/our-work/${category}/${imageFile.filename}`;

      // Delete old image if it's being replaced
      if (
        existingItem.image_url &&
        existingItem.image_url.startsWith("/uploads")
      ) {
        try {
          // convert URL back to local path
          const oldPath = path.join(process.cwd(), existingItem.image_url);
          await fs.unlink(oldPath);
        } catch (unlinkError) {
          console.warn("Error deleting old image:", unlinkError);
        }
      }
    }

    // Handle additional images
    let additionalImagesArray = existingItem.additional_images;
    if (additional_images) {
      try {
        additionalImagesArray =
          typeof additional_images === "string"
            ? JSON.parse(additional_images)
            : additional_images;
        if (!Array.isArray(additionalImagesArray)) {
          additionalImagesArray = [additionalImagesArray];
        }
      } catch (error) {
        console.warn(
          "Error parsing additional images, keeping existing:",
          error
        );
      }
    }

    const updates = [
      "title = ?",
      "description = ?",
      "content = ?",
      "image_url = ?",
      "video_url = ?",
      "additional_images = ?",
      "meta_title = ?",
      "meta_description = ?",
      "meta_keywords = ?",
      "is_active = ?",
      "display_order = ?",
      "last_modified_by = ?",
      "last_modified_at = CURRENT_TIMESTAMP", // NEW: Track who modified and update timestamp
    ];

    const values = [
      title,
      description,
      content,
      finalImageUrl,
      video_url,
      JSON.stringify(additionalImagesArray),
      meta_title,
      meta_description,
      meta_keywords,
      is_active,
      display_order,
      req.user.id, // NEW: User who made the change
      id,
    ];

    const query = `UPDATE ${category} SET ${updates.join(", ")} WHERE id = ?`;
    await db.query(query, values);

    res.json({
      message: "Item updated successfully",
      is_active: is_active,
    });
  } catch (error) {
    console.error(`Error updating ${category} item:`, error);

    // Clean up uploaded files if there was an error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error("Error cleaning up file:", unlinkError);
        }
      }
    }

    res.status(500).json({
      error: `Failed to update ${category} item`,
      details: error.message,
      sqlMessage: error.sqlMessage,
    });
  }
}

// Delete item
router.delete("/admin/:category/:id", auth, async (req, res) => {
  const { category, id } = req.params;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    // First get the item to check if it has files to delete
    const [items] = await db.query(`SELECT * FROM ${category} WHERE id = ?`, [
      id,
    ]);

    if (items.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = items[0];

    // Delete associated image file
    if (item.image_url && item.image_url.startsWith("/uploads")) {
      try {
        const filePath = path.join(process.cwd(), item.image_url);
        await fs.unlink(filePath);
      } catch (unlinkError) {
        console.warn("Error deleting associated image:", unlinkError);
      }
    }

    // Delete additional images
    if (item.additional_images) {
      try {
        const additionalImages =
          typeof item.additional_images === "string"
            ? JSON.parse(item.additional_images)
            : item.additional_images;

        if (Array.isArray(additionalImages)) {
          for (const imageUrl of additionalImages) {
            if (imageUrl && typeof imageUrl === "string") {
              try {
                await fs.unlink(`uploads/our-work/${category}/${imageUrl}`);
              } catch (unlinkError) {
                console.warn("Error deleting additional image:", unlinkError);
              }
            }
          }
        }
      } catch (error) {
        console.warn("Error parsing additional images for deletion:", error);
      }
    }

    const query = `DELETE FROM ${category} WHERE id = ?`;
    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(`Error deleting ${category} item:`, error);
    res.status(500).json({
      error: `Failed to delete ${category} item`,
      details: error.message,
    });
  }
});

// Toggle active status - UPDATED: Track who changed the status
router.patch("/admin/:category/:id/status", auth, async (req, res) => {
  const { category, id } = req.params;
  const { is_active } = req.body;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const query = `UPDATE ${category} SET is_active = ?, last_modified_by = ?, last_modified_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.query(query, [is_active, req.user.id, id]);

    res.json({
      message: `Item ${is_active ? "activated" : "deactivated"} successfully`,
      is_active,
    });
  } catch (error) {
    console.error(`Error toggling active status for ${category}:`, error);
    res.status(500).json({
      error: `Failed to update status`,
      details: error.message,
    });
  }
});

// Update display order - UPDATED: Track who changed the order
router.patch("/admin/:category/:id/order", auth, async (req, res) => {
  const { category, id } = req.params;
  const { display_order } = req.body;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const query = `UPDATE ${category} SET display_order = ?, last_modified_by = ?, last_modified_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.query(query, [display_order, req.user.id, id]);

    res.json({
      message: "Display order updated successfully",
      display_order,
    });
  } catch (error) {
    console.error(`Error updating display order for ${category}:`, error);
    res.status(500).json({
      error: "Failed to update display order",
      details: error.message,
    });
  }
});

// Get statistics for specific category - UPDATED: Include user info in stats if needed
router.get("/admin/stats/:category", auth, async (req, res) => {
  const { category } = req.params;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const totalQuery = `SELECT COUNT(*) as total FROM ${category}`;
    const activeQuery = `SELECT COUNT(*) as active FROM ${category} WHERE is_active = TRUE`;
    const recentActivityQuery = `
      SELECT u.username, COUNT(*) as modification_count 
      FROM ${category} ow 
      JOIN users u ON ow.last_modified_by = u.id 
      WHERE ow.last_modified_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY u.username 
      ORDER BY modification_count DESC
    `;

    const [totalResult] = await db.query(totalQuery);
    const [activeResult] = await db.query(activeQuery);
    const [recentActivityResult] = await db.query(recentActivityQuery);

    res.json({
      total: totalResult[0].total,
      active: activeResult[0].active,
      inactive: totalResult[0].total - activeResult[0].active,
      recent_activity: recentActivityResult,
    });
  } catch (error) {
    console.error(`Error fetching stats for ${category}:`, error);
    res.status(500).json({
      error: "Failed to fetch statistics",
      details: error.message,
    });
  }
});

// Get all categories with item counts - UPDATED: Include recent activity
router.get("/admin/categories/stats", auth, async (req, res) => {
  try {
    const stats = {};

    for (const category of Object.keys(ourWorkTables)) {
      try {
        const totalQuery = `SELECT COUNT(*) as total FROM ${category}`;
        const activeQuery = `SELECT COUNT(*) as active FROM ${category} WHERE is_active = TRUE`;
        const recentModificationsQuery = `
          SELECT COUNT(*) as recent_modifications 
          FROM ${category} 
          WHERE last_modified_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        `;

        const [totalResult] = await db.query(totalQuery);
        const [activeResult] = await db.query(activeQuery);
        const [recentModificationsResult] = await db.query(
          recentModificationsQuery
        );

        stats[category] = {
          total: totalResult[0].total,
          active: activeResult[0].active,
          inactive: totalResult[0].total - activeResult[0].active,
          recent_modifications:
            recentModificationsResult[0].recent_modifications,
        };
      } catch (error) {
        console.error(`Error fetching stats for ${category}:`, error);
        stats[category] = { error: "Failed to fetch statistics" };
      }
    }

    res.json(stats);
  } catch (error) {
    console.error("Error fetching category statistics:", error);
    res.status(500).json({
      error: "Failed to fetch category statistics",
      details: error.message,
    });
  }
});

module.exports = router;
