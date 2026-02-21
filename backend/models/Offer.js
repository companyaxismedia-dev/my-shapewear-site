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

    /* MAX DISCOUNT */
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
  { timestamps: true }
);

/* ======================================================
   🔥 AUTO FORMAT CODE (FIXED - NO NEXT)
====================================================== */

offerSchema.pre("save", function () {
  if (this.code) {
    this.code = this.code.toUpperCase().trim();
  }

  // auto deactivate expired
  if (this.endDate && this.endDate < new Date()) {
    this.isActive = false;
  }
});

/* ======================================================
   📊 INDEXING
====================================================== */
offerSchema.index({ code: 1 });
offerSchema.index({ isActive: 1 });
offerSchema.index({ endDate: 1 });

/* ======================================================
   🧠 METHOD → CHECK IF OFFER VALID
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
   🔥 EXPORT MODEL
====================================================== */
module.exports =
  mongoose.models.Offer || mongoose.model("Offer", offerSchema);
