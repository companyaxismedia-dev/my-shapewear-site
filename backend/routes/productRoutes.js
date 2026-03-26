const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

const {
  getProducts,
  getProductFilterMeta,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getSimilarProducts
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");

/* ======================================================
   PUBLIC ROUTES
====================================================== */

/* 🔹 GET ALL PRODUCTS (Filter + Search + Pagination) */
router.get("/", getProducts);
router.get("/filters-meta", getProductFilterMeta);

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

/* ======================================================
   🔥 FILTER OPTIONS (ALL COLORS + SIZES)
====================================================== */

router.get("/filters", async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    });

    const colors = new Set();
    const sizes = new Set();

    products.forEach((product) => {
      product.variants?.forEach((variant) => {

        // COLORS
        if (variant.color) {
          colors.add(variant.color);
        }

        // SIZES
        variant.sizes?.forEach((s) => {
          if (s.size) sizes.add(s.size);
        });

      });
    });

    res.status(200).json({
      success: true,
      colors: [...colors],
      sizes: [...sizes],
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* 🔹 GET SUBCATEGORIES BY CATEGORY */
router.get("/subcategories", async (req, res) => {
  try {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const products = await Product.find({
      category: category,
      isActive: true,
    });

    const subCategories = new Set();
    products.forEach((product) => {
      if (product.subCategory) {
        subCategories.add(product.subCategory);
      }
    });

    res.status(200).json({
      success: true,
      subcategories: [...subCategories].map((name) => ({ name })),
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

/* 🔹 GET SIMILAR PRODUCTS */
router.get("/similar/:id", getSimilarProducts);

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
