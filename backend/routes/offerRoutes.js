const express = require("express");
const router = express.Router();

const { validateOffer } = require("../controllers/offerController");

router.post("/validate", validateOffer);

module.exports = router;
