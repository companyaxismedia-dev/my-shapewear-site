const express = require("express");
const router = express.Router();

const Product = require("../models/Product");

const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");

/* ======================================================
   PUBLIC ROUTES
====================================================== */

// 🔹 GET all active products
router.get("/", getProducts);

// 🔹 GET featured products
router.get("/featured/list", async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 GET products by category
router.get("/category/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 GET product by slug
router.get("/slug/:slug", getProductBySlug);

// 🔹 GET product by ID
router.get("/:id", getProductById);


/* ======================================================
   ADMIN ROUTES (Protected)
====================================================== */

// 🔹 ADMIN - Get all products (Active + Inactive)
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 ADMIN - Restore product (inactive → active)
router.put("/admin/restore/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = true;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product restored successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// 🔹 CREATE product
router.post("/", protect, admin, createProduct);

// 🔹 UPDATE product
router.put("/:id", protect, admin, updateProduct);

// 🔹 DELETE product (Soft delete)
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
