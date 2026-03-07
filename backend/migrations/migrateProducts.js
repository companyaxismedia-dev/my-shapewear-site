const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");
const User = require("../models/User");

/* ======================================================
   MIGRATION: Add status, createdBy, updatedBy to products
====================================================== */

async function migrateProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Find an admin user to assign as createdBy/updatedBy
    const adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.log("❌ No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    console.log(`📝 Using admin user: ${adminUser.name || adminUser.email}`);

    // Get total products before migration
    const totalBefore = await Product.countDocuments();
    console.log(`📊 Total products before migration: ${totalBefore}`);

    // Update all products
    const result = await Product.updateMany(
      {},
      {
        $set: {
          status: "published",
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
        },
      }
    );

    console.log(`✅ Migration completed!`);
    console.log(`   - Matched: ${result.matchedCount} products`);
    console.log(`   - Modified: ${result.modifiedCount} products`);

    // Verify migration
    const productsWithoutStatus = await Product.countDocuments({ status: { $exists: false } });
    const productsWithoutCreatedBy = await Product.countDocuments({ createdBy: { $exists: false } });
    const productsWithoutUpdatedBy = await Product.countDocuments({ updatedBy: { $exists: false } });

    if (productsWithoutStatus === 0 && productsWithoutCreatedBy === 0 && productsWithoutUpdatedBy === 0) {
      console.log("✅ Verification passed! All products have been migrated successfully.");
    } else {
      console.log("⚠️  Some products may not have been migrated:");
      if (productsWithoutStatus > 0) console.log(`   - ${productsWithoutStatus} products missing 'status'`);
      if (productsWithoutCreatedBy > 0) console.log(`   - ${productsWithoutCreatedBy} products missing 'createdBy'`);
      if (productsWithoutUpdatedBy > 0) console.log(`   - ${productsWithoutUpdatedBy} products missing 'updatedBy'`);
    }

    console.log("\n🎉 Migration script completed!");
    process.exit(0);

  } catch (error) {
    console.error("❌ Migration Error:", error.message);
    process.exit(1);
  }
}

// Run migration
migrateProducts();
