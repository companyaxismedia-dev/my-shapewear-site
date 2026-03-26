const Product = require("../models/Product");

const parseCsv = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const buildProductFilter = (query = {}) => {
  const filter = { isActive: true, status: "published" };

  if (query.category) {
    filter.category = query.category;
  }

  if (query.subCategory) {
    const subCats = parseCsv(query.subCategory);
    if (subCats.length) {
      filter.subCategory = { $in: subCats };
    }
  }

  if (query.keyword) {
    const regex = new RegExp(query.keyword, "i");
    filter.$or = [{ name: regex }, { brand: regex }, { "variants.color": regex }];
  }

  if (query.minPrice || query.maxPrice) {
    filter.minPrice = {};

    if (query.minPrice !== undefined && query.minPrice !== "") {
      filter.minPrice.$gte = Number(query.minPrice);
    }

    if (query.maxPrice !== undefined && query.maxPrice !== "") {
      filter.minPrice.$lte = Number(query.maxPrice);
    }

    if (!Object.keys(filter.minPrice).length) {
      delete filter.minPrice;
    }
  }

  if (query.color) {
    const colors = parseCsv(query.color);
    if (colors.length) {
      filter["variants.color"] = { $in: colors };
    }
  }

  if (query.size) {
    const sizes = parseCsv(query.size);
    if (sizes.length) {
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
  }

  if (query.rating) {
    filter.rating = { $gte: Number(query.rating) };
  }

  if (query.discount) {
    filter.discount = { $gte: Number(query.discount) };
  }

  if (query.gender) {
    filter.gender = query.gender;
  }

  if (query.featured === "true") filter.isFeatured = true;
  if (query.bestSeller === "true") filter.isBestSeller = true;
  if (query.isNewArrival === "true") filter.isNewArrival = true;

  if (query.inStock === "true") {
    filter.totalStock = { $gt: 0 };
  }

  return filter;
};

/* ======================================================
   GET ALL PRODUCTS (ENTERPRISE FILTER SYSTEM)
====================================================== */
exports.getProducts = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 12, 1);
    const filter = buildProductFilter(req.query);

    /* ================= SORTING ================= */
    let sortOption = { createdAt: -1 };

    switch (req.query.sort) {
      case "priceLow":
      case "price_asc":
        sortOption = { minPrice: 1 };
        break;
      case "priceHigh":
      case "price_desc":
        sortOption = { minPrice: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "discount":
      case "discount_desc":
        sortOption = { discount: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .select("name slug thumbnail variants minPrice mrp discount rating numReviews shortDescription")
//       .select({
//   name: 1,
//   slug: 1,
//   thumbnail: 1,
//   minPrice: 1,
//   mrp: 1,
//   discount: 1,
//   rating: 1,
//   numReviews: 1,
//   shortDescription: 1,
//   "variants.images.url": 1,
// })
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

      res.json({
        success: true,
        products,
        page,
        pages: Math.ceil(total / limit),
        total,
        totalProducts: total,
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

exports.getProductFilterMeta = async (req, res) => {
  try {
    const query = { ...req.query };
    const categoryFilter = buildProductFilter(query);

    const subCategoryFilter = buildProductFilter({
      ...query,
      subCategory: "",
    });
    const colorFilter = buildProductFilter({
      ...query,
      color: "",
    });
    const sizeFilter = buildProductFilter({
      ...query,
      size: "",
    });
    const priceFilter = buildProductFilter({
      ...query,
      minPrice: "",
      maxPrice: "",
    });

    const [subcategories, colors, sizes, priceRange] = await Promise.all([
      Product.aggregate([
        { $match: subCategoryFilter },
        { $match: { subCategory: { $exists: true, $ne: "" } } },
        { $group: { _id: "$subCategory", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Product.aggregate([
        { $match: colorFilter },
        { $unwind: "$variants" },
        { $match: { "variants.color": { $exists: true, $ne: "" } } },
        {
          $group: {
            _id: {
              productId: "$_id",
              color: "$variants.color",
              colorCode: "$variants.colorCode",
            },
          },
        },
        {
          $group: {
            _id: "$_id.color",
            colorCode: { $first: "$_id.colorCode" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Product.aggregate([
        { $match: sizeFilter },
        { $unwind: "$variants" },
        { $unwind: "$variants.sizes" },
        { $match: { "variants.sizes.size": { $exists: true, $ne: "" } } },
        {
          $group: {
            _id: {
              productId: "$_id",
              size: "$variants.sizes.size",
            },
          },
        },
        {
          $group: {
            _id: "$_id.size",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Product.aggregate([
        { $match: priceFilter },
        {
          $group: {
            _id: null,
            min: { $min: "$minPrice" },
            max: { $max: "$minPrice" },
          },
        },
      ]),
    ]);

    const totalMatchingProducts = await Product.countDocuments(categoryFilter);

    res.json({
      success: true,
      totalMatchingProducts,
      subcategories: subcategories.map((item) => ({
        name: item._id,
        count: item.count,
      })),
      colors: colors.map((item) => ({
        name: item._id,
        colorCode: item.colorCode || "",
        count: item.count,
      })),
      sizes: sizes.map((item) => ({
        name: item._id,
        count: item.count,
      })),
      priceRange: {
        min: priceRange[0]?.min ?? 0,
        max: priceRange[0]?.max ?? 0,
      },
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

      if (!product || !product.isActive || product.status !== "published") {
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
        status: "published",
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


//  GET SIMILAR PRODUCTS 
exports.getSimilarProducts = async (req, res) => {
  try {
    const current = await Product.findById(req.params.id).lean();

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    // exclding current product

    // const candidates = await Product.find({
    //   _id: { $ne: current._id },
    //   isActive: true,
    // }).lean();
    const candidates = await Product.find(
      {
        _id: { $ne: current._id },
        isActive: true,
      },
      "name category minPrice slug variants rating brand"
    )
      .limit(80)
      .lean();

    const tokenize = (text = "") =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(" ")
        .filter((w) => w.length > 2);

    const currentTokens = tokenize(current.name);

    let scored = candidates.map((p) => {
      let score = 0;

      if (p.category === current.category) {
        score += 6;
      }
      const pTokens = tokenize(p.name);

      const matchedWords = currentTokens.filter((w) =>
        pTokens.includes(w)
      );

      score += matchedWords.length * 4;
      if (
        p.minPrice &&
        current.minPrice &&
        Math.abs(p.minPrice - current.minPrice) <= 500
      ) {
        score += 3;
      }

      return {
        ...p,
        finalScore: score,
      };
    });

    // match products logic
    let similar = scored
      .filter((p) => p.finalScore > 0)
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 12);

    // random products logic 
    // if (!similar.length) {
    //   similar = candidates
    //     .sort(() => 0.5 - Math.random())
    //     .slice(0, 12);
    // }
    if (!similar.length) {
      similar = await Product.aggregate([
        {
          $match: {
            _id: { $ne: current._id },
            isActive: true,
          },
        },
        { $sample: { size: 12 } },
      ]);
    }

    res.json({
      success: true,
      products: similar,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
