const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");

const router = express.Router();

/* Razorpay Instance (Secure) */
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID?.trim();
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET?.trim();

let razorpay = null;

if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET || RAZORPAY_KEY_ID === '' || RAZORPAY_SECRET === '') {
  console.warn("⚠️  Razorpay ENV variables missing or empty! Payment routes will be disabled.");
  console.warn("   Set RAZORPAY_KEY_ID and RAZORPAY_SECRET in your .env file to enable payment functionality.");
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

      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      } = req.body;

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
