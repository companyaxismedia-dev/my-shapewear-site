const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

/* ================= GOOGLE CLIENT ================= */
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


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
    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({
        message: "Sabhi fields aur OTP zaroori hain",
      });
    }

    const userEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({
      $or: [{ email: userEmail }, { phone }],
    });

    if (userExists) {
      return res.status(400).json({
        message: "User pehle se register hai",
      });
    }

    const record = await Otp.findOne({ email: userEmail });

    if (!record) {
      return res.status(400).json({
        message: "OTP record nahi mila",
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

    const user = await User.create({
      name,
      email: userEmail,
      phone,
      password,
    });

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

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        message: "User nahi mila",
      });
    }

    const record = await Otp.findOne({ email: userEmail });
    if (!record) {
      return res.status(400).json({
        message: "OTP record nahi mila",
      });
    }

    if (Date.now() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({
        message: "OTP expire ho gaya",
      });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({
        message: "Galat OTP",
      });
    }

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
    console.error("Login OTP Error:", error);
    res.status(500).json({
      message: "Login fail hua",
    });
  }
};

/* ======================================================
   LOGIN USER (EMAIL + PASSWORD)
====================================================== */
exports.loginWithPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email aur password zaroori hain",
      });
    }

    const userEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        message: "User nahi mila",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Galat password",
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Password Error:", error);
    res.status(500).json({
      message: "Login fail hua",
    });
  }
};

/* ======================================================
   LOGIN WITH MOBILE + OTP
====================================================== */
exports.loginWithMobile = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    if (!phone || !otp) {
      return res.status(400).json({
        message: "Phone aur OTP zaroori hain",
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        message: "User nahi mila",
      });
    }

    const record = await Otp.findOne({ phone });
    if (!record) {
      return res.status(400).json({
        message: "OTP record nahi mila",
      });
    }

    if (Date.now() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({
        message: "OTP expire ho gaya",
      });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({
        message: "Galat OTP",
      });
    }

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
    console.error("Login Mobile Error:", error);
    res.status(500).json({
      message: "Login fail hua",
    });
  }
};

/* ======================================================
   GOOGLE LOGIN (DIRECT)
====================================================== */
exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential required",
      });
    }

    // Google token verify
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({
        message: "Google email not found",
      });
    }

    const userEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: userEmail });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email: userEmail,
        phone: undefined,
        password: Math.random().toString(36) + Date.now(),

      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({
      message: "Google login fail hua",
    });
  }
};


/* ======================================================
   FORGOT PASSWORD
====================================================== */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        message: "Email zaroori hai",
      });
    }

    const userEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        message: "User nahi mila",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: userEmail },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    console.log(`🔐 FORGOT OTP for ${userEmail}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent",
    });
  } catch (error) {
    res.status(500).json({
      message: "OTP send nahi hua",
    });
  }
};

/* ======================================================
   RESET PASSWORD
====================================================== */
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP aur new password zaroori hain",
      });
    }

    const userEmail = email.toLowerCase().trim();
    const record = await Otp.findOne({ email: userEmail });

    if (!record) {
      return res.status(400).json({
        message: "OTP record nahi mila",
      });
    }

    if (Date.now() > record.expiresAt) {
      await record.deleteOne();
      return res.status(400).json({
        message: "OTP expire ho gaya",
      });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({
        message: "Galat OTP",
      });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        message: "User nahi mila",
      });
    }

    user.password = newPassword;
    await user.save();

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Password reset fail hua",
    });
  }
};
