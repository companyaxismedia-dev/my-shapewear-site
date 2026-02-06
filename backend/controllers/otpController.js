const nodemailer = require("nodemailer");

// OTP ko memory mein save karne ke liye
const otpStore = {}; 

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gloviaglamour9@gmail.com",
    pass: "uvqz owgw yvep xapy",
  },
});

// 1. SEND OTP
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email zaroori hai" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  const identifier = email.toLowerCase().trim();

  // Store OTP with expiry (5 mins)
  otpStore[identifier] = {
    otp: otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  try {
    await transporter.sendMail({
      from: '"Glovia Glamour" <gloviaglamour9@gmail.com>',
      to: identifier,
      subject: "Your Verification Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `<b>Your OTP is ${otp}</b>`,
    });

    console.log(`🔑 OTP for ${identifier}: ${otp}`); // Debugging ke liye terminal mein
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email bhejte waqt error aaya" });
  }
};

// 2. VERIFY OTP (Iska hona zaroori hai routes ke liye)
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
    // Verify hone par delete na karein agar aapko registration mein dobara check karna hai
    return res.status(200).json({ success: true, message: "OTP Verified" });
  } else {
    return res.status(400).json({ success: false, message: "Galat OTP" });
  }
};

// Isse export karna zaroori hai taaki authController ise use kar sake
exports.otpStore = otpStore;