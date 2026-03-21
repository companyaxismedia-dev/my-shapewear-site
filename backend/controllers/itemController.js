require("dotenv").config();

const Order = require("../models/Order");

/* =====================================================
   1️⃣ CANCEL SPECIFIC ITEM
===================================================== */
exports.cancelItem = async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;
    const { reason, comment } = req.body;

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

    // Check if item exists
    if (!order.products[itemIndex]) {
      return res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
    }

    const item = order.products[itemIndex];

    // Check if item is already cancelled
    if (item.cancellation?.isCancelled) {
      return res.status(400).json({
        success: false,
        message: "Item is already cancelled",
      });
    }

    // Check if item can be cancelled (not delivered/shipped)
    const nonCancellableStatuses = ["Delivered", "Shipped", "Out for Delivery", "Picked Up"];
    if (nonCancellableStatuses.includes(item.itemStatus)) {
      return res.status(400).json({
        success: false,
        message: `Item cannot be cancelled as it is already ${item.itemStatus}`,
      });
    }

    // Cancel the item
    item.cancellation = {
      isCancelled: true,
      cancelledAt: new Date(),
      cancelReason: reason || "",
      cancelComment: comment || "",
    };

    item.itemStatus = "Cancelled";

    // Add to item status history
    if (!item.itemStatusHistory) {
      item.itemStatusHistory = [];
    }
    item.itemStatusHistory.push({
      status: "Cancelled",
      message: `Item cancelled - ${reason || "No reason provided"}`,
      date: new Date(),
    });

    // Update order status if all items are cancelled
    const allCancelled = order.products.every((p) => p.cancellation?.isCancelled);
    if (allCancelled) {
      order.status = "Cancelled";
      order.cancellation.cancelledAt = new Date();
    } else {
      order.status = "Partially Cancelled";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Item cancelled successfully",
      order,
      item,
    });
  } catch (error) {
    console.error("CANCEL ITEM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   2️⃣ REQUEST RETURN FOR SPECIFIC ITEM
===================================================== */
exports.requestReturnItem = async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;
    const { reason, images } = req.body;

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

    if (!order.products[itemIndex]) {
      return res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
    }

    const item = order.products[itemIndex];

    // Check if item is eligible for return
    if (item.itemStatus !== "Delivered" && item.itemStatus !== "Out for Delivery") {
      return res.status(400).json({
        success: false,
        message: "Item is not eligible for return yet",
      });
    }

    if (!item.returnInfo) {
      item.returnInfo = {};
    }

    // Check return window
    const deliveryDate = item.deliveredAt || new Date(item.estimatedDelivery);
    const returnWindowEnd = new Date(deliveryDate);
    returnWindowEnd.setDate(returnWindowEnd.getDate() + 7); // 7 days return window

    if (new Date() > returnWindowEnd) {
      return res.status(400).json({
        success: false,
        message: "Item return window has expired",
      });
    }

    // Update return info
    item.itemStatus = "Return Requested";
    item.returnInfo = {
      isReturnEligible: true,
      returnWindowEnd,
      returnReason: reason || "",
      returnImages: images || [],
      requestedAt: new Date(),
    };

    if (!item.itemStatusHistory) {
      item.itemStatusHistory = [];
    }
    item.itemStatusHistory.push({
      status: "Return Requested",
      message: `Return requested - ${reason || "No reason provided"}`,
      date: new Date(),
    });

    // Update order status
    const anyReturned = order.products.some((p) => p.itemStatus === "Return Requested" || p.itemStatus === "Returned");
    if (anyReturned && !order.products.every((p) => p.itemStatus === "Returned")) {
      order.status = "Partially Returned";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
      order,
      item,
    });
  } catch (error) {
    console.error("RETURN ITEM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   3️⃣ REQUEST EXCHANGE FOR SPECIFIC ITEM
===================================================== */
exports.requestExchangeItem = async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;
    const { reason, newSize, newColor, newProductId } = req.body;

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

    if (!order.products[itemIndex]) {
      return res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
    }

    const item = order.products[itemIndex];

    // Check if item is eligible for exchange
    if (item.itemStatus !== "Delivered" && item.itemStatus !== "Out for Delivery") {
      return res.status(400).json({
        success: false,
        message: "Item is not eligible for exchange yet",
      });
    }

    if (!item.exchangeInfo) {
      item.exchangeInfo = {};
    }

    // Check exchange window (7 days)
    const deliveryDate = item.deliveredAt || new Date(item.estimatedDelivery);
    const exchangeWindowEnd = new Date(deliveryDate);
    exchangeWindowEnd.setDate(exchangeWindowEnd.getDate() + 7);

    if (new Date() > exchangeWindowEnd) {
      return res.status(400).json({
        success: false,
        message: "Item exchange window has expired",
      });
    }

    // Update exchange info
    item.itemStatus = "Exchange Requested";
    item.exchangeInfo = {
      isExchangeEligible: true,
      exchangeWindowEnd,
      exchangeReason: reason || "",
      newSize: newSize || item.size,
      newColor: newColor || item.color,
      newProductId: newProductId || item.productId,
      requestedAt: new Date(),
    };

    if (!item.itemStatusHistory) {
      item.itemStatusHistory = [];
    }
    item.itemStatusHistory.push({
      status: "Exchange Requested",
      message: `Exchange requested - ${reason || "No reason provided"}`,
      date: new Date(),
    });

    // Update order status
    const anyExchanged = order.products.some((p) => p.itemStatus === "Exchange Requested" || p.itemStatus === "Exchanged");
    if (anyExchanged && !order.products.every((p) => p.itemStatus === "Exchanged")) {
      order.status = "Partially Exchanged";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Exchange request submitted successfully",
      order,
      item,
    });
  } catch (error) {
    console.error("EXCHANGE ITEM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   4️⃣ GET ITEM DETAILS
===================================================== */
exports.getItemDetails = async (req, res) => {
  try {
    const { orderId, itemIndex } = req.params;

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

    if (!order.products[itemIndex]) {
      return res.status(404).json({
        success: false,
        message: "Item not found in order",
      });
    }

    const item = order.products[itemIndex];

    return res.status(200).json({
      success: true,
      item,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress || order.userInfo,
        userInfo: order.userInfo,
        payment: order.payment,
      },
    });
  } catch (error) {
    console.error("GET ITEM DETAILS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
