const mongoose = require("mongoose");

/* ======================================================
   🎁 OFFER / COUPON SCHEMA (PRO VERSION)
====================================================== */
const offerSchema = new mongoose.Schema(
  {
    /* BASIC INFO */
    title: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    /* DISCOUNT TYPE */
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },

    /* MINIMUM ORDER CONDITION */
    minOrderValue: {
      type: Number,
      default: 0,
    },

    /* MAX DISCOUNT (ONLY FOR %) */
    maxDiscount: {
      type: Number,
      default: null,
    },

    /* USAGE LIMIT */
    usageLimit: {
      type: Number,
      default: 0,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    /* ACTIVE FLAG */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    /* VALIDITY */
    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: {
      type: Date,
      required: true,
    },

    /* TARGETING */
    applicableCategories: [
      {
        type: String,
      },
    ],

    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ======================================================
   🔥 AUTO FORMAT BEFORE SAVE
====================================================== */
offerSchema.pre("save", function () {
  if (this.code) {
    this.code = this.code.toUpperCase().trim();
  }

  // auto deactivate expired offers
  if (this.endDate && this.endDate < new Date()) {
    this.isActive = false;
  }
});

/* ======================================================
   📊 INDEXING (FAST QUERY)
====================================================== */
offerSchema.index({ code: 1 });
offerSchema.index({ isActive: 1 });
offerSchema.index({ endDate: 1 });
offerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

/* ======================================================
   🧠 CHECK IF OFFER VALID
====================================================== */
offerSchema.methods.isValidOffer = function () {
  const now = new Date();

  if (!this.isActive) return false;
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;

  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
    return false;
  }

  return true;
};

/* ======================================================
   🎨 FRONTEND FRIENDLY VIRTUALS
   (Clovia / Myntra style display)
====================================================== */
offerSchema.virtual("offerText").get(function () {
  if (this.discountType === "flat") {
    return `₹${this.discountValue} OFF`;
  }
  return `${this.discountValue}% OFF`;
});

offerSchema.virtual("expiryText").get(function () {
  return this.endDate
    ? new Date(this.endDate).toDateString()
    : "Limited time offer";
});

/* ======================================================
   🔥 EXPORT MODEL
====================================================== */
module.exports =
  mongoose.models.Offer || mongoose.model("Offer", offerSchema);
