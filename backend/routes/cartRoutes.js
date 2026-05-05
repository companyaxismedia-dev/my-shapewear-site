const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// GET USER CART
router.get("/", protect, cartController.getCart);

// ADD ITEM
router.post("/", protect, cartController.addItemToCart);
router.post("/merge", protect, cartController.mergeItemsToCart);

// UPDATE QUANTITY
router.put("/:itemId", protect, cartController.updateQty);
router.put("/size/:itemId", protect, cartController.updateSize);

// APPLY / REMOVE COUPON
router.post("/coupon", protect, cartController.applyCoupon);
router.delete("/coupon", protect, cartController.removeCoupon);

// REMOVE SINGLE ITEM
router.delete("/:itemId", protect, cartController.deleteItemFromCart);

module.exports = router;
