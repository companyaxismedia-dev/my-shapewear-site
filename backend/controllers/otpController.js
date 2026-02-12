require("dotenv").config();
const { Resend } = require("resend");
const Otp = require("../models/Otp");

const resend = new Resend(process.env.RESEND_API_KEY);

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

      // Future SMS integration (Twilio etc)
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
   POST /api/otp/verify  (EMAIL + MOBILE SUPPORT)
   WITH LOCK SYSTEM
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

    /* ================= LOCK CHECK ================= */
    if (record.isLocked()) {
      return res.status(403).json({
        success: false,
        message: "Zyada galat attempts. 10 minute baad try karein.",
      });
    }

    /* ================= EXPIRY CHECK ================= */
    if (Date.now() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({
        success: false,
        message: "OTP expire ho chuka hai",
      });
    }

    /* ================= MATCH OTP ================= */
    if (String(record.otp) !== String(otp)) {
      await record.incrementAttempts();
      return res.status(400).json({
        success: false,
        message: "Galat OTP",
      });
    }

    /* ================= SUCCESS ================= */
    await record.resetAttempts();
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
