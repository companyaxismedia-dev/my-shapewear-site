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

/* 🔹 GET ALL PRODUCTS (Filter + Search + Pagination) */
router.get("/", getProducts);

/* 🔹 GET FEATURED PRODUCTS */
router.get("/featured", async (req, res) => {
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

/* 🔹 GET BEST SELLERS */
router.get("/best-sellers", async (req, res) => {
  try {
    const products = await Product.find({
      isBestSeller: true,
      isActive: true,
    }).sort({ rating: -1 });

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

/* 🔹 GET NEW ARRIVALS */
router.get("/new-arrivals", async (req, res) => {
  try {
    const products = await Product.find({
      isNewArrival: true,
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

/* 🔹 GET PRODUCTS BY CATEGORY */
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

/* 🔹 GET PRODUCT BY SLUG */
router.get("/slug/:slug", getProductBySlug);

/* 🔹 GET SINGLE PRODUCT BY ID */
router.get("/:id", getProductById);

/* ======================================================
   ADMIN ROUTES (PROTECTED)
====================================================== */

/* 🔹 ADMIN: GET ALL PRODUCTS (Active + Inactive) */
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

/* 🔹 ADMIN: RESTORE PRODUCT */
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

/* 🔹 ADMIN: TOGGLE FEATURED */
router.put("/admin/feature/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Feature status updated",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* 🔹 CREATE PRODUCT */
router.post("/", protect, admin, createProduct);

/* 🔹 UPDATE PRODUCT */
router.put("/:id", protect, admin, updateProduct);

/* 🔹 SOFT DELETE PRODUCT */
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
