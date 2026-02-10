require("dotenv").config();
const { Resend } = require("resend");
const Otp = require("../models/Otp");

const resend = new Resend(process.env.RESEND_API_KEY);

/* =====================================================
   POST /api/otp/send   (AMAZON STYLE)
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

    const userEmail = email.toLowerCase().trim();

    // 2️⃣ Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    console.log(`🔐 OTP for ${userEmail}: ${otp}`);

    // 3️⃣ Save OTP (UPSERT)
    await Otp.findOneAndUpdate(
      { email: userEmail },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // 4️⃣ Send OTP Email (RESEND)
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
            Please do not share this OTP with anyone.
          </p>
        </div>
      `,
    });

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
   POST /api/otp/verify
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

    // 2️⃣ Find OTP
    const record = await Otp.findOne({ email: userEmail });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP nahi mila, dobara OTP bhejein",
      });
    }

    // 3️⃣ Expiry check
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

    // 5️⃣ Success → delete OTP
    await Otp.deleteOne({ email: userEmail });

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
