const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const Product = require("../models/Product");

/* ======================================================
   PUBLIC ROUTES
====================================================== */

// 🔹 GET all products
// Example:
// /api/products?category=bra&keyword=lace&page=1&limit=12&sort=price
router.get("/", getProducts);

// 🔹 GET featured products
router.get("/featured/list", async (req, res) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({
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

    res.json({
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
// MUST be above /:id route
router.get("/slug/:slug", getProductBySlug);

// 🔹 GET product by ID
router.get("/:id", getProductById);


/* ======================================================
   ADMIN ROUTES
====================================================== */

// 🔹 CREATE product
router.post("/", createProduct);

// 🔹 UPDATE product
router.put("/:id", updateProduct);

// 🔹 DELETE product
router.delete("/:id", deleteProduct);

module.exports = router;
