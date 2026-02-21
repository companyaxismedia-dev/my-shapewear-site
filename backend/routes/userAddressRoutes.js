const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");

/* =====================================================
   ADDRESS ROUTES (AMAZON STYLE)
===================================================== */

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
   UPDATE ADDRESS (IMPORTANT)
   PUT /api/users/address/:id
=============================== */
router.put("/address/:id", protect, updateAddress);

/* ===============================
   DELETE ADDRESS
   DELETE /api/users/address/:id
=============================== */
router.delete("/address/:id", protect, deleteAddress);

/* ===============================
   SET DEFAULT ADDRESS
   PATCH /api/users/address/default/:id
=============================== */
router.patch("/address/default/:id", protect, setDefaultAddress);

module.exports = router;
