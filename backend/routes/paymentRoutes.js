const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createRazorpayOrder,
  createUpiQrCode,
  checkUpiQrStatus,
  verifyRazorpayPayment,
  markPaymentFailed,
} = require("../controllers/paymentController");

router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);
router.post("/razorpay/upi-qr", protect, createUpiQrCode);
router.get("/razorpay/upi-qr/:transactionId/status", protect, checkUpiQrStatus);
router.post("/razorpay/fail", protect, markPaymentFailed);

module.exports = router;
