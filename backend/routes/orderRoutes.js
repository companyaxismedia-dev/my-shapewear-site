const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  trackOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/authMiddleware");

/* =====================================================
   1️⃣ CREATE ORDER (LOGIN USER)
   POST /api/orders
   🔒 Token required
   📦 Cart → Order → Cart Clear
===================================================== */
router.post("/", protect, createOrder);

/* =====================================================
   2️⃣ MY ORDERS (LOGIN USER)
   GET /api/orders/my-orders
===================================================== */
router.get("/my-orders", protect, getMyOrders);

/* =====================================================
   3️⃣ TRACK ORDER (GUEST / USER)
   GET /api/orders/track/:id
===================================================== */
router.get("/track/:id", trackOrder);

/* =====================================================
   4️⃣ ADMIN – GET ALL ORDERS
   GET /api/orders/admin/all
===================================================== */
router.get("/admin/all", protect, admin, getAllOrders);

/* =====================================================
   5️⃣ ADMIN – UPDATE ORDER STATUS
   PUT /api/orders/admin/update-status
===================================================== */
router.put("/admin/update-status", protect, admin, updateOrderStatus);

module.exports = router;
