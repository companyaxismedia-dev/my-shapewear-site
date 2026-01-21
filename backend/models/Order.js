const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
  },
  products: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  trackingId: { type: String, default: "" }, 
  status: { type: String, default: "Order Placed" }, 
  paymentType: { type: String, default: "Online" }, // Sirf Online Payment
  paymentId: { type: String, required: true },    // Gateway se aayi Transaction ID
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);