const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  loginWithPassword,
  loginWithMobile,
  googleLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

/* ===============================
   🆕 REGISTER
   Email + Password + OTP
================================ */
router.post("/register", registerUser);

/* ===============================
   🔐 LOGIN METHODS
================================ */

// 1️⃣ Email + OTP
router.post("/login", loginUser);

// 2️⃣ Email + Password
router.post("/login/password", loginWithPassword);

// 3️⃣ Mobile + OTP
router.post("/login/mobile", loginWithMobile);

// 4️⃣ Google Direct Login
router.post("/login/google", googleLogin);

/* ===============================
   🔁 FORGOT PASSWORD FLOW
================================ */

// Send OTP for reset
router.post("/forgot-password", forgotPassword);

// Reset password using OTP
router.post("/reset-password", resetPassword);

module.exports = router;
