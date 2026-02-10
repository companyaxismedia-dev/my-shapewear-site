const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");

/* ================= EMAIL TRANSPORTER ================= */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =====================================================
   POST /api/otp/send
===================================================== */
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email zaroori hai",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email service not configured",
      });
    }

    const userEmail = email.toLowerCase().trim();

    // 2️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    console.log(`🔐 OTP for ${userEmail}: ${otp}`);

    // 3️⃣ Save OTP in MongoDB (UPSERT)
    await Otp.findOneAndUpdate(
      { email: userEmail },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // 4️⃣ Send Email
    await transporter.sendMail({
      from: `"Glovia Glamour" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Verification Code - Glovia Glamour",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2 style="color:#E91E63;">Glovia Glamour</h2>
          <p>Your verification code is:</p>
          <h1>${otp}</h1>
          <p style="font-size:12px;">
            This OTP is valid for 5 minutes.
          </p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("❌ OTP SEND ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "OTP send failed",
    });
  }
};

/* =====================================================
   POST /api/otp/verify   (OPTIONAL)
===================================================== */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1️⃣ Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email aur OTP dono zaroori hain",
      });
    }

    const userEmail = email.toLowerCase().trim();

    // 2️⃣ Find OTP in DB
    const record = await Otp.findOne({ email: userEmail });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP nahi mila, dobara OTP bhejein",
      });
    }

    // 3️⃣ Expiry Check
    if (Date.now() > record.expiresAt) {
      await Otp.deleteOne({ email: userEmail });
      return res.status(400).json({
        success: false,
        message: "OTP expire ho chuka hai",
      });
    }

    // 4️⃣ Match OTP
    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Galat OTP",
      });
    }

    // 5️⃣ Success → Delete OTP
    await Otp.deleteOne({ email: userEmail });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("❌ OTP VERIFY ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "OTP verify failed",
    });
  }
};
