const mongoose = require("mongoose");

const ORDER_STATUS = [
  "Order Placed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Partially Cancelled",
  "Partially Delivered",
  "Partially Returned",
  "Returned",
  "Partially Exchanged",
  "Exchanged",
];

const ITEM_STATUS = [
  "Order Placed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Return Requested",
  "Return Approved",
  "Picked Up",
  "Returned",
  "Refund Processed",
  "Exchange Requested",
  "Exchange Approved",
  "Exchange Shipped",
  "Exchange Delivered",
];

const OrderSchema = new mongoose.Schema(
  {
    /* ================= USER / DELIVERY INFO ================= */
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
        default: "",
      },

      addressLine1: {
        type: String,
        required: [true, "Delivery address is mandatory"],
        trim: true,
      },

      addressLine2: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        default: "",
      },

      pincode: {
        type: String,
        trim: true,
        default: "",
      },

      country: {
        type: String,
        trim: true,
        default: "India",
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
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    /* ================= PRODUCTS SNAPSHOT ================= */
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          default: null,
        },

        variantId: {
          type: String,
          default: "",
          trim: true,
        },

        sku: {
          type: String,
          default: "",
          trim: true,
          uppercase: true,
        },

        brand: {
          type: String,
          default: "",
          trim: true,
        },

        name: {
          type: String,
          required: true,
          trim: true,
        },

        img: {
          type: String,
          default: "",
          trim: true,
        },

        color: {
          type: String,
          default: "",
          trim: true,
        },

        size: {
          type: String,
          default: "Standard",
          trim: true,
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },

        mrp: {
          type: Number,
          default: 0,
          min: 0,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        discount: {
          type: Number,
          default: 0,
          min: 0,
        },

        lineTotal: {
          type: Number,
          required: true,
          min: 0,
        },

        itemStatus: {
          type: String,
          enum: ITEM_STATUS,
          default: "Order Placed",
          index: true,
        },

        estimatedDelivery: {
          type: Date,
          default: null,
        },

        deliveredAt: {
          type: Date,
          default: null,
        },

        cancellation: {
          isCancelled: {
            type: Boolean,
            default: false,
          },
          cancelledAt: {
            type: Date,
            default: null,
          },
          cancelReason: {
            type: String,
            default: "",
            trim: true,
          },
          cancelComment: {
            type: String,
            default: "",
            trim: true,
          },
        },

        returnInfo: {
          isReturnEligible: {
            type: Boolean,
            default: false,
          },
          returnWindowEnd: {
            type: Date,
            default: null,
          },
          isReturnRequested: {
            type: Boolean,
            default: false,
          },
          requestedAt: {
            type: Date,
            default: null,
          },
          approvedAt: {
            type: Date,
            default: null,
          },
          pickedUpAt: {
            type: Date,
            default: null,
          },
          returnedAt: {
            type: Date,
            default: null,
          },
          reason: {
            type: String,
            default: "",
            trim: true,
          },
          refundAmount: {
            type: Number,
            default: 0,
            min: 0,
          },
          refundStatus: {
            type: String,
            enum: ["Pending", "Processed", "Rejected"],
            default: "Pending",
          },
        },

        exchangeInfo: {
          isExchangeEligible: {
            type: Boolean,
            default: false,
          },
          isExchangeRequested: {
            type: Boolean,
            default: false,
          },
          requestedAt: {
            type: Date,
            default: null,
          },
          approvedAt: {
            type: Date,
            default: null,
          },
          reason: {
            type: String,
            default: "",
            trim: true,
          },
          newSize: {
            type: String,
            default: "",
            trim: true,
          },
          newVariantId: {
            type: String,
            default: "",
            trim: true,
          },
          exchangeStatus: {
            type: String,
            enum: [
              "Pending",
              "Approved",
              "Rejected",
              "Exchange Shipped",
              "Exchange Delivered",
            ],
            default: "Pending",
          },
        },

        itemStatusHistory: [
          {
            status: {
              type: String,
              default: "",
              trim: true,
            },
            message: {
              type: String,
              default: "",
              trim: true,
            },
            date: {
              type: Date,
              default: Date.now,
            },
          },
        ],
      },
    ],

    /* ================= PRICING ================= */
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      productDiscount: {
        type: Number,
        default: 0,
        min: 0,
      },
      couponDiscount: {
        type: Number,
        default: 0,
        min: 0,
      },
      shippingCharge: {
        type: Number,
        default: 0,
        min: 0,
      },
      platformFee: {
        type: Number,
        default: 0,
        min: 0,
      },
      tax: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },

    /* ================= APPLIED COUPON SNAPSHOT ================= */
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
      discountAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    /* ================= FRONTEND FEATURES ================= */
    offersEarned: {
      type: [String],
      default: [],
    },

    /* ================= SHIPMENT / LOGISTICS ================= */
    shipment: {
      trackingId: {
        type: String,
        default: "",
        trim: true,
        index: true,
      },
      courier: {
        type: String,
        default: "",
        trim: true,
      },
      trackingUrl: {
        type: String,
        default: "",
        trim: true,
      },
      estimatedDelivery: {
        type: Date,
        default: null,
      },
      shippedAt: {
        type: Date,
        default: null,
      },
      deliveredAt: {
        type: Date,
        default: null,
      },
    },

    /* ================= OVERALL ORDER STATUS ================= */
    status: {
      type: String,
      enum: ORDER_STATUS,
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

    /* ================= ORDER LEVEL CANCELLATION ================= */
    cancellation: {
      cancelReason: {
        type: String,
        default: "",
        trim: true,
      },
      cancelComment: {
        type: String,
        default: "",
        trim: true,
      },
      refundMode: {
        type: String,
        enum: ["Original", "Wallet"],
        default: "Original",
      },
      cancelledAt: {
        type: Date,
        default: null,
      },
    },

    /* ================= STATUS HISTORY ================= */
    statusHistory: [
      {
        status: {
          type: String,
          enum: ORDER_STATUS,
        },
        message: {
          type: String,
          default: "",
          trim: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],

    /* ================= PAYMENT ================= */
    payment: {
      method: {
        type: String,
        enum: ["COD", "UPI", "CARD", "NETBANKING", "WALLET"],
        default: "COD",
      },
      status: {
        type: String,
        enum: ["Pending", "Paid", "Failed", "Refunded", "Partially Refunded"],
        default: "Pending",
      },
      paymentId: {
        type: String,
        default: "",
        trim: true,
      },
      paidAt: {
        type: Date,
        default: null,
      },
      paymentChanged: {
        type: Boolean,
        default: false,
      },
      paymentChangedAt: {
        type: Date,
        default: null,
      },
    },

    /* ================= EXTRA ================= */
    invoiceNumber: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    supportTicketIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
    ],
  },
  {
    timestamps: true,
  }
);

/* ======================================================
   AUTO PUSH ORDER STATUS HISTORY
====================================================== */
OrderSchema.pre("save", function () {
  if (this.isNew || this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      message: this.isNew ? "Order created" : "Order status updated",
      date: new Date(),
    });
  }
});

/* ======================================================
   INDEXES
====================================================== */
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ "userInfo.phone": 1, createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "shipment.trackingId": 1 });
OrderSchema.index({ "products.sku": 1 });
OrderSchema.index({ "products.itemStatus": 1 });
OrderSchema.index({ "payment.status": 1 });

/* ======================================================
   EXPORT SAFE
====================================================== */
module.exports =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);