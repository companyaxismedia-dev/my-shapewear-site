const express = require("express");
const router = express.Router();

/* ===============================
   CONTROLLERS IMPORT 
================================ */
const {
  registerUser,
  loginUser,            // Email + OTP login
  loginWithPassword,    // Email/Mobile + Password
  googleLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  sendOTP,
  verifyOTP,
  verifyResetOTP,   // 🔥 NEW (reset token generator)
} = require("../controllers/otpController");

/* ===============================
   🆕 REGISTER
   Email + Password + OTP
================================ */
router.post("/register", registerUser);

/* ===============================
   🔐 LOGIN (PASSWORD)
   Email + Password
   Mobile + Password
   FRONTEND: POST /api/auth/login
================================ */
router.post("/login", loginWithPassword);

/* ===============================
   🔐 LOGIN WITH OTP FLOW
================================ */

// Step 1 → Send OTP
// FRONTEND: POST /api/auth/login/send-otp
router.post("/login/send-otp", sendOTP);

// Step 2 → Verify OTP + Login
// FRONTEND: POST /api/auth/login/verify-otp
router.post("/login/verify-otp", loginUser);

/* ===============================
   🔐 GOOGLE LOGIN
   FRONTEND: POST /api/auth/google
================================ */
router.post("/google", googleLogin);

/* ===============================
   🔁 PASSWORD RESET FLOW (Amazon Style)
================================ */

// Step 1 → Send OTP for reset
// FRONTEND: POST /api/auth/password/forgot
router.post("/password/forgot", forgotPassword);

// Step 2 → Verify OTP → returns resetToken
// FRONTEND: POST /api/auth/password/verify-otp
router.post("/password/verify-otp", verifyResetOTP);

// Step 3 → Reset Password using resetToken
// FRONTEND: POST /api/auth/password/reset
router.post("/password/reset", resetPassword);

module.exports = router;
