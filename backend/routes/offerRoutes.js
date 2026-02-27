const express = require("express");
const router = express.Router();

const {
  validateOffer,
  getOffers,
  createOffer,
} = require("../controllers/offerController");

/* ======================================================
   🎁 GET ALL ACTIVE OFFERS
   Frontend → MyCoupons page
====================================================== */
router.get("/", getOffers);

/* ======================================================
   ➕ CREATE NEW OFFER
   Admin / Postman
====================================================== */
router.post("/", createOffer);

/* ======================================================
   🎯 VALIDATE COUPON
   Checkout page
====================================================== */
router.post("/validate", validateOffer);

module.exports = router;