const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  addAddress,
  getAddresses,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");

/* ===============================
   ADD NEW ADDRESS
   POST /api/users/address
=============================== */
router.post("/address", protect, addAddress);

/* ===============================
   GET ALL ADDRESSES
   GET /api/users/address
=============================== */
router.get("/address", protect, getAddresses);

/* ===============================
   DELETE ADDRESS
   DELETE /api/users/address/:id
=============================== */
router.delete("/address/:id", protect, deleteAddress);

/* ===============================
   SET DEFAULT ADDRESS
   PUT /api/users/address/default/:id
=============================== */
router.put("/address/default/:id", protect, setDefaultAddress);

module.exports = router;
