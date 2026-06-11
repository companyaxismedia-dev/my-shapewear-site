const dns = require("dns");
dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
])
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

// Load env vars
dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });

    if (existingAdmin) {
      console.log("Demo admin already exists!");
      console.log("Email: admin@example.com");
      console.log("Password: adminpassword");
      process.exit();
    }

    // Create demo admin
    const admin = await User.create({
      name: "Demo Admin",
      email: "admin@example.com",
      password: "adminpassword",
      role: "admin",
      status: "active",
      gender: "other",
    });

    console.log("✅ Demo Admin created successfully!");
    console.log("------------------------------------");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: adminpassword`);
    console.log("------------------------------------");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:");
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
