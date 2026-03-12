const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");
const User = require("../models/User");

/* ======================================================
   COMPREHENSIVE MIGRATION: Update all products to current schema
====================================================== */

async function migrateProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected\n");

    // Get total products before migration
    const totalBefore = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalBefore}`);

    if (totalBefore === 0) {
      console.log("⚠️  No products found in database. Nothing to migrate.");
      process.exit(0);
    }

    // Find an admin user to assign as createdBy/updatedBy
    const adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      console.log("   Use: node seedProducts.js");
      process.exit(1);
    }

    console.log(`📝 Using admin user: ${adminUser.name || adminUser.email}\n`);

    // Phase 1: Get all products and update individually
    console.log("🔄 Phase 1: Processing products...");
    const allProducts = await Product.find({}).lean();
    let processedCount = 0;

    for (const product of allProducts) {
      const updates = {};
      
      if (!product.status) updates.status = "published";
      if (!product.createdBy) updates.createdBy = adminUser._id;
      if (!product.updatedBy) updates.updatedBy = adminUser._id;
      if (product.isFeatured === null || product.isFeatured === undefined) updates.isFeatured = false;
      if (product.isBestSeller === null || product.isBestSeller === undefined) updates.isBestSeller = false;
      if (product.isNewArrival === null || product.isNewArrival === undefined) updates.isNewArrival = false;
      if (product.isActive === null || product.isActive === undefined) updates.isActive = true;

      if (Object.keys(updates).length > 0) {
        await Product.findByIdAndUpdate(product._id, { $set: updates }, { new: true, strict: false });
        processedCount++;
      }
    }

    console.log(`   ✅ Processed: ${allProducts.length} products`);
    console.log(`   ✅ Updated: ${processedCount} products\n`);

    // Phase 2: Ensure ALL products have required fields with defaults
    console.log("🔄 Phase 2: Initializing missing fields with defaults...");

    // Get all products to process individually
    const products = await Product.find({}).lean();
    let fieldsAddedCount = 0;

    for (const product of products) {
      const updates = {};
      let needsUpdate = false;

      // Check and add missing fields with defaults
      if (!product.ratingBreakdown) {
        updates.ratingBreakdown = {
          five: 0,
          four: 0,
          three: 0,
          two: 0,
          one: 0,
        };
        needsUpdate = true;
      }

      if (!product.rating) {
        updates.rating = 0;
        needsUpdate = true;
      }

      if (!product.numReviews) {
        updates.numReviews = 0;
        needsUpdate = true;
      }

      if (!product.reviews) {
        updates.reviews = [];
        needsUpdate = true;
      }

      if (!product.slug && product.name) {
        updates.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, "")
          .replace(/\s+/g, "-")
          + "-" + product._id.toString().slice(-6);
        needsUpdate = true;
      }

      if (!product.features) {
        updates.features = [];
        needsUpdate = true;
      }

      if (!product.specifications) {
        updates.specifications = [];
        needsUpdate = true;
      }

      if (!product.sizeAndFits) {
        updates.sizeAndFits = [];
        needsUpdate = true;
      }

      if (!product.materialCare) {
        updates.materialCare = [];
        needsUpdate = true;
      }

      if (!product.serviceablePincodes) {
        updates.serviceablePincodes = [];
        needsUpdate = true;
      }

      if (!product.offers) {
        updates.offers = [];
        needsUpdate = true;
      }

      if (!product.variants || product.variants.length === 0) {
        console.log(`   ⚠️  Product "${product.name}" has no variants`);
        // Initialize empty variants array if missing
        if (!product.variants) {
          updates.variants = [];
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, { $set: updates }, { new: true });
        fieldsAddedCount++;
      }
    }

    console.log(`   ✅ Updated ${fieldsAddedCount} products with missing fields\n`);

    // Phase 3: Verify all required fields exist
    console.log("🔄 Phase 3: Verification - Checking schema compliance...");

    const missingStatus = await Product.countDocuments({ status: { $exists: false } });
    const missingCreatedBy = await Product.countDocuments({ createdBy: { $exists: false } });
    const missingUpdatedBy = await Product.countDocuments({ updatedBy: { $exists: false } });
    const missingRating = await Product.countDocuments({ rating: { $exists: false } });
    const missingVariants = await Product.countDocuments({ variants: { $exists: false } });
    const emptyVariants = await Product.countDocuments({ variants: { $size: 0 } });

    console.log("   Schema Compliance Report:");
    console.log(`   - Status field: ${missingStatus === 0 ? "✅ OK" : `❌ ${missingStatus} missing`}`);
    console.log(`   - CreatedBy field: ${missingCreatedBy === 0 ? "✅ OK" : `❌ ${missingCreatedBy} missing`}`);
    console.log(`   - UpdatedBy field: ${missingUpdatedBy === 0 ? "✅ OK" : `❌ ${missingUpdatedBy} missing`}`);
    console.log(`   - Rating field: ${missingRating === 0 ? "✅ OK" : `❌ ${missingRating} missing`}`);
    console.log(`   - Variants field: ${missingVariants === 0 ? "✅ OK" : `❌ ${missingVariants} missing`}`);
    console.log(`   - Products with 0 variants: ${emptyVariants}\n`);

    // Phase 4: Summary Report
    console.log("════════════════════════════════════════════════════════");
    console.log("📋 MIGRATION SUMMARY");
    console.log("════════════════════════════════════════════════════════");
    console.log(`   Total products processed: ${totalBefore}`);
    console.log(`   Schema compliance: ${missingStatus === 0 && missingCreatedBy === 0 && missingUpdatedBy === 0 ? "✅ PASSED" : "⚠️  NEEDS ATTENTION"}`);

    if (emptyVariants > 0) {
      console.log(`\n   ⚠️  WARNING: ${emptyVariants} products have no variants!`);
      console.log(`   These products won't be visible until variants are added.`);
    }

    console.log("════════════════════════════════════════════════════════\n");

    console.log("✅ Migration completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Migration Error:", error.message);
    console.error("\nFull Error:", error);
    process.exit(1);
  }
}

// Run migration
migrateProducts();
