const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

// --- IMPORTANT: Agar .env kaam nahi kar raha, toh yahan direct string dalein ---
// Par dhyan rahe: Quotes "" hona zaroori hai!
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_live_S8qV0g09nn545L";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "A7KQQTkz5uSK7Kh30BuvYBIj";

// Razorpay Instance Setup
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/**
 * 1. CREATE ORDER
 * Isse frontend ko Order ID milti hai taaki Razorpay popup khul sake
 */
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ success: false, message: "Amount is required" });
  }

  try {
    const options = {
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("❌ Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. VERIFY PAYMENT
 * Yeh check karta hai ki payment real hai ya fake
 */
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Validation logic
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // SUCCESS: Yahan aap database mein order save kar sakte hain
      res.status(200).json({
        success: true,
        message: "Payment verified successfully ✅",
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed ❌"
      });
    }
  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;