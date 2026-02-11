const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");


 
// Load env FIRST
dotenv.config();

const { sendOTP, verifyOTP } = require("./controllers/otpController.js");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
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

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* -------------------- DATABASE -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* -------------------- ROUTES -------------------- */
app.get("/", (req, res) => {
  res.status(200).send("🚀 Glovia Glamour API Running");
});

// OTP
app.post("/api/otp/send", sendOTP);
app.post("/api/otp/verify", verifyOTP);

// Other routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/authRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", require("./routes/userAddressRoutes"));



// / --- ADD THIS LINE FOR CART ---
app.use("/api/cart", require("./routes/cartRoutes"));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------- ERROR HANDLING -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* -------------------- START SERVER -------------------- */
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
