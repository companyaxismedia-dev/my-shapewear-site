const express = require("express");
const router = express.Router();

const { protect, admin } =
  require("../middleware/authMiddleware");

const adminController =
  require("../controllers/adminController");

// ================= ADMIN ROUTES =================
router.put(
  "/update-status",
  protect,
  admin,
  adminController.updateOrderStatus
);

module.exports = router;
