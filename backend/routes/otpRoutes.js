const express = require("express");
const router = express.Router();

// Controller se functions import karein
// Ensure karein ki aapke otpController.js mein dono functions exported hain
const { sendOTP, verifyOTP } = require("../controllers/otpController"); 

/**
 * 1. OTP Bhejne ka Route
 * Frontend fetch: /api/otp/send
 */
router.post("/send", sendOTP);

/**
 * 2. OTP Verify karne ka Route
 * Frontend fetch: /api/otp/verify
 * Note: Yeh route "Incorrect OTP" alert ko fix karne ke liye zaroori hai
 */
router.post("/verify", verifyOTP);

module.exports = router;