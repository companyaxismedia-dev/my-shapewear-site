const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

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

/* ================= RATE LIMIT ================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", limiter);

/* ======================================================
   📦 BODY PARSER
====================================================== */

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

/* ======================================================
   🌍 CORS CONFIGURATION
====================================================== */

const allowedOrigins = [
  "http://localhost:3000",
  "https://my-shapewear-site.vercel.app",
  "https://www.gloviaglamour.com",
  "https://gloviaglamour.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.includes("vercel.app")
      ) {
        return callback(null, true);
      }

      console.log("❌ CORS Blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ======================================================
   📝 REQUEST LOGGER
====================================================== */

app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

/* ======================================================
   🗄 DATABASE CONNECTION (Production Safe)
====================================================== */

mongoose
  .connect(process.env.MONGO_URI, {
    autoIndex: false,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* ======================================================
   🖼 STATIC FILE SERVING
====================================================== */

app.use(
  "/image",
  express.static(path.join(__dirname, "../frontend/public/image"))
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* ======================================================
   🛣 ROOT + HEALTH CHECK
====================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Glovia Glamour Enterprise API Running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* ======================================================
   📦 ROUTES
====================================================== */

/* ================= AUTH ================= */
app.use("/api/otp", require("./routes/otpRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

/* ================= PRODUCTS ================= */
/*
   Supports:
   - Multiple variants
   - Pincode check
   - Review system
   - Offer validation
   - Advanced filtering
*/
app.use("/api/products", require("./routes/productRoutes"));

/* ================= CART ================= */
app.use("/api/cart", require("./routes/cartRoutes"));

/* ================= WISHLIST ================= */
app.use("/api/wishlist", require("./routes/wishlistRoutes"));

/* ================= ORDERS ================= */
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));

/* ================= USERS ================= */
app.use("/api/users", require("./routes/userAddressRoutes"));

/* ======================================================
   ❌ 404 HANDLER
====================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ======================================================
   🔥 GLOBAL ERROR HANDLER
====================================================== */

app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);

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

/* ======================================================
   💥 GRACEFUL SHUTDOWN
====================================================== */

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED ERROR:", err.message);
  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
