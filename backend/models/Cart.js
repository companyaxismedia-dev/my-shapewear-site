const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // ek user ka ek hi cart
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        }, 
        qty: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        size: String,
        color: String,
      },
    ],

    coupon: {
      code: {
        type: String,
        default: "",
        trim: true,
        uppercase: true,
      },
      title: {
        type: String,
        default: "",
        trim: true,
      },
      discountType: {
        type: String,
        enum: ["percentage", "flat", ""],
        default: "",
      },
      discountValue: {
        type: Number,
        default: 0,
        min: 0,
      },
      maxDiscount: {
        type: Number,
        default: null,
        min: 0,
      },
      minOrderValue: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
