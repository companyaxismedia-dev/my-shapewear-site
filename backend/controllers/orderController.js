require("dotenv").config();

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Offer = require("../models/Offer");
const {
  applyBulkItemStatus,
  buildOrderStatusHistory,
  getOrderDerivedStatus,
  orderMatchesStatus,
} = require("../utils/orderStatus");

const { Resend } = require("resend");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const PLATFORM_FEE = 30;
const SHIPPING_CHARGE = 0;

function serializeOrder(orderDoc) {
  const order =
    typeof orderDoc?.toObject === "function" ? orderDoc.toObject() : orderDoc;
  const status = getOrderDerivedStatus(order?.products || []);
  const statusHistory = buildOrderStatusHistory(order?.products || []);

  return {
    ...order,
    finalAmount: order?.pricing?.totalAmount ?? order?.finalAmount ?? 0,
    status,
    statusHistory,
    trackingEvents: statusHistory,
  };
}

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
      let selectedPrice = item.product.minPrice;
      let selectedMrp = item.product.mrp;
      item.product.variants.forEach((variant) => {
        variant.sizes.forEach((size) => {
          if (size.size === item.size) {
            selectedPrice = size.price;
            selectedMrp = size.mrp || size.price;
          }
        });
      });
      const quantity = item.qty;
      return {
        productId: item.product._id,
        name: item.product.name,
        price: selectedPrice,
        listingPrice: selectedMrp,
        quantity,
        size: item.size || "Standard",
        img: item.product.thumbnail || "",
        lineTotal: selectedPrice * quantity,
        itemStatus: "Order Placed",
        itemStatusHistory: [
          {
            status: "Order Placed",
            message: "Order created",
            date: new Date(),
          },
        ],
      };
    });

    /* ---------- TOTAL ---------- */

    const totalMrp = orderProducts.reduce(
      (sum, item) => sum + item.listingPrice * item.quantity,
      0
    );
    const totalAmount = orderProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    /* ---------- OFFER LOGIC ---------- */
    let discountAmount = 0;
    let finalAmount = totalAmount + SHIPPING_CHARGE + PLATFORM_FEE;
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
        totalAmount + SHIPPING_CHARGE + PLATFORM_FEE - discountAmount,
        0
      );

      appliedOfferCode = offer.code;


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

    /* ---------- ORDER NUMBER GENERATE ---------- */

    const orderCount = await Order.countDocuments()

    const orderNumber =
      "ORD-" +
      new Date().getFullYear() +
      "-" +
      Math.floor(100000 + Math.random() * 900000);


    const order = new Order({
      orderNumber: orderNumber,
      userId: req.user._id,
      userInfo: {
        name: address.fullName,
        phone: address.phone,
        alternatePhone: address.alternatePhone || "",
        email: user.email,
        addressLine1: address.addressLine,
        addressLine2: address.addressLine2 || "",
        city: address.city,
        state: address.state || "",
        pincode: address.pincode,
        country: address.country || "India",
      },
      products: orderProducts,
      pricing: {
        subtotal: totalMrp,
        productDiscount: totalMrp - totalAmount,
        couponDiscount: discountAmount,
        shippingCharge: SHIPPING_CHARGE,
        platformFee: PLATFORM_FEE,
        tax: 0,
        totalAmount: finalAmount,
      },
      coupon: {
        code: appliedOfferCode || "",
        title: "",
        discountType: offerCode ? (offer.discountType || "") : "",
        discountValue: offerCode ? (offer.discountValue || 0) : 0,
        discountAmount: discountAmount,
      },
      offersEarned: offersEarned,
      shipment: {
        trackingId: "",
        courier: "",
        trackingUrl: "",
        estimatedDelivery: null,
        shippedAt: null,
        deliveredAt: null,
      },
      canEditAddress: true,
      canEditPhone: true,
      lockedAt: null,
      cancellation: {
        cancelReason: "",
        cancelComment: "",
        refundMode: "Original",
        cancelledAt: null,
      },
      payment: {
        method: finalPaymentType,
        status: "Pending",
        paymentId: paymentId || "N/A",
        paidAt: null,
        paymentChanged: false,
        paymentChangedAt: null,
      },
      invoiceNumber: "",
      supportTicketIds: [],
    });

    savedOrder = await order.save();

    /* ---------- STOCK REDUCE (FIXED VERSION) ---------- */
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

      // ⭐ FIX: agar createdBy missing ho to set kar do
      if (!product.createdBy) {
        product.createdBy = req.user._id;
      }

      await product.save();
    }

    /* ---------- CLEAR CART ---------- */
    await Cart.deleteOne({ user: req.user._id });

    // update user's last activity (placed order)
    try {
      user.lastActivity = new Date();
      await user.save();
    } catch (e) {
      console.error('Failed to update user.lastActivity after order:', e.message);
    }

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
            <p><b>Final:</b> ₹${savedOrder.finalAmount}</p>
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

    const filteredOrders = orders
      .filter((order) => orderMatchesStatus(order.products, status))
      .map(serializeOrder);

    return res.status(200).json({
      success: true,
      orders: filteredOrders,
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
/* =====================================================
   3️⃣ TRACK ORDER
===================================================== */
exports.trackOrder = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      order: serializeOrder(order),
    });

  } catch {

    return res.status(500).json({
      success: false,
      message: "Invalid Order ID"
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
      orders: orders.map(serializeOrder),
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
      "Out for Delivery",
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

    applyBulkItemStatus(order, status, {
      trackingId,
      message: `Bulk order update to ${status}`,
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated",
      order: serializeOrder(order),
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

    // update user's last activity (viewed order)
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.lastActivity = new Date();
        await user.save();
      }
    } catch (e) {
      console.error('Failed to update lastActivity on order view:', e.message);
    }

    return res.status(200).json({
      success: true,
      order: serializeOrder(order),
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

    const { reason, comment, refundMode } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const currentStatus = getOrderDerivedStatus(order.products);

    if (["Shipped", "Out for Delivery", "Delivered", "Cancelled"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now"
      });
    }

    /* ========= UPDATE ORDER ========= */

    order.cancellation.cancelReason = reason;
    order.cancellation.cancelComment = comment;
    order.cancellation.refundMode = refundMode || "Original";
    order.cancellation.cancelledAt = new Date();
    applyBulkItemStatus(order, "Cancelled", {
      message: `Order cancelled${reason ? ` - ${reason}` : ""}`,
      reason,
      comment,
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: serializeOrder(order)
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
/* =====================================================
   8️⃣ UPDATE ORDER DELIVERY ADDRESS
===================================================== */
exports.updateOrderAddress = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    /* ===== ORDER NOT FOUND ===== */

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    /* ===== CHANGE BLOCK AFTER SHIPPING ===== */

    /* ===== CHANGE BLOCK AFTER SHIPPING ===== */

    const currentStatus = getOrderDerivedStatus(order.products);

    if (["Shipped", "Out for Delivery", "Delivered", "Cancelled"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Address cannot be changed after order is shipped"
      });
    }


    const { name, phone, alternatePhone, email, addressLine1, addressLine2, city, state, pincode, country } = req.body;

    /* ===== UPDATE DATA ===== */
    if (name) order.userInfo.name = name;
    if (phone) order.userInfo.phone = phone;
    if (alternatePhone) order.userInfo.alternatePhone = alternatePhone;
    if (email) order.userInfo.email = email;
    if (addressLine1) order.userInfo.addressLine1 = addressLine1;
    if (addressLine2) order.userInfo.addressLine2 = addressLine2;
    if (city) order.userInfo.city = city;
    if (state) order.userInfo.state = state;
    if (pincode) order.userInfo.pincode = pincode;
    if (country) order.userInfo.country = country;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Address updated",
      order: serializeOrder(order)
    });

  } catch (error) {

    console.error("UPDATE ADDRESS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};
/* =====================================================
   9️⃣ UPDATE ORDER PHONE
===================================================== */

exports.updateOrderPhone = async (req, res) => {
  try {

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (!order.canEditPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone cannot be changed for this order"
      });
    }


    const { name, phone, alternatePhone } = req.body;

    /* ===== NOTHING TO UPDATE ===== */
    if (!name && !phone && !alternatePhone) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update"
      });
    }

    /* ===== UPDATE DATA ===== */
    if (name) order.userInfo.name = name;
    if (phone) order.userInfo.phone = phone;
    if (alternatePhone) order.userInfo.alternatePhone = alternatePhone;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Phone updated successfully",
      order: serializeOrder(order)
    });

  } catch (error) {

    console.error("UPDATE PHONE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

/* =====================================================
   🔟 UPDATE PAYMENT METHOD
===================================================== */

exports.updatePayment = async (req, res) => {

  try {

    const { paymentMethod, paymentStatus, paymentId } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    
    /* ===== BLOCK PAYMENT CHANGE FOR FINAL ORDERS ===== */

    const currentStatus = getOrderDerivedStatus(order.products);

    if (["Cancelled", "Delivered"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Payment cannot be changed for this order"
      });
    }

    /* ===== BLOCK AFTER SHIPPING ===== */

    if (["Shipped", "Out for Delivery"].includes(currentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Payment cannot be changed after order is shipped"
      });
    }

    /* ===== ONLY COD ORDERS CAN CHANGE PAYMENT ===== */

    if (order.payment.method !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Only COD orders can change payment method"
      });
    }

    /* ===== PAYMENT CHANGE TIME LIMIT (2 HOURS) ===== */

    const orderTime = new Date(order.createdAt).getTime();
    const now = Date.now();

    const twoHours = 2 * 60 * 60 * 1000;

    if (now - orderTime > twoHours) {
      return res.status(400).json({
        success: false,
        message: "Payment change allowed only within 2 hours"
      });
    }

    /* ===== ONLY ONE TIME CHANGE ===== */

    if (order.payment.paymentChanged) {
      return res.status(400).json({
        success: false,
        message: "Payment method already changed once"
      });
    }

    /* ===== UPDATE PAYMENT ===== */


    if (paymentMethod) {
      order.payment.method = paymentMethod;
    }
    if (paymentStatus) {
      order.payment.status = paymentStatus;
    }
    if (paymentId) {
      order.payment.paymentId = paymentId;
    }
    order.payment.paymentChanged = true;
    order.payment.paymentChangedAt = new Date();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      order: serializeOrder(order)
    });

  } catch (error) {

    console.error("UPDATE PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
