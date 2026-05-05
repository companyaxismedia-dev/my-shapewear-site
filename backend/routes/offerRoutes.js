const express = require("express");
const router = express.Router();

const {
  validateOffer,
  getOffers,
  getActiveOffer,
} = require("../controllers/offerController");

// Public storefront/account coupon list.
router.get("/", getOffers);

// Featured active offer used by checkout payment offer widget.
router.get("/active", getActiveOffer);

// Coupon validation used by cart and checkout.
router.post("/validate", validateOffer);

module.exports = router;
