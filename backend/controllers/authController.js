const User = require("../models/User");
const jwt = require("jsonwebtoken");
// 🔹 otpStore ko import kiya taaki hum registration ke time OTP check kar sakein
const { otpStore } = require("./otpController"); 

// 🔹 Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// =======================
// REGISTER USER (Phone/Email + OTP Verification)
// =======================
exports.registerUser = async (req, res) => {
  const { name, email, phone, password, otp } = req.body;

  try {
    // 1. Basic Validations
    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({ message: "Sabhi fields aur OTP bharna zaroori hai" });
    }

    // 2. Check if user already exists (Email or Phone)
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: "User is email ya phone se pehle se hai" });
    }

    // 3. OTP VERIFICATION (Register hone ke liye OTP check hona zaroori hai)
    // Hum identifier mein 'phone' use kar rahe hain kyunki aapne kaha OTP phone pe jana chahiye
    const identifier = phone.toString().toLowerCase(); 
    const record = otpStore[identifier];

    if (!record) {
      return res.status(400).json({ message: "Kripya naya OTP mangwayein (No record found)" });
    }

    // Match OTP (User ka dala hua OTP vs Terminal mein aaya OTP)
    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({ message: "Galat OTP enter kiya hai!" });
    }

    // Check if OTP expired
    if (Date.now() > record.expiresAt) {
      delete otpStore[identifier];
      return res.status(400).json({ message: "OTP expire ho gaya hai, please resend" });
    }

    // 4. Create User (Jab OTP sahi hoga, tabhi yahan tak code chalega)
    const user = await User.create({
      name,
      email,
      phone,
      password,
    });

    if (user) {
      // Success hone par OTP store se saaf karein
      delete otpStore[identifier];

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
    res.status(500).json({ message: error.message || "Registration Error" });
  }
};

// =======================
// LOGIN USER (Email ya Phone dono support karega)
// =======================
exports.loginUser = async (req, res) => {
  const { email, password } = req.body; // Yahan 'email' field mein user phone bhi daal sakta hai

  try {
    // Login check: Database mein ya toh Email mile ya Phone number mile
    const user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { phone: email }] 
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email/phone or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};