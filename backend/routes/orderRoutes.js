const express = require("express");
const router = express.Router();

const {
   createOrder,
   getMyOrders,
   getAllOrders,
   trackOrder,
   updateOrderStatus,
   getOrderById,
   cancelOrder,   
   updateOrderAddress,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");


router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);

router.get("/track/:id", protect, trackOrder);



router.get("/admin/all", protect, admin, getAllOrders);

router.put("/admin/update-status", protect, admin, updateOrderStatus);

router.put("/cancel/:id", protect, cancelOrder);

router.put("/update-address/:id", protect, updateOrderAddress);

router.get("/:id", protect, getOrderById);



module.exports = router;
