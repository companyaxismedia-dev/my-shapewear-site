const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");

/* ================= TOKEN ================= */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* ======================================================
   REGISTER USER (EMAIL + OTP)
====================================================== */
exports.registerUser = async (req, res) => {
  const { name, email, phone, password, otp } = req.body;

  try {
    /* ---------- VALIDATION ---------- */
    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({
        message: "Sabhi fields aur OTP zaroori hain",
      });
    }

    const userEmail = email.toLowerCase().trim();

    /* ---------- USER EXISTS ---------- */
    const userExists = await User.findOne({
      $or: [{ email: userEmail }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({
        message: "User pehle se register hai",
      });
    }

    /* ---------- OTP VERIFY (DB) ---------- */
    const record = await Otp.findOne({ email: userEmail });

    if (!record) {
      return res.status(400).json({
        message: "OTP record nahi mila, dobara OTP bhejein",
      });
    }

    if (Date.now() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({
        message: "OTP expire ho gaya hai",
      });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({
        message: "Galat OTP",
      });
    }

    /* ---------- CREATE USER ---------- */
    const user = await User.create({
      name,
      email: userEmail,
      phone,
      password,
    });

    // OTP delete after success
    await record.deleteOne();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Registration fail ho gaya",
    });
  }
};

/* ======================================================
   LOGIN USER (EMAIL + OTP)
====================================================== */
exports.loginUser = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email aur OTP dono zaroori hain",
      });
    }

    const userEmail = email.toLowerCase().trim();

    /* ---------- FIND USER ---------- */
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        message: "User nahi mila, pehle register karein",
      });
    }

    /* ---------- OTP VERIFY (DB) ---------- */
    const record = await Otp.findOne({ email: userEmail });

    if (!record) {
      return res.status(400).json({
        message: "Login OTP record nahi mila",
      });
    }

    if (Date.now() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({
        message: "OTP expire ho gaya hai",
      });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({
        message: "Galat OTP",
      });
    }

    // OTP delete after success
    await record.deleteOne();

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
    res.status(500).json({
      message: "Server error ki wajah se login fail hua",
    });
  }
};36
