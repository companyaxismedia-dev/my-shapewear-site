const FINAL_ITEM_STATUSES = new Set([
  "Delivered",
  "Cancelled",
  "Returned",
  "Refund Processed",
  "Exchange Delivered",
]);

const RETURN_ITEM_STATUSES = new Set([
  "Return Requested",
  "Return Approved",
  "Picked Up",
  "Returned",
  "Refund Processed",
]);

const EXCHANGE_ITEM_STATUSES = new Set([
  "Exchange Requested",
  "Exchange Approved",
  "Exchange Shipped",
  "Exchange Delivered",
]);

const TERMINAL_ITEM_STATUSES = new Set([
  "Cancelled",
  "Delivered",
  "Returned",
  "Refund Processed",
  "Exchange Delivered",
]);

const ACTIVE_STATUS_PRIORITY = [
  "Exchange Requested",
  "Exchange Approved",
  "Exchange Shipped",
  "Return Requested",
  "Return Approved",
  "Picked Up",
  "Out for Delivery",
  "Shipped",
  "Packed",
  "Processing",
  "Order Placed",
];

function getSafeItemStatus(item) {
  return item?.itemStatus || "Order Placed";
}

function getOrderDerivedStatus(products = []) {
  if (!Array.isArray(products) || products.length === 0) {
    return "Order Placed";
  }

  const statuses = products.map(getSafeItemStatus);
  const uniqueStatuses = [...new Set(statuses)];

  if (uniqueStatuses.length === 1) {
    return uniqueStatuses[0];
  }

  if (products.every((item) => getSafeItemStatus(item) === "Cancelled")) {
    return "Cancelled";
  }

  const activeStatuses = products
    .map(getSafeItemStatus)
    .filter((status) => !TERMINAL_ITEM_STATUSES.has(status));

  for (const priorityStatus of ACTIVE_STATUS_PRIORITY) {
    if (activeStatuses.includes(priorityStatus)) {
      return priorityStatus;
    }
  }

  if (
    products.some((item) => EXCHANGE_ITEM_STATUSES.has(getSafeItemStatus(item)))
  ) {
    return "Exchange Delivered";
  }

  if (
    products.some((item) => RETURN_ITEM_STATUSES.has(getSafeItemStatus(item)))
  ) {
    return "Returned";
  }

  if (products.some((item) => getSafeItemStatus(item) === "Delivered")) {
    return "Delivered";
  }

  return "Order Placed";
}

function buildOrderStatusHistory(products = []) {
  return (products || [])
    .flatMap((product, itemIndex) =>
      (product?.itemStatusHistory || []).map((entry) => ({
        status: entry?.status || getSafeItemStatus(product),
        message: entry?.message || "",
        date: entry?.date || null,
        itemIndex,
        itemName: product?.name || `Item ${itemIndex + 1}`,
      }))
    )
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
}

function appendItemStatusHistory(item, status, message) {
  if (!Array.isArray(item.itemStatusHistory)) {
    item.itemStatusHistory = [];
  }

  item.itemStatusHistory.push({
    status,
    message,
    date: new Date(),
  });
}

function applyBulkItemStatus(order, status, options = {}) {
  const { trackingId = "" } = options;
  const message = options.message || `Item status updated to ${status}`;

  for (const item of order.products || []) {
    const currentStatus = getSafeItemStatus(item);

    if (status !== "Cancelled" && FINAL_ITEM_STATUSES.has(currentStatus)) {
      continue;
    }

    if (status === "Cancelled") {
      if (currentStatus === "Cancelled") {
        continue;
      }

      item.itemStatus = "Cancelled";
      item.cancellation = {
        ...(item.cancellation || {}),
        isCancelled: true,
        cancelledAt: new Date(),
        cancelReason: options.reason || item.cancellation?.cancelReason || "",
        cancelComment: options.comment || item.cancellation?.cancelComment || "",
      };
      appendItemStatusHistory(item, "Cancelled", message);
      continue;
    }

    item.itemStatus = status;

    if (status === "Shipped") {
      item.estimatedDelivery =
        item.estimatedDelivery ||
        order.shipment?.estimatedDelivery ||
        null;
    }

    if (status === "Delivered") {
      item.deliveredAt = new Date();
      item.returnInfo = {
        ...(item.returnInfo || {}),
        isReturnEligible: true,
        returnWindowEnd: item.returnInfo?.returnWindowEnd || null,
      };
    }

    appendItemStatusHistory(item, status, message);
  }

  if (trackingId) {
    order.shipment.trackingId = trackingId;
  }

  if (status === "Shipped" && !order.shipment.courier) {
    order.shipment.courier = "ShadowFax";
  }

  if (status === "Shipped") {
    order.shipment.shippedAt = order.shipment.shippedAt || new Date();
    order.canEditAddress = false;
    order.canEditPhone = false;
    order.lockedAt = order.lockedAt || new Date();
  }

  if (status === "Delivered") {
    order.shipment.deliveredAt = new Date();
  }

  if (status === "Cancelled") {
    order.cancellation.cancelledAt = order.cancellation.cancelledAt || new Date();
  }
}

function orderMatchesStatus(products = [], requestedStatus = "") {
  if (!requestedStatus || requestedStatus === "All" || requestedStatus === "all") {
    return true;
  }

  const derivedStatus = getOrderDerivedStatus(products);

  if (requestedStatus === "Unfulfilled") {
    return derivedStatus !== "Delivered";
  }

  if (requestedStatus === "on-the-way") {
    return ["Processing", "Packed", "Shipped", "Out for Delivery"].includes(
      derivedStatus
    );
  }

  const normalized = requestedStatus.toLowerCase();
  if (normalized === "delivered") return derivedStatus === "Delivered";
  if (normalized === "cancelled") return derivedStatus === "Cancelled";
  if (normalized === "returned") return derivedStatus === "Returned";

  return derivedStatus === requestedStatus;
}

module.exports = {
  applyBulkItemStatus,
  appendItemStatusHistory,
  buildOrderStatusHistory,
  getOrderDerivedStatus,
  orderMatchesStatus,
};
