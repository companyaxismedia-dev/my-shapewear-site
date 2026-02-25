const Product = require("../models/Product");

/* ======================================================
   GET ALL PRODUCTS (ENTERPRISE FILTER SYSTEM)
====================================================== */
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 12, 1);

    const filter = { isActive: true };

    /* ================= CATEGORY ================= */
    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.subCategory) {
      const subCats = req.query.subCategory.split(",");
      filter.subCategory = { $in: subCats };
    }

    /* ================= SEARCH ================= */
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, "i");

      filter.$or = [
        { name: regex },
        { brand: regex },
        { "variants.color": regex },
      ];
    }

    /* ================= PRICE RANGE ================= */
    if (req.query.minPrice || req.query.maxPrice) {
      filter.minPrice = {};

      if (req.query.minPrice) {
        filter.minPrice.$gte = Number(req.query.minPrice);
      }

      if (req.query.maxPrice) {
        filter.minPrice.$lte = Number(req.query.maxPrice);
      }
    }

    /* ================= COLOR (MULTI SUPPORT) ================= */
    if (req.query.color) {
      const colors = req.query.color.split(",");
      filter["variants.color"] = { $in: colors };
    }

    /* ================= SIZE (MULTI SUPPORT) ================= */
    if (req.query.size) {
      const sizes = req.query.size.split(",");

      filter.variants = {
        $elemMatch: {
          sizes: {
            $elemMatch: {
              size: { $in: sizes },
              stock: { $gt: 0 },
            },
          },
        },
      };
    }

    /* ================= RATING ================= */
    if (req.query.rating) {
      filter.rating = { $gte: Number(req.query.rating) };
    }

    /* ================= DISCOUNT ================= */
    if (req.query.discount) {
      filter.discount = { $gte: Number(req.query.discount) };
    }

    /* ================= FLAGS ================= */
    if (req.query.featured === "true") filter.isFeatured = true;
    if (req.query.bestSeller === "true") filter.isBestSeller = true;
    if (req.query.newArrival === "true") filter.isNewArrival = true;

    /* ================= STOCK ================= */
    if (req.query.inStock === "true") {

      filter.totalStock = { $gt: 0 };
    }

    /* ================= SORTING ================= */
    let sortOption = { createdAt: -1 };

    switch (req.query.sort) {
      case "priceLow":
        sortOption = { minPrice: 1 };
        break;
      case "priceHigh":
        sortOption = { minPrice: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "discount":
        sortOption = { discount: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .select("name slug thumbnail minPrice mrp discount rating numReviews")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      products,
      page,
      pages: Math.ceil(total / limit),
      totalProducts: total,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
  GET PRODUCT BY ID
====================================================== */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Product ID",
    });
  }
};

/* ======================================================
  GET PRODUCT BY SLUG
====================================================== */
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
  CREATE PRODUCT (ADMIN)
====================================================== */
exports.createProduct = async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.category || !data.variants?.length) {
      return res.status(400).json({
        success: false,
        message: "Name, category and variants required",
      });
    }

    /* AUTO SLUG */
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");

    const exists = await Product.findOne({ slug });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }

    const product = new Product({
      ...data,
      slug,
      isFeatured: data.isFeatured || false,
      isActive: data.isActive ?? true,
    });

    const created = await product.save();

    res.status(201).json({
      success: true,
      product: created,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   UPDATE PRODUCT
====================================================== */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (req.body.slug && req.body.slug !== product.slug) {
      const slugExists = await Product.findOne({ slug: req.body.slug });
      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "Slug already exists",
        });
      }
    }

    Object.keys(req.body).forEach((key) => {
      product[key] = req.body[key];
    });

    const updated = await product.save();

    res.json({
      success: true,
      product: updated,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   ADD REVIEW (AUTO RATING UPDATE)
====================================================== */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, userName } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.reviews.push({
      rating,
      comment,
      userName,
    });

    /* Update rating breakdown */
    if (rating === 5) product.ratingBreakdown.five++;
    if (rating === 4) product.ratingBreakdown.four++;
    if (rating === 3) product.ratingBreakdown.three++;
    if (rating === 2) product.ratingBreakdown.two++;
    if (rating === 1) product.ratingBreakdown.one++;

    await product.save();

    res.json({
      success: true,
      message: "Review added successfully",
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   SOFT DELETE
====================================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: "Product deactivated successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
