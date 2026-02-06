const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Get user from the token (Optimized: Check if user still exists)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: "User belongs to this token no longer exists." 
        });
      }

      next();
    } catch (error) {
      console.error("JWT Error:", error.message);
      return res.status(401).json({ 
        success: false, 
        message: "Not authorized, token invalid or expired" 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Not authorized, no token provided" 
    });
  }
};

// 🔐 Admin check (Added safety check)
exports.admin = (req, res, next) => {
  // Check if req.user exists and role is exactly 'admin'
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Access denied: Admins only" 
    });
  }
};