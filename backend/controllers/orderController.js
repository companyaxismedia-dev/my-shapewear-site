const Order = require("../models/Order");
const Otp = require("../models/Otp");
const nodemailer = require("nodemailer");

/* ================= EMAIL TRANSPORTER ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =====================================================
   1. CREATE & VERIFY ORDER
===================================================== */
exports.createOrder = async (req, res) => {
  try {
    const { email, otp, customerData, items, amount, paymentId, paymentType } =
      req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email aur OTP zaroori hain!",
      });
    }

    const userEmail = email.toLowerCase().trim();

    /* ---------- OTP VERIFICATION ---------- */
    if (otp !== "DIRECT") {
      const record = await Otp.findOne({ email: userEmail });

      if (!record) {
        return res.status(400).json({
          success: false,
          message: "OTP nahi mila, dobara mangwayein.",
        });
      }

      if (Date.now() > record.expiresAt) {
        await Otp.deleteOne({ email: userEmail });
        return res.status(400).json({
          success: false,
          message: "OTP expire ho gaya hai.",
        });
      }

      if (String(record.otp) !== String(otp)) {
        return res.status(400).json({
          success: false,
          message: "Galat OTP!",
        });
      }

      await Otp.deleteOne({ email: userEmail });
    }

    /* ---------- CREATE ORDER ---------- */
    const newOrder = new Order({
      userId: req.user ? req.user._id : null, // logged user / guest

      userInfo: {
        name: customerData?.name || "Customer",
        phone: customerData?.phone || "",
        email: userEmail,
        address: customerData?.address || "N/A",
        city: customerData?.city || "N/A",
        pincode: customerData?.pincode || "",
      },

      products: (items || []).map((item) => ({
        name: item.name,
        price: item.offerPrice || item.price,
        quantity: item.qty || 1,
        size: item.size || "Standard",
      })),

      totalAmount: amount || 0,
      paymentId: paymentId || "N/A",
      paymentType: paymentType || "COD",
      status: "Order Placed",

      statusHistory: [
        {
          status: "Order Placed",
          date: new Date(),
        },
      ],
    });

    const savedOrder = await newOrder.save();

    /* ---------- ADMIN EMAIL ---------- */
    transporter
      .sendMail({
        from: `"Glovia Glamour" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `🛒 New Order ₹${amount}`,
        html: `
          <h2>New Order Received</h2>
          <p><b>Order ID:</b> ${savedOrder._id}</p>
          <p><b>Phone:</b> ${customerData?.phone}</p>
          <p><b>Amount:</b> ₹${amount}</p>
        `,
      })
      .catch((err) => console.error("Email error:", err));

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("❌ ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* =====================================================
   2. GET ALL ORDERS (ADMIN)
===================================================== */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   3. TRACK ORDER (GUEST – PHONE / ID)
===================================================== */
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Invalid Order ID",
    });
  }
};

/* =====================================================
   4. MY ORDERS (LOGIN USER)
===================================================== */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   5. ADMIN – UPDATE ORDER STATUS
===================================================== */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, trackingId } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "orderId and status are required",
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

    if (trackingId) {
      order.trackingId = trackingId;
    }

    order.statusHistory.push({
      status,
      date: new Date(),
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("❌ ADMIN UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
