const express = require("express");
const router = express.Router();

// Controller se functions import karein
const { sendOTP, verifyOTP } = require("../controllers/otpController"); 

/**
 * 1. OTP Bhejne ka Route
 * POST /api/otp/send
 */
router.post("/send", sendOTP);

/**
 * 2. OTP Verify karne ka Route
 * POST /api/otp/verify
 */
router.post("/verify", verifyOTP);

module.exports = router;