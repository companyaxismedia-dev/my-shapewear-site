const mongoose = require("mongoose");

/* ======================================================
   IMAGE SCHEMA
====================================================== */
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    altText: String,
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    width: Number,
    height: Number,
    format: String,
  },
  { _id: false }
);

/* ======================================================
   SERVICEABLE PINCODE
====================================================== */
const serviceablePincodeSchema = new mongoose.Schema(
  {
    pincode: { type: String, required: true, index: true },
    codAvailable: { type: Boolean, default: true },
    estimatedDays: { type: Number, default: 3 },
  },
  { _id: false }
);

/* ======================================================
   OFFER
====================================================== */
const offerSchema = new mongoose.Schema(
  {
    title: String,
    code: String,
    discountType: { type: String, enum: ["percentage", "flat"] },
    discountValue: Number,
    minOrderValue: Number,
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

/* ======================================================
   SPECIFICATIONS TABLE
====================================================== */
const specificationSchema = new mongoose.Schema(
  {
    key: String,
    value: String,
  },
  { _id: false }
);

/* ======================================================
   SIZE & FITS (Dynamic Structured Attributes)
====================================================== */
const sizeFitSchema = new mongoose.Schema(
  {
    label: String,  // Fabric, Padding, Wire etc.
    value: String,
  },
  { _id: false }
);

/* ======================================================
   REVIEW
====================================================== */
const reviewSchema = new mongoose.Schema(
  {
    userName: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    images: [String],
    createdAt: { type: Date, default: Date.now },
    verified: { type: Boolean, default: true },
  },
  { _id: false }
);

/* ======================================================
   SIZE / SKU LEVEL
====================================================== */
const sizeSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    sku: { type: String, required: true, uppercase: true },
    price: { type: Number, required: true },
    mrp: Number,
    discount: Number,
    stock: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

/* ======================================================
   VARIANT (COLOR LEVEL)
====================================================== */
const variantSchema = new mongoose.Schema(
  {
    color: { type: String, required: true },
    colorCode: String,
    images: [imageSchema],
    video: String,
    sizes: [sizeSchema],
  },
  { _id: false }
);

/* ======================================================
   MAIN PRODUCT SCHEMA
====================================================== */
const productSchema = new mongoose.Schema(
  {
    /* BASIC */
    /* BASIC */
name: { type: String, required: true },
slug: { type: String, unique: true, index: true },
brand: { type: String, index: true },

category: {
  type: String,
  required: true,
  enum: [
    "bra",
    "panties",
    "lingerie",
    "shapewear",
    "curvy",
    "tummy-control",
    "non-padded"
  ],
  index: true
},

subCategory: { type: String, index: true },


    shortDescription: String,
    productDetails: String,
    features: [String],

    /* SIZE & FITS (Dynamic Subcategory Support) */
    sizeAndFits: [sizeFitSchema],

    materialCare: [String],
    specifications: [specificationSchema],

    /* VARIANTS */
    variants: [variantSchema],

    /* DELIVERY */
    serviceablePincodes: [serviceablePincodeSchema],

    /* OFFERS */
    offers: [offerSchema],

    /* PRICE SUMMARY */
    minPrice: Number,
    maxPrice: Number,
    mrp: Number,
    discount: Number,
    totalStock: Number,

    /* RATINGS */
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    ratingBreakdown: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 },
    },

    reviews: [reviewSchema],

    /* MEDIA */
    thumbnail: String,

    /* FLAGS */
    isFeatured: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },

    /* SEO */
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
  },
  { timestamps: true }
);

/* ======================================================
   INDEXING
====================================================== */
productSchema.index({ name: "text", shortDescription: "text", brand: "text" });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ minPrice: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ "variants.color": 1 });

/* ======================================================
   AUTO SLUG
====================================================== */
productSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
  }
});

/* ======================================================
   AUTO CALCULATIONS
====================================================== */
productSchema.pre("save", function () {
  let totalStock = 0;
  let prices = [];
  let mrps = [];

  if (this.variants?.length) {
    this.variants.forEach((variant) => {
      variant.sizes.forEach((size) => {
        totalStock += size.stock;
        prices.push(size.price);

        if (size.mrp) {
          mrps.push(size.mrp);

          if (size.mrp > size.price) {
            size.discount = Math.round(
              ((size.mrp - size.price) / size.mrp) * 100
            );
          }
        }
      });
    });
  }

  this.totalStock = totalStock;

  if (prices.length) {
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
  }

  if (mrps.length) {
    this.mrp = Math.max(...mrps);
  }

  if (this.mrp && this.minPrice && this.mrp > this.minPrice) {
    this.discount = Math.round(
      ((this.mrp - this.minPrice) / this.mrp) * 100
    );
  }

  /* Thumbnail */
  if (!this.thumbnail && this.variants?.length) {
    const firstVariant = this.variants[0];
    const primary =
      firstVariant.images.find((img) => img.isPrimary) ||
      firstVariant.images[0];
    this.thumbnail = primary?.url;
  }

  /* Rating */
  const totalRatings =
    this.ratingBreakdown.five +
    this.ratingBreakdown.four +
    this.ratingBreakdown.three +
    this.ratingBreakdown.two +
    this.ratingBreakdown.one;

  if (totalRatings > 0) {
    const weightedSum =
      this.ratingBreakdown.five * 5 +
      this.ratingBreakdown.four * 4 +
      this.ratingBreakdown.three * 3 +
      this.ratingBreakdown.two * 2 +
      this.ratingBreakdown.one * 1;

    this.rating = Number((weightedSum / totalRatings).toFixed(1));
    this.numReviews = totalRatings;
  }
});

module.exports = mongoose.model("Product", productSchema);
