const nodemailer = require("nodemailer");

const otpStore = {}; 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email zaroori hai" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  const identifier = email.toLowerCase().trim();

  otpStore[identifier] = {
    otp: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  try {
    await transporter.sendMail({
      from: `"Glovia Glamour" <${process.env.EMAIL_USER}>`, // Variable use kiya
      to: identifier,
      subject: "Your Verification Code - Glovia Glamour",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #E91E63;">Glovia Glamour</h2>
          <p>Aapka verification code niche diya gaya hai:</p>
          <h1 style="background: #f4f4f4; padding: 10px; display: inline-block;">${otp}</h1>
          <p>Ye code 5 minutes mein expire ho jayega.</p>
        </div>
      `,
    });

    console.log(`🔑 OTP sent to ${identifier}: ${otp}`);
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ success: false, message: "Email bhejte waqt error aaya" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const identifier = email.toLowerCase().trim();
  const record = otpStore[identifier];

  if (!record) {
    return res.status(400).json({ success: false, message: "OTP record nahi mila" });
  }

  if (String(record.otp) === String(otp)) {
    if (Date.now() > record.expiresAt) {
      delete otpStore[identifier];
      return res.status(400).json({ success: false, message: "OTP expire ho gaya" });
    }
    return res.status(200).json({ success: true, message: "OTP Verified" });
  } else {
    return res.status(400).json({ success: false, message: "Galat OTP" });
  }
};

exports.otpStore = otpStore;