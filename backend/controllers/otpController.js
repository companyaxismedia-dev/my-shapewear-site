const nodemailer = require("nodemailer");

// In-memory store (Server restart hone par ye khaali ho jayega)
const otpStore = {}; 

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Port 465 ke liye true (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Aapka 16-digit App Password
  },
  tls: {
    rejectUnauthorized: false // Cloud servers (Render) par SSL handshake fast karne ke liye
  },
  connectionTimeout: 10000, // 10 seconds tak try karega, fir error de dega
});

// --- OTP BHEJNE KA LOGIC ---
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: "Email zaroori hai" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  const identifier = email.toLowerCase().trim();

  // OTP ko store karna (5 minutes expiry ke saath)
  otpStore[identifier] = {
    otp: otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  try {
    await transporter.sendMail({
      from: `"Glovia Glamour" <${process.env.EMAIL_USER}>`,
      to: identifier,
      subject: "Verification Code - Glovia Glamour",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; border: 1px solid #e91e63; border-radius: 10px; max-width: 500px;">
          <h2 style="color: #E91E63; text-align: center;">Glovia Glamour</h2>
          <p style="font-size: 16px; color: #333;">Aapka verification code niche diya gaya hai:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="background: #fce4ec; color: #E91E63; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 5px; border: 1px dashed #E91E63;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 12px; color: #777; text-align: center;">Ye code 5 minutes mein expire ho jayega. Agar aapne ye request nahi ki, toh is email ko ignore karein.</p>
        </div>
      `,
    });

    console.log(`✅ OTP sent to ${identifier}: ${otp}`);
    return res.status(200).json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.error("❌ Nodemailer Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Email bhejte waqt error aaya. Check your App Password." 
    });
  }
};

// --- OTP VERIFY KARNE KA LOGIC ---
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email aur OTP dono zaroori hain" });
  }

  const identifier = email.toLowerCase().trim();
  const record = otpStore[identifier];

  if (!record) {
    return res.status(400).json({ success: false, message: "Pehle OTP request karein" });
  }

  // Time check
  if (Date.now() > record.expiresAt) {
    delete otpStore[identifier]; // Purana OTP hatao
    return res.status(400).json({ success: false, message: "OTP expire ho gaya hai" });
  }

  // OTP match check
  if (String(record.otp) === String(otp)) {
    // Verification successful - OTP ko store se hata do taaki reuse na ho sake
    delete otpStore[identifier]; 
    return res.status(200).json({ success: true, message: "OTP Verified Successfully" });
  } else {
    return res.status(400).json({ success: false, message: "Galat OTP dala gaya hai" });
  }
};

// Is store ko doosre controllers (jaise user register) mein use karne ke liye export
exports.otpStore = otpStore;