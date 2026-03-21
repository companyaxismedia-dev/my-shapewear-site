const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { updateProfile, getProfile } = require("../controllers/authController");
const {
	addAddress,
	getAddresses,
	updateAddress,
	deleteAddress,
	setDefaultAddress,
} = require("../controllers/addressController");

// Profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Address routes
router.post("/address", protect, addAddress);
router.get("/address", protect, getAddresses);
router.put("/address/:id", protect, updateAddress);
router.delete("/address/:id", protect, deleteAddress);
router.patch("/address/default/:id", protect, setDefaultAddress);

module.exports = router;
