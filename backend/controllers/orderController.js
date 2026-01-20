const Order = require("../models/Order");

// Order create karne ka function
exports.createOrder = async (req, res) => {
  try {
    const { products, totalAmount, userInfo, paymentId } = req.body;

    const order = new Order({
      products,
      totalAmount,
      userInfo,
      paymentId,
      paymentStatus: paymentId ? "paid" : "pending",
      deliveryStatus: "Processing"
    });

    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Saare orders dekhne ke liye
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Status badalne ke liye
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(id, { deliveryStatus }, { new: true });
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};