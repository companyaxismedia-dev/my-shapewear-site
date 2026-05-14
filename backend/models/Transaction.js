const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["razorpay", "cod", "manual"],
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ["COD", "UPI", "CARD"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },
    razorpayQrCodeId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    qrImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    qrExpiresAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "created",
        "pending_collection",
        "authorized",
        "captured",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "created",
      index: true,
    },
    failureReason: {
      type: String,
      default: "",
      trim: true,
    },
    rawResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    webhookEvents: [
      {
        eventId: {
          type: String,
          default: "",
          trim: true,
        },
        event: {
          type: String,
          default: "",
          trim: true,
        },
        receivedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

TransactionSchema.index({ orderId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ razorpayOrderId: 1, razorpayPaymentId: 1 });
TransactionSchema.index({ razorpayQrCodeId: 1, createdAt: -1 });
TransactionSchema.index({ "webhookEvents.eventId": 1 });

module.exports =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
