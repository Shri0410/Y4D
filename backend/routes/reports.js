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
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
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

// Get all reports - Public endpoint (optional auth for admin access)
router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let query;

    // If token is provided, try to authenticate (optional auth)
    if (token) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user exists and is approved
        const [userResults] = await db.query(
          "SELECT id, username, role, status FROM users WHERE id = ?",
          [decoded.id]
        );

        if (userResults && userResults.length > 0 && userResults[0].status === "approved") {
          const user = userResults[0];
          req.user = user;

          // Authenticated users get role-based access
          if (user.role === "admin" || user.role === "super_admin") {
            query = `
              SELECT r.*, u.username as last_modified_by_name 
              FROM reports r 
              LEFT JOIN users u ON r.last_modified_by = u.id 
              ORDER BY r.created_at DESC
            `;
            const [rows] = await db.query(query);
            return res.json(rows);
          } else {
            // Regular users see their own reports + published reports
            query = `SELECT * FROM reports WHERE last_modified_by = ? OR is_published = TRUE ORDER BY created_at DESC`;
            const [rows] = await db.query(query, [user.id]);
            return res.json(rows);
          }
        }
      } catch (authError) {
        // Invalid token, fall through to public access
      }
    }

    // Public access: return only published reports
    query = `SELECT * FROM reports WHERE is_published = TRUE ORDER BY created_at DESC`;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single report - FILTERED by role
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    let query;

    if (req.user.role === "admin" || req.user.role === "super_admin") {
      query = `
        SELECT r.*, u.username as last_modified_by_name 
        FROM reports r 
        LEFT JOIN users u ON r.last_modified_by = u.id 
        WHERE r.id = ?
      `;
    } else {
      query = `SELECT * FROM reports WHERE id = ?`;
    }

    const [rows] = await db.query(query, [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Report not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create report - Handle multiple files and set created_by
router.post(
  "/",
  authenticateToken,
  upload.fields([{ name: "image" }, { name: "pdf" }]),
  async (req, res) => {
    try {
      const { title, description, content } = req.body;

      const image =
        req.files && req.files["image"] ? req.files["image"][0].filename : null;
      const pdf =
        req.files && req.files["pdf"] ? req.files["pdf"][0].filename : null;

      const [result] = await db.query(
        "INSERT INTO reports (title, description, content, image, pdf, last_modified_by) VALUES (?, ?, ?, ?, ?, ?)",
        [title, description, content, image, pdf, req.user.id]
      );

      res.json({
        id: result.insertId,
        message: "Report created successfully",
        report: {
          id: result.insertId,
          title,
          description,
          content,
          image,
          pdf,
        },
      });
    } catch (err) {
      console.error("Error creating report:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Update report - Handle multiple files and track last modified
router.put(
  "/:id",
  authenticateToken,
  upload.fields([{ name: "image" }, { name: "pdf" }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, content } = req.body;

      const [rows] = await db.query("SELECT * FROM reports WHERE id = ?", [id]);
      if (rows.length === 0)
        return res.status(404).json({ error: "Report not found" });

      const currentReport = rows[0];

      let image = currentReport.image;
      let pdf = currentReport.pdf;

      if (req.files && req.files["image"]) {
        if (currentReport.image) {
          const oldImagePath = path.join(
            "uploads/reports/",
            currentReport.image
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        image = req.files["image"][0].filename;
      }

      if (req.files && req.files["pdf"]) {
        if (currentReport.pdf) {
          const oldPdfPath = path.join("uploads/reports/", currentReport.pdf);
          if (fs.existsSync(oldPdfPath)) {
            fs.unlinkSync(oldPdfPath);
          }
        }
        pdf = req.files["pdf"][0].filename;
      }

      await db.query(
        "UPDATE reports SET title = ?, description = ?, content = ?, image = ?, pdf = ?, last_modified_by = ?, last_modified_at = CURRENT_TIMESTAMP WHERE id = ?",
        [title, description, content, image, pdf, req.user.id, id]
      );

      res.json({ message: "Report updated successfully" });
    } catch (err) {
      console.error("Error updating report:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete report - Delete associated files
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reports WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Report not found" });

    const report = rows[0];

    if (report.image) {
      const imagePath = path.join("uploads/reports/", report.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (report.pdf) {
      const pdfPath = path.join("uploads/reports/", report.pdf);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    const [result] = await db.query("DELETE FROM reports WHERE id = ?", [
      req.params.id,
    ]);

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ error: err.message });
  }
});

// Publish/Unpublish report - Track who made the status change
router.patch("/:id/publish", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_published } = req.body;

    const [result] = await db.query(
      "UPDATE reports SET is_published = ?, last_modified_by = ?, last_modified_at = CURRENT_TIMESTAMP WHERE id = ?",
      [is_published, req.user.id, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Report not found" });

    res.json({
      message: `Report ${
        is_published ? "published" : "unpublished"
      } successfully`,
      is_published,
    });
  } catch (err) {
    console.error("Error updating report status:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
