require("dotenv").config();
const { Resend } = require("resend");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const User = require("../models/User");

/* =====================================================
   🔐 RESEND INITIALIZATION (Safe Mode)
===================================================== */

let resend;

if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY missing in .env");
} else {
  resend = new Resend(process.env.RESEND_API_KEY);
}

/* =====================================================
   POST /api/otp/send   (EMAIL + MOBILE SUPPORT)
===================================================== */
exports.sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email ya phone zaroori hai",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    /* ================= EMAIL OTP ================= */
    if (email) {
      const userEmail = email.toLowerCase().trim();

      console.log(`🔐 EMAIL OTP for ${userEmail}: ${otp}`);

      await Otp.findOneAndUpdate(
        { email: userEmail },
        {
          otp,
          expiresAt,
          attempts: 0,
          lockedUntil: null,
        },
        { upsert: true, new: true }
      );

      if (!resend) {
        return res.status(500).json({
          success: false,
          message: "Email service not configured",
        });
      }

      await resend.emails.send({
        from: process.env.OTP_FROM_EMAIL,
        to: [userEmail],
        subject: "Your Glovia Glamour verification code",
        html: `
          <div style="font-family: Arial; padding:20px;">
            <h2 style="color:#E91E63;">Glovia Glamour</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing:4px;">${otp}</h1>
            <p style="font-size:12px;color:#555;">
              This code is valid for 5 minutes.
            </p>
          </div>
        `,
      });
    }

    /* ================= MOBILE OTP ================= */
    if (phone) {
      console.log(`📱 MOBILE OTP for ${phone}: ${otp}`);

      await Otp.findOneAndUpdate(
        { phone },
        {
          otp,
          expiresAt,
          attempts: 0,
          lockedUntil: null,
        },
        { upsert: true, new: true }
      );

      // ⚠️ Yaha future me SMS integration laga sakte ho
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("❌ OTP SEND ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "OTP send failed",
    });
  }
};

/* =====================================================
   VERIFY OTP FOR LOGIN / REGISTER
===================================================== */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if ((!email && !phone) || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email/phone aur OTP zaroori hain",
      });
    }

    let record;

    if (email) {
      const userEmail = email.toLowerCase().trim();
      record = await Otp.findOne({ email: userEmail });
    }

    if (phone) {
      record = await Otp.findOne({ phone });
    }

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP nahi mila",
      });
    }

    if (Date.now() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({
        success: false,
        message: "OTP expire ho chuka hai",
      });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Galat OTP",
      });
    }

    await record.deleteOne();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("❌ OTP VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verify failed",
    });
  }
};

/* =====================================================
   VERIFY OTP FOR PASSWORD RESET
   RETURNS resetToken
===================================================== */
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email aur OTP zaroori hain",
      });
    }

    const userEmail = email.toLowerCase().trim();
    const record = await Otp.findOne({ email: userEmail });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    if (Date.now() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const resetToken = jwt.sign(
      { email: userEmail },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    await record.deleteOne();

    return res.status(200).json({
      success: true,
      resetToken,
    });

  } catch (error) {
    console.error("❌ RESET OTP VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Reset OTP verification failed",
    });
  }
};
