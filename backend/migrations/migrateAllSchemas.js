const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Otp = require("../models/Otp");
const Offer = require("../models/Offer");
const Category = require("../models/category");
const Import = require("../models/Import");

/* ======================================================
   COMPREHENSIVE MIGRATION: All 8 Models Schema Alignment
====================================================== */

async function migrateAllSchemas() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    // ============================================================
    // 1️⃣ MIGRATE PRODUCTS
    // ============================================================
    console.log("════════════════════════════════════════════════════════");
    console.log("1️⃣  MIGRATING PRODUCTS");
    console.log("════════════════════════════════════════════════════════");

    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products: ${totalProducts}`);

    const adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    const allProducts = await Product.find({}).lean();
    let productsUpdated = 0;

    for (const product of allProducts) {
      const updates = {};

      if (!product.status) updates.status = "published";
      if (!product.createdBy) updates.createdBy = adminUser._id;
      if (!product.updatedBy) updates.updatedBy = adminUser._id;
      if (product.isFeatured === null || product.isFeatured === undefined) updates.isFeatured = false;
      if (product.isBestSeller === null || product.isBestSeller === undefined) updates.isBestSeller = false;
      if (product.isNewArrival === null || product.isNewArrival === undefined) updates.isNewArrival = false;
      if (product.isActive === null || product.isActive === undefined) updates.isActive = true;
      if (!product.ratingBreakdown) updates.ratingBreakdown = { five: 0, four: 0, three: 0, two: 0, one: 0 };
      if (!product.rating) updates.rating = 0;
      if (!product.numReviews) updates.numReviews = 0;
      if (!product.reviews) updates.reviews = [];
      if (!product.features) updates.features = [];
      if (!product.specifications) updates.specifications = [];
      if (!product.sizeAndFits) updates.sizeAndFits = [];
      if (!product.materialCare) updates.materialCare = [];
      if (!product.serviceablePincodes) updates.serviceablePincodes = [];
      if (!product.offers) updates.offers = [];
      if (!product.variants) updates.variants = [];

      if (Object.keys(updates).length > 0) {
        await Product.findByIdAndUpdate(product._id, { $set: updates }, { new: true });
        productsUpdated++;
      }
    }

    console.log(`✅ Products updated: ${productsUpdated}/${totalProducts}\n`);

    // ============================================================
    // 2️⃣ MIGRATE USERS
    // ============================================================
    console.log("════════════════════════════════════════════════════════");
    console.log("2️⃣  MIGRATING USERS");
    console.log("════════════════════════════════════════════════════════");

    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users: ${totalUsers}`);

    const allUsers = await User.find({}).lean();
    let usersUpdated = 0;

    for (const user of allUsers) {
      const updates = {};

      if (!user.role) updates.role = "user";
      if (!user.status) updates.status = "active";
      if (user.isDeleted === null || user.isDeleted === undefined) updates.isDeleted = false;
      if (!user.wishlist) updates.wishlist = [];
      if (!user.addresses) updates.addresses = [];
      if (!user.lastActivity) updates.lastActivity = null;

      if (Object.keys(updates).length > 0) {
        await User.findByIdAndUpdate(user._id, { $set: updates }, { new: true });
        usersUpdated++;
      }
    }

    console.log(`✅ Users updated: ${usersUpdated}/${totalUsers}\n`);

    // ============================================================
    // 3️⃣ MIGRATE CARTS
    // ============================================================
    console.log("════════════════════════════════════════════════════════");
    console.log("3️⃣  MIGRATING CARTS");
    console.log("════════════════════════════════════════════════════════");

    const totalCarts = await Cart.countDocuments();
    console.log(`📊 Total carts: ${totalCarts}`);

    const allCarts = await Cart.find({}).lean();
    let cartsUpdated = 0;

    for (const cart of allCarts) {
      const updates = {};

      if (!cart.items) updates.items = [];
      
      // Ensure each item has required fields
      if (cart.items && cart.items.length > 0) {
        const updatedItems = cart.items.map(item => ({
          product: item.product,
          qty: item.qty || 1,
          size: item.size || "",
          color: item.color || ""
        }));
        updates.items = updatedItems;
      }

      if (Object.keys(updates).length > 0) {
        await Cart.findByIdAndUpdate(cart._id, { $set: updates }, { new: true });
        cartsUpdated++;
      }
    }

    console.log(`✅ Carts updated: ${cartsUpdated}/${totalCarts}\n`);

    // ============================================================
    // 4️⃣ MIGRATE ORDERS
    // ============================================================
    console.log("════════════════════════════════════════════════════════");
    console.log("4️⃣  MIGRATING ORDERS");
    console.log("════════════════════════════════════════════════════════");

    const totalOrders = await Order.countDocuments();
    console.log(`📊 Total orders: ${totalOrders}`);

    const allOrders = await Order.find({}).lean();
    let ordersUpdated = 0;

    for (const order of allOrders) {
      const updates = {};

      if (!order.userInfo) updates.userInfo = { name: "user", phone: "", email: "", address: "" };
      if (!order.products) updates.products = [];
      if (!order.offersEarned) updates.offersEarned = [];
      if (!order.trackingEvents) updates.trackingEvents = [];
      if (!order.discountAmount) updates.discountAmount = 0;
      if (!order.trackingId) updates.trackingId = "";
      if (!order.paymentType) updates.paymentType = "COD";
      if (!order.paymentStatus) updates.paymentStatus = "Pending";

      if (Object.keys(updates).length > 0) {
        await Order.findByIdAndUpdate(order._id, { $set: updates }, { new: true });
        ordersUpdated++;
      }
    }

    console.log(`✅ Orders updated: ${ordersUpdated}/${totalOrders}\n`);

    // ============================================================
    // 5️⃣ MIGRATE OTPS
    // ============================================================
    console.log("════════════════════════════════════════════════════════");
    console.log("5️⃣  MIGRATING OTPS");
    console.log("════════════════════════════════════════════════════════");

    const totalOtps = await Otp.countDocuments();
    console.log(`📊 Total OTPs: ${totalOtps}`);

    const allOtps = await Otp.find({}).lean();
    let otpsUpdated = 0;

    for (const otp of allOtps) {
      const updates = {};

      if (otp.attempts === null || otp.attempts === undefined) updates.attempts = 0;
      if (!otp.lockedUntil) updates.lockedUntil = null;

      if (Object.keys(updates).length > 0) {
        await Otp.findByIdAndUpdate(otp._id, { $set: updates }, { new: true });
        otpsUpdated++;
      }
    }

    console.log(`✅ OTPs updated: ${otpsUpdated}/${totalOtps}\n`);

    // ============================================================
    // 6️⃣ MIGRATE OFFERS
    // ============================================================
    console.log("════════════════════════════════════════════════════════");
    console.log("6️⃣  MIGRATING OFFERS");
    console.log("════════════════════════════════════════════════════════");

    const totalOffers = await Offer.countDocuments();
    console.log(`📊 Total offers: ${totalOffers}`);

    const allOffers = await Offer.find({}).lean();
    let offersUpdated = 0;

    for (const offer of allOffers) {
      const updates = {};

      if (!offer.discountType) updates.discountType = "percentage";
      if (!offer.minOrderValue) updates.minOrderValue = 0;
      if (offer.isActive === null || offer.isActive === undefined) updates.isActive = true;
      if (!offer.startDate) updates.startDate = new Date();
      if (!offer.applicableCategories) updates.applicableCategories = [];
      if (!offer.applicableProducts) updates.applicableProducts = [];
      if (!offer.usageLimit) updates.usageLimit = 0;
      if (!offer.usedCount) updates.usedCount = 0;

      if (Object.keys(updates).length > 0) {
        await Offer.findByIdAndUpdate(offer._id, { $set: updates }, { new: true });
        offersUpdated++;
      }
    }

    console.log(`✅ Offers updated: ${offersUpdated}/${totalOffers}\n`);

    // ============================================================
    // 7️⃣ MIGRATE CATEGORIES
    // ============================================================
    console.log("════════════════════════════════════════════════════════");
    console.log("7️⃣  MIGRATING CATEGORIES");
    console.log("════════════════════════════════════════════════════════");

    const totalCategories = await Category.countDocuments();
    console.log(`📊 Total categories: ${totalCategories}`);

    const allCategories = await Category.find({}).lean();
    let categoriesUpdated = 0;

    for (const category of allCategories) {
      const updates = {};
      const unset = {};

      if (category.isActive === null || category.isActive === undefined) updates.isActive = true;
      if (!category.metaTitle) updates.metaTitle = category.name || "";
      if (!category.metaDescription) updates.metaDescription = "";
      if (!category.metaKeywords) {
        updates.metaKeywords = Array.isArray(category.mataKeywords) ? category.mataKeywords : [];
      }
      if (!category.slug && category.name) {
        updates.slug = String(category.name)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
      }
      if (!Array.isArray(category.subCategories)) updates.subCategories = [];
      if (!Array.isArray(category.ancestors)) updates.ancestors = [];
      if (category.level === null || category.level === undefined) updates.level = 0;
      if (category.sortOrder === null || category.sortOrder === undefined) updates.sortOrder = 0;
      if (category.parent === undefined) updates.parent = null;
      if (Object.prototype.hasOwnProperty.call(category, "image")) unset.image = "";
      if (Object.prototype.hasOwnProperty.call(category, "mataKeywords")) unset.mataKeywords = "";

      if (Object.keys(updates).length > 0 || Object.keys(unset).length > 0) {
        await Category.findByIdAndUpdate(
          category._id,
          {
            ...(Object.keys(updates).length > 0 ? { $set: updates } : {}),
            ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
          },
          { new: true }
        );
        categoriesUpdated++;
      }
    }

    console.log(`✅ Categories updated: ${categoriesUpdated}/${totalCategories}\n`);

    // ============================================================
    // 8️⃣ MIGRATE IMPORTS
    // ============================================================
    console.log("════════════════════════════════════════════════════════");
    console.log("8️⃣  MIGRATING IMPORTS");
    console.log("════════════════════════════════════════════════════════");

    const totalImports = await Import.countDocuments();
    console.log(`📊 Total imports: ${totalImports}`);

    const allImports = await Import.find({}).lean();
    let importsUpdated = 0;

    for (const importRecord of allImports) {
      const updates = {};

      if (!importRecord.status) updates.status = "uploaded";
      if (!importRecord.items) updates.items = [];
      if (!importRecord.filename) updates.filename = "import-" + importRecord._id;

      if (Object.keys(updates).length > 0) {
        await Import.findByIdAndUpdate(importRecord._id, { $set: updates }, { new: true });
        importsUpdated++;
      }
    }

    console.log(`✅ Imports updated: ${importsUpdated}/${totalImports}\n`);

    // ============================================================
    // FINAL VERIFICATION
    // ============================================================
    console.log("════════════════════════════════════════════════════════");
    console.log("📋 FINAL SCHEMA COMPLIANCE REPORT");
    console.log("════════════════════════════════════════════════════════");

    // Verification checks
    const checks = [
      {
        name: "Products",
        model: Product,
        checks: [
          { field: "status", count: await Product.countDocuments({ status: { $exists: false } }) },
          { field: "createdBy", count: await Product.countDocuments({ createdBy: { $exists: false } }) },
        ],
      },
      {
        name: "Users",
        model: User,
        checks: [
          { field: "role", count: await User.countDocuments({ role: { $exists: false } }) },
          { field: "status", count: await User.countDocuments({ status: { $exists: false } }) },
        ],
      },
      {
        name: "Carts",
        model: Cart,
        checks: [
          { field: "items", count: await Cart.countDocuments({ items: { $exists: false } }) },
        ],
      },
      {
        name: "Orders",
        model: Order,
        checks: [
          { field: "userInfo", count: await Order.countDocuments({ userInfo: { $exists: false } }) },
        ],
      },
      {
        name: "Offers",
        model: Offer,
        checks: [
          { field: "isActive", count: await Offer.countDocuments({ isActive: { $exists: false } }) },
        ],
      },
      {
        name: "Categories",
        model: Category,
        checks: [
          { field: "isActive", count: await Category.countDocuments({ isActive: { $exists: false } }) },
        ],
      },
    ];

    let allChecksPassed = true;
    for (const check of checks) {
      console.log(`\n${check.name}:`);
      for (const fieldCheck of check.checks) {
        const status = fieldCheck.count === 0 ? "✅" : "❌";
        console.log(`  ${status} ${fieldCheck.field}: ${fieldCheck.count === 0 ? "OK" : fieldCheck.count + " missing"}`);
        if (fieldCheck.count > 0) allChecksPassed = false;
      }
    }

    console.log("\n════════════════════════════════════════════════════════");
    if (allChecksPassed) {
      console.log("✅ ALL MODELS MIGRATED SUCCESSFULLY!");
    } else {
      console.log("⚠️  SOME FIELDS MAY NEED ATTENTION");
    }
    console.log("════════════════════════════════════════════════════════\n");

    console.log("🎉 Comprehensive schema migration completed!\n");
    process.exit(0);

  } catch (error) {
    console.error("❌ Migration Error:", error.message);
    console.error("\nFull Error:", error);
    process.exit(1);
  }
}

// Run migration
migrateAllSchemas();
