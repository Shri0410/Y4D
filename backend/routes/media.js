
const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/database");
const fs = require("fs").promises;
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.params.type;
    const uploadPath = `uploads/media/${type}/`;

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

const mediaTables = {
  newsletters: {
    fields: [
      "title",
      "description",
      "file_path",
      "published_date",
      "is_published",
    ],
  },
  stories: {
    fields: [
      "title",
      "content",
      "image",
      "author",
      "published_date",
      "is_published",
    ],
  },
  events: {
    fields: [
      "title",
      "description",
      "date",
      "time",
      "location",
      "image",
      "published_date",
      "is_published",
    ],
  },
  blogs: {
    fields: [
      "title",
      "content",
      "image",
      "author",
      "tags",
      "published_date",
      "is_published",
    ],
  },
  documentaries: {
    fields: [
      "title",
      "description",
      "video_url",
      "thumbnail",
      "duration",
      "published_date",
      "is_published",
    ],
  },
};

const isValidMediaType = (type) => {
  return mediaTables.hasOwnProperty(type);
};

// Helper: safely get first element if value is array
const safeFirst = (val) => {
  if (Array.isArray(val)) return val[0];
  return val;
};

// Helper: ensure not null/undefined
const ensureString = (val) => {
  if (val === undefined || val === null) return "";
  return val;
};

// Get all published items for a specific media type (for frontend) : Include user info
router.get("/published/:type", async (req, res) => {
  const { type } = req.params;

  if (!isValidMediaType(type)) {
    return res.status(400).json({ error: "Invalid media type" });
  }

  try {
    const query = `SELECT m.*, u.username as last_modified_by_name 
                   FROM ${type} m 
                   LEFT JOIN users u ON m.last_modified_by = u.id 
                   WHERE m.is_published = TRUE 
                   ORDER BY m.created_at DESC`;
    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error(`Error fetching published ${type}:`, error);
    res.status(500).json({
      error: `Failed to fetch ${type}`,
      details: error.message,
    });
  }
});

// Get all items for a specific media type (for admin) 
router.get("/:type", authenticateToken, async (req, res) => {
  const { type } = req.params;

  if (!isValidMediaType(type)) {
    return res.status(400).json({ error: "Invalid media type" });
  }

  try {
    let query;

    if (req.user.role === "admin" || req.user.role === "super_admin") {
      query = `
        SELECT m.*, u.username as last_modified_by_name 
        FROM ${type} m 
        LEFT JOIN users u ON m.last_modified_by = u.id 
        ORDER BY m.created_at DESC
      `;
    } else {
      query = `SELECT * FROM ${type} WHERE last_modified_by = ? OR is_published = TRUE ORDER BY created_at DESC`;
    }

    const [results] = await db.query(
      query,
      req.user.role !== "admin" && req.user.role !== "super_admin"
        ? [req.user.id]
        : []
    );
    res.json(results);
  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    res.status(500).json({
      error: `Failed to fetch ${type}`,
      details: error.message,
    });
  }
});

// Get single item 
router.get("/:type/:id", async (req, res) => {
  const { type, id } = req.params;

  if (!isValidMediaType(type)) {
    return res.status(400).json({ error: "Invalid media type" });
  }

  try {
    const query = `SELECT m.*, u.username as last_modified_by_name 
                   FROM ${type} m 
                   LEFT JOIN users u ON m.last_modified_by = u.id 
                   WHERE m.id = ?`;
    const [results] = await db.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(results[0]);
  } catch (error) {
    console.error(`Error fetching ${type} item:`, error);
    res.status(500).json({
      error: `Failed to fetch ${type} item`,
      details: error.message,
    });
  }
});

