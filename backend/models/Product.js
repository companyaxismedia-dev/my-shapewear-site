const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    video: { type: String },
    description: String,
    category: String,
    stock: { type: Number, default: 10 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
