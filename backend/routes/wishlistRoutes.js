const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

/* =====================================================
   ❤️ TOGGLE WISHLIST (ADD / REMOVE)  — AMAZON STYLE
   POST /api/wishlist/toggle
   🔒 Login required
===================================================== */
router.post("/toggle", protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    // product exist check (important)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await User.findById(req.user._id);

    const alreadyAdded = user.wishlist.includes(productId);

    if (alreadyAdded) {
      // REMOVE
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== productId.toString()
      );

      await user.save();

      return res.status(200).json({
        success: true,
        action: "removed",
        message: "Product removed from wishlist",
      });
    } else {
      // ADD
      user.wishlist.push(productId);
      await user.save();

      return res.status(200).json({
        success: true,
        action: "added",
        message: "Product added to wishlist",
      });
    }
  } catch (error) {
    console.error("❌ WISHLIST TOGGLE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =====================================================
   📋 GET USER WISHLIST
   GET /api/wishlist
   🔒 Login required
===================================================== */
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");

    res.status(200).json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("❌ GET WISHLIST ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =====================================================
   ❌ REMOVE FROM WISHLIST (DIRECT)
   DELETE /api/wishlist/remove/:productId
   🔒 Login required
===================================================== */
router.delete("/remove/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("❌ REMOVE WISHLIST ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
