const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Offer = require("../models/Offer");


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

exports.createProduct = async (req, res) => {
  try {
    let data = req.body;

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
      if (typeof data[field] === "string" && data[field].trim() !== "") {
        try {
          data[field] = JSON.parse(data[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
          data[field] = [];
        }
      } else if (typeof data[field] === "object" && data[field] !== null) {
        // already parsed or object
      } else {
        data[field] = [];
      }
    });

    // Only validate required fields if NOT saving as draft
    if (data.status !== "draft" && (!data.name || !data.category || !data.variants?.length)) {
      return res.status(400).json({
        success: false,
        message: "Name, category & variants required",
      });
    }

    // Generate slug - for drafts with no name, use timestamp + random id
    let slug;
    if (data.name && data.name.trim()) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-");
    } else {
      // Draft with no name - use timestamp to ensure uniqueness
      slug = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Only check for existing slug if not a draft (published products need unique names)
    if (data.status !== "draft") {
      const exists = await Product.findOne({ slug });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Product already exists",
        });
      }
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

    // For drafts, skip Mongoose validation; for published products, validate
    const productData = {
      ...data,
      slug,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    };

    let product;
    if (data.status === "draft") {
      // For drafts, bypass strict validation
      product = new Product(productData);
      await product.save({ validateBeforeSave: false });
    } else {
      // For published products, enforce validation
      product = await Product.create(productData);
    }

    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    console.error("Error in createProduct:", err);
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

exports.getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const keyword = req.query.keyword || "";
    const categories = req.query.category ? req.query.category.split(",") : [];

    // ONLY show published products, not drafts
    const filter = {
      status: "published",
    };

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
      if (typeof data[field] === "string" && data[field].trim() !== "") {
        try {
          data[field] = JSON.parse(data[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
          data[field] = [];
        }
      } else if (typeof data[field] === "object" && data[field] !== null) {
        // already parsed or object
      } else {
        data[field] = [];
      }
    });

    //update the slugif the name chnaged
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
      //  HANDLE VARIANT FILE UPLOADS
      
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

    // Don't allow overwriting createdBy
    delete data.createdBy;

    Object.keys(data).forEach((key) => {
      product[key] = data[key];
    });

    // Set updatedBy to current admin
    product.updatedBy = req.user._id;

    await product.save();

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    console.error("Error in updateProduct:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

  //  deleting multiple products
exports.deleteManyProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({
        success: false,
        message: "No products selected",
      });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


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
    product.updatedBy = req.user._id;

    await product.save();

    res.json({
      success: true,
      message: "Inventory updated",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


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
      await Product.updateMany(
        { name: item._id },
        { isBestSeller: true, updatedBy: req.user._id }
      );
    }

    res.json({ success: true, bestProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


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


exports.getDraftProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const keyword = req.query.keyword || "";

    const filter = {
      status: "draft",
      createdBy: req.user._id,
    };

    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    const total = await Product.countDocuments(filter);

    const drafts = await Product.find(filter)
      .select("name thumbnail minPrice totalStock category createdAt createdBy")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      drafts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDraft = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    // Verify it's a draft and owned by current user
    if (product.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "This product is not in draft status",
      });
    }

    if (product.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own draft products",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.publishDraft = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Verify ownership
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only publish your own draft products",
      });
    }

    // Validate required fields
    if (!product.name || !product.category || !product.variants?.length) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled before publishing",
      });
    }

    // Check if all variants have at least one image
    const hasMissingImages = product.variants.some(v => !v.images || v.images.length === 0);
    if (hasMissingImages) {
      return res.status(400).json({
        success: false,
        message: "All variants must have at least one image",
      });
    }

    product.status = "published";
    product.updatedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: "Product published successfully!",
      product,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDraft = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    // Verify ownership
    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own drafts",
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Draft deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteManyDrafts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !ids.length) {
      return res.status(400).json({
        success: false,
        message: "No drafts selected",
      });
    }

    // Only delete drafts created by current user
    const result = await Product.deleteMany({
      _id: { $in: ids },
      status: "draft",
      createdBy: req.user._id,
    });

    res.json({
      success: true,
      message: `${result.deletedCount} draft${result.deletedCount > 1 ? 's' : ''} deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
