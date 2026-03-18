const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* =========================================
   🔐 PROTECT MIDDLEWARE
========================================= */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Token check from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ No token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    // 5️⃣ Attach user
    req.user = user;

    return next(); // 🔥 IMPORTANT
  } catch (error) {
    console.error("JWT Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid or expired",
    });
  }
};

/* =========================================
   👑 ADMIN MIDDLEWARE
========================================= */
const admin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admins only",
      });
    }

    return next(); // 🔥 IMPORTANT
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin middleware error",
    });
  }
};

/* =========================================
   EXPORT (IMPORTANT FIX)
========================================= */
const verifyAdmin = [protect, admin];
module.exports = { protect, admin, verifyAdmin };
