const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Offer = require("../models/Offer");

/* ======================================================
   🧠 DASHBOARD
====================================================== */
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const sales = await Order.aggregate([
      { $match: { status: "Delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    const lowStock = await Product.find({
      totalStock: { $lt: 5 },
      isActive: true,
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales: sales[0]?.total || 0,
      },
      recentOrders,
      lowStock,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   📊 SALES GRAPH
====================================================== */
exports.getSalesGraph = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          sales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   🛒 PRODUCTS
====================================================== */

// exports.createProduct = async (req, res) => {
//   try {
//     const data = req.body;

//     if (!data.name || !data.category || !data.variants?.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, category & variants required",
//       });
//     }

//     const slug = data.name
//       .toLowerCase()
//       .replace(/[^a-z0-9 ]/g, "")
//       .replace(/\s+/g, "-");

//     const exists = await Product.findOne({ slug });

//     if (exists) {
//       return res.status(400).json({
//         success: false,
//         message: "Product already exists",
//       });
//     }

//     const product = await Product.create({
//       ...data,
//       slug,
//       isActive: true,
//     });

//     res.status(201).json({
//       success: true,
//       product,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

exports.createProduct = async (req, res) => {
  try {
    let data = req.body;

    // Parse JSON fields if sent as string (from FormData)
    const jsonFields = [
      "variants",
      "features",
      "materialCare",
      "sizeAndFits",
      "specifications",
      "metaKeywords",
      "offers",
      "serviceablePincodes",
    ];

    jsonFields.forEach((field) => {
      if (typeof data[field] === "string") {
        try {
          data[field] = JSON.parse(data[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
          data[field] = [];
        }
      }
    });

    if (!data.name || !data.category || !data.variants?.length) {
      return res.status(400).json({
        success: false,
        message: "Name, category & variants required",
      });
    }

    // Generate slug
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

    /* =========================================
       HANDLE VARIANT-WISE FILE UPLOADS
    ========================================== */
    // Keep a set of initialized variants to avoid over-clearing if there are multiple images for one variant
    const clearedImageVariants = new Set();

    if (req.files?.length) {
      req.files.forEach((file) => {
        const fieldName = file.fieldname;
        // examples: images_0, video_1

        const match = fieldName.match(/(images|video)_(\d+)/);

        if (match) {
          const type = match[1]; // images or video
          const variantIndex = parseInt(match[2]);

          if (!data.variants[variantIndex]) return;

          if (type === "images") {
            // Because the frontend sends local `blob:...` urls inside the JSON, we need to clear the array first,
            // but only once per variant, so we don't overwrite multiple legitimate uploads.
            if (!clearedImageVariants.has(variantIndex)) {
              data.variants[variantIndex].images = [];
              clearedImageVariants.add(variantIndex);
            }

            if (!data.variants[variantIndex].images) {
              data.variants[variantIndex].images = [];
            }

            data.variants[variantIndex].images.push({
              url: `/${file.path.replace(/\\/g, "/")}`,
              altText: data.name,
              isPrimary: data.variants[variantIndex].images.length === 0,
              order: data.variants[variantIndex].images.length,
            });
          }

          if (type === "video") {
            data.variants[variantIndex].video = `/${file.path.replace(/\\/g, "/")}`;
          }
        }
      });
    }

    const product = await Product.create({
      ...data,
      slug,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false });

    // Multer saves file to uploads/products/images or uploads/products/videos
    const isVideo = req.file.mimetype.startsWith("video/");
    const basePath = isVideo
      ? "/uploads/products/videos/"
      : "/uploads/products/images/";
    const url = basePath + req.file.filename;

    res.json({
      success: true,
      url: url,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// exports.getAllProducts = async (req, res) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = 20;

//     const products = await Product.find()
//       .sort({ createdAt:-1 })
//       .skip((page-1)*limit)
//       .limit(limit);

//     res.json({ success:true, products });

//   } catch (err) {
//     res.status(500).json({ success:false, message: err.message });
//   }
// };

exports.getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const keyword = req.query.keyword || "";
    const categories = req.query.category ? req.query.category.split(",") : [];

    const filter = {};

    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    if (categories.length) {
      filter.category = { $in: categories };
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      // .select(
      //   "name slug category subCategory minPrice maxPrice totalStock thumbnail isActive createdAt",
      // )
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// exports.updateProduct = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     Object.keys(req.body).forEach((key) => {
//       product[key] = req.body[key];
//     });

//     await product.save();

//     res.json({
//       success: true,
//       product,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


exports.updateProduct = async (req, res) => {
  try {
    let data = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* =========================================
       PARSE JSON FIELDS (FROM FORMDATA)
    ========================================== */

    const jsonFields = [
      "variants",
      "features",
      "materialCare",
      "sizeAndFits",
      "specifications",
      "metaKeywords",
      "offers",
      "serviceablePincodes",
    ];

    jsonFields.forEach((field) => {
      if (typeof data[field] === "string") {
        try {
          data[field] = JSON.parse(data[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
          data[field] = [];
        }
      }
    });

    /* =========================================
       UPDATE SLUG IF NAME CHANGED
    ========================================== */

    if (data.name && data.name !== product.name) {
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-");

      const exists = await Product.findOne({
        slug,
        _id: { $ne: product._id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Product with this name already exists",
        });
      }

      data.slug = slug;
    }

    /* =========================================
       HANDLE VARIANT FILE UPLOADS
    ========================================== */

    const clearedImageVariants = new Set();

    if (req.files?.length && data.variants?.length) {
      req.files.forEach((file) => {
        const fieldName = file.fieldname;

        const match = fieldName.match(/(images|video)_(\d+)/);

        if (match) {
          const type = match[1];
          const variantIndex = parseInt(match[2]);

          if (!data.variants[variantIndex]) return;

          if (type === "images") {
            if (!clearedImageVariants.has(variantIndex)) {
              data.variants[variantIndex].images = [];
              clearedImageVariants.add(variantIndex);
            }

            if (!data.variants[variantIndex].images) {
              data.variants[variantIndex].images = [];
            }

            data.variants[variantIndex].images.push({
              url: `/${file.path.replace(/\\/g, "/")}`,
              altText: data.name || product.name,
              isPrimary: data.variants[variantIndex].images.length === 0,
              order: data.variants[variantIndex].images.length,
            });
          }

          if (type === "video") {
            data.variants[
              variantIndex
            ].video =`/${file.path.replace(/\\/g, "/")}`;
          }
        }
      });
    }

    /* =========================================
       UPDATE PRODUCT DATA
    ========================================== */

    Object.keys(data).forEach((key) => {
      product[key] = data[key];
    });

    await product.save();

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

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

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   🗑 DELETE MULTIPLE PRODUCTS
====================================================== */
exports.deleteManyProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({
        success: false,
        message: "No products selected",
      });
    }

    await Product.updateMany({ _id: { $in: ids } }, { isActive: false });

    res.json({
      success: true,
      message: "Products deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// exports.deleteManyProducts = async (req, res) => {
//   try {
//     const { ids } = req.body;

//     await Product.updateMany(
//       { _id: { $in: ids } },
//       { isActive: false }
//     );

//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success:false, message: err.message });
//   }
// };

/* ======================================================
   📦 INVENTORY
====================================================== */

exports.updateInventory = async (req, res) => {
  try {
    const { variantIndex, sizeIndex, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.variants?.[variantIndex]) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant index",
      });
    }

    if (!product.variants[variantIndex].sizes?.[sizeIndex]) {
      return res.status(400).json({
        success: false,
        message: "Invalid size index",
      });
    }

    product.variants[variantIndex].sizes[sizeIndex].stock = stock;

    await product.save();

    res.json({
      success: true,
      message: "Inventory updated",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   ⭐ AUTO BEST SELLER
====================================================== */

exports.autoBestSeller = async (req, res) => {
  try {
    const bestProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.name",
          count: { $sum: "$products.quantity" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    for (const item of bestProducts) {
      await Product.updateMany({ name: item._id }, { isBestSeller: true });
    }

    res.json({ success: true, bestProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   📦 ORDERS
====================================================== */

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, trackingId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    if (trackingId) order.trackingId = trackingId;

    order.statusHistory.push({ status });

    await order.save();

    res.json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   👤 USERS
====================================================== */

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   🎁 OFFERS
====================================================== */

exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.json({ success: true, offer });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });

    res.json({ success: true, offers });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
