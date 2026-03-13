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

      alternatePhone: {
        type: String,
        trim: true,
        default: "",
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
   
    /* ================= ORDER NUMBER ================= */

orderNumber: {
  type: String,
  unique: true,
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

    /* ================= PRICE BREAKDOWN ================= */

    listingPrice: {
      type: Number,
      default: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

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

    fees: {
      type: Number,
      default: 16,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /* ================= FRONTEND FEATURES ================= */

    offersEarned: {
      type: [String],
      default: [],
    },

    trackingEvents: [
      {
        status: {
          type: String,
          default: "",
        },
        time: {
          type: String,
          default: "",
        },
        date: {
          type: String,
          default: "",
        },
      },
    ],



    /* ================= LOGISTICS ================= */

    trackingId: {
      type: String,
      default: "",
      index: true,
    },

    courier: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    /* ================= ORDER STATUS ================= */
    status: {
      type: String,
      enum: [
        "Order Placed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
      index: true,
    },

    /* ================= EDIT LOCK SYSTEM ================= */

    canEditAddress: {
      type: Boolean,
      default: true,
    },

    canEditPhone: {
      type: Boolean,
      default: true,
    },

    lockedAt: {
      type: Date,
      default: null,
    },

    /* ================= CANCELLATION ================= */

    cancelReason: {
      type: String,
      default: "",
    },

    cancelComment: {
      type: String,
      default: "",
    },

    refundMode: {
      type: String,
      enum: ["Original", "Wallet"],
      default: "Original",
    },

    cancelledAt: {
      type: Date,
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
            "Out for Delivery",
            "Delivered",
            "Cancelled",
          ],
        },
        date: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          default: "",
        },
      },
    ],


    /* ================= PAYMENT ================= */
    paymentType: {
      type: String,
      enum: ["COD", "UPI", "CARD"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentId: {
      type: String,
      default: "N/A",
    },

    /* ================= PAYMENT CHANGE CONTROL ================= */

paymentChanged: {
  type: Boolean,
  default: false,
},

paymentChangedAt: {
  type: Date,
  default: null,
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

  if (this.isModified("status")) {

    const now = new Date()

    this.trackingEvents.push({
      status: this.status,
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      })
    })

    this.statusHistory.push({
      status: this.status,
      date: now
    })

  }

})
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
