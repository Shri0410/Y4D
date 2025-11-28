const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const xss = require("xss");

require("dotenv").config();

// ENVIRONMENT VALIDATION
if (!process.env.CORP_MAIL || !process.env.CORP_MAIL_PASSWORD) {
  console.error("❌ CORP_MAIL or CORP_MAIL_PASSWORD missing in environment variables.");
}

// SANITIZER
const clean = (value) => (value ? xss(value.trim()) : "");

// CREATE SINGLE TRANSPORTER INSTANCE
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.CORP_MAIL,
    pass: process.env.CORP_MAIL_PASSWORD.replace(/\s/g, ""), // remove hidden spaces
  },
});

// Verify transporter once on startup
transporter.verify((err) => {
  if (err) {
    console.error("❌ SMTP verification failed:", err.message);
  } else {
    console.log("📧 SMTP transporter is ready");
  }
});

// REUSABLE MAIL SENDER
const sendMailSafe = async (options, res) => {
  try {
    await transporter.sendMail(options);
    return res.json({ success: true, message: "Mail sent successfully" });
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: err.message,
    });
  }
};

// CORPORATE PARTNERSHIP ROUTE
router.post("/corporate-partnership", async (req, res) => {
  const companyName = clean(req.body.companyName);
  const email = clean(req.body.email);
  const contact = clean(req.body.contact);
  const details = clean(req.body.details);

  // Validate required fields
  if (!companyName || !email || !contact) {
    return res.status(400).json({
      success: false,
      message: "Required fields missing: companyName, email, contact",
    });
  }

  console.log("📩 Corporate Partnership Request:", {
    companyName,
    email,
    contact,
  });

  const mailOptions = {
    from: email,
    to: process.env.MAIL_USER,
    subject: "New Corporate Partnership Request",
    html: `
      <h3>Corporate Partnership Enquiry</h3>
      <p><strong>Company Name:</strong> ${companyName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Contact Number:</strong> ${contact}</p>
      <p><strong>Details:</strong> ${details}</p>
    `,
  };

  return sendMailSafe(mailOptions, res);
});

module.exports = router;
