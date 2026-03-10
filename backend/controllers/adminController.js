const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Offer = require("../models/Offer");
const mongoose = require('mongoose');


// dynamic controller to fetch the counts in the amdin panel
exports.getCounts = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      { $match: { status: "Order Placed" } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$finalAmount" },
        }
      }
    ])

    const totalSales = sales.length ? sales[0].totalSales : 0;
    const totalCustomers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const recentOrdersRaw = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("userInfo.name finalAmount status");

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: "#" + o._id.toString().slice(-10),
      customer: o.userInfo?.name || "Customer",
      amount: o.finalAmount,
      status: o.status,
    }));

    // fetch last 3 published products for recent products section
    const recentProductsRaw = await Product.find({ status: "published", isActive: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("_id name thumbnail minPrice maxPrice totalStock category variants");

    const recentProducts = recentProductsRaw.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      image: p.thumbnail || (p.variants?.[0]?.images?.[0] || null),
      price: p.minPrice || p.maxPrice || 0,
      stock: p.totalStock,
      category: p.category,
    }));

    const lowStock = await Product.find({
      totalStock: { $lt: 5 },
      isActive: true,
    }).sort({ totalStock: 1 })
      .limit(3);

    res.json({
      success: true, totalSales, totalCustomers,
      totalProducts, totalOrders, recentOrders, recentProducts, lowStock
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSalesGraph = async (req, res) => {
  try {
    const { period } = req.query;

    let startDate = new Date();
    let groupFormat = "%d %b"; // Apr 18

    if (period === "7days") {
      startDate.setDate(startDate.getDate() - 6);
    } else {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }

    const sales = await Order.aggregate([
      {
        $match: {
          // status: "Delivered",
          status: "Order Placed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$createdAt" },
          },
          sales: { $sum: "$finalAmount" || "$totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const formatted = sales.map((s) => ({
      date: s._id,
      sales: s.sales,
    }));

    res.json({
      success: true,
      data: formatted,
    });
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
            // Only clear blob URLs (pending client uploads), keep real file paths from database
            if (!clearedImageVariants.has(variantIndex)) {
              if (data.variants[variantIndex].images) {
                // Filter out blob URLs but keep existing file paths
                data.variants[variantIndex].images = data.variants[variantIndex].images.filter(
                  img => !img.url?.startsWith('blob:')
                );
              } else {
                data.variants[variantIndex].images = [];
              }
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
        } else if (fieldName === "thumbnailFile") {
          // Handle thumbnail file upload
          data.thumbnail = `/${file.path.replace(/\\/g, "/")}`;
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

    const productsRaw = await Product.find(filter)
      .sort({ createdAt: -1 })
      .select("_id name slug category minPrice maxPrice totalStock thumbnail isActive createdAt variants")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Map products to include image field with fallback
    const products = productsRaw.map((p) => ({
      ...p,
      image: p.thumbnail || (p.variants?.[0]?.images?.[0]?.url || null),
    }));

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
            // Only clear blob URLs (pending client uploads), keep real file paths from database
            if (!clearedImageVariants.has(variantIndex)) {
              if (data.variants[variantIndex].images) {
                // Filter out blob URLs but keep existing file paths
                data.variants[variantIndex].images = data.variants[variantIndex].images.filter(
                  img => !img.url?.startsWith('blob:')
                );
              } else {
                data.variants[variantIndex].images = [];
              }
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
            ].video = `/${file.path.replace(/\\/g, "/")}`;
          }
        } else if (fieldName === "thumbnailFile") {
          // Handle thumbnail file upload
          data.thumbnail = `/${file.path.replace(/\\/g, "/")}`;
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

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const { startDate, endDate, status } = req.query;

    const filter = {};

    if (search) {
      filter["userInfo.name"] = { $regex: search, $options: "i" };
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    // Status filter: support explicit status, comma-separated list, or special token 'Unfulfilled'
    if (status && status !== "All") {
      const statuses = status.split(",").map((s) => s.trim()).filter(Boolean);
      if (statuses.length === 1) {
        if (statuses[0] === "Unfulfilled") {
          filter.status = { $ne: "Delivered" };
        } else {
          filter.status = statuses[0];
        }
      } else if (statuses.length > 1) {
        // If the list includes 'Unfulfilled' together with explicit statuses,
        // build an $or that matches either the explicit statuses or any non-Delivered status.
        if (statuses.includes("Unfulfilled")) {
          const explicit = statuses.filter((s) => s !== "Unfulfilled");
          const ors = [];
          if (explicit.length) ors.push({ status: { $in: explicit } });
          ors.push({ status: { $ne: "Delivered" } });
          filter.$or = ors;
        } else {
          filter.status = { $in: statuses };
        }
      }
    }
    const total = await Order.countDocuments(filter);

    const ordersRaw = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const orders = ordersRaw.map((o) => ({
      id: "#" + o._id.toString().slice(-4),
      orderId: o._id,
      date: o.createdAt,
      customer: o.userInfo?.name || "Customer",
      payment: o.paymentStatus,
      total: o.finalAmount,
      items: o.products?.length || 0,
      status: o.status,
    }));

    res.json({
      success: true,
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/orders/details
exports.getOrdersDetails = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: "ids array required" });
    }

    const orders = await Order.find({ _id: { $in: ids } }).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let match = {};

    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    /* ================= TOTAL ORDERS ================= */
    const totalOrders = await Order.countDocuments(match);

    /* ================= ORDER ITEMS OVER TIME ================= */
    const orderItems = await Order.aggregate([
      { $match: match },
      { $unwind: "$products" },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          items: { $sum: "$products.quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* ================= RETURN ORDERS ================= */
    const returnOrders = await Order.countDocuments({
      ...match,
      status: "Cancelled",
    });

    /* ================= FULFILLED ORDERS ================= */
    const fulfilledOrders = await Order.aggregate([
      {
        $match: {
          ...match,
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      totalOrders,
      orderItems,
      returnOrders,
      fulfilledOrders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
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

/*
  GET /api/admin/customers
  Returns paginated customers with order count, total spent and last activity
*/
exports.getCustomers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const match = { role: "user" };
    if (search) {
      const regex = new RegExp(search, "i");
      match.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "orders",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$userId", "$$userId"] } } },
            { $group: { _id: null, orders: { $sum: 1 }, totalSpent: { $sum: { $ifNull: ["$finalAmount", 0] } }, lastOrder: { $max: "$createdAt" } } },
          ],
          as: "ordersMeta",
        },
      },
      { $addFields: { ordersMeta: { $arrayElemAt: ["$ordersMeta", 0] } } },
      { $project: { password: 0 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const results = await User.aggregate(pipeline);

    // total count for pagination
    const total = await User.countDocuments(match);

    const users = results.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt,
      status: u.status || (u.isDeleted ? 'deleted' : 'active'),
      isDeleted: u.isDeleted || false,
      orders: (u.ordersMeta && u.ordersMeta.orders) || 0,
      totalSpent: (u.ordersMeta && u.ordersMeta.totalSpent) || 0,
      lastActivity: u.lastActivity || (u.ordersMeta && u.ordersMeta.lastOrder) || null,
    }));

    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* POST /api/admin/customers/details */
exports.getCustomersDetails = async (req, res) => {
  try {
    const ids = req.body.ids || [];
    if (!ids.length) return res.json({ success: true, users: [] });
    const users = await User.find({ _id: { $in: ids } }).select('-password');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* GET /api/admin/customers/:id
   Returns a detailed customer view including orders, totals and spending over time */
exports.getCustomerById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const orders = await Order.find({ userId: id }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((s, o) => s + (o.finalAmount || 0), 0);
    const completedOrders = orders.filter((o) => o.status === 'Delivered').length;

    // Spending over last 12 months
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const spendingAgg = await Order.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(id), createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: { $ifNull: ['$finalAmount', 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // build monthly series for last 12 months
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) });
    }

    const spendingOverTime = months.map((m) => {
      const found = spendingAgg.find((a) => a._id.year === m.year && a._id.month === m.month);
      return { label: m.label, total: found ? found.total : 0 };
    });

    res.json({ success: true, user, orders, totalOrders, totalSpent, completedOrders, spendingOverTime });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
  DELETE /api/admin/users/:id
  Delete a user (admin)
*/
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Soft delete: mark as deleted but keep data
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.status = 'deleted';
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Toggle between active and suspended for admin quick toggle
    if (user.status === 'active') user.status = 'inactive';
    else if (user.status === 'inactive') user.status = 'active';
    else user.status = 'inactive';

    await user.save();
    res.json({ success: true, status: user.status });
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

