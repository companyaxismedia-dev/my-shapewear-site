const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// GET USER CART
router.get("/", protect, cartController.getCart);

// ADD ITEM
router.post("/", protect, cartController.addItemToCart);

// UPDATE QUANTITY
router.put("/:itemId", protect, cartController.updateQty);
router.put("/size/:itemId", protect, cartController.updateSize);


// REMOVE SINGLE ITEM
router.delete("/:itemId", protect, cartController.deleteItemFromCart);

module.exports = router;
