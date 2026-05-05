const express = require("express");
const { getHomeStorefront } = require("../controllers/storefrontController");

const router = express.Router();

router.get("/home", getHomeStorefront);

module.exports = router;
