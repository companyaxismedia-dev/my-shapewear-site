const nodemailer = require("nodemailer");

// In-memory OTP store
const otpStore = {};

/* ---------------- SEND OTP ---------------- */
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email zaroori hai",
      });
    }

    // 🔐 ENV SAFETY CHECK (VERY IMPORTANT)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ EMAIL ENV NOT LOADED");
      return res.status(500).json({
        success: false,
        message: "Email service not configured",
      });
    }

    const identifier = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (5 min expiry)
    otpStore[identifier] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    // 🔥 CREATE TRANSPORTER AT RUNTIME (FIX)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Glovia Glamour" <${process.env.EMAIL_USER}>`,
      to: identifier,
      subject: "Verification Code - Glovia Glamour",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:#E91E63;">Glovia Glamour</h2>
          <p>Aapka verification code:</p>
          <h1>${otp}</h1>
          <p style="font-size:12px;">Code 5 minutes mein expire ho jayega.</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent to ${identifier}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("❌ OTP SEND ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "OTP send karne mein problem aayi",
    });
  }
};

/* ---------------- VERIFY OTP ---------------- */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email aur OTP dono zaroori hain",
      });
    }

    const identifier = email.toLowerCase().trim();
    const record = otpStore[identifier];

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Pehle OTP request karein",
      });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[identifier];
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

    delete otpStore[identifier];

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("❌ OTP VERIFY ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "OTP verify karne mein error",
    });
  }
};

exports.otpStore = otpStore;
