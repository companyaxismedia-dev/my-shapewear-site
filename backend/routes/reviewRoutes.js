const express = require("express");
const router = express.Router();
const { getHomeReviews } = require("../controllers/reviewController");

router.get("/home", getHomeReviews);

module.exports = router;