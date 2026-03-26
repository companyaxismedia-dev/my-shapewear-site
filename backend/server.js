const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { default: connectDB } = require("./config/db");

// const cache  = new NodeCache();
dotenv.config();

const app = express();

// app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://my-shapewear-site.vercel.app",
  "https://www.damietree.com"
];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    console.log("CORS Blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());

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
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

/* ======================================================
   DATABASE CONNECTION (Production Safe)
====================================================== */

// mongoose
//   .connect(process.env.MONGO_URI, {
//     autoIndex: false,
//   })
//   .then(() => {
//     console.log("MongoDB Connected");
//   })
//   .catch((err) => {
//     console.error("MongoDB Error:", err.message);
//     process.exit(1);
//   });
connectDB();

app.use(
  "/image",
  express.static(path.join(__dirname, "../frontend/public/image"))
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Glovia Glamour Enterprise API Running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/otp", require("./routes/otpRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/offers", require("./routes/offerRoutes"));

const { bannerRouter, adminRouter, pagesRouter } = require("./routes/bannerRoutes");
app.use("/api/banner", bannerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/pages", pagesRouter);

/* ================= PAYMENT ================= */
app.use("/api/payment", require("./routes/paymentRoutes"));

/* ================= chat us ================= */
app.use("/api/chat", require("./routes/chatRoutes"));

/* ================= SUPPORT ================= */
app.use("/api/support", require("./routes/ticketRoutes"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// cache.clear();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log(`Server running on port ${PORT}`);
  console.log("=================================");
});

/* ======================================================
   GRACEFUL SHUTDOWN
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
