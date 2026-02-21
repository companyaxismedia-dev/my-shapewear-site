const mongoose = require("mongoose");


const OrderSchema = new mongoose.Schema(
  {
    /* ================= USER INFO ================= */
    userInfo: {
      name: {
        type: String,
        trim: true,
        default: "user",
      },

      phone: {
        type: String,
        required: [true, "Phone number is mandatory"],
        trim: true,
      },

      email: {
        type: String,
        lowercase: true,
        trim: true,
      },

      address: {
        type: String,
        required: [true, "Delivery address is mandatory"],
      },

      city: {
        type: String,
        default: "N/A",
      },

      pincode: {
        type: String,
      },
    },

    /* ================= REGISTERED USER ================= */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /* ================= PRODUCTS ================= */
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          default: null,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },

        size: {
          type: String,
          default: "Standard",
        },

        img: {
          type: String,
          default: "",
        },
      },
    ],

    /* ================= TOTAL ================= */
totalAmount: {
  type: Number,
  required: true,
  min: 0,
},

/* ================= OFFER / COUPON ================= */
offerCode: {
  type: String,
  default: null,
},

discountAmount: {
  type: Number,
  default: 0,
},

finalAmount: {
  type: Number,
  required: true,
  min: 0,
},


    /* ================= LOGISTICS ================= */
    trackingId: {
      type: String,
      default: "",
      index: true,
    },

    /* ================= ORDER STATUS ================= */
    status: {
      type: String,
      enum: [
        "Order Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
      index: true,
    },

    /* ================= STATUS TIMELINE ================= */
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            "Order Placed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
          ],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    /* ================= PAYMENT ================= */
    paymentType: {
      type: String,
      enum: ["Online", "COD"],
      default: "Online",
    },

    paymentId: {
      type: String,
      default: "N/A",
    },
  },
  {
    timestamps: true,
  }
);

/* ======================================================
   AUTO PUSH INITIAL STATUS (FIXED - NO NEXT)
====================================================== */

OrderSchema.pre("save", function () {
  if (
    this.isNew &&
    (!this.statusHistory || this.statusHistory.length === 0)
  ) {
    this.statusHistory.push({
      status: this.status,
    });
  }
});

/* ======================================================
   INDEXES (ADMIN PANEL SPEED BOOST)
====================================================== */

OrderSchema.index({ "userInfo.phone": 1, createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

/* ======================================================
   EXPORT SAFE
====================================================== */

module.exports =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);
