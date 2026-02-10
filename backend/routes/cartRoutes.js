const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// 1️⃣ GET LOGGED-IN USER CART
// GET /api/cart
router.get("/", protect, cartController.getCart);

// 2️⃣ ADD TO CART
// POST /api/cart/add
router.post("/add", protect, cartController.addItemToCart);

// 3️⃣ REMOVE ITEM FROM CART
// DELETE /api/cart/remove/:productId
router.delete(
  "/remove/:productId",
  protect,
  cartController.deleteItemFromCart
);

module.exports = router;
