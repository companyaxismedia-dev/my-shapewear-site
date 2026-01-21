const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// --- CORS UPDATE ---
// Isse aapka frontend backend se sahi se connect ho payega
app.use(cors({
  origin: [
    "https://www.bootybloom.online", 
    "https://bootybloom.online", 
    "http://localhost:3000" // Development ke liye localhost bhi rakha hai
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Error ❌", err.message);
    process.exit(1); // Connection fail hone par server stop ho jaye
  });

// Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/authRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));

app.get("/", (req, res) => res.send("API is running 🚀 (Booty Bloom Live)"));

// --- PORT FIX ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // Live server par localhost nahi dikhayega, isliye ye log better hai
  console.log(`Server is running on port: ${PORT}`);
});