// Create item - Track who created the item
router.post("/:type", authenticateToken, upload, async (req, res) => {
  const { type } = req.params;

  if (!isValidMediaType(type)) {
    return res.status(400).json({ error: "Invalid media type" });
  }

  // Sanitize request body to avoid null/undefined and handle array form values
  const sanitizedBody = {};
  Object.keys(req.body || {}).forEach((key) => {
    sanitizedBody[key] = safeFirst(req.body[key]);
  });

  try {
    const files = req.files || [];
    const imageFile = files.find((file) => file.fieldname === "image");
    const fileFile = files.find((file) => file.fieldname === "file");

    let fields = [];
    let values = [];
    let placeholders = [];

    switch (type) {
      case "newsletters": {
        const {
          title: newsletterTitle,
          description: newsletterDesc,
          published_date: newsletterDate,
          publish_type: newsletterPublishType = "immediate",
          scheduled_date: newsletterScheduledDate,
        } = sanitizedBody;

        const file_path = fileFile ? fileFile.filename : null;

        if (!file_path) {
          return res
            .status(400)
            .json({ error: "PDF file is required for newsletters" });
        }

        let newsletterPublishedDate =
          newsletterDate || new Date().toISOString().split("T")[0];
        let newsletterIsPublished = newsletterPublishType === "immediate";

        if (newsletterPublishType === "schedule" && newsletterScheduledDate) {
          newsletterPublishedDate = newsletterScheduledDate;
          newsletterIsPublished = false;
        }

        fields = [
          "title",
          "description",
          "file_path",
          "published_date",
          "is_published",
          "last_modified_by",
        ];
        values = [
          ensureString(newsletterTitle),
          ensureString(newsletterDesc),
          file_path,
          newsletterPublishedDate,
          newsletterIsPublished,
          req.user.id,
        ];
        break;
      }

      case "stories": {
        const {
          title: storyTitle,
          content,
          author,
          published_date: storyDate,
          publish_type: storyPublishType = "immediate",
          scheduled_date: storyScheduledDate,
        } = sanitizedBody;

        const image = imageFile ? imageFile.filename : null;

        // Ensure content is a single string and not null
        const storyContent = ensureString(content);

        let storyPublishedDate =
          storyDate || new Date().toISOString().split("T")[0];
        let storyIsPublished = storyPublishType === "immediate";

        if (storyPublishType === "schedule" && storyScheduledDate) {
          storyPublishedDate = storyScheduledDate;
          storyIsPublished = false;
        }

        fields = [
          "title",
          "content",
          "image",
          "author",
          "published_date",
          "is_published",
          "last_modified_by",
        ];
        values = [
          ensureString(storyTitle),
          storyContent,
          image,
          ensureString(author) || "Anonymous",
          storyPublishedDate,
          storyIsPublished,
          req.user.id,
        ];
        break;
      }

      case "events": {
        const {
          title: eventTitle,
          description: eventDesc,
          date,
          time,
          location,
          publish_type: eventPublishType = "immediate",
          scheduled_date: eventScheduledDate,
          published_date: eventPublished_date,
          is_published: eventIsPublishedInput,
        } = sanitizedBody;

        const eventImage = imageFile ? imageFile.filename : null;

        // Validate required fields for events
        if (!date || !time || !location) {
          return res.status(400).json({
            error: "Missing required fields for event",
            details: "Date, time, and location are required for events",
          });
        }

        // Determine published date and publish flag
        let eventPublishedDate = eventPublished_date || new Date().toISOString().split("T")[0];
        let eventIsPublished = eventPublishType === "immediate";

        if (eventPublishType === "schedule" && eventScheduledDate) {
          eventPublishedDate = eventScheduledDate;
          eventIsPublished = false;
        }

        // If is_published passed explicitly (string), normalize it
        if (typeof eventIsPublishedInput !== "undefined") {
          const val = eventIsPublishedInput;
          eventIsPublished = (val === true || val === "true" || val === "1" || val === 1);
        }

        fields = [
          "title",
          "description",
          "date",
          "time",
          "location",
          "image",
          "published_date",
          "is_published",
          "last_modified_by",
        ];
        values = [
          ensureString(eventTitle),
          ensureString(eventDesc),
          ensureString(date),
          ensureString(time),
          ensureString(location),
          eventImage,
          eventPublishedDate,
          eventIsPublished,
          req.user.id,
        ];
        break;
      }

      case "blogs": {
        const {
          title: blogTitle,
          content: blogContent,
          author: blogAuthor,
          tags,
          published_date: blogDate,
          publish_type: blogPublishType = "immediate",
          scheduled_date: blogScheduledDate,
        } = sanitizedBody;
        const blogImage = imageFile ? imageFile.filename : null;

        // Safe tags parsing
        let tagsJson = [];
        if (tags) {
          try {
            tagsJson =
              typeof tags === "string" ? JSON.parse(tags) : tags;
            if (!Array.isArray(tagsJson)) {
              tagsJson = [tagsJson];
            }
          } catch (error) {
            console.warn("Error parsing tags, using empty array:", error);
            tagsJson = [];
          }
        }

        let blogPublishedDate = blogDate || null;
        let blogIsPublished = blogPublishType === "immediate";

        if (blogPublishType === "schedule" && blogScheduledDate) {
          blogPublishedDate = blogScheduledDate;
          blogIsPublished = false;
        }

        fields = [
          "title",
          "content",
          "image",
          "author",
          "tags",
          "published_date",
          "is_published",
          "last_modified_by",
        ];
        values = [
          ensureString(blogTitle),
          ensureString(blogContent),
          blogImage,
          ensureString(blogAuthor),
          JSON.stringify(tagsJson),
          blogPublishedDate,
          blogIsPublished,
          req.user.id,
        ];
        break;
      }

      case "documentaries": {
        const {
          title: docTitle,
          description: docDesc,
          video_url,
          duration,
          published_date: docDate,
          publish_type: docPublishType = "immediate",
          scheduled_date: docScheduledDate,
        } = sanitizedBody;

        const thumbnail = imageFile ? imageFile.filename : null;

        const videoFile = files.find((file) => file.fieldname === "video_file");
        const video_filename = videoFile ? videoFile.filename : null;

        let docPublishedDate = docDate || null;
        let docIsPublished = docPublishType === "immediate";

        if (docPublishType === "schedule" && docScheduledDate) {
          docPublishedDate = docScheduledDate;
          docIsPublished = false;
        }

        fields = [
          "title",
          "description",
          "video_url",
          "video_filename",
          "thumbnail",
          "duration",
          "published_date",
          "is_published",
          "last_modified_by",
        ];
        values = [
          ensureString(docTitle),
          ensureString(docDesc),
          ensureString(video_url),
          video_filename,
          thumbnail,
          ensureString(duration),
          docPublishedDate,
          docIsPublished,
          req.user.id,
        ];
        break;
      }

      default:
        return res.status(400).json({ error: "Unsupported media type" });
    }

    placeholders = fields.map(() => "?").join(", ");
    const query = `INSERT INTO ${type} (${fields.join(
      ", "
    )}) VALUES (${placeholders})`;

    console.log("Final SQL query:", query);
    console.log("Final values:", values);

    const [result] = await db.query(query, values);

    res.json({
      id: result.insertId,
      message: `${type.slice(0, -1)} created successfully`,
      is_published: values[values.length - 2],
    });
  } catch (error) {
    console.error(`Error creating ${type}:`, error);

    // Better file cleanup when error occurs
    if (req.files) {
      for (const file of req.files) {
        try {
          if (file && file.path) await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error("Error cleaning up file:", unlinkError);
        }
      }
    }

    res.status(500).json({
      error: `Failed to create ${type}`,
      details: error.message,
      sqlMessage: error && error.sqlMessage ? error.sqlMessage : undefined,
    });
  }
});

