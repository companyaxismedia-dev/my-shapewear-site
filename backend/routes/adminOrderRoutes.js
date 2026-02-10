const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { updateOrderStatus } = require("../controllers/orderController");

// ================= ADMIN ROUTES =================
router.put("/update-status", protect, admin, updateOrderStatus);

module.exports = router;
