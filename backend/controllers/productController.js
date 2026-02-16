const Product = require("../models/Product");

/* ======================================================
   GET ALL PRODUCTS (FILTER + PAGINATION + SORT)
====================================================== */
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 12, 1);

    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.keyword) {
  const searchRegex = new RegExp(req.query.keyword, "i");

  filter.$or = [
    { name: searchRegex },
    { brand: searchRegex },
    { description: searchRegex },
    { category: searchRegex },
    { details: { $elemMatch: { $regex: searchRegex } } },
    { "variants.color": searchRegex }
  ];
}

// ✅ PRICE FILTER
if (req.query.minPrice || req.query.maxPrice) {
  filter.price = {};

  if (req.query.minPrice) {
    filter.price.$gte = Number(req.query.minPrice);
  }

  if (req.query.maxPrice) {
    filter.price.$lte = Number(req.query.maxPrice);
  }
}

// ✅ RATING FILTER
if (req.query.rating) {
  filter.rating = { $gte: Number(req.query.rating) };
}

// ✅ FEATURED FILTER
if (req.query.featured === "true") {
  filter.isFeatured = true;
}

// ✅ COLOR FILTER (Exact Match)
if (req.query.color) {
  filter["variants.color"] = req.query.color;
}

// ✅ SIZE FILTER
if (req.query.size) {
  filter.variants = {
    $elemMatch: {
      sizes: {
        $elemMatch: { size: req.query.size }
      }
    }
  };
}


    let sortOption = { createdAt: -1 };

    if (req.query.sort === "price") sortOption = { price: 1 };
    if (req.query.sort === "-price") sortOption = { price: -1 };
    if (req.query.sort === "rating") sortOption = { rating: -1 };

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter).lean()

      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

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
    res.status(500).json({
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
    const {
      name,
      category,
      brand,
      description,
      details,
      variants,
      images,
      price,
      mrp,
      isFeatured,
      isActive,
    } = req.body;

    if (!name || !category || !variants || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name, category and variants are required",
      });
    }

    // Auto slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");

    const slugExists = await Product.findOne({ slug });

    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: "Product with similar name already exists",
      });
    }

    // Validate variant price
    for (let variant of variants) {
      if (!variant.price) {
        return res.status(400).json({
          success: false,
          message: "Each variant must contain price",
        });
      }
    }

    const product = new Product({
      name,
      slug,
      category,
      brand,
      description,
      details,
      variants,
      images,
      price,
      mrp,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true,
    });

    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      product: createdProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/* ======================================================
   UPDATE PRODUCT (ADMIN SAFE)
====================================================== */
/* ======================================================
   UPDATE PRODUCT (ADMIN SAFE - FINAL FIXED)
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

    // If body empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided",
      });
    }

    // Slug duplicate check (safe)
    if (req.body.slug && req.body.slug !== product.slug) {
      const slugExists = await Product.findOne({
        slug: req.body.slug,
      });

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "Slug already exists",
        });
      }
    }

    // Update dynamically
    Object.keys(req.body).forEach((key) => {
      product[key] = req.body[key];
    });

    const updatedProduct = await product.save();

    res.json({
      success: true,
      product: updatedProduct,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


/* ======================================================
   SOFT DELETE PRODUCT
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
