import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customerName: String,
  phone: String,
  address: String,
  city: String,
  items: Array,
  totalAmount: Number,
  status: { type: String, default: "Pending" }, // Pending, Shipped, Delivered
  paymentMethod: String, // COD or Razorpay
  paymentId: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);