"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Package, Truck, RotateCcw, MessageCircle, X } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";

export default function ItemDetailView({ order, selectedItemIndex, onClose, onRefresh }) {
    const { cancelItem, requestReturnItem, requestExchangeItem } = useOrders();
    const [activeAction, setActiveAction] = useState(null);
    const [actionData, setActionData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showMoreItems, setShowMoreItems] = useState(false);

    const product = order?.products?.[selectedItemIndex];
    const itemIndex = selectedItemIndex;

    if (!product) return null;

    const handleCancelItem = async () => {
        if (!actionData.cancelReason) {
            toast.error("Please select a cancellation reason");
            return;
        }

        try {
            setIsLoading(true);
            await cancelItem(order._id || order.id, itemIndex, actionData.cancelReason, actionData.cancelComment);
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
            await requestReturnItem(order._id || order.id, itemIndex, actionData.returnReason);
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

    const otherItems = order.products.filter((_, idx) => idx !== itemIndex);
    const canCancelItem = ["Order Placed", "Processing", "Packed"].includes(product.itemStatus);
    const canReturnItem = product.itemStatus === "Delivered";
    const canExchangeItem = product.itemStatus === "Delivered";

    const getStatusColor = (status) => {
        if (status === "Cancelled") return "#E74C3C";
        if (status === "Delivered") return "#27AE60";
        if (status === "Return Requested" || status === "Returned") return "#F39C12";
        if (status === "Exchange Requested" || status === "Exchanged") return "#3498DB";
        return "#95A5A6";
    };

    return (
        <div className="space-y-6">
            {/* Main Item Detail */}
            <div className="card-imkaa p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6" style={{ borderBottom: "1px solid var(--color-border)", paddingBottom: "16px" }}>
                    <div>
                        <p className="text-sm" style={{ color: "var(--color-muted)" }}>Item {itemIndex + 1} of {order.products.length}</p>
                        <h2 className="text-xl font-bold" style={{ color: "var(--color-heading)" }}>{product.name}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded transition"
                        style={{ color: "var(--color-body)", background: "var(--color-bg)" }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Item Image and Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Image */}
                    <div className="flex justify-center md:col-span-1">
                        {product.img && (
                            <Image
                                src={`${API_BASE}${product.img}`}
                                alt={product.name}
                                width={200}
                                height={200}
                                className="rounded object-cover"
                            />
                        )}
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Brand */}
                        <div>
                            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Brand</p>
                            <p className="font-medium" style={{ color: "var(--color-heading)" }}>{product.brand || product.name}</p>
                        </div>

                        {/* Attributes */}
                        <div className="grid grid-cols-2 gap-4">
                            {product.color && (
                                <div>
                                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>Color</p>
                                    <p className="font-medium" style={{ color: "var(--color-body)" }}>{product.color}</p>
                                </div>
                            )}
                            {product.size && (
                                <div>
                                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>Size</p>
                                    <p className="font-medium" style={{ color: "var(--color-body)" }}>{product.size}</p>
                                </div>
                            )}
                        </div>

                        {/* Quantity and Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm" style={{ color: "var(--color-muted)" }}>Quantity</p>
                                <p className="font-medium" style={{ color: "var(--color-body)" }}>{product.quantity}</p>
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: "var(--color-muted)" }}>Price per item</p>
                                <p className="font-bold price-text">₹{product.price}</p>
                            </div>
                        </div>

                        {/* Line Total */}
                        <div style={{ background: "var(--color-bg)", padding: "12px", borderRadius: "8px" }}>
                            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Line Total</p>
                            <p className="text-2xl font-bold price-text">₹{product.lineTotal}</p>
                        </div>

                        {/* Status */}
                        <div>
                            <p className="text-sm" style={{ color: "var(--color-muted)" }}>Status</p>
                            <p className="font-bold" style={{ color: getStatusColor(product.itemStatus) }}>
                                ● {product.itemStatus}
                            </p>
                        </div>

                        {/* Delivery Info */}
                        {product.estimatedDelivery && (
                            <div className="flex items-center gap-2">
                                <Truck size={16} style={{ color: "var(--color-primary)" }} />
                                <span style={{ color: "var(--color-body)" }}>
                                    Est. Delivery: {new Date(product.estimatedDelivery).toLocaleDateString("en-IN")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {activeAction === null && (
                    <div className="flex flex-wrap gap-3">
                        {canCancelItem && (
                            <button
                                onClick={() => setActiveAction("cancel")}
                                className="px-4 py-2 rounded font-medium transition"
                                style={{ background: "#FFE5E5", color: "#C0392B" }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            >
                                <X size={16} className="inline mr-2" />
                                Cancel Item
                            </button>
                        )}
                        {canReturnItem && (
                            <button
                                onClick={() => setActiveAction("return")}
                                className="px-4 py-2 rounded font-medium transition"
                                style={{ background: "#FCE8E9", color: "#E67E22" }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            >
                                <RotateCcw size={16} className="inline mr-2" />
                                Return
                            </button>
                        )}
                        {canExchangeItem && (
                            <button
                                onClick={() => setActiveAction("exchange")}
                                className="px-4 py-2 rounded font-medium transition"
                                style={{ background: "#E3F2FD", color: "#3498DB" }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                            >
                                <Package size={16} className="inline mr-2" />
                                Exchange
                            </button>
                        )}
                    </div>
                )}

                {/* Action Forms */}
                {activeAction === "cancel" && (
                    <div className="border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                        <h3 className="font-semibold mb-3" style={{ color: "var(--color-heading)" }}>Cancel Item</h3>
                        <div className="space-y-3">
                            <select
                                value={actionData.cancelReason || ""}
                                onChange={(e) => setActionData({ ...actionData, cancelReason: e.target.value })}
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
                                onChange={(e) => setActionData({ ...actionData, cancelComment: e.target.value })}
                                placeholder="Additional comments (optional)"
                                className="input-imkaa w-full min-h-20"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setActiveAction(null); setActionData({}); }}
                                    className="flex-1 px-4 py-2 rounded font-medium"
                                    style={{ background: "var(--color-bg)", color: "var(--color-body)" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCancelItem}
                                    disabled={isLoading}
                                    className="flex-1 btn-primary-imkaa"
                                >
                                    {isLoading ? "Processing..." : "Confirm Cancellation"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeAction === "return" && (
                    <div className="border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                        <h3 className="font-semibold mb-3" style={{ color: "var(--color-heading)" }}>Request Return</h3>
                        <div className="space-y-3">
                            <select
                                value={actionData.returnReason || ""}
                                onChange={(e) => setActionData({ ...actionData, returnReason: e.target.value })}
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setActiveAction(null); setActionData({}); }}
                                    className="flex-1 px-4 py-2 rounded font-medium"
                                    style={{ background: "var(--color-bg)", color: "var(--color-body)" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReturnRequest}
                                    disabled={isLoading}
                                    className="flex-1 btn-primary-imkaa"
                                >
                                    {isLoading ? "Processing..." : "Request Return"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeAction === "exchange" && (
                    <div className="border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                        <h3 className="font-semibold mb-3" style={{ color: "var(--color-heading)" }}>Request Exchange</h3>
                        <div className="space-y-3">
                            <select
                                value={actionData.exchangeReason || ""}
                                onChange={(e) => setActionData({ ...actionData, exchangeReason: e.target.value })}
                                className="input-imkaa w-full"
                            >
                                <option value="">Select exchange reason</option>
                                <option value="Different size needed">Different size needed</option>
                                <option value="Different color wanted">Different color wanted</option>
                                <option value="Defective item">Defective item</option>
                                <option value="Other">Other</option>
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="New size (optional)"
                                    value={actionData.exchangeSize || ""}
                                    onChange={(e) => setActionData({ ...actionData, exchangeSize: e.target.value })}
                                    className="input-imkaa"
                                />
                                <input
                                    type="text"
                                    placeholder="New color (optional)"
                                    value={actionData.exchangeColor || ""}
                                    onChange={(e) => setActionData({ ...actionData, exchangeColor: e.target.value })}
                                    className="input-imkaa"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setActiveAction(null); setActionData({}); }}
                                    className="flex-1 px-4 py-2 rounded font-medium"
                                    style={{ background: "var(--color-bg)", color: "var(--color-body)" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleExchangeRequest}
                                    disabled={isLoading}
                                    className="flex-1 btn-primary-imkaa"
                                >
                                    {isLoading ? "Processing..." : "Request Exchange"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Other Items in This Order */}
            {otherItems.length > 0 && (
                <div className="card-imkaa p-6">
                    <button
                        onClick={() => setShowMoreItems(!showMoreItems)}
                        className="w-full flex justify-between items-center"
                    >
                        <h3 className="font-semibold text-lg" style={{ color: "var(--color-heading)" }}>
                            Other items in this order ({otherItems.length})
                        </h3>
                        <ChevronDown
                            size={20}
                            style={{
                                color: "var(--color-muted)",
                                transform: showMoreItems ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.3s",
                            }}
                        />
                    </button>

                    {showMoreItems && (
                        <div className="mt-4 space-y-3">
                            {otherItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex gap-3 p-3 rounded"
                                    style={{ background: "var(--color-bg)" }}
                                >
                                    {item.img && (
                                        <Image
                                            src={`${API_BASE}${item.img}`}
                                            alt={item.name}
                                            width={60}
                                            height={60}
                                            className="rounded object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium" style={{ color: "var(--color-heading)" }}>{item.name}</p>
                                        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                                            Size: {item.size} | Color: {item.color}
                                        </p>
                                        <p className="font-bold price-text">₹{item.lineTotal}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Address Info */}
            <div className="card-imkaa p-6">
                <h3 className="font-semibold mb-4" style={{ color: "var(--color-heading)" }}>Delivery Address</h3>
                <div style={{ color: "var(--color-body)" }}>
                    <p className="font-medium">{order.userInfo?.name}</p>
                    <p>{order.userInfo?.phone}</p>
                    <p className="text-sm mt-2">
                        {order.userInfo?.addressLine1}, {order.userInfo?.addressLine2}
                    </p>
                    <p className="text-sm">
                        {order.userInfo?.city}, {order.userInfo?.state} - {order.userInfo?.pincode}
                    </p>
                </div>
            </div>
        </div>
    );
}
