const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");

const router = express.Router();

/* Razorpay Instance (Secure)
 * Use backend-only environment variables (do NOT expose secret to frontend)
 */
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID?.trim();
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET?.trim();
const HR_EMAIL = process.env.HR_EMAIL;
const HR_EMAIL_PASSWORD = process.env.HR_EMAIL_PASSWORD;

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

// Reuse HR mailbox for sending donation receipts
let mailTransporter = null;
if (!HR_EMAIL || !HR_EMAIL_PASSWORD) {
  console.warn("⚠️ HR_EMAIL or HR_EMAIL_PASSWORD missing. Donation receipts will not be emailed.");
} else {
  mailTransporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: HR_EMAIL,
      pass: HR_EMAIL_PASSWORD,
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
      .isInt({ min: 1 })
      .withMessage("Amount must be a valid number greater than 0"),
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

      const options = {
        amount: Number(amount) * 100, 
        currency: "INR",
        receipt: "receipt_" + Date.now(),
        notes: { ...req.body }, 
      };

      const order = await razorpay.orders.create(options);

      return res.status(201).json({
        success: true,
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

/* Verify Payment (POST)*/
router.post(
  "/verify-payment",
  [
    body("razorpay_payment_id").notEmpty().withMessage("Payment ID missing"),
    body("razorpay_order_id").notEmpty().withMessage("Order ID missing"),
    body("razorpay_signature").notEmpty().withMessage("Signature missing"),
  ],
  async (req, res) => {
    try {
      // Check if Razorpay is initialized
      if (!razorpay || !RAZORPAY_SECRET) {
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

      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
        req.body;

      const signString = `${razorpay_order_id}|${razorpay_payment_id}`;

      const expectedSign = crypto
        .createHmac("sha256", RAZORPAY_SECRET)
        .update(signString)
        .digest("hex");

      const isValid = expectedSign === razorpay_signature;

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Invalid signature, payment verification failed",
        });
      }

      // Optionally fetch order to read donor details from notes
      let donorEmail = null;
      let donorName = null;
      let donorAmount = null;

      try {
        const order = await razorpay.orders.fetch(razorpay_order_id);
        if (order && order.notes) {
          donorEmail = order.notes.email || null;
          donorName = order.notes.name || null;
          donorAmount =
            typeof order.amount === "number" ? order.amount / 100 : null;
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch Razorpay order for receipt:", err.message);
      }

      // Send email receipt to donor if we have details and mail is configured
      if (mailTransporter && donorEmail) {
        try {
          const subject = "Thank you for your donation to Y4D Foundation";
          const amountText = donorAmount ? `₹${donorAmount.toLocaleString("en-IN")}` : "your generous";
          const nameText = donorName || "Friend";

          await mailTransporter.sendMail({
            from: HR_EMAIL,
            to: donorEmail,
            subject,
            html: `
              <h2>Dear ${nameText},</h2>
              <p>Thank you for your donation of <strong>${amountText}</strong> to Y4D Foundation.</p>
              <p>Your payment has been received successfully.</p>
              <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
              <p>We truly appreciate your support in empowering communities.</p>
              <p>Warm regards,<br/>Y4D Foundation</p>
            `,
          });
        } catch (mailError) {
          console.error("❌ Failed to send donation receipt email:", mailError.message);
        }
      }

      return res.json({
        success: true,
        message: "Payment verified successfully",
        paymentId: razorpay_payment_id,
      });
    } catch (error) {
      console.error("❌ Error verifying payment:", error.message);
      res
        .status(500)
        .json({ success: false, message: "Payment verification failed" });
    }
  }
);

module.exports = router;
