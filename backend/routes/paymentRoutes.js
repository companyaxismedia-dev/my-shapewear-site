const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

router.post("/verify-and-save", async (req, res) => {
  const { customerData, paymentId, amount, items } = req.body;

  try {
    const newOrder = new Order({
      // Schema ke 'userInfo' object se match karne ke liye:
      userInfo: {
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city
      },
      // Schema ke 'products' array se match karne ke liye:
      products: items, 
      totalAmount: amount,
      paymentId: paymentId,
      paymentType: "Online", // Default Online
      status: "Order Placed", // Taaki Pehla Green Tick dikhe
      trackingId: "" // Shuruat mein khali rahega
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, orderId: savedOrder._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;