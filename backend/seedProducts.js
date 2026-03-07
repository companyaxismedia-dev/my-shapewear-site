const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const Product = require("./models/Product");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const imageBasePath = path.join(__dirname, "../frontend/public/image");

const categories = {
  bra: "bra",
  panty: "panties",
  shapewear: "shapewear",
  "tummy-control": "shapewear",
  "lingerie-set-gum": "lingerie"
};

async function seedProducts() {
  try {
    await Product.deleteMany();
    console.log("Old products removed");

    // Get or create an admin user for seeding
    let adminUser = await User.findOne({ role: "admin" });
    
    if (!adminUser) {
      console.log("No admin user found. Please create an admin user first.");
      process.exit(1);
    }

    const folders = fs.readdirSync(imageBasePath);

    for (let folder of folders) {

      if (!categories[folder]) continue;

      const folderPath = path.join(imageBasePath, folder);
      const files = fs.readdirSync(folderPath);

      // Group every 3 images into 1 product
      for (let i = 0; i < files.length; i += 3) {

        const images = files.slice(i, i + 3).map(
          file => `/image/${folder}/${file}`
        );

        const productName = `${folder} product ${i + 1}`;

        const product = new Product({
          name: productName,
          category: categories[folder],
          brand: "Glovia",
          description: `${folder} premium product with high comfort.`,
          details: [
            "Soft breathable fabric",
            "Premium stitching",
            "All day comfort"
          ],
          mrp: 999,
          variants: [
            {
              color: "Default",
              colorCode: "#000000",
              price: 499,
              mrp: 999,
              images: images,
              sizes: [
                { size: "S", stock: 10 },
                { size: "M", stock: 15 },
                { size: "L", stock: 12 },
                { size: "XL", stock: 8 }
              ]
            }
          ],
          isFeatured: Math.random() > 0.7,
          createdBy: adminUser._id,
          updatedBy: adminUser._id,
          status: "published"
        });

        await product.save();
        console.log(`Inserted: ${productName}`);
      }
    }

    console.log("All products seeded successfully 🔥");
    process.exit();

  } catch (error) {
    console.log(error);
    process.exit();
  }
}

seedProducts();
