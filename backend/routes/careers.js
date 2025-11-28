const express = require("express");
const db = require("../config/database");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// CAREERS CRUD 
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM careers ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active careers
router.get("/active", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM careers WHERE is_active = TRUE ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one career
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM careers WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Career not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create career
router.post("/", async (req, res) => {
  try {
    const { title, description, requirements, location, type } = req.body;
    const [result] = await db.query(
      "INSERT INTO careers (title, description, requirements, location, type) VALUES (?, ?, ?, ?, ?)",
      [title, description, requirements, location, type]
    );
    res.json({
      id: result.insertId,
      message: "Career created successfully",
      career: {
        id: result.insertId,
        title,
        description,
        requirements,
        location,
        type,
        is_active: true,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update career
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, location, type, is_active } =
      req.body;

    const [rows] = await db.query("SELECT * FROM careers WHERE id = ?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Career not found" });

    await db.query(
      "UPDATE careers SET title = ?, description = ?, requirements = ?, location = ?, type = ?, is_active = ? WHERE id = ?",
      [title, description, requirements, location, type, is_active, id]
    );

    res.json({ message: "Career updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete career
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM careers WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Career not found" });
    res.json({ message: "Career deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  APPLY FOR JOB 
router.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, phone, message, careerId } = req.body;
    const resumeFile = req.file;

    const [careerRows] = await db.query("SELECT * FROM careers WHERE id = ?", [
      careerId,
    ]);
    if (careerRows.length === 0)
      return res.status(404).json({ error: "Career not found" });

    const career = careerRows[0];

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.HR_EMAIL,
        pass: process.env.HR_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.OWNER_EMAIL,
      subject: `Job Application for ${career.title}`,
      html: `
        <h3>New Application for ${career.title}</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        <hr />
        <h4>Job Details:</h4>
        <p><strong>Location:</strong> ${career.location}</p>
        <p><strong>Type:</strong> ${career.type}</p>
        <p><strong>Description:</strong> ${career.description}</p>
      `,
      attachments: resumeFile
        ? [
            {
              filename: resumeFile.originalname,
              path: resumeFile.path,
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);

    if (resumeFile) fs.unlinkSync(resumeFile.path);

    res.json({ success: true, message: "Application sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send application" });
  }
});

module.exports = router;
