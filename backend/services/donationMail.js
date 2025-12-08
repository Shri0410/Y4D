const nodemailer = require("nodemailer");

const CORP_MAIL = process.env.CORP_MAIL;
const CORP_MAIL_PASSWORD = process.env.CORP_MAIL_PASSWORD;

let transporter = null;

// Check ENV first
if (!CORP_MAIL || !CORP_MAIL_PASSWORD) {
  console.warn("⚠️ Email env vars missing — donation emails disabled.");
} else {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: CORP_MAIL,
      pass: CORP_MAIL_PASSWORD, 
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Diagnostic check once on startup
  transporter.verify((err, success) => {
    if (err) {
      console.error("❌ SMTP Server NOT reachable:", err.code || err.message);
    } else {
      console.log("📩 SMTP Ready: Emails can be sent.");
    }
  });
}

exports.sendDonationMail = async ({ name, email, amount, paymentId }) => {
  if (!transporter) {
    console.warn("⚠️ Email transporter not initialized — skipping email.");
    return false;
  }

  if (!email) {
    console.warn("⚠️ Email not provided — skipping email.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `Y4D Foundation <${CORP_MAIL}>`,
      to: email,
      subject: "Donation Receipt - Y4D Foundation",
      html: `
        <h2>Dear ${name || "Donor"},</h2>
        <p>Thank you for your generous support !</p>
        <p>Your contribution of ₹ ${Number(amount).toLocaleString("en-IN")} will directly help us empower communities through education, skilling, and sustainable development.</p>
        <p>We’re grateful to have you as a part of the Y4D Team</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <br/>
        <p>Warm regards,<br/>Y4D Foundation</p>`,
    });

    console.log(`📧 Receipt sent to ${email}`);
    return true;
  } catch (e) {
    console.error("❌ Donation email failed:", e.code || e.message);
    return false;
  }
};
