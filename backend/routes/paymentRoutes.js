const express = require("express");
const router = express.Router();
const Order = require("../models/Order"); // Aapka model

// Payment Success hone ke baad Order Save karne ka route
router.post("/verify-and-save", async (req, res) => {
  const { customerData, paymentId, amount, items } = req.body;

  try {
    const newOrder = new Order({
      customerName: customerData.name,
      phone: customerData.phone,
      address: customerData.address,
      city: customerData.city,
      pincode: customerData.pincode,
      state: customerData.state,
      totalAmount: amount,
      paymentMethod: "Razorpay",
      paymentId: paymentId,
      status: "Paid",
      items: items // [ {name: "Shapewear", size: "M"} ]
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, orderId: savedOrder._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;