const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const itemController = require("../controllers/itemController");

// Cancel specific item
router.put("/:orderId/:itemIndex/cancel", protect, itemController.cancelItem);

// Request return for item
router.put("/:orderId/:itemIndex/return", protect, itemController.requestReturnItem);

// Request exchange for item
router.put("/:orderId/:itemIndex/exchange", protect, itemController.requestExchangeItem);

// Get item details
router.get("/:orderId/:itemIndex", protect, itemController.getItemDetails);

module.exports = router;
