const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    /* ===============================
       EMAIL SUPPORT
    =============================== */
    email: {
      type: String,
      lowercase: true,
      index: true,
      sparse: true,
    },

    /* ===============================
       MOBILE SUPPORT
    =============================== */
    phone: {
      type: String,
      index: true,
      sparse: true,
    },

    /* ===============================
       OTP VALUE
    =============================== */
    otp: {
      type: String,
      required: true,
    },

    /* ===============================
       EXPIRY TIME (5 min etc)
    =============================== */
    expiresAt: {
      type: Date,
      required: true,
    },

    /* ===============================
       🔐 SECURITY UPGRADE
    =============================== */

    // Wrong OTP attempt counter
    attempts: {
      type: Number,
      default: 0,
    },

    // Account temporary lock
    lockedUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ===============================
   AUTO DELETE AFTER EXPIRY
================================ */
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* ======================================================
   🔐 METHOD: Check if OTP is locked
====================================================== */
otpSchema.methods.isLocked = function () {
  if (!this.lockedUntil) return false;
  return Date.now() < this.lockedUntil;
};

/* ======================================================
   🔐 METHOD: Increase Failed Attempt
====================================================== */
otpSchema.methods.incrementAttempts = async function () {
  this.attempts += 1;

  // If 5 wrong attempts → lock for 10 minutes
  if (this.attempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 min lock
    this.attempts = 0; // reset attempts after locking
  }

  await this.save();
};

/* ======================================================
   🔐 METHOD: Reset attempts after success
====================================================== */
otpSchema.methods.resetAttempts = async function () {
  this.attempts = 0;
  this.lockedUntil = null;
  await this.save();
};

module.exports =
  mongoose.models.Otp || mongoose.model("Otp", otpSchema);
