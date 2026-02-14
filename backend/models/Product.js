const mongoose = require("mongoose");

/* =================================
   SIZE SCHEMA
================================= */
const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

/* =================================
   VARIANT SCHEMA
================================= */
const variantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      trim: true,
    },

    colorCode: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    mrp: {
      type: Number,
      min: 0,
    },

    images: [String],

    video: String,

    sizes: [sizeSchema],
  },
  { _id: false }
);

/* =================================
   PRODUCT SCHEMA
================================= */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["bra", "panties", "lingerie", "shapewear"],
      required: true,
      index: true,
    },

    brand: {
      type: String,
      trim: true,
    },

    description: String,

    details: [String],

    images: [String],

    price: {
      type: Number,
      min: 0,
    },

    mrp: {
      type: Number,
      min: 0,
    },

    discount: {
      type: Number,
      min: 0,
      max: 100,
    },

    totalStock: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    variants: [variantSchema],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

/* =================================
   AUTO GENERATE SLUG
================================= */
productSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  }

  next();
});

/* =================================
   AUTO CALCULATE TOTAL STOCK
================================= */
productSchema.pre("save", function (next) {
  let total = 0;

  if (this.variants && this.variants.length > 0) {
    this.variants.forEach((variant) => {
      if (variant.sizes && variant.sizes.length > 0) {
        variant.sizes.forEach((size) => {
          total += size.stock;
        });
      }
    });
  }

  this.totalStock = total;

  next();
});

/* =================================
   AUTO CALCULATE DISCOUNT
================================= */
productSchema.pre("save", function (next) {
  if (this.mrp && this.price && this.mrp > this.price) {
    this.discount = Math.round(
      ((this.mrp - this.price) / this.mrp) * 100
    );
  }

  next();
});

/* =================================
   AUTO SET PRICE FROM FIRST VARIANT
================================= */
productSchema.pre("save", function (next) {
  if (!this.price && this.variants.length > 0) {
    this.price = this.variants[0].price;
  }

  next();
});

module.exports = mongoose.model("Product", productSchema);
