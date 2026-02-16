const express = require("express");
const router = express.Router();

/* ===============================
   CONTROLLERS IMPORT 
================================ */
const {
  registerUser,
  loginUser,
  loginWithPassword,
  googleLogin,
  forgotPassword,
  verifyResetOTP,   // ✅ FROM AUTH CONTROLLER
  resetPassword,
} = require("../controllers/authController");

const {
  sendOTP,
  verifyOTP,
} = require("../controllers/otpController");

/* ===============================
   🆕 REGISTER
================================ */
router.post("/register", registerUser);

/* ===============================
   🔐 LOGIN (PASSWORD)
================================ */
router.post("/login", loginWithPassword);

/* ===============================
   🔐 LOGIN WITH OTP FLOW
================================ */
router.post("/login/send-otp", sendOTP);
router.post("/login/verify-otp", loginUser);

/* ===============================
   🔐 GOOGLE LOGIN
================================ */
router.post("/google", googleLogin);

/* ===============================
   🔁 PASSWORD RESET FLOW
================================ */
router.post("/password/forgot", forgotPassword);
router.post("/password/verify-otp", verifyResetOTP);
router.post("/password/reset", resetPassword);

module.exports = router;
