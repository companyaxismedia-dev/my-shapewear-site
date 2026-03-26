"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Package, RotateCcw, Truck, X } from "lucide-react";
import { toast } from "sonner";

import { useOrders } from "@/context/OrderContext";
import { API_BASE } from "@/lib/api";

function getStatusStyles(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("cancel")) {
    return {
      badge: { background: "#FDECEC", color: "#C64640" },
      dot: "#D9534F",
    };
  }

  if (normalized.includes("deliver")) {
    return {
      badge: { background: "#EEF7D8", color: "#7A9A31" },
      dot: "#88A93E",
    };
  }

  if (normalized.includes("return")) {
    return {
      badge: { background: "#FFF1E6", color: "#D96D10" },
      dot: "#E67E22",
    };
  }

  return {
    badge: { background: "#FFF4E6", color: "#D98A12" },
    dot: "#E5A33A",
  };
}

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ItemDetailView({
  order,
  selectedItemIndex,
  onClose,
  onRefresh,
}) {
  const { cancelItem, requestReturnItem, requestExchangeItem } = useOrders();
  const [activeAction, setActiveAction] = useState(null);
  const [actionData, setActionData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const items = order?.items?.length ? order.items : order?.products || [];
  const product = items?.[selectedItemIndex];
  const itemIndex = selectedItemIndex;

  const statusHistory = useMemo(() => {
    return [...(product?.itemStatusHistory || [])]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [product?.itemStatusHistory]);

  if (!product) return null;

  const canCancelItem = ["Order Placed", "Processing", "Packed"].includes(
    product.itemStatus
  );
  const canReturnItem = product.itemStatus === "Delivered";
  const canExchangeItem = product.itemStatus === "Delivered";
  const statusStyles = getStatusStyles(product.itemStatus);
  const itemImage = product.img ? `${API_BASE}${product.img}` : null;
  const lineTotal =
    product.lineTotal || (product.price || 0) * (product.quantity || 1);

  const handleCancelItem = async () => {
    if (!actionData.cancelReason) {
      toast.error("Please select a cancellation reason");
      return;
    }

    try {
      setIsLoading(true);
      await cancelItem(
        order._id || order.id,
        itemIndex,
        actionData.cancelReason,
        actionData.cancelComment
      );
      toast.success("Item cancelled successfully");
      setActiveAction(null);
      setActionData({});
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnRequest = async () => {
    if (!actionData.returnReason) {
      toast.error("Please select a return reason");
      return;
    }

    try {
      setIsLoading(true);
      await requestReturnItem(
        order._id || order.id,
        itemIndex,
        actionData.returnReason
      );
      toast.success("Return request submitted");
      setActiveAction(null);
      setActionData({});
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request return");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExchangeRequest = async () => {
    if (!actionData.exchangeReason) {
      toast.error("Please select an exchange reason");
      return;
    }

    try {
      setIsLoading(true);
      await requestExchangeItem(
        order._id || order.id,
        itemIndex,
        actionData.exchangeReason,
        actionData.exchangeSize || product.size,
        actionData.exchangeColor || product.color
      );
      toast.success("Exchange request submitted");
      setActiveAction(null);
      setActionData({});
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request exchange");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card-imkaa overflow-hidden">
        <div className="flex items-start justify-between border-b p-5 sm:p-6" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Order ID: {order.orderNumber}
            </p>
            <h2 className="mt-1 text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
              Product Details
            </h2>
          </div>

          {onClose ? (
            <button
              onClick={onClose}
              className="rounded-full p-2 transition"
              style={{ background: "var(--color-bg)", color: "var(--color-body)" }}
            >
              <X size={18} />
            </button>
          ) : null}
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[180px_1fr] sm:p-6 lg:grid-cols-[180px_1fr_260px]">
          <div className="flex justify-center">
            <div
              className="overflow-hidden rounded-[24px]"
              style={{ background: "var(--color-bg)" }}
            >
              {itemImage ? (
                <Image
                  src={itemImage}
                  alt={product.name || "Product"}
                  width={180}
                  height={220}
                  className="h-[220px] w-[180px] object-cover"
                />
              ) : (
                <div className="flex h-[220px] w-[180px] items-center justify-center text-sm" style={{ color: "var(--color-muted)" }}>
                  No image
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "#9B4F4F" }}>
                {product.brand || "Product"}
              </p>
              <h1 className="mt-1 text-2xl font-semibold leading-tight" style={{ color: "var(--color-heading)" }}>
                {product.name}
              </h1>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl p-4" style={{ background: "var(--color-bg)" }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                  Size
                </p>
                <p className="mt-1 font-medium" style={{ color: "var(--color-heading)" }}>
                  {product.size || "-"}
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: "var(--color-bg)" }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                  Quantity
                </p>
                <p className="mt-1 font-medium" style={{ color: "var(--color-heading)" }}>
                  {product.quantity || 1}
                </p>
              </div>
            </div>

            <div className="rounded-2xl p-4" style={{ background: "var(--color-bg)" }}>
              <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                Total Price
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-heading)" }}>
                Rs. {Number(lineTotal || 0).toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                Rs. {Number(product.price || 0).toLocaleString("en-IN")} per item
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border p-5" style={{ borderColor: "var(--color-border)", background: "#fffdfb" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
              Delivery Status
            </p>
            <div
              className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold"
              style={statusStyles.badge}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: statusStyles.dot }}
              />
              {product.itemStatus}
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl p-4" style={{ background: "var(--color-bg)" }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                  Estimated Delivery
                </p>
                <p className="mt-1 font-medium" style={{ color: "var(--color-heading)" }}>
                  {formatDate(product.estimatedDelivery)}
                </p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: "var(--color-bg)" }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                  Last Update
                </p>
                <p className="mt-1 font-medium" style={{ color: "var(--color-heading)" }}>
                  {formatDate(statusHistory[0]?.date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t p-5 sm:p-6" style={{ borderColor: "var(--color-border)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>
            Item Timeline
          </h3>

          <div className="mt-5 space-y-4">
            {(statusHistory.length ? statusHistory : [{ status: product.itemStatus, date: product.estimatedDelivery, message: "" }]).map((entry, index) => {
              const entryStyles = getStatusStyles(entry.status);

              return (
                <div key={`${entry.status}-${entry.date}-${index}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className="mt-1 h-3 w-3 rounded-full"
                      style={{ background: entryStyles.dot }}
                    />
                    {index !== statusHistory.length - 1 ? (
                      <span
                        className="mt-2 h-12 w-px"
                        style={{ background: "var(--color-border)" }}
                      />
                    ) : null}
                  </div>

                  <div className="flex-1 rounded-2xl p-4" style={{ background: "var(--color-bg)" }}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold" style={{ color: "var(--color-heading)" }}>
                        {entry.status}
                      </p>
                      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                        {formatDate(entry.date)}
                      </p>
                    </div>

                    {entry.message ? (
                      <p className="mt-2 text-sm" style={{ color: "var(--color-body)" }}>
                        {entry.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t p-5 sm:p-6" style={{ borderColor: "var(--color-border)" }}>
          {activeAction === null ? (
            <div className="flex flex-wrap gap-3">
              {canCancelItem ? (
                <button
                  onClick={() => setActiveAction("cancel")}
                  className="rounded-full px-5 py-3 font-medium transition"
                  style={{ background: "#FFE5E5", color: "#C0392B" }}
                >
                  <X size={16} className="mr-2 inline" />
                  Cancel Item
                </button>
              ) : null}

              {canReturnItem ? (
                <button
                  onClick={() => setActiveAction("return")}
                  className="rounded-full px-5 py-3 font-medium transition"
                  style={{ background: "#FFF1E6", color: "#D96D10" }}
                >
                  <RotateCcw size={16} className="mr-2 inline" />
                  Return Item
                </button>
              ) : null}

              {canExchangeItem ? (
                <button
                  onClick={() => setActiveAction("exchange")}
                  className="rounded-full px-5 py-3 font-medium transition"
                  style={{ background: "#E8F1FD", color: "#3A78D1" }}
                >
                  <Package size={16} className="mr-2 inline" />
                  Exchange Item
                </button>
              ) : null}
            </div>
          ) : null}

          {activeAction === "cancel" ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>
                Cancel Item
              </h3>
              <select
                value={actionData.cancelReason || ""}
                onChange={(event) =>
                  setActionData({ ...actionData, cancelReason: event.target.value })
                }
                className="input-imkaa w-full"
              >
                <option value="">Select reason for cancellation</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Item not needed anymore">Item not needed anymore</option>
                <option value="Long delivery time">Long delivery time</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                value={actionData.cancelComment || ""}
                onChange={(event) =>
                  setActionData({ ...actionData, cancelComment: event.target.value })
                }
                placeholder="Additional comments (optional)"
                className="input-imkaa min-h-20 w-full"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveAction(null);
                    setActionData({});
                  }}
                  className="flex-1 rounded-full px-5 py-3 font-medium"
                  style={{ background: "var(--color-bg)", color: "var(--color-body)" }}
                >
                  Back
                </button>
                <button
                  onClick={handleCancelItem}
                  disabled={isLoading}
                  className="btn-primary-imkaa flex-1"
                >
                  {isLoading ? "Processing..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          ) : null}

          {activeAction === "return" ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>
                Request Return
              </h3>
              <select
                value={actionData.returnReason || ""}
                onChange={(event) =>
                  setActionData({ ...actionData, returnReason: event.target.value })
                }
                className="input-imkaa w-full"
              >
                <option value="">Select return reason</option>
                <option value="Defective/Damaged">Defective/Damaged</option>
                <option value="Not as described">Not as described</option>
                <option value="Wrong item received">Wrong item received</option>
                <option value="Size/fit issue">Size/fit issue</option>
                <option value="Changed mind">Changed mind</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveAction(null);
                    setActionData({});
                  }}
                  className="flex-1 rounded-full px-5 py-3 font-medium"
                  style={{ background: "var(--color-bg)", color: "var(--color-body)" }}
                >
                  Back
                </button>
                <button
                  onClick={handleReturnRequest}
                  disabled={isLoading}
                  className="btn-primary-imkaa flex-1"
                >
                  {isLoading ? "Processing..." : "Request Return"}
                </button>
              </div>
            </div>
          ) : null}

          {activeAction === "exchange" ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>
                Request Exchange
              </h3>
              <select
                value={actionData.exchangeReason || ""}
                onChange={(event) =>
                  setActionData({ ...actionData, exchangeReason: event.target.value })
                }
                className="input-imkaa w-full"
              >
                <option value="">Select exchange reason</option>
                <option value="Different size needed">Different size needed</option>
                <option value="Different color wanted">Different color wanted</option>
                <option value="Defective item">Defective item</option>
                <option value="Other">Other</option>
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="New size (optional)"
                  value={actionData.exchangeSize || ""}
                  onChange={(event) =>
                    setActionData({ ...actionData, exchangeSize: event.target.value })
                  }
                  className="input-imkaa"
                />
                <input
                  type="text"
                  placeholder="New color (optional)"
                  value={actionData.exchangeColor || ""}
                  onChange={(event) =>
                    setActionData({ ...actionData, exchangeColor: event.target.value })
                  }
                  className="input-imkaa"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActiveAction(null);
                    setActionData({});
                  }}
                  className="flex-1 rounded-full px-5 py-3 font-medium"
                  style={{ background: "var(--color-bg)", color: "var(--color-body)" }}
                >
                  Back
                </button>
                <button
                  onClick={handleExchangeRequest}
                  disabled={isLoading}
                  className="btn-primary-imkaa flex-1"
                >
                  {isLoading ? "Processing..." : "Request Exchange"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card-imkaa p-6">
        <div className="flex items-center gap-3">
          <Truck size={18} style={{ color: "var(--color-primary)" }} />
          <div>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Updates sent to
            </p>
            <p className="font-medium" style={{ color: "var(--color-heading)" }}>
              {order.recipientPhone || order.userInfo?.phone || "Phone not available"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
