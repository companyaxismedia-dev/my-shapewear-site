const Order = require("../models/Order")
const { getOrderDerivedStatus } = require("../utils/orderStatus")

/* =====================================================
   BOT MESSAGE HANDLER
===================================================== */

exports.handleMessage = async (message, orderId) => {

  try {

    if (!message) {
      return botReply("Please enter a valid message.")
    }

    const text = message.toLowerCase().trim()

    /* ========= GET ORDER ========= */

    const order = await Order.findById(orderId)

    if (!order) {
      return botReply("Sorry, I couldn't find your order.")
    }

    const orderStatus = getOrderDerivedStatus(order.products || [])
    const activeItems = (order.products || []).filter(
      (item) => item.itemStatus !== "Cancelled"
    )
    const primaryItem = activeItems[0] || order.products?.[0]

    /* ========= INTENT MATCHING ========= */

    if (match(text, ["where is my order", "order status", "track order"])) {

      return botReply(
        `Your order is currently *${orderStatus}*.`,
        quickOptions()
      )
    }

    if (match(text, ["delivery", "delivery date", "when will it arrive"])) {

      if (primaryItem?.estimatedDelivery || order.shipment?.estimatedDelivery) {
        const date = new Date(
          primaryItem?.estimatedDelivery || order.shipment?.estimatedDelivery
        ).toDateString()

        return botReply(
          `Estimated delivery date is *${date}*.`,
          quickOptions()
        )
      }

      return botReply(
        "Estimated delivery date is not available yet.",
        quickOptions()
      )
    }

    if (match(text, ["tracking", "tracking id", "track shipment"])) {

      if (order.shipment?.trackingId) {

        return botReply(
          `Your tracking ID is *${order.shipment.trackingId}*.`,
          quickOptions()
        )
      }

      return botReply(
        "Tracking number has not been generated yet.",
        quickOptions()
      )
    }

    if (match(text, ["cancel", "cancel order"])) {

      if (["Order Placed", "Processing", "Packed"].includes(orderStatus)) {

        return botReply(
          "You can cancel this order from the order details page.",
          quickOptions()
        )
      }

      return botReply(
        "This order cannot be cancelled now."
      )
    }

    /* ========= FALLBACK ========= */

    return botReply(
      "Sorry, I didn't understand your question.",
      quickOptions()
    )

  } catch (error) {

    console.error("BOT SERVICE ERROR:", error)

    return botReply(
      "Something went wrong. Please try again later."
    )

  }

}


/* =====================================================
   HELPER FUNCTIONS
===================================================== */

function match(text, keywords) {
  return keywords.some(keyword => text.includes(keyword))
}


function botReply(message, options = []) {

  return {
    text: message,
    quickReplies: options
  }

}


function quickOptions() {

  return [
    "Where is my order",
    "Expected delivery date",
    "Tracking ID",
    "Cancel my order"
  ]

}
