require("dotenv").config();

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");

const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

/* =====================================================
   1️⃣ CREATE ORDER FROM CART (AMAZON STYLE – LOGIN USER)
===================================================== */
exports.createOrder = async (req, res) => {
  try {
    const { paymentId, paymentType, addressId } = req.body;

    /* ---------- FETCH USER ---------- */
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------- FETCH CART ---------- */
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart empty hai",
      });
    }

    /* ---------- FETCH ADDRESS ---------- */
    const address =
      user.addresses?.find((a) => a._id.toString() === addressId) ||
      user.addresses?.find((a) => a.isDefault === true);

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Delivery address nahi mila",
      });
    }

    /* ---------- CREATE ORDER ---------- */
    const order = new Order({
      userId: req.user._id,

      userInfo: {
        name: address.fullName,
        phone: address.phone,
        email: user.email,
        address: address.addressLine,
        city: address.city,
        pincode: address.pincode,
      },

      products: cart.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.qty,
        size: item.size || "Standard",
        img: item.image,
      })),

      totalAmount: cart.bill,
      paymentId: paymentId || "N/A",
      paymentType: paymentType || "COD",

      status: "Order Placed",
      statusHistory: [{ status: "Order Placed" }],
    });

    const savedOrder = await order.save();

    /* ---------- CLEAR CART (AMAZON RULE) ---------- */
    await Cart.deleteOne({ userId: req.user._id });

    /* ---------- ADMIN EMAIL ---------- */
    resend.emails
      .send({
        from: process.env.OTP_FROM_EMAIL,
        to: [process.env.OTP_FROM_EMAIL],
        subject: `🛒 New Order ₹${cart.bill}`,
        html: `
          <h2>New Order Received</h2>
          <p><b>Order ID:</b> ${savedOrder._id}</p>
          <p><b>Phone:</b> ${address.phone}</p>
          <p><b>Amount:</b> ₹${cart.bill}</p>
        `,
      })
      .catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* =====================================================
   2️⃣ MY ORDERS (LOGIN USER)
===================================================== */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, orders });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* =====================================================
   3️⃣ TRACK ORDER (GUEST / USER)
===================================================== */
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch {
    res.status(500).json({ success: false, message: "Invalid Order ID" });
  }
};

/* =====================================================
   4️⃣ ADMIN – GET ALL ORDERS
===================================================== */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =====================================================
   5️⃣ ADMIN – UPDATE ORDER STATUS
===================================================== */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, trackingId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    if (trackingId) order.trackingId = trackingId;

    order.statusHistory.push({ status });
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated",
      order,
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
