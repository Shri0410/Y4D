const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/database");
const fs = require("fs").promises;
const { authenticateToken: auth } = require("../middleware/auth");
const consoleLogger = require("../utils/logger");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const category = req.params.category;
    const uploadPath = `uploads/our-work/${category}/`;

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

const isValidCategory = (category) => {
  return ourWorkTables.hasOwnProperty(category);
};

// Get all published items for a specific category (for frontend) - Include user info
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
    consoleLogger.error(`Error fetching published ${category}:`, error.message);
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: `Failed to fetch ${category}`,
      ...(isDevelopment && { details: error.message }),
    });
  }
});

// Get single published item by ID (for frontend) - Public access
router.get("/published/:category/:id", async (req, res) => {
  const { category, id } = req.params;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    const query = `SELECT ow.*, u.username as last_modified_by_name 
                   FROM ${category} ow 
                   LEFT JOIN users u ON ow.last_modified_by = u.id 
                   WHERE ow.id = ? AND ow.is_active = TRUE`;
    const [results] = await db.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Item not found or not published" });
    }

    return res.status(200).json(results[0]);
  } catch (error) {
    consoleLogger.error(`Error fetching published ${category} item:`, error.message);
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: `Failed to fetch ${category} item`,
      ...(isDevelopment && { details: error.message }),
    });
  }
});

// Get all items for a specific category (for admin) - FILTERED by role
router.get("/admin/:category", auth, async (req, res) => {
  const { category } = req.params;

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    let query;

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
    consoleLogger.error(`Error fetching ${category}:`, error.message);
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: `Failed to fetch ${category}`,
      ...(isDevelopment && { details: error.message }),
    });
  }
});

