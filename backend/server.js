const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

dotenv.config();

const app = express();

/* ======================================================
   🔐 SECURITY MIDDLEWARE
====================================================== */

app.set("trust proxy", 1);

// Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Compression
app.use(compression());

/* ======================================================
   ✅ RATE LIMIT (SMART FIX)
   Development me disable
   Production me enable
====================================================== */

if (process.env.NODE_ENV === "production") {
  console.log("🔐 Production Mode → Rate Limit Enabled");

  // Global limiter
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // OTP limiter
  const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
  });

  // Login limiter
  const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
  });

  app.use("/api/otp", otpLimiter, require("./routes/otpRoutes"));
  app.use("/api/auth", loginLimiter, require("./routes/authRoutes"));

} else {
  console.log("🛠 Development Mode → Rate Limit Disabled");

  app.use("/api/otp", require("./routes/otpRoutes"));
  app.use("/api/auth", require("./routes/authRoutes"));
}

/* ======================================================
   📦 NORMAL MIDDLEWARE
====================================================== */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://my-shapewear-site.vercel.app",
      "https://gloviaglamour.com",
      "https://www.gloviaglamour.com",
      /\.vercel\.app$/,
    ],
    credentials: true,
  })
);

// Logger
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
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
   🛣 OTHER ROUTES
====================================================== */

app.get("/", (req, res) => {
  res.status(200).send("🚀 Glovia Glamour API Running");
});

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));
app.use("/api/users", require("./routes/userAddressRoutes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ======================================================
   ❌ ERROR HANDLING
====================================================== */

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
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

// Unhandled Rejection
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED ERROR:", err);
  server.close(() => process.exit(1));
});
