const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Controllers ko import karein - verifyOTP yahan add kiya hai
const { sendOTP, verifyOTP } = require("./controllers/otpController");

dotenv.config();
const app = express();

// --- 1. MIDDLEWARE ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// CORS Configuration
app.use(cors({
    origin: [
        "https://www.bootybloom.online", 
        "https://bootybloom.online", 
        "http://localhost:3000" 
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Request Logger (Terminal check ke liye)
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} request to ${req.url}`);
    next();
});

// --- 2. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅ (Booty Bloom DB Active)"))
.catch((err) => {
    console.error("MongoDB Connection Error ❌:", err.message);
});

// --- 3. API ROUTES ---

// Health Check
app.get("/", (req, res) => res.status(200).send("Booty Bloom API is running 🚀"));

/**
 * OTP ROUTES 
 * Pehle sirf send tha, ab verify bhi add kar diya hai 
 * taaki 404 Route Not Found error na aaye
 */
app.post("/api/otp/send", sendOTP); 
app.post("/api/otp/verify", verifyOTP); 

// Feature Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/authRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

// --- 4. ERROR HANDLING ---

// 404 Route Not Found (Agar route define nahi hoga toh ye chalega)
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Internal Server Error 🚨:", err.stack);
    res.status(500).json({ 
        success: false, 
        message: "Something went wrong on the server!",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// --- 5. SERVER START ---
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`----------------------------------------`);
    console.log(`🚀 Server running on port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`----------------------------------------`);
});

// Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
    console.log(`Critical Error: ${err.message}`);
    server.close(() => process.exit(1));
});