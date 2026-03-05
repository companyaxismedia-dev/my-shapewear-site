require("dotenv").config();

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Offer = require("../models/Offer");

const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/* =====================================================
   1️⃣ CREATE ORDER FROM CART (WITH OFFER SUPPORT)
===================================================== */
exports.createOrder = async (req, res) => {
  try {
    const { paymentId, paymentType, addressId, offerCode } = req.body;
    /* ---------- PAYMENT TYPE VALIDATION ---------- */
    const allowedPayments = ["COD", "UPI", "CARD"];

    const finalPaymentType =
      allowedPayments.includes(paymentType)
        ? paymentType
        : "COD";

    /* ---------- USER ---------- */
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    /* ---------- CART ---------- */
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");
    console.log("========= ORDER DEBUG =========");
    console.log("REQ USER:", req.user._id);
    console.log("CART:", cart);
    console.log("================================");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart empty hai",
      });
    }

    /* ---------- ADDRESS ---------- */
    const address =
      user.addresses?.find(
        (a) => a._id.toString() === addressId
      ) || user.addresses?.find((a) => a.isDefault === true);

    console.log("ADDRESS ID FROM FRONTEND:", addressId);
    console.log("USER ADDRESSES:", user.addresses);
    console.log("SELECTED ADDRESS:", address);

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Delivery address nahi mila",
      });
    }

    /* ---------- PRODUCTS ---------- */
    const orderProducts = cart.items.map((item) => {
      if (!item.product) {
        throw new Error("Product missing in cart");
      }

      return {
        productId: item.product._id,
        name: item.product.name,
        price: item.product.minPrice || 0,
        quantity: item.qty,
        size: item.size || "Standard",
        img: item.product.thumbnail || "",
      };
    });

    /* ---------- TOTAL ---------- */
    const totalAmount = orderProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    /* ---------- OFFER LOGIC ---------- */
    let discountAmount = 0;
let finalAmount = totalAmount;
let appliedOfferCode = null;
let offersEarned = [];

    if (offerCode) {
      const offer = await Offer.findOne({
        code: offerCode.toUpperCase(),
      });

      if (!offer) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer code",
        });
      }

      if (!offer.isValidOffer()) {
        return res.status(400).json({
          success: false,
          message: "Offer expired or inactive",
        });
      }

      if (totalAmount < offer.minOrderValue) {
        return res.status(400).json({
          success: false,
          message: `Minimum order ₹${offer.minOrderValue} required`,
        });
      }

      // percentage discount
      if (offer.discountType === "percentage") {
        discountAmount =
          (totalAmount * offer.discountValue) / 100;

        if (
          offer.maxDiscount &&
          discountAmount > offer.maxDiscount
        ) {
          discountAmount = offer.maxDiscount;
        }
      }

      // flat discount
      if (offer.discountType === "flat") {
        discountAmount = offer.discountValue;
      }

      finalAmount = Math.max(
        totalAmount - discountAmount,
        0
      );

      appliedOfferCode = offer.code;
      orderProducts; // ignore

      if (appliedOfferCode) {
  offersEarned.push(
    `Offer ${appliedOfferCode} applied - Saved ₹${discountAmount}`
  );
}

      // increase usage count
      offer.usedCount += 1;
      await offer.save();
    }

    let savedOrder = null;

for (const item of orderProducts) {

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

    products: [item], // 👈 only one product per order

    totalAmount: item.price * item.quantity,
    offerCode: appliedOfferCode,
    discountAmount: 0,
    finalAmount: item.price * item.quantity,

    offersEarned,

    paymentId: paymentId || "N/A",
    paymentType: finalPaymentType,
    paymentStatus:
      finalPaymentType === "COD"
        ? "Pending"
        : paymentId
          ? "Paid"
          : "Pending",

    status: "Order Placed",

    statusHistory: [{ status: "Order Placed" }],

    trackingEvents: [
      {
        status: "Order Placed",
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
      },
    ],

  });

  savedOrder = await order.save();
}

    /* ---------- STOCK REDUCE (FIXED VERSION) ---------- */
    for (const item of cart.items) {
      const product = item.product;

      if (!product) continue;

      for (const variant of product.variants) {
        for (const size of variant.sizes) {
          if (size.size === item.size) {
            size.stock = Math.max(0, size.stock - item.qty);
          }
        }
      }

      await product.save();
    }


    /* ---------- CLEAR CART ---------- */
    await Cart.deleteOne({ user: req.user._id });

    /* ---------- ADMIN EMAIL ---------- */
    if (resend && process.env.OTP_FROM_EMAIL) {
      resend.emails
        .send({
          from: process.env.OTP_FROM_EMAIL,
          to: [process.env.OTP_FROM_EMAIL],
          subject: `🛒 New Order ₹${totalAmount}`,
          html: `
            <h2>New Order Received</h2>
            <p><b>Order ID:</b> ${savedOrder._id}</p>
            <p><b>Phone:</b> ${address.phone}</p>
            <p><b>Total:</b> ₹${totalAmount}</p>
            <p><b>Discount:</b> ₹${discountAmount}</p>
            <p><b>Final:</b> ₹${finalAmount}</p>
          `,
        })
        .catch(() => { });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: savedOrder._id,
      totalAmount,
      discountAmount,
      finalAmount,
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

/* =====================================================
   2️⃣ MY ORDERS
===================================================== */
exports.getMyOrders = async (req, res) => {
  try {
    const { search, status, time } = req.query;

    const filter = {
      userId: req.user._id,
    };

    /* ========= STATUS FILTER ========= */
    if (status && status !== "all") {
      if (status === "on-the-way") {
        filter.status = "Shipped";
      } else {
        filter.status =
          status.charAt(0).toUpperCase() + status.slice(1);
      }
    }

    /* ========= TIME FILTER ========= */
    if (time && time !== "all") {
      const now = new Date();

      if (time === "last-30-days") {
        const d = new Date();
        d.setDate(now.getDate() - 30);
        filter.createdAt = { $gte: d };
      }

      if ([2026, 2025, 2024, 2023].includes(Number(time))) {
        filter.createdAt = {
          $gte: new Date(`${time}-01-01`),
          $lt: new Date(`${Number(time) + 1}-01-01`),
        };
      }

      if (time === "older") {
        filter.createdAt = {
          $lt: new Date("2023-01-01"),
        };
      }
    }

    /* ========= SEARCH FILTER ========= */
    if (search) {
      filter.$or = [
        { "products.name": { $regex: search, $options: "i" } },
        { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : undefined },
      ];
    }

    const orders = await Order.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* =====================================================
   3️⃣ TRACK ORDER
===================================================== */
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

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

  } catch {
    return res.status(500).json({
      success: false,
      message: "Invalid Order ID",
    });
  }
};

/* =====================================================
   4️⃣ ADMIN – GET ALL ORDERS
===================================================== */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    });

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
   5️⃣ ADMIN – UPDATE ORDER STATUS
===================================================== */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, trackingId } = req.body;
    const allowedStatuses = [
      "Order Placed",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
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

    order.statusHistory.push({ status });
    order.trackingEvents.push({
      status,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   6️⃣ GET SINGLE ORDER (SUCCESS PAGE)
===================================================== */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

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
   7️⃣ CANCEL ORDER (USER SIDE)
===================================================== */
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }



    // ❌ delivered / shipped cancel nahi hoga
    if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    order.status = "Cancelled";
    order.statusHistory.push({
      status: "Cancelled",
      reason: req.body.reason,
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};