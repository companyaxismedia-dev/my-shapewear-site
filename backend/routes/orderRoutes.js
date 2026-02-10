const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");

/* =====================================================
   1️⃣ CREATE ORDER
   POST /api/orders
   (Login user → userId save | Guest → userId null)
===================================================== */
router.post("/", protect, async (req, res) => {
  try {
    const { customerData, items, amount, paymentType, paymentId } = req.body;

    if (
      !customerData?.phone ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const newOrder = new Order({
      userId: req.user ? req.user._id : null,

      userInfo: {
        name: customerData.name || "Customer",
        phone: customerData.phone,
        email: customerData.email || "",
        address: customerData.address || "N/A",
        city: customerData.city || "N/A",
        pincode: customerData.pincode || "",
      },

      products: items.map((item) => ({
        name: item.name,
        price: Number(item.offerPrice || item.price),
        quantity: Number(item.qty || 1),
        size: item.size || "Standard",
      })),

      totalAmount: Number(amount),
      paymentType: paymentType || "COD",
      paymentId: paymentId || `ORDER_${Date.now()}`,

      status: "Order Placed",
      statusHistory: [
        {
          status: "Order Placed",
          date: new Date(),
        },
      ],
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



/* =====================================================
   2️⃣ MY ORDERS (LOGIN USER)
   GET /api/orders/my-orders
===================================================== */
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("❌ MY ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



/* =====================================================
   3️⃣ GUEST ORDER TRACK (PHONE)
   GET /api/orders/track?phone=9999999999
===================================================== */
router.get("/track", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number required",
      });
    }

    const orders = await Order.find({
      "userInfo.phone": phone,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("❌ TRACK ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



/* =====================================================
   4️⃣ SINGLE ORDER DETAIL
   GET /api/orders/:id
===================================================== */
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid Order ID",
    });
  }
});



/* =====================================================
   5️⃣ ADMIN – UPDATE ORDER STATUS
   PUT /api/orders/admin/update-status
===================================================== */
router.put("/admin/update-status", protect, admin, async (req, res) => {
  try {
    const { orderId, status, trackingId } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "orderId & status required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    if (trackingId) order.trackingId = trackingId;

    order.statusHistory.push({
      status,
      date: new Date(),
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("❌ ADMIN STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
