const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { otpStore } = require("./otpController"); 

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ======================================================
// REGISTER USER (Email-Only OTP Verification)
// ======================================================
exports.registerUser = async (req, res) => {
  const { name, email, phone, password, otp } = req.body;

  try {
    // 1. Validation check
    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({ message: "Sabhi fields aur OTP bharna zaroori hai" });
    }

    // 2. User exists check
    const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: "User pehle se register hai" });
    }

    // 3. OTP VERIFICATION (Only using Email as Identifier)
    const identifier = email.toLowerCase().trim();
    const record = otpStore[identifier];

    if (!record) {
      return res.status(400).json({ message: "OTP record nahi mila. Phir se OTP bhejein." });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({ message: "Galat OTP enter kiya hai!" });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[identifier];
      return res.status(400).json({ message: "OTP expire ho gaya hai" });
    }

    // 4. Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
    });

    if (user) {
      delete otpStore[identifier]; // Success ke baad delete karein
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message || "Registration fail ho gaya" });
  }
};

// ======================================================
// LOGIN USER (Email-Only OTP Verification)
// ======================================================
exports.loginUser = async (req, res) => {
  const { email, otp } = req.body; 

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email aur OTP dono zaroori hain" });
    }

    const user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { phone: email }] 
    });

    if (!user) {
      return res.status(404).json({ message: "User nahi mila. Kripya pehle Register karein." });
    }

    // Login ke liye bhi sirf Email identifier check karein
    const identifier = user.email.toLowerCase().trim();
    const record = otpStore[identifier];

    if (!record) {
      return res.status(400).json({ message: "Login OTP record nahi mila." });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({ message: "Galat OTP! Kripya sahi OTP dalein." });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[identifier];
      return res.status(400).json({ message: "OTP expire ho gaya hai." });
    }

    delete otpStore[identifier];

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error ki wajah se login fail hua" });
  }
};