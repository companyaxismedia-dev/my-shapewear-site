const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ===============================
// 🔹 Middlewares
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// 🔹 MongoDB Connection (FIXED)
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error ❌", error.message);
  });

// ===============================
// 🔹 Routes
// ===============================
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/authRoutes"));
// Routes ke neeche ise add karein
app.use("/api/payment", require("./routes/paymentRoutes"));

// ===============================
// 🔹 Test Route
// ===============================
app.get("/", (req, res) => {
  res.send("API is running successfully 🚀");
});

// ===============================
// 🔹 Server Start
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
