const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

/* ================= GOOGLE CLIENT ================= */
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= TOKEN ================= */
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in .env");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/* ======================================================
   REGISTER USER (EMAIL + OTP)
====================================================== */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, otp } = req.body;

    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({ message: "All fields and OTP required" });
    }

    const userEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({
      $or: [{ email: userEmail }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const record = await Otp.findOne({ email: userEmail });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await record.deleteOne();
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.create({
      name,
      email: userEmail,
      phone,
      password,
    });

    await record.deleteOne();

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email or phone already registered",
      });
    }

    return res.status(500).json({
      message: error.message || "Registration failed",
    });
  }
};

/* ======================================================
   LOGIN (PASSWORD)
====================================================== */
exports.loginWithPassword = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({
        message: "Email/Phone and password required",
      });
    }

    let user;

    if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ======================================================
   LOGIN WITH OTP
====================================================== */
exports.loginUser = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;

    if ((!email && !phone) || !otp) {
      return res.status(400).json({
        message: "Email/Phone and OTP required",
      });
    }

    let user;
    let record;

    if (email) {
      const userEmail = email.toLowerCase().trim();
      user = await User.findOne({ email: userEmail });
      record = await Otp.findOne({ email: userEmail });
    }

    if (phone) {
      user = await User.findOne({ phone });
      record = await Otp.findOne({ phone });
    }

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!record) return res.status(400).json({ message: "OTP not found" });

    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await record.deleteOne();
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await record.deleteOne();

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("OTP LOGIN ERROR:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ======================================================
   GOOGLE LOGIN
====================================================== */
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const userEmail = payload.email.toLowerCase().trim();

    let user = await User.findOne({ email: userEmail });

    if (!user) {
      user = await User.create({
        name: payload.name || "Google User",
        email: userEmail,
        password: Math.random().toString(36) + Date.now(),
      });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);
    return res.status(500).json({ message: "Google login failed" });
  }
};

/* ======================================================
   FORGOT PASSWORD
====================================================== */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const userEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: userEmail },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    console.log("🔐 Reset OTP:", otp);

    return res.status(200).json({
      success: true,
      message: "Reset OTP sent",
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ======================================================
   VERIFY RESET OTP
====================================================== */
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "All fields required" });
    }

    const userEmail = email.toLowerCase().trim();
    const record = await Otp.findOne({ email: userEmail });

    if (!record) return res.status(400).json({ message: "OTP not found" });

    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await record.deleteOne();
      return res.status(400).json({ message: "OTP expired" });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const resetToken = jwt.sign(
      { email: userEmail },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    await record.deleteOne();

    return res.status(200).json({
      success: true,
      resetToken,
    });

  } catch (error) {
    console.error("VERIFY RESET OTP ERROR:", error);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

/* ======================================================
   RESET PASSWORD
====================================================== */
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decoded.email });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }
};
