require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await Order.updateMany(
      {},
      {
        $unset: {
          status: "",
          statusHistory: "",
        },
      }
    );

    console.log("Removed legacy order-level status fields from orders.");
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  } catch (error) {
    console.error("removeOrderLevelStatus migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
