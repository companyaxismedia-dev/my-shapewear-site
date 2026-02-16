const mongoose = require("mongoose");

/* ================= SIZE SCHEMA ================= */
const sizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, trim: true },
  },
  { _id: false }
);

/* ================= VARIANT SCHEMA ================= */
const variantSchema = new mongoose.Schema(
  {
    color: { type: String, required: true, trim: true },
    colorCode: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    images: [String],
    video: String,
    sizes: [sizeSchema],
  },
  { _id: false }
);

/* ================= PRODUCT SCHEMA ================= */
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["bra", "panties", "lingerie", "shapewear"],
      required: true,
    },

    brand: String,
    description: String,
    details: [String],
    images: [String],

    price: Number,
    mrp: Number,
    discount: Number,

    totalStock: { type: Number, default: 0 },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    variants: [variantSchema],

    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ================= AUTO SLUG ================= */
productSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  }
});

/* ================= AUTO CALCULATIONS ================= */
productSchema.pre("save", function () {
  let total = 0;

  if (this.variants) {
    this.variants.forEach((variant) => {
      if (variant.sizes) {
        variant.sizes.forEach((size) => {
          total += size.stock || 0;
        });
      }
    });
  }

  this.totalStock = total;

  if (!this.price && this.variants?.length > 0) {
    this.price = this.variants[0].price;
  }

  if (this.mrp && this.price && this.mrp > this.price) {
    this.discount = Math.round(
      ((this.mrp - this.price) / this.mrp) * 100
    );
  }
});

module.exports = mongoose.model("Product", productSchema);
