const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();

/* ======================================================
   🔐 SECURITY MIDDLEWARE (PRODUCTION LEVEL)
====================================================== */

// ⚠️ IMPORTANT (Railway / Render / Vercel pe required)
app.set("trust proxy", 1);

// 1️⃣ Helmet (Security headers)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2️⃣ Global Rate Limit (Basic protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// 3️⃣ OTP Rate Limit (Brute force protection)
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Bahut zyada OTP attempts. 5 minute baad try karein.",
  },
});

// 4️⃣ Login Rate Limit
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Zyada login attempts. Thodi der baad try karein.",
  },
});

/* ======================================================
   📦 NORMAL MIDDLEWARE
====================================================== */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5000",
      "https://my-shapewear-site.vercel.app",
      "https://gloviaglamour.com",
      "https://www.gloviaglamour.com",
      /\.vercel\.app$/,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ======================================================
   🗄 DATABASE
====================================================== */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* ======================================================
   🛣 ROUTES
====================================================== */

app.get("/", (req, res) => {
  res.status(200).send("🚀 Glovia Glamour API Running");
});

/* ================= OTP ROUTES ================= */
app.use("/api/otp", otpLimiter, require("./routes/otpRoutes"));

/* ================= AUTH ROUTES ================= */
app.use("/api/users", loginLimiter, require("./routes/authRoutes"));

/* ================= PRODUCT ROUTES ================= */
app.use("/api/products", require("./routes/productRoutes"));

/* ================= ORDER ROUTES ================= */
app.use("/api/orders", require("./routes/orderRoutes"));

/* ================= CART ROUTES ================= */
app.use("/api/cart", require("./routes/cartRoutes"));

/* ================= WISHLIST ROUTES ================= */
app.use("/api/wishlist", require("./routes/wishlistRoutes"));

/* ================= ADMIN ORDER ROUTES ================= */
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));

/* ================= ADDRESS ROUTES ================= */
app.use("/api/users", require("./routes/userAddressRoutes"));

/* ================= STATIC ================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================================================
   ❌ ERROR HANDLING
====================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* ======================================================
   🚀 START SERVER
====================================================== */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("=================================");
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED ERROR:", err.message);
  server.close(() => process.exit(1));
});
