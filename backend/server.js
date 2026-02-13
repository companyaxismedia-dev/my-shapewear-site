const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

dotenv.config();

const app = express();

/* ======================================================
   🔐 SECURITY MIDDLEWARE
====================================================== */

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());

/* ======================================================
   📦 NORMAL MIDDLEWARE
====================================================== */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Simple CORS (Local Development Safe)
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.gloviaglamour.com",
  "https://gloviaglamour.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);




// Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
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

// 🔹 OTP Routes (NO LIMIT)
app.use("/api/otp", require("./routes/otpRoutes"));

// 🔹 Auth Routes
app.use("/api/auth", require("./routes/authRoutes"));

// 🔹 Other Routes
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

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED ERROR:", err);
  server.close(() => process.exit(1));
});
