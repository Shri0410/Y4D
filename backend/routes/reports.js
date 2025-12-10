const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/database");
const fs = require("fs");
const { authenticateToken, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/reports/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

// ✅ FIXED: Get ALL reports - Public endpoint returns ONLY published reports
router.get("/", async (req, res) => {
  try {
    console.log("🔍 [REPORTS] GET / - Fetching reports");
    console.log("📝 Auth header present:", !!req.headers["authorization"]);
    
    // For LegalReports.jsx frontend - ALWAYS return only published reports
    const query = `SELECT * FROM reports WHERE is_published = TRUE ORDER BY created_at DESC`;
    const [rows] = await db.query(query);
    
    console.log(`✅ [REPORTS] Returning ${rows.length} published reports to frontend`);
    
    // Log sample for debugging
    if (rows.length > 0) {
      console.log(`📄 Sample report: ${rows[0].title} (ID: ${rows[0].id}, Published: ${rows[0].is_published})`);
    }
    
    res.json(rows);
  } catch (err) {
    console.error("❌ [REPORTS] Error fetching reports:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ NEW: Get reports for Admin Dashboard (with auth, includes all reports)
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    console.log(`🔍 [REPORTS-ADMIN] GET /admin/all - User: ${req.user.username}, Role: ${req.user.role}`);
    
    let query;
    
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      // Admins see all reports with last modified info
      query = `
        SELECT r.*, u.username as last_modified_by_name 
        FROM reports r 
        LEFT JOIN users u ON r.last_modified_by = u.id 
        ORDER BY r.created_at DESC
      `;
    } else {
      // Regular users see only their own reports + published ones
      query = `SELECT * FROM reports WHERE last_modified_by = ? OR is_published = TRUE ORDER BY created_at DESC`;
    }
    
    const params = req.user.role === "admin" || req.user.role === "super_admin" ? [] : [req.user.id];
    const [rows] = await db.query(query, params);
    
    console.log(`✅ [REPORTS-ADMIN] Returning ${rows.length} reports to admin dashboard`);
    res.json(rows);
  } catch (err) {
    console.error("❌ [REPORTS-ADMIN] Error fetching admin reports:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get single report - FILTERED by role
router.get("/:id", async (req, res) => {
  try {
    console.log(`🔍 [REPORTS] GET /${req.params.id} - Fetching single report`);
    
    // Check auth for admin access
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    let query;
    
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const [userResults] = await db.query(
          "SELECT id, username, role, status FROM users WHERE id = ?",
          [decoded.id]
        );
        
        if (userResults && userResults.length > 0 && userResults[0].status === "approved") {
          const user = userResults[0];
          
          if (user.role === "admin" || user.role === "super_admin") {
            // Admins can see any report
            query = `SELECT * FROM reports WHERE id = ?`;
          } else {
            // Regular users can see published reports or their own
            query = `SELECT * FROM reports WHERE id = ? AND (is_published = TRUE OR last_modified_by = ?)`;
          }
        }
      } catch (authError) {
        // Invalid token, fall through to public access
      }
    }
    
    // Public access (or invalid token): only published reports
    if (!query) {
      query = `SELECT * FROM reports WHERE id = ? AND is_published = TRUE`;
    }
    
    const params = query.includes("last_modified_by = ?") ? [req.params.id, decoded.id] : [req.params.id];
    const [rows] = await db.query(query, params);
    
    if (rows.length === 0) {
      console.log(`❌ [REPORTS] Report ${req.params.id} not found or not published`);
      return res.status(404).json({ error: "Report not found or not published" });
    }
    
    console.log(`✅ [REPORTS] Returning report ${req.params.id}`);
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ [REPORTS] Error fetching single report:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create report - Handle multiple files and set created_by
router.post(
  "/",
  authenticateToken,
  (req, res, next) => {
    upload.fields([{ name: "image" }, { name: "pdf" }])(req, res, (err) => {
      if (err) {
        console.error("❌ [REPORTS] Multer error during upload:", err.message);
        return res.status(400).json({ 
          error: "File upload error", 
          details: err.message 
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { title, description, content, is_published = true } = req.body;
      
      console.log("📝 [REPORTS] Creating report:", {
        title,
        description: description?.substring(0, 50) + "...",
        is_published
      });

      const image =
        req.files && req.files["image"] ? req.files["image"][0].filename : null;
      const pdf =
        req.files && req.files["pdf"] ? req.files["pdf"][0].filename : null;

      const [result] = await db.query(
        "INSERT INTO reports (title, description, content, image, pdf, last_modified_by, is_published) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, description, content, image, pdf, req.user.id, is_published]
      );

      console.log(`✅ [REPORTS] Report created successfully with ID: ${result.insertId}, Published: ${is_published}`);

      res.status(201).json({
        id: result.insertId,
        message: "Report created successfully",
        report: {
          id: result.insertId,
          title,
          description,
          content,
          image,
          pdf,
          last_modified_by: req.user.id,
          is_published: is_published === true || is_published === "true"
        },
      });
    } catch (err) {
      console.error("❌ [REPORTS] Error creating report:", err);
      res.status(500).json({ 
        error: "Failed to create report", 
        details: err.message 
      });
    }
  }
);

// Update report - Handle multiple files and track last modified
router.put(
  "/:id",
  authenticateToken,
  (req, res, next) => {
    upload.fields([{ name: "image" }, { name: "pdf" }])(req, res, (err) => {
      if (err) {
        console.error("❌ [REPORTS] Multer error during update:", err.message);
        return res.status(400).json({ 
          error: "File upload error", 
          details: err.message 
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, content, is_published } = req.body;

      console.log(`📝 [REPORTS] Updating report ${id}:`, {
        title,
        is_published
      });

      const [rows] = await db.query("SELECT * FROM reports WHERE id = ?", [id]);
      if (rows.length === 0) {
        console.log(`❌ [REPORTS] Report ${id} not found`);
        return res.status(404).json({ error: "Report not found" });
      }

      const currentReport = rows[0];

      let image = currentReport.image;
      let pdf = currentReport.pdf;

      // Handle image update
      if (req.files && req.files["image"]) {
        console.log("🔄 [REPORTS] New image uploaded:", req.files["image"][0].filename);
        if (currentReport.image) {
          const oldImagePath = path.join(
            "uploads/reports/",
            currentReport.image
          );
          if (fs.existsSync(oldImagePath)) {
            console.log("🗑️ [REPORTS] Deleting old image");
            fs.unlinkSync(oldImagePath);
          }
        }
        image = req.files["image"][0].filename;
      }

      // Handle PDF update
      if (req.files && req.files["pdf"]) {
        console.log("🔄 [REPORTS] New PDF uploaded:", req.files["pdf"][0].filename);
        if (currentReport.pdf) {
          const oldPdfPath = path.join("uploads/reports/", currentReport.pdf);
          if (fs.existsSync(oldPdfPath)) {
            console.log("🗑️ [REPORTS] Deleting old PDF");
            fs.unlinkSync(oldPdfPath);
          }
        }
        pdf = req.files["pdf"][0].filename;
      }

      await db.query(
        "UPDATE reports SET title = ?, description = ?, content = ?, image = ?, pdf = ?, is_published = ?, last_modified_by = ?, last_modified_at = CURRENT_TIMESTAMP WHERE id = ?",
        [title, description, content, image, pdf, is_published, req.user.id, id]
      );

      console.log(`✅ [REPORTS] Report ${id} updated successfully`);

      res.json({ 
        message: "Report updated successfully",
        report: {
          id,
          title,
          description,
          content,
          image,
          pdf,
          is_published
        }
      });
    } catch (err) {
      console.error("❌ [REPORTS] Error updating report:", err);
      res.status(500).json({ 
        error: "Failed to update report", 
        details: err.message 
      });
    }
  }
);

// Delete report - Delete associated files
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    console.log(`🗑️ [REPORTS] Deleting report ${req.params.id}`);
    
    const [rows] = await db.query("SELECT * FROM reports WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      console.log(`❌ [REPORTS] Report ${req.params.id} not found`);
      return res.status(404).json({ error: "Report not found" });
    }

    const report = rows[0];

    if (report.image) {
      const imagePath = path.join("uploads/reports/", report.image);
      if (fs.existsSync(imagePath)) {
        console.log("🗑️ [REPORTS] Deleting image file");
        fs.unlinkSync(imagePath);
      }
    }

    if (report.pdf) {
      const pdfPath = path.join("uploads/reports/", report.pdf);
      if (fs.existsSync(pdfPath)) {
        console.log("🗑️ [REPORTS] Deleting PDF file");
        fs.unlinkSync(pdfPath);
      }
    }

    const [result] = await db.query("DELETE FROM reports WHERE id = ?", [
      req.params.id,
    ]);

    console.log(`✅ [REPORTS] Report ${req.params.id} deleted successfully`);

    res.json({ 
      message: "Report deleted successfully",
      deletedId: req.params.id
    });
  } catch (err) {
    console.error("❌ [REPORTS] Error deleting report:", err);
    res.status(500).json({ 
      error: "Failed to delete report", 
      details: err.message 
    });
  }
});

// Publish/Unpublish report - Track who made the status change
router.patch("/:id/publish", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    console.log(`📢 [REPORTS] ${is_published ? 'Publishing' : 'Unpublishing'} report ${id}`);

    const [result] = await db.query(
      "UPDATE reports SET is_published = ?, last_modified_by = ?, last_modified_at = CURRENT_TIMESTAMP WHERE id = ?",
      [is_published, req.user.id, id]
    );

    if (result.affectedRows === 0) {
      console.log(`❌ [REPORTS] Report ${id} not found for publish/unpublish`);
      return res.status(404).json({ error: "Report not found" });
    }

    console.log(`✅ [REPORTS] Report ${id} ${is_published ? 'published' : 'unpublished'} successfully`);

    res.json({
      message: `Report ${
        is_published ? "published" : "unpublished"
      } successfully`,
      is_published,
    });
  } catch (err) {
    console.error("❌ [REPORTS] Error updating report status:", err);
    res.status(500).json({ 
      error: "Failed to update report status", 
      details: err.message 
    });
  }
});

// ✅ NEW: Get only published reports count (for frontend display)
router.get("/count/published", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM reports WHERE is_published = TRUE");
    console.log(`📊 [REPORTS] Published reports count: ${rows[0].count}`);
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error("❌ [REPORTS] Error counting published reports:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;