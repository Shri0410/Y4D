const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const db = require("../config/database");
const router = express.Router();
const { sendDonationMail } = require("../services/donationMail");
/* Razorpay Instance (Secure)
 * Use backend-only environment variables (do NOT expose secret to frontend)
 */
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID?.trim();
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET?.trim();
const CORP_MAIL = process.env.CORP_MAIL;
const CORP_MAIL_PASSWORD = process.env.CORP_MAIL_PASSWORD;

let razorpay = null;

if (
  !RAZORPAY_KEY_ID ||
  !RAZORPAY_SECRET ||
  RAZORPAY_KEY_ID === "" ||
  RAZORPAY_SECRET === ""
) {
  console.warn("⚠️  Razorpay ENV variables missing or empty! Payment routes will be disabled.");
  console.warn(
    "   Set RAZORPAY_KEY_ID and RAZORPAY_SECRET in your backend .env file to enable payment functionality."
  );
} else {
  try {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_SECRET,
    });
    console.log("✅ Razorpay initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing Razorpay:", error.message);
    razorpay = null;
  }
}

let mailTransporter = null;
if (!CORP_MAIL || !CORP_MAIL_PASSWORD) {
  console.warn("⚠️ CORP_MAIL or CORP_MAIL_PASSWORD missing. Donation receipts will not be emailed.");
} else {
  mailTransporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: CORP_MAIL,
      pass: CORP_MAIL_PASSWORD,
    },
  });
}

/* ---------------------------
     1. Create Order (POST)
----------------------------- */
router.post(
  "/create-order",
  [
    body("amount")
      .trim()
      .toFloat()
      .isFloat({ min: 1 })
      .withMessage("Enter valid donation amount"),
    body("name").optional().isString().trim(),
    body("email").optional().isEmail(),
    body("pan").optional().isString().trim(),
    body("message").optional().isString().trim(),
  ],
  async (req, res) => {
    try {
      // Check if Razorpay is initialized
      if (!razorpay) {
        return res.status(503).json({
          success: false,
          message: "Payment service is not configured. Please contact administrator.",
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ success: false, errors: errors.array() });
      }

      const { amount } = req.body;

      const cleanAmount = parseFloat(amount);
      if (isNaN(cleanAmount) || cleanAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid donation amount",
        });
      }

      const options = {
        amount: Math.round(cleanAmount * 100),
        currency: "INR",
        receipt: "receipt_" + Date.now(),
        notes: { ...req.body }, 
      };

      const order = await razorpay.orders.create(options);

      return res.status(201).json({
        success: true,
        key: RAZORPAY_KEY_ID,
        order,
      });
    } catch (error) {
      console.error("❌ Error creating Razorpay order:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to create order" });
    }
  }
);

router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Signature mismatch" });
    }

    // Razorpay Order Fetch → Includes donor notes
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const donor = order.notes;
    const amount = Number(order.amount) / 100;

    // 🌟 Insert Into DB
    const insertQuery = `
      INSERT INTO transaction_logs
      (user_name, email, pan_number, amount, message, payment_method, status, payment_id, transaction_id, utr, masked_card_number, card_expiry)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(insertQuery, [
      donor?.name || "",
      donor?.email || "",
      donor?.pan || "",
      amount,
      donor?.message || "",
      "Razorpay",          // payment_method
      "success",           // status
      razorpay_payment_id, // payment_id
      razorpay_order_id,   // transaction_id
      null,                // utr (need webhook for UPI)
      null,                // masked_card_number (also webhook)
      null,                // card_expiry (also webhook)
    ]);

    // Send Email Receipt
    await sendDonationMail({
      name: donor?.name,
      email: donor?.email,
      amount,
      paymentId: razorpay_payment_id,
    });

    return res.json({
      success: true,
      paymentId: razorpay_payment_id,
    });

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Verification failed" });
  }
});

router.get("/key", (req, res) => {
  if (!RAZORPAY_KEY_ID) {
    return res.status(500).json({
      success: false,
      message: "Razorpay key not configured",
    });
  }

  return res.json({
    success: true,
    key: RAZORPAY_KEY_ID,
  });
});
module.exports = router;
