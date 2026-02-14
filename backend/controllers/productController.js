const Product = require("../models/Product");

/* ======================================================
   GET ALL PRODUCTS
====================================================== */
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 12, 1);

    const filter = { isActive: true };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Search by name
    if (req.query.keyword) {
      filter.name = {
        $regex: req.query.keyword,
        $options: "i",
      };
    }

    // Sorting
    let sortOption = { createdAt: -1 };

    if (req.query.sort === "price") {
      sortOption = { price: 1 };
    }

    if (req.query.sort === "-price") {
      sortOption = { price: -1 };
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
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
      message: error.message,
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
   CREATE PRODUCT
====================================================== */
exports.createProduct = async (req, res) => {
  try {
    let {
      name,
      slug,
      category,
      brand,
      description,
      variants,
      images,
      price,
      mrp,
      discount,
      isFeatured,
      isActive,
    } = req.body;

    if (!name || !category || !variants || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name, category and variants are required",
      });
    }

    // Auto slug generate if not provided
    if (!slug) {
      slug = name.toLowerCase().replace(/ /g, "-");
    }

    const slugExists = await Product.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: "Slug already exists",
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
      variants,
      images,
      price,
      mrp,
      discount,
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true,
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

    // Prevent duplicate slug on update
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

    Object.assign(product, req.body);

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

    // Soft delete
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
