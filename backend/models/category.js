const { default: mongoose } = require("mongoose");

// Schema for individual subcategory items (e.g., "Padded Bras", "Non Padded")
const subCategoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  path: { type: String }, // Optional: Path for frontend routing
});

// Schema for grouping subcategories (e.g., "Styles", "Padding")
const categoryGroupSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Main group title (e.g., "Styles")
  leftPanelName: { type: String, required: true }, // Sidebar title (e.g., "Shop By Style")
  items: [subCategoryItemSchema],
});

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: String,
    description: String,

    // Mega-menu structure to hold grouped subcategories
    groups: [categoryGroupSchema],

    metaTitle: String,
    metaDescription: String,
    mataKeywords: [String], // Leaving existing typo if any to prevent breaking changes unless intended
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ isActive: 1 });

module.exports = mongoose.model("Category", categorySchema);