// Update item -  Track who modified the item
router.put("/:type/:id", authenticateToken, upload, async (req, res) => {
  const { type, id } = req.params;

  if (!isValidMediaType(type)) {
    return res.status(400).json({ error: "Invalid media type" });
  }

  // Sanitize request body
  const sanitizedBody = {};
  Object.keys(req.body || {}).forEach((key) => {
    sanitizedBody[key] = safeFirst(req.body[key]);
  });

  try {
    const [existingItems] = await db.query(
      `SELECT * FROM ${type} WHERE id = ?`,
      [id]
    );

    if (existingItems.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const existingItem = existingItems[0];
    let updates = [];
    let values = [];

    const files = req.files || [];
    const imageFile = files.find((file) => file.fieldname === "image");
    const fileFile = files.find((file) => file.fieldname === "file");

    switch (type) {
      case "newsletters": {
        const {
          title,
          description,
          published_date,
          publish_type,
          scheduled_date,
          is_published,
        } = sanitizedBody;
        let file_path = existingItem.file_path;
        if (fileFile) file_path = fileFile.filename;

        let finalIsPublished = is_published;
        if (publish_type === "schedule" && scheduled_date) {
          finalIsPublished = false;
        } else if (publish_type === "immediate") {
          finalIsPublished = true;
        }

        updates = [
          "title = ?",
          "description = ?",
          "file_path = ?",
          "published_date = ?",
          "is_published = ?",
          "last_modified_by = ?",
          "last_modified_at = CURRENT_TIMESTAMP",
        ];
        values = [
          ensureString(title),
          ensureString(description),
          file_path,
          published_date,
          finalIsPublished,
          req.user.id,
          id,
        ];
        break;
      }

      case "stories": {
        const {
          title: storyTitle,
          content,
          author,
          published_date: storyDate,
          publish_type: storyPublishType = "immediate",
          scheduled_date: storyScheduledDate,
        } = sanitizedBody;

        const image = imageFile ? imageFile.filename : null;

        const storyContent = ensureString(content);

        let storyPublishedDate =
          storyDate || new Date().toISOString().split("T")[0];
        let storyIsPublished = storyPublishType === "immediate";

        if (storyPublishType === "schedule" && storyScheduledDate) {
          storyPublishedDate = storyScheduledDate;
          storyIsPublished = false;
        }

        updates = [
          "title = ?",
          "content = ?",
          "image = ?",
          "author = ?",
          "published_date = ?",
          "is_published = ?",
          "last_modified_by = ?",
          "last_modified_at = CURRENT_TIMESTAMP",
        ];
        values = [
          ensureString(storyTitle),
          storyContent,
          image,
          ensureString(author) || "Anonymous",
          storyPublishedDate,
          storyIsPublished,
          req.user.id,
          id,
        ];
        break;
      }

      case "events": {
        const {
          title: eventTitle,
          description: eventDesc,
          date,
          time,
          location,
          publish_type: eventPublishType,
          scheduled_date: eventScheduledDate,
          is_published: eventIsPublishedInput,
        } = sanitizedBody;

        let eventImage = existingItem.image;
        if (imageFile) eventImage = imageFile.filename;

        // Build updates similar to File1 but keep safety checks
        updates = [
          "title = ?",
          "description = ?",
          "date = ?",
          "time = ?",
          "location = ?",
          "image = ?",
          "published_date = ?",
          "is_published = ?",
          "last_modified_by = ?",
          "last_modified_at = CURRENT_TIMESTAMP",
        ];

        // Compute publish status
        let finalEventPublished = eventIsPublishedInput;
        if (eventPublishType === "schedule" && eventScheduledDate) {
          finalEventPublished = false;
        } else if (eventPublishType === "immediate") {
          finalEventPublished = true;
        }
        // normalize if passed as string
        if (typeof finalEventPublished !== "undefined") {
          finalEventPublished =
            finalEventPublished === true ||
            finalEventPublished === "true" ||
            finalEventPublished === 1 ||
            finalEventPublished === "1";
        }

        values = [
          ensureString(eventTitle),
          ensureString(eventDesc),
          ensureString(date || existingItem.date),
          ensureString(time || existingItem.time),
          ensureString(location || existingItem.location),
          eventImage,
          existingItem.published_date,
          finalEventPublished,
          req.user.id,
          id,
        ];

        break;
      }

      case "blogs": {
        const {
          title: blogTitle,
          content: blogContent,
          author: blogAuthor,
          tags,
          published_date: blogDate,
          publish_type: blogPublishType,
          scheduled_date: blogScheduledDate,
          is_published: blogIsPublished,
        } = sanitizedBody;
        let blogImage = existingItem.image;
        if (imageFile) blogImage = imageFile.filename;

        let tagsJson = existingItem.tags;
        if (tags) {
          try {
            tagsJson = typeof tags === "string" ? JSON.parse(tags) : tags;
            if (!Array.isArray(tagsJson)) {
              tagsJson = [tagsJson];
            }
          } catch (error) {
            console.warn("Error parsing tags, keeping existing:", error);
          }
        }

        let finalBlogPublished = blogIsPublished;
        if (blogPublishType === "schedule" && blogScheduledDate) {
          finalBlogPublished = false;
        } else if (blogPublishType === "immediate") {
          finalBlogPublished = true;
        }

        updates = [
          "title = ?",
          "content = ?",
          "image = ?",
          "author = ?",
          "tags = ?",
          "published_date = ?",
          "is_published = ?",
          "last_modified_by = ?",
          "last_modified_at = CURRENT_TIMESTAMP",
        ];
        values = [
          ensureString(blogTitle),
          ensureString(blogContent),
          blogImage,
          ensureString(blogAuthor),
          JSON.stringify(tagsJson),
          blogDate,
          finalBlogPublished,
          req.user.id,
          id,
        ];
        break;
      }

      case "documentaries": {
        const {
          title: docTitle,
          description: docDesc,
          video_url,
          duration,
          published_date: docDate,
          publish_type: docPublishType,
          scheduled_date: docScheduledDate,
          is_published: docIsPublished,
        } = sanitizedBody;

        let thumbnail = existingItem.thumbnail;
        if (imageFile) thumbnail = imageFile.filename;

        const videoFile = files.find((file) => file.fieldname === "video_file");
        let video_filename = existingItem.video_filename;
        if (videoFile) video_filename = videoFile.filename;

        let finalDocPublished = docIsPublished;
        if (docPublishType === "schedule" && docScheduledDate) {
          finalDocPublished = false;
        } else if (docPublishType === "immediate") {
          finalDocPublished = true;
        }

        updates = [
          "title = ?",
          "description = ?",
          "video_url = ?",
          "thumbnail = ?",
          "duration = ?",
          "published_date = ?",
          "is_published = ?",
          "last_modified_by = ?",
          "last_modified_at = CURRENT_TIMESTAMP",
        ];
        values = [
          ensureString(docTitle),
          ensureString(docDesc),
          ensureString(video_url) || existingItem.video_url,
          thumbnail,
          ensureString(duration) || existingItem.duration,
          docDate || existingItem.published_date,
          finalDocPublished,
          req.user.id,
          id,
        ];
        break;
      }

      default:
        return res.status(400).json({ error: "Unsupported media type" });
    }

    const query = `UPDATE ${type} SET ${updates.join(", ")} WHERE id = ?`;
    await db.query(query, values);

    res.json({
      message: `${type.slice(0, -1)} updated successfully`,
      is_published: values[values.length - 3],
    });
  } catch (error) {
    console.error(`Error updating ${type}:`, error);

    if (req.files) {
      for (const file of req.files) {
        try {
          if (file && file.path) await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error("Error cleaning up file:", unlinkError);
        }
      }
    }

    res.status(500).json({
      error: `Failed to update ${type}`,
      details: error.message,
      sqlMessage: error && error.sqlMessage ? error.sqlMessage : undefined,
    });
  }
});

// Delete item
router.delete("/:type/:id", authenticateToken, async (req, res) => {
  const { type, id } = req.params;

  if (!isValidMediaType(type)) {
    return res.status(400).json({ error: "Invalid media type" });
  }

  try {
    const [items] = await db.query(`SELECT * FROM ${type} WHERE id = ?`, [id]);

    if (items.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const item = items[0];

    if (item.image || item.file_path || item.thumbnail) {
      try {
        if (item.image) {
          await fs.unlink(`uploads/media/${type}/${item.image}`);
        }
        if (item.file_path) {
          await fs.unlink(`uploads/media/${type}/${item.file_path}`);
        }
        if (item.thumbnail) {
          await fs.unlink(`uploads/media/${type}/${item.thumbnail}`);
        }
      } catch (unlinkError) {
        console.warn("Error deleting associated files:", unlinkError);
      }
    }

    const query = `DELETE FROM ${type} WHERE id = ?`;
    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: `${type.slice(0, -1)} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    res.status(500).json({
      error: `Failed to delete ${type}`,
      details: error.message,
    });
  }
});

// Toggle publish status - Track who changed the status
router.patch("/:type/:id/publish", authenticateToken, async (req, res) => {
  const { type, id } = req.params;
  const { is_published } = req.body;

  if (!isValidMediaType(type)) {
    return res.status(400).json({ error: "Invalid media type" });
  }

  try {
    const query = `UPDATE ${type} SET is_published = ?, last_modified_by = ?, last_modified_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.query(query, [is_published, req.user.id, id]);

    res.json({
      message: `${type.slice(0, -1)} ${
        is_published ? "published" : "unpublished"
      } successfully`,
      is_published,
    });
  } catch (error) {
    console.error(`Error toggling publish status for ${type}:`, error);
    res.status(500).json({
      error: `Failed to update publish status`,
      details: error.message,
    });
  }
});

// Get scheduled items for a specific media type - Include user info
router.get("/scheduled/:type", async (req, res) => {
  const { type } = req.params;

  if (!isValidMediaType(type)) {
    return res.status(400).json({ error: "Invalid media type" });
  }

  try {
    const query = `SELECT m.*, u.username as last_modified_by_name 
                   FROM ${type} m 
                   LEFT JOIN users u ON m.last_modified_by = u.id 
                   WHERE m.is_published = FALSE AND m.published_date > NOW() 
                   ORDER BY m.published_date ASC`;
    const [results] = await db.query(query);
    res.json(results);
  } catch (error) {
    console.error(`Error fetching scheduled ${type}:`, error);
    res.status(500).json({
      error: `Failed to fetch scheduled ${type}`,
      details: error.message,
    });
  }
});

// Publish all scheduled items that are due - Track who published
router.post("/publish-scheduled", authenticateToken, async (req, res) => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    let totalPublished = 0;

    for (const type of Object.keys(mediaTables)) {
      const query = `UPDATE ${type} SET is_published = TRUE, last_modified_by = ?, last_modified_at = CURRENT_TIMESTAMP WHERE is_published = FALSE AND published_date <= ?`;
      const [result] = await db.query(query, [req.user.id, now]);
      totalPublished += result.affectedRows;
    }

    res.json({
      message: `Published ${totalPublished} scheduled items successfully`,
      count: totalPublished,
    });
  } catch (error) {
    console.error("Error publishing scheduled items:", error);
    res.status(500).json({
      error: "Failed to publish scheduled items",
      details: error.message,
    });
  }
});

// Get statistics for specific media type
router.get("/stats/:type", async (req, res) => {
  const { type } = req.params;

  if (!isValidMediaType(type)) {
    return res.status(400).json({ error: "Invalid media type" });
  }

  try {
    const totalQuery = `SELECT COUNT(*) as total FROM ${type}`;
    const publishedQuery = `SELECT COUNT(*) as published FROM ${type} WHERE is_published = TRUE`;
    const scheduledQuery = `SELECT COUNT(*) as scheduled FROM ${type} WHERE is_published = FALSE AND published_date > NOW()`;

    const [totalResult] = await db.query(totalQuery);
    const [publishedResult] = await db.query(publishedQuery);
    const [scheduledResult] = await db.query(scheduledQuery);

    res.json({
      total: totalResult[0].total,
      published: publishedResult[0].published,
      scheduled: scheduledResult[0].scheduled,
      draft:
        totalResult[0].total -
        publishedResult[0].published -
        scheduledResult[0].scheduled,
    });
  } catch (error) {
    console.error(`Error fetching stats for ${type}:`, error);
    res.status(500).json({
      error: `Failed to fetch statistics`,
      details: error.message,
    });
  }
});

module.exports = router;
