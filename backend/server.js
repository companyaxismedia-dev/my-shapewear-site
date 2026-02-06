const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Controllers
const { sendOTP, verifyOTP } = require("./controllers/otpController");

dotenv.config();
const app = express();

// --- 1. MIDDLEWARE ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// CORS Configuration - Added your GloviaGlamour domain here
app.use(cors({
    origin: [
         
        "https://www.gloviaglamour.com", // Screenshot image_5a8b41 ke mutabiq add kiya
        "https://gloviaglamour.com",
        "http://localhost:3000" 
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} request to ${req.url}`);
    next();
});

// --- 2. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅ (Glovia Glamour Active)"))
.catch((err) => {
    console.error("MongoDB Connection Error ❌:", err.message);
});

// --- 3. API ROUTES ---

// Health Check
app.get("/", (req, res) => res.status(200).send("Glovia Glamour API is running 🚀"));

// OTP ROUTES
app.post("/api/otp/send", sendOTP); 
app.post("/api/otp/verify", verifyOTP); 

// Feature Routes
// NOTE: Agar signup pe "Route not found" aa raha hai, toh frontend check karein:
// Kya aap http://localhost:5000/api/users/register par bhej rahe hain?
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/authRoutes")); // Iske andar /register define hona chahiye
app.use("/api/payment", require("./routes/paymentRoutes"));

// Static Folder for Uploads (Agar products ki images hain)
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// --- 4. ERROR HANDLING ---

// 404 Route Not Found
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.url} not found on this server` });
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