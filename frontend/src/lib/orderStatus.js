export function getOrderStatusGroup(status) {
  const normalized = String(status || "").toLowerCase().trim();

  if (["processing", "packed", "shipped", "out for delivery", "partially delivered"].includes(normalized)) {
    return "on-the-way";
  }

  if (["delivered", "exchange delivered"].includes(normalized)) {
    return "delivered";
  }

  if (["cancelled", "partially cancelled"].includes(normalized)) {
    return "cancelled";
  }

  if (["returned", "partially returned", "refund processed", "return requested", "return approved", "picked up"].includes(normalized)) {
    return "returned";
  }

  return "processing";
}

export function getOrderStatusColor(status) {
  const group = getOrderStatusGroup(status);

  switch (group) {
    case "delivered":
      return "text-green-600 bg-green-50";
    case "cancelled":
      return "text-red-600 bg-red-50";
    case "returned":
      return "text-orange-600 bg-orange-50";
    case "on-the-way":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-yellow-600 bg-yellow-50";
  }
}

export function getOrderStatusTextColor(status) {
  const group = getOrderStatusGroup(status);

  switch (group) {
    case "delivered":
      return "text-green-600";
    case "cancelled":
      return "text-red-600";
    case "returned":
      return "text-orange-600";
    case "on-the-way":
      return "text-blue-600";
    default:
      return "text-yellow-600";
  }
}

export function getOrderStatusLabel(status) {
  return status || "Order Placed";
}