// Get single item - Include user info
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
    consoleLogger.error(`Error fetching ${category} item:`, error.message);
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: `Failed to fetch ${category} item`,
      ...(isDevelopment && { details: error.message }),
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
    consoleLogger.debug(`Creating ${category} item`, {
      fileCount: req.files?.length || 0,
      hasImage: !!req.files?.find((f) => f.fieldname === "image"),
    });

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

    const isActiveBool =
      is_active === "true" || is_active === "1" || is_active === true;
    const displayOrderInt = parseInt(display_order) || 0;

    let finalImageUrl = image_url;
    if (imageFile) {
      finalImageUrl = `/uploads/our-work/${category}/${imageFile.filename}`;
    }

    let additionalImagesArray = [];
    if (additional_images) {
      try {
        additionalImagesArray =
          typeof additional_images === "string"
            ? JSON.parse(additional_images)
            : additional_images;
      } catch (error) {
        consoleLogger.warn("Error parsing additional images:", error.message);
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
      "last_modified_by",
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
      isActiveBool ? 1 : 0, 
      displayOrderInt,
      req.user.id, 
    ];

    consoleLogger.debug(`Inserting ${category} item`, {
      fieldCount: fields.length,
      hasImage: !!finalImageUrl,
    });

    const placeholders = fields.map(() => "?").join(", ");
    const query = `INSERT INTO ${category} (${fields.join(
      ", "
    )}) VALUES (${placeholders})`;

    const [result] = await db.query(query, values);

    res.json({
      id: result.insertId,
      message: "Item created successfully",
      is_active: isActiveBool,
    });
  } catch (error) {
    consoleLogger.error(`Error creating ${category} item:`, {
      message: error.message,
      sqlMessage: error.sqlMessage,
      userId: req.user?.id,
    });

    // Cleanup uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
          consoleLogger.debug("Cleaned up file after error:", file.path);
        } catch (unlinkError) {
          consoleLogger.error("Error cleaning up file:", unlinkError.message);
        }
      }
    }

    // Don't expose SQL errors in production
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: `Failed to create ${category} item`,
      ...(isDevelopment && {
      details: error.message,
      sqlMessage: error.sqlMessage,
      }),
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
    const [existingItems] = await db.query(
      `SELECT * FROM ${category} WHERE id = ?`,
      [id]
    );

    if (existingItems.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const existingItem = existingItems[0];

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

    let finalImageUrl = image_url || existingItem.image_url;
    if (imageFile) {
      finalImageUrl = `/uploads/our-work/${category}/${imageFile.filename}`;

      if (
        existingItem.image_url &&
        existingItem.image_url.startsWith("/uploads")
      ) {
        try {
          const oldPath = path.join(process.cwd(), existingItem.image_url);
          await fs.unlink(oldPath);
        } catch (unlinkError) {
          consoleLogger.warn("Error deleting old image:", unlinkError.message);
        }
      }
    }

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
        consoleLogger.warn(
          "Error parsing additional images, keeping existing:",
          error.message
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
      "last_modified_at = CURRENT_TIMESTAMP", 
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
      req.user.id, 
      id,
    ];

    const query = `UPDATE ${category} SET ${updates.join(", ")} WHERE id = ?`;
    await db.query(query, values);

    res.json({
      message: "Item updated successfully",
      is_active: is_active,
    });
  } catch (error) {
    consoleLogger.error(`Error updating ${category} item:`, {
      message: error.message,
      sqlMessage: error.sqlMessage,
      userId: req.user?.id,
      itemId: id,
    });

    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          consoleLogger.error("Error cleaning up file:", unlinkError.message);
        }
      }
    }

    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: `Failed to update ${category} item`,
      ...(isDevelopment && {
      details: error.message,
      sqlMessage: error.sqlMessage,
      }),
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
    const [items] = await db.query(`SELECT * FROM ${category} WHERE id = ?`, [
      id,
    ]);

    if (items.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = items[0];

    if (item.image_url && item.image_url.startsWith("/uploads")) {
      try {
        const filePath = path.join(process.cwd(), item.image_url);
        await fs.unlink(filePath);
      } catch (unlinkError) {
        consoleLogger.warn("Error deleting associated image:", unlinkError.message);
      }
    }

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
                consoleLogger.warn("Error deleting additional image:", unlinkError.message);
              }
            }
          }
        }
      } catch (error) {
        consoleLogger.warn("Error parsing additional images for deletion:", error.message);
      }
    }

    const query = `DELETE FROM ${category} WHERE id = ?`;
    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    consoleLogger.error(`Error deleting ${category} item:`, {
      message: error.message,
      sqlMessage: error.sqlMessage,
      userId: req.user?.id,
      itemId: id,
    });
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: `Failed to delete ${category} item`,
      ...(isDevelopment && { details: error.message }),
    });
  }
});

// Toggle active status - Track who changed the status
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
    consoleLogger.error(`Error toggling active status for ${category}:`, {
      message: error.message,
      userId: req.user?.id,
      itemId: id,
    });
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: `Failed to update status`,
      ...(isDevelopment && { details: error.message }),
    });
  }
});

// Update display order - Track who changed the order
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
    consoleLogger.error(`Error updating display order for ${category}:`, {
      message: error.message,
      userId: req.user?.id,
      itemId: id,
    });
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: "Failed to update display order",
      ...(isDevelopment && { details: error.message }),
    });
  }
});

// Get statistics for specific category -  Include user info in stats if needed
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
    consoleLogger.error(`Error fetching stats for ${category}:`, error.message);
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: "Failed to fetch statistics",
      ...(isDevelopment && { details: error.message }),
    });
  }
});

// Get all categories with item counts - Include recent activity
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
        consoleLogger.error(`Error fetching stats for ${category}:`, error.message);
        stats[category] = { error: "Failed to fetch statistics" };
      }
    }

    res.json(stats);
  } catch (error) {
    consoleLogger.error("Error fetching category statistics:", error.message);
    const isDevelopment = process.env.NODE_ENV !== "production";
    res.status(500).json({
      error: "Failed to fetch category statistics",
      ...(isDevelopment && { details: error.message }),
    });
  }
});

module.exports = router;
