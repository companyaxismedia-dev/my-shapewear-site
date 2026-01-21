const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Live Website Domain (Tracking link ke liye kaam aayega)
const DOMAIN = "https://www.bootybloom.online";

router.post("/verify-and-save", async (req, res) => {
  const { customerData, paymentId, amount, items, paymentType } = req.body;

  try {
    const newOrder = new Order({
      // Schema ke 'userInfo' se matching
      userInfo: {
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city || "N/A",
        pincode: customerData.pincode || "N/A"
      },
      // Schema ke 'products' se matching
      products: items.map(item => ({
        name: item.name,
        price: item.price,
        size: item.size,
        quantity: item.quantity || 1
      })), 
      totalAmount: amount,
      paymentId: paymentId || "N/A",
      // Agar frontend se paymentType aa raha hai toh wo, nahi toh "Online"
      paymentType: paymentType || "Online Paid", 
      status: "Order Placed", 
      trackingId: "",
      createdAt: new Date()
    });

    const savedOrder = await newOrder.save();

    // Response mein success ke saath Order ID bhej rahe hain
    res.status(201).json({ 
      success: true, 
      message: "Order saved successfully",
      orderId: savedOrder._id,
      trackingUrl: `${DOMAIN}/track?id=${savedOrder._id}` // User ke liye direct link
    });

  } catch (error) {
    console.error("Order Save Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: "Database mein order save nahi ho paya." 
    });
  }
});

module.exports = router;