const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/database");
const fs = require("fs");

const router = express.Router();

// Configure multer for file uploads (both image and PDF)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/reports/";
    // Create directory if it doesn't exist
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
  // Allow images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Get all reports
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM reports ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single report
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reports WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Report not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create report - UPDATED: Handle multiple files
router.post("/", upload.fields([{ name: 'image' }, { name: 'pdf' }]), async (req, res) => {
  try {
    const { title, description, content } = req.body;
    
    // Handle uploaded files
    const image = req.files && req.files['image'] ? req.files['image'][0].filename : null;
    const pdf = req.files && req.files['pdf'] ? req.files['pdf'][0].filename : null;

    const [result] = await db.query(
      "INSERT INTO reports (title, description, content, image, pdf) VALUES (?, ?, ?, ?, ?)",
      [title, description, content, image, pdf]
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
        pdf 
      },
    });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update report - UPDATED: Handle multiple files
router.put("/:id", upload.fields([{ name: 'image' }, { name: 'pdf' }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content } = req.body;

    // Get current report data
    const [rows] = await db.query("SELECT * FROM reports WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Report not found" });

    const currentReport = rows[0];
    
    // Handle uploaded files
    let image = currentReport.image;
    let pdf = currentReport.pdf;

    if (req.files && req.files['image']) {
      // Delete old image if exists
      if (currentReport.image) {
        const oldImagePath = path.join('uploads/reports/', currentReport.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image = req.files['image'][0].filename;
    }

    if (req.files && req.files['pdf']) {
      // Delete old PDF if exists
      if (currentReport.pdf) {
        const oldPdfPath = path.join('uploads/reports/', currentReport.pdf);
        if (fs.existsSync(oldPdfPath)) {
          fs.unlinkSync(oldPdfPath);
        }
      }
      pdf = req.files['pdf'][0].filename;
    }

    await db.query(
      "UPDATE reports SET title = ?, description = ?, content = ?, image = ?, pdf = ? WHERE id = ?",
      [title, description, content, image, pdf, id]
    );
    
    res.json({ message: "Report updated successfully" });
  } catch (err) {
    console.error("Error updating report:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete report - UPDATED: Delete associated files
router.delete("/:id", async (req, res) => {
  try {
    // First get the report to delete associated files
    const [rows] = await db.query("SELECT * FROM reports WHERE id = ?", [req.params.id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Report not found" });

    const report = rows[0];

    // Delete associated files
    if (report.image) {
      const imagePath = path.join('uploads/reports/', report.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (report.pdf) {
      const pdfPath = path.join('uploads/reports/', report.pdf);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    // Delete from database
    const [result] = await db.query("DELETE FROM reports WHERE id = ?", [req.params.id]);
    
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("Error deleting report:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;