const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const { getOrderDerivedStatus } = require("../utils/orderStatus");

const ONLINE_METHODS = ["UPI", "CARD"];

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys missing in environment");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

function toPaise(amount) {
  return Math.round(Number(amount || 0) * 100);
}

function safeCompare(a = "", b = "") {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, signature }) {
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return safeCompare(expectedSignature, signature);
}

function normalizePaymentMethod(method, fallback = "UPI") {
  const normalized = String(method || "").toUpperCase();

  if (normalized === "CARD") return "CARD";
  if (normalized === "UPI") return "UPI";

  return fallback;
}

function normalizePhone(phone = "") {
  const digits = String(phone).replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function buildCheckoutPrefill(order) {
  return {
    name: order.userInfo?.name || "",
    email: order.userInfo?.email || "",
    contact: normalizePhone(order.userInfo?.phone || ""),
  };
}

async function reduceStockForOrder(order) {
  for (const item of order.products || []) {
    if (!item.productId) continue;

    const product = await Product.findById(item.productId);
    if (!product) continue;

    for (const variant of product.variants || []) {
      for (const size of variant.sizes || []) {
        if (size.size === item.size) {
          size.stock = Math.max(0, Number(size.stock || 0) - Number(item.quantity || 0));
        }
      }
    }

    await product.save();
  }
}

async function markOrderPaid(order, transaction, payment) {
  const wasAlreadyPaid = order.payment?.status === "Paid";
  const actualMethod = normalizePaymentMethod(payment.method, transaction.method);

  transaction.method = actualMethod;
  transaction.status = payment.status;
  transaction.razorpayPaymentId = payment.id;
  transaction.rawResponse = payment;
  transaction.paidAt = payment.captured_at
    ? new Date(payment.captured_at * 1000)
    : new Date();

  order.payment.status = "Paid";
  order.payment.method = actualMethod;
  order.payment.paymentId = payment.id;
  order.payment.provider = "razorpay";
  order.payment.razorpayOrderId =
    payment.order_id || order.payment.razorpayOrderId || transaction.razorpayOrderId || "";
  order.payment.latestTransactionId = transaction._id;
  order.payment.paidAt = transaction.paidAt;

  if (!wasAlreadyPaid) {
    await reduceStockForOrder(order);
    await Cart.deleteOne({ user: order.userId });
  }

  await Promise.all([transaction.save(), order.save()]);
}

async function findOrderForPayment(orderId, userId) {
  return Order.findOne({
    _id: orderId,
    userId,
  });
}

function validatePayableOrder(order) {
  if (!order) {
    return "Order not found";
  }

  if (order.payment?.status === "Paid") {
    return "Order is already paid";
  }

  const currentStatus = getOrderDerivedStatus(order.products || []);
  if (["Cancelled", "Shipped", "Out for Delivery", "Delivered"].includes(currentStatus)) {
    return "Payment cannot be started for this order";
  }

  return "";
}

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    const method = String(paymentMethod || "").toUpperCase();

    if (!orderId || !ONLINE_METHODS.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Valid orderId and paymentMethod are required",
      });
    }

    const order = await findOrderForPayment(orderId, req.user._id);
    const orderError = validatePayableOrder(order);
    if (orderError) {
      return res.status(order ? 400 : 404).json({
        success: false,
        message: orderError,
      });
    }

    const amount = Number(order.pricing?.totalAmount || 0);
    const amountInPaise = toPaise(amount);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: order.orderNumber || String(order._id),
      notes: {
        app_order_id: String(order._id),
        app_order_number: order.orderNumber || "",
        user_id: String(req.user._id),
        payment_method: method,
      },
    });

    const transaction = await Transaction.create({
      orderId: order._id,
      userId: req.user._id,
      provider: "razorpay",
      method,
      amount,
      currency: "INR",
      razorpayOrderId: razorpayOrder.id,
      status: "created",
      rawResponse: razorpayOrder,
    });

    order.payment.method = method;
    order.payment.status = "Pending";
    order.payment.provider = "razorpay";
    order.payment.razorpayOrderId = razorpayOrder.id;
    order.payment.latestTransactionId = transaction._id;
    order.payment.paymentId = "";
    order.payment.paidAt = null;
    await order.save();

    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order._id,
      transactionId: transaction._id,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      prefill: buildCheckoutPrefill(order),
    });
  } catch (error) {
    console.error("CREATE RAZORPAY ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create Razorpay order",
    });
  }
};

exports.createUpiQrCode = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const order = await findOrderForPayment(orderId, req.user._id);
    const orderError = validatePayableOrder(order);
    if (orderError) {
      return res.status(order ? 400 : 404).json({
        success: false,
        message: orderError,
      });
    }

    const amount = Number(order.pricing?.totalAmount || 0);
    const amountInPaise = toPaise(amount);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    const razorpay = getRazorpayClient();
    const closeBy = Math.floor(Date.now() / 1000) + 16 * 60;
    const qrCode = await razorpay.qrCode.create({
      type: "upi_qr",
      name: `Glovia Glamour ${order.orderNumber || order._id}`,
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amountInPaise,
      description: `Payment for order ${order.orderNumber || order._id}`,
      close_by: closeBy,
      notes: {
        app_order_id: String(order._id),
        app_order_number: order.orderNumber || "",
        user_id: String(req.user._id),
        payment_method: "UPI_QR",
      },
    });

    const transaction = await Transaction.create({
      orderId: order._id,
      userId: req.user._id,
      provider: "razorpay",
      method: "UPI",
      amount,
      currency: "INR",
      razorpayQrCodeId: qrCode.id,
      qrImageUrl: qrCode.image_url,
      qrExpiresAt: qrCode.close_by ? new Date(qrCode.close_by * 1000) : new Date(closeBy * 1000),
      status: "created",
      rawResponse: qrCode,
    });

    order.payment.method = "UPI";
    order.payment.status = "Pending";
    order.payment.provider = "razorpay";
    order.payment.latestTransactionId = transaction._id;
    order.payment.paymentId = "";
    order.payment.paidAt = null;
    await order.save();

    return res.status(201).json({
      success: true,
      orderId: order._id,
      transactionId: transaction._id,
      qrCode: {
        id: qrCode.id,
        imageUrl: qrCode.image_url,
        amount: amountInPaise,
        currency: "INR",
        expiresAt: transaction.qrExpiresAt,
      },
    });
  } catch (error) {
    console.error("CREATE UPI QR ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create UPI QR code",
    });
  }
};

exports.checkUpiQrStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: req.user._id,
      provider: "razorpay",
      method: "UPI",
    });

    if (!transaction?.razorpayQrCodeId) {
      return res.status(404).json({
        success: false,
        message: "QR transaction not found",
      });
    }

    const order = await Order.findOne({
      _id: transaction.orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.payment?.status === "Paid") {
      return res.status(200).json({
        success: true,
        paid: true,
        orderId: order._id,
      });
    }

    const razorpay = getRazorpayClient();
    const payments = await razorpay.qrCode.fetchAllPayments(transaction.razorpayQrCodeId, {
      count: 10,
    });
    const capturedPayment = (payments.items || []).find((payment) => {
      return (
        payment.status === "captured" &&
        Number(payment.amount) === toPaise(order.pricing?.totalAmount || 0)
      );
    });

    if (capturedPayment) {
      await markOrderPaid(order, transaction, capturedPayment);

      return res.status(200).json({
        success: true,
        paid: true,
        orderId: order._id,
        paymentId: capturedPayment.id,
      });
    }

    return res.status(200).json({
      success: true,
      paid: false,
      status: transaction.status,
      expiresAt: transaction.qrExpiresAt,
    });
  } catch (error) {
    console.error("CHECK UPI QR STATUS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to check QR payment status",
    });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification data",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.payment?.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order mismatch",
      });
    }

    const transaction = await Transaction.findOne({
      orderId: order._id,
      userId: req.user._id,
      razorpayOrderId: razorpay_order_id,
    }).sort({ createdAt: -1 });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const isAuthentic = verifyCheckoutSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isAuthentic) {
      transaction.status = "failed";
      transaction.failureReason = "Signature verification failed";
      transaction.razorpayPaymentId = razorpay_payment_id;
      transaction.razorpaySignature = razorpay_signature;
      transaction.verifiedAt = new Date();
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    const expectedAmount = toPaise(order.pricing?.totalAmount || 0);

    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    transaction.verifiedAt = new Date();
    transaction.rawResponse = payment;

    if (payment.order_id !== razorpay_order_id || Number(payment.amount) !== expectedAmount) {
      transaction.status = "failed";
      transaction.failureReason = "Payment amount or order mismatch";
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: "Payment amount or order mismatch",
      });
    }

    if (payment.status !== "captured") {
      transaction.status = payment.status === "authorized" ? "authorized" : "failed";
      transaction.failureReason =
        payment.status === "authorized"
          ? "Payment authorized but not captured"
          : payment.error_description || payment.error_reason || "Payment not captured";
      await transaction.save();

      return res.status(400).json({
        success: false,
        message: "Payment is not captured yet",
      });
    }

    await markOrderPaid(order, transaction, payment);

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("VERIFY RAZORPAY PAYMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to verify payment",
    });
  }
};

exports.markPaymentFailed = async (req, res) => {
  try {
    const { orderId, reason = "Payment cancelled by customer" } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.payment?.status !== "Paid") {
      order.payment.status = "Failed";
      await order.save();
    }

    if (order.payment?.latestTransactionId) {
      await Transaction.findOneAndUpdate(
        {
          _id: order.payment.latestTransactionId,
          userId: req.user._id,
          status: { $ne: "captured" },
        },
        {
          status: "failed",
          failureReason: reason,
        }
      );
    }

    return res.status(200).json({
      success: true,
      orderId: order._id,
    });
  } catch (error) {
    console.error("MARK PAYMENT FAILED ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to mark payment failed",
    });
  }
};

exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay webhook secret missing",
      });
    }

    const signature = req.headers["x-razorpay-signature"];
    const body = req.body;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (!signature || !safeCompare(expectedSignature, signature)) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const payload = JSON.parse(body.toString("utf8"));
    const event = payload.event;
    const eventId = String(req.headers["x-razorpay-event-id"] || "");
    const payment = payload.payload?.payment?.entity;
    const notesOrderId = payment?.notes?.app_order_id;

    if (!payment?.id || (!payment.order_id && !notesOrderId)) {
      return res.status(200).json({ success: true });
    }

    const transactionQuery = payment.order_id
      ? { razorpayOrderId: payment.order_id }
      : { orderId: notesOrderId };

    const transaction = await Transaction.findOne(transactionQuery).sort({ createdAt: -1 });

    if (!transaction) {
      return res.status(200).json({ success: true });
    }

    if (
      eventId &&
      transaction.webhookEvents.some((webhookEvent) => webhookEvent.eventId === eventId)
    ) {
      return res.status(200).json({ success: true, duplicate: true });
    }

    const order = await Order.findById(transaction.orderId);
    transaction.webhookEvents.push({ eventId, event, receivedAt: new Date() });
    transaction.rawResponse = payment;
    transaction.razorpayPaymentId = payment.id || transaction.razorpayPaymentId;

    if (event === "payment.captured" && order) {
      await markOrderPaid(order, transaction, payment);
    } else if (event === "payment.failed") {
      transaction.status = "failed";
      transaction.failureReason =
        payment.error_description || payment.error_reason || "Payment failed";
      await transaction.save();

      if (order && order.payment?.status !== "Paid") {
        order.payment.status = "Failed";
        order.payment.paymentId = payment.id || order.payment.paymentId;
        await order.save();
      }
    } else {
      await transaction.save();
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("RAZORPAY WEBHOOK ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Webhook handling failed",
    });
  }
};
