const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Offer = require("../models/Offer");
const mongoose = require('mongoose');
const ImportModel = require('../models/Import');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const {
  applyBulkItemStatus,
  buildOrderStatusHistory,
  getOrderDerivedStatus,
  orderMatchesStatus,
} = require("../utils/orderStatus");

function serializeOrder(orderDoc) {
  const order =
    typeof orderDoc?.toObject === "function" ? orderDoc.toObject() : orderDoc;
  const status = getOrderDerivedStatus(order?.products || []);
  const statusHistory = buildOrderStatusHistory(order?.products || []);

  return {
    ...order,
    finalAmount: order?.pricing?.totalAmount ?? order?.finalAmount ?? 0,
    status,
    statusHistory,
  };
}


// dynamic controller to fetch the counts in the amdin panel
exports.getCounts = async (req, res) => {
  try {
    // Get total sales from all orders
    const sales = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$finalAmount" },
        }
      }
    ]);

    const totalSales = sales.length && sales[0].totalSales ? sales[0].totalSales : 0;
    const totalCustomers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Fetch recent orders (up to 6)
    const recentOrdersRaw = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    const recentOrders = recentOrdersRaw.map((o) => ({
      id: "#" + o._id.toString().slice(-10),
      customer: o.userInfo?.name || "Customer",
      amount: o.finalAmount || o.totalAmount || 0,
      status: getOrderDerivedStatus(o.products || []),
    }));

    // Fetch last 3 published products for recent products section
    const recentProductsRaw = await Product.find({ status: "published", isActive: true })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const recentProducts = recentProductsRaw.map((p) => ({
      id: p._id.toString(),
      name: p.name || "Product",
      image: p.thumbnail || (p.variants?.[0]?.images?.[0]?.url) || null,
      price: p.minPrice || p.maxPrice || 0,
      stock: p.totalStock || 0,
      category: p.category || "N/A",
    }));

    // Fetch low stock products (less than 10 units)
    const lowStockRaw = await Product.find({
      totalStock: { $lt: 10 },
      isActive: true,
    })
      .sort({ totalStock: 1 })
      .limit(3)
      .lean();

    const lowStock = lowStockRaw.map((p) => ({
      _id: p._id.toString(),
      name: p.name || "Product",
      variant: p.category || "Unknown",
      totalStock: p.totalStock || 0,
    }));

    res.json({
      success: true,
      totalSales,
      totalCustomers,
      totalProducts,
      totalOrders,
      recentOrders,
      recentProducts,
      lowStock,
    });
  } catch (err) {
    console.error("Error in getCounts:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSalesGraph = async (req, res) => {
  try {
    const { period = "7days" } = req.query;

    let startDate = new Date();
    let groupFormat = "%d %b"; // Apr 18

    if (period === "7days") {
      startDate.setDate(startDate.getDate() - 6);
    } else if (period === "month") {
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }

    const sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupFormat, date: "$createdAt" },
          },
          sales: { $sum: { $ifNull: ["$finalAmount", { $ifNull: ["$totalAmount", 0] }] } },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const formatted = sales.map((s) => ({
      date: s._id,
      sales: Math.round(s.sales) || 0,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error("Error in getSalesGraph:", err);
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

    // Filter out blob URLs from thumbnail
    if (data.thumbnail && data.thumbnail.startsWith('blob:')) {
      data.thumbnail = "";
    }

    // Filter out blob URLs from variants
    if (Array.isArray(data.variants)) {
      data.variants = data.variants.map(v => ({
        ...v,
        images: Array.isArray(v.images)
          ? v.images.filter(img => img && img.url && !img.url.startsWith('blob:'))
          : [],
        video: (!v.video || v.video.startsWith('blob:')) ? "" : v.video,
      }));
    }

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

    // Filter out blob URLs from thumbnail
    if (data.thumbnail && data.thumbnail.startsWith('blob:')) {
      data.thumbnail = "";
    }

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

    // Filter out blob URLs from thumbnail
    if (data.thumbnail && data.thumbnail.startsWith('blob:')) {
      data.thumbnail = "";
    }

    // Filter out blob URLs from variants (from JSON body)
    if (Array.isArray(data.variants)) {
      data.variants = data.variants.map(v => ({
        ...v,
        images: Array.isArray(v.images)
          ? v.images.filter(img => img && img.url && !img.url.startsWith('blob:'))
          : [],
        video: (!v.video || v.video.startsWith('blob:')) ? "" : v.video,
      }));
    }

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
    const requestedStatuses = (status || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const ordersRaw = await Order.find(filter).sort({ createdAt: -1 });

    const filteredOrdersRaw = !requestedStatuses.length
      ? ordersRaw
      : ordersRaw.filter((order) =>
          requestedStatuses.some((requestedStatus) =>
            orderMatchesStatus(order.products, requestedStatus)
          )
        );

    const total = filteredOrdersRaw.length;

    const orders = filteredOrdersRaw
      .slice((page - 1) * limit, page * limit)
      .map((o) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      createdAt: o.createdAt,
      customer: o.userInfo?.name || "Customer",
      phone: o.userInfo?.phone || "",
      payment: o.payment?.status || "Pending",
      paymentMethod: o.payment?.method || "COD",
      total: o.pricing?.totalAmount ?? 0,
      items: o.products?.length || 0,
      status: getOrderDerivedStatus(o.products || []),
      shipment: o.shipment || {},
      products: (o.products || []).map((product, itemIndex) => ({
        itemIndex,
        name: product?.name || "Product",
        img: product?.img || "",
        size: product?.size || "",
        color: product?.color || "",
        quantity: product?.quantity || 1,
        price: product?.price || 0,
        lineTotal:
          product?.lineTotal || (product?.price || 0) * (product?.quantity || 1),
        itemStatus: product?.itemStatus || "Order Placed",
      })),
      userInfo: o.userInfo || {},
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

    const ordersRaw = await Order.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
    const orders = ordersRaw.map((o) => serializeOrder(o));
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

    const analyticsOrders = await Order.find(match).lean();

    const returnOrders = analyticsOrders.filter((order) =>
      ["Cancelled", "Returned"].includes(
        getOrderDerivedStatus(order.products || [])
      )
    ).length;

    const fulfilledCounts = new Map();
    for (const order of analyticsOrders) {
      const derivedStatus = getOrderDerivedStatus(order.products || []);
      if (derivedStatus !== "Delivered") continue;
      const day = new Date(order.createdAt).toISOString().slice(0, 10);
      fulfilledCounts.set(day, (fulfilledCounts.get(day) || 0) + 1);
    }

    const fulfilledOrders = [...fulfilledCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, count]) => ({ _id: day, count }));

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

    applyBulkItemStatus(order, status, {
      trackingId,
      message: `Bulk order update to ${status}`,
    });

    await order.save();

    res.json({
      success: true,
      order: serializeOrder(order),
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

    const ordersRaw = await Order.find({ userId: id }).sort({ createdAt: -1 });
    const orders = ordersRaw.map((order) => serializeOrder(order));

    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (s, o) => s + (o.pricing?.totalAmount || o.finalAmount || 0),
      0
    );
    const completedOrders = orders.filter(
      (o) => o.status === 'Delivered'
    ).length;

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

// PUT /api/admin/customers/:id - update customer details
exports.updateCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Missing id' });

    const { name, email, phone, address, status } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });

    // check email uniqueness
    if (email && email !== user.email) {
      const exist = await User.findOne({ email });
      if (exist && String(exist._id) !== String(id)) return res.status(400).json({ success: false, message: 'Email already in use' });
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      const existPhone = await User.findOne({ phone });
      if (existPhone && String(existPhone._id) !== String(id)) return res.status(400).json({ success: false, message: 'Phone already in use' });
      user.phone = phone;
    }

    if (name) user.name = name;

    // Update status if provided
    if (status && ["active", "inactive", "deleted", "suspended"].includes(status)) {
      user.status = status;
      if (status === "deleted") {
        user.isDeleted = true;
        user.deletedAt = new Date();
      } else if (status === "active") {
        user.isDeleted = false;
        user.deletedAt = null;
      }
    }

    // address: if provided, replace first address or push
    if (address && typeof address === 'object') {
      if (!user.addresses || !user.addresses.length) {
        user.addresses = [address];
      } else {
        user.addresses[0] = { ...user.addresses[0].toObject(), ...address };
      }
    }

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error('updateCustomer error', err);
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

/* ======================================================
   INVENTORY MANAGEMENT ENDPOINTS
====================================================== */

/**
 * GET /api/admin/inventory
 * Get all products with their variants flattened for inventory management
 * Each variant/size combination is returned as a separate item
 */
exports.getInventory = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";

    const filter = { status: "published", isActive: true };

    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    if (category) {
      // Support multiple categories separated by comma
      const categories = category.split(",").map((c) => c.trim());
      if (categories.length > 1) {
        filter.category = { $in: categories };
      } else {
        filter.category = category;
      }
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    // Flatten products - each variant/size becomes a separate item
    let flattenedInventory = [];
    products.forEach((product) => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant, variantIndex) => {
          if (variant.sizes && variant.sizes.length > 0) {
            variant.sizes.forEach((size, sizeIndex) => {
              const image = variant.images?.[0]?.url || product.thumbnail || "";
              flattenedInventory.push({
                _id: `${product._id}-${variantIndex}-${sizeIndex}`,
                productId: product._id,
                productName: product.name,
                variantIndex,
                sizeIndex,
                color: variant.color || "N/A",
                colorCode: variant.colorCode || "",
                size: size.size || "N/A",
                sku: size.sku || "",
                price: size.price || 0,
                originalPrice: size.price || 0,
                mrp: size.mrp || size.price || 0,
                originalMrp: size.mrp || size.price || 0,
                stock: size.stock || 0,
                originalStock: size.stock || 0,
                image: image,
                category: product.category || "",
              });
            });
          }
        });
      }
    });

    // Pagination
    const total = flattenedInventory.length;
    const startIndex = (page - 1) * limit;
    const paginatedInventory = flattenedInventory.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      inventory: paginatedInventory,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error in getInventory:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * PUT /api/admin/inventory/:productId/:variantIndex/:sizeIndex
 * Update price, MRP, and stock for a specific variant/size combination
 */
exports.updateVariantDetails = async (req, res) => {
  try {
    const { productId, variantIndex, sizeIndex } = req.params;
    const { price, mrp, stock } = req.body;

    // Validate inputs
    if (
      isNaN(variantIndex) ||
      isNaN(sizeIndex) ||
      price === undefined ||
      mrp === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid parameters. Price, MRP, and stock are required.",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const variant = product.variants[variantIndex];
    if (!variant) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant index",
      });
    }

    const sizeItem = variant.sizes[sizeIndex];
    if (!sizeItem) {
      return res.status(400).json({
        success: false,
        message: "Invalid size index",
      });
    }

    // Update the fields
    sizeItem.price = Number(price);
    sizeItem.mrp = Number(mrp);
    sizeItem.stock = Number(stock);

    // Calculate discount if not present
    if (!sizeItem.discount && sizeItem.mrp > sizeItem.price) {
      sizeItem.discount = Math.round((((sizeItem.mrp - sizeItem.price) / sizeItem.mrp) * 100));
    } else if (sizeItem.mrp > sizeItem.price) {
      sizeItem.discount = Math.round((((sizeItem.mrp - sizeItem.price) / sizeItem.mrp) * 100));
    }

    product.updatedBy = req.user._id;
    await product.save();

    res.json({
      success: true,
      message: "Variant details updated successfully",
      variant: {
        color: variant.color,
        size: sizeItem.size,
        price: sizeItem.price,
        mrp: sizeItem.mrp,
        stock: sizeItem.stock,
        discount: sizeItem.discount,
      },
    });
  } catch (err) {
    console.error("Error in updateVariantDetails:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ===== Import handlers (moved from importController) =====
// POST /api/admin/imports  (multipart/form-data: file)
exports.uploadImport = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    // Read buffer and parse using SheetJS
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // Helper: copy frontend sample images (/image/...) into backend uploads and normalize paths
    const copyImageIfFrontend = (imgPath) => {
      if (!imgPath || typeof imgPath !== 'string') return imgPath;
      // Only handle frontend image references like '/image/...' or 'image/...'
      if (!imgPath.includes('/image/')) return imgPath;

      // If image is a full URL, extract the pathname
      let rel;
      try {
        if (/^https?:\/\//i.test(imgPath)) {
          const u = new URL(imgPath);
          rel = u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
        } else {
          rel = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath; // e.g. image/bra/comfort.jpg
        }
      } catch (e) {
        rel = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
      }

      const src = path.join(__dirname, '..', 'frontend', 'public', rel);
      if (!fs.existsSync(src)) return imgPath; // leave as-is if source not present

      // Ensure destination folder exists
      const destDir = path.join(__dirname, '..', 'uploads', 'products', 'images');
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      const ext = path.extname(src) || '.jpg';
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1e6)}${ext}`;
      const dest = path.join(destDir, fileName);

      try {
        fs.copyFileSync(src, dest);
        return `/uploads/products/images/${fileName}`;
      } catch (e) {
        console.error('Failed to copy frontend image', src, e);
        return imgPath;
      }
    };

    // Normalize row fields that may contain image references
    const normalizeRowImages = (r) => {
      const row = { ...r };

      // Thumbnail
      if (row.thumbnail && typeof row.thumbnail === 'string' && row.thumbnail.includes('/image/')) {
        row.thumbnail = copyImageIfFrontend(row.thumbnail);
      }

      // Variants column may be JSON string or object
      try {
        if (row.variants && typeof row.variants === 'string' && row.variants.trim()) {
          const parsed = JSON.parse(row.variants);
          if (Array.isArray(parsed)) {
            parsed.forEach((v) => {
              if (v.images && Array.isArray(v.images)) {
                v.images = v.images.map(img => (typeof img === 'string' ? copyImageIfFrontend(img) : img));
              }
            });
            row.variants = parsed;
          }
        } else if (row.variants && Array.isArray(row.variants)) {
          row.variants = row.variants.map(v => {
            if (v.images && Array.isArray(v.images)) {
              v.images = v.images.map(img => (typeof img === 'string' ? copyImageIfFrontend(img) : img));
            }
            return v;
          });
        }
      } catch (e) {
        // ignore parse errors
      }

      return row;
    };

    // Create import record (normalize any frontend image references into backend uploads)
    const importRec = new ImportModel({
      filename: file.originalname,
      uploader: req.user?._id || null,
      status: 'processed',
      items: rows.map(r => ({ data: normalizeRowImages(r), valid: false, errors: [] })),
    });

    await importRec.save();

    return res.json({ success: true, importId: importRec._id, count: rows.length });
  } catch (err) {
    console.error('Import upload error', err);
    return res.status(500).json({ success: false, message: 'Import failed' });
  }
};

// GET /api/admin/imports
exports.listImports = async (req, res) => {
  const imports = await ImportModel.find().sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, imports });
};

// GET /api/admin/imports/:id
exports.getImport = async (req, res) => {
  const imp = await ImportModel.findById(req.params.id);
  if (!imp) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, import: imp });
};

// POST /api/admin/imports/:id/submit  (body: { itemIndex } optional)
exports.submitImport = async (req, res) => {
  try {
    const imp = await ImportModel.findById(req.params.id);
    if (!imp) return res.status(404).json({ success: false, message: 'Not found' });

    const { itemIndex } = req.body;
    const toProcess = typeof itemIndex === 'number' ? [itemIndex] : imp.items.map((_, i) => i);

    const results = [];
    for (const idx of toProcess) {
      const item = imp.items[idx];
      if (!item) { results.push({ idx, success: false, message: 'Invalid index' }); continue; }
      if (item.createdProductId) { results.push({ idx, success: true, message: 'Already created' }); continue; }

      // Minimal validation: require name, brand, category, productDetails
      const d = item.data || {};
      const missing = [];
      if (!d.name || !String(d.name).trim()) missing.push('name');
      if (!d.brand || !String(d.brand).trim()) missing.push('brand');
      if (!d.category || !String(d.category).trim()) missing.push('category');
      if (!d.productDetails || !String(d.productDetails).trim()) missing.push('productDetails');

      if (missing.length) {
        item.errors = missing.map(m => `${m} is required`);
        await imp.save();
        results.push({ idx, success: false, errors: item.errors });
        continue;
      }

      // Build payload similar to frontend ProductForm
      const payload = {
        name: d.name,
        brand: d.brand,
        category: d.category,
        subCategory: d.subCategory || '',
        shortDescription: d.shortDescription || '',
        thumbnail: d.thumbnail || '',
        productDetails: d.productDetails || '',
        features: Array.isArray(d.features) ? d.features : (d.features ? String(d.features).split(';').map(s=>s.trim()) : []),
        materialCare: Array.isArray(d.materialCare) ? d.materialCare : (d.materialCare ? String(d.materialCare).split(';').map(s=>s.trim()) : []),
        sizeAndFits: [],
        specifications: [],
        variants: [],
        offers: [],
        pincodes: [],
        isFeatured: !!d.isFeatured,
        isBestSeller: !!d.isBestSeller,
        isNewArrival: !!d.isNewArrival,
        isActive: d.isActive === undefined ? true : !!d.isActive,
        status: 'published',
        metaTitle: d.metaTitle || '',
        metaDescription: d.metaDescription || '',
        metaKeywords: d.metaKeywords || '',
      };

      // Create product using existing Product model
      const prod = new Product(payload);
      await prod.save();

      item.createdProductId = prod._id;
      item.errors = [];
      await imp.save();

      results.push({ idx, success: true, productId: prod._id });
    }

    return res.json({ success: true, results });
  } catch (err) {
    console.error('submitImport error', err);
    return res.status(500).json({ success: false, message: 'Submit failed' });
  }
};

// POST /api/admin/imports/:id/delete-items  body: { indices: [0,1,2] }
exports.deleteItems = async (req, res) => {
  try {
    const imp = await ImportModel.findById(req.params.id);
    if (!imp) return res.status(404).json({ success: false, message: 'Not found' });

    const { indices } = req.body;
    if (!Array.isArray(indices)) return res.status(400).json({ success: false, message: 'indices array required' });

    // Remove items by index (keep items not in indices)
    const newItems = imp.items.filter((_, idx) => !indices.includes(idx));
    imp.items = newItems;
    await imp.save();

    return res.json({ success: true, count: newItems.length });
  } catch (err) {
    console.error('deleteItems error', err);
    return res.status(500).json({ success: false, message: 'Delete failed' });
  }
};

