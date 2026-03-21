"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "@/lib/api";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    /* ================= FETCH ALL ORDERS ================= */

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = user?.token;

            if (!token) return;

            const res = await axios.get(`${API_BASE}/api/orders/my-orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const mapped = res.data.orders.map((o) => ({
                id: o._id,
                _id: o._id,
                orderNumber: o.orderNumber,
                createdAt: o.createdAt,

                status: (() => {
                    const s = o.status?.toLowerCase();

                    if (["processing", "shipped", "out for delivery"].includes(s))
                        return "on-the-way";

                    if (s === "delivered") return "delivered";

                    if (s === "cancelled") return "cancelled";

                    return "on-the-way";
                })(),

                items: o.products.map((p) => ({
                    title: p.name,
                    imageUrl: p.img,
                    size: p.size,
                    price: p.price,
                    quantity: p.quantity,
                })),
            }));

            setOrders(mapped);
        } catch (err) {
            console.error("Order fetch error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    /* ================= FETCH SINGLE ORDER ================= */

    const fetchOrderById = async (id) => {
        if (!id || id === "null") {
            console.log("Invalid order id:", id);
            return null;
        }
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = user?.token;

            if (!token) {
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_BASE}/api/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const o = res?.data?.order;

            if (!o) return null;

            const status = (o.status || "").toLowerCase().trim();

            return {
                id: o._id,
                orderNumber: o.orderNumber,
                createdAt: o.createdAt,
                status: (o.status || "Order Placed").trim(),
                canEditAddress: o.canEditAddress,
                canEditPhone: o.canEditPhone,
                userInfo: o.userInfo,
                products: o.products || [],
                items: (o.products || []).map((p) => ({
                    name: p.name,
                    img: p.img,
                    size: p.size,
                    price: p.price,
                    mrp: p.mrp,
                    quantity: p.quantity,
                    itemStatus: p.itemStatus,
                })),
                pricing: o.pricing || {},
                subtotal: o.pricing?.subtotal || 0,
                discount: (o.pricing?.productDiscount || 0) + (o.pricing?.couponDiscount || 0),
                fees: (o.pricing?.shippingCharge || 0) + (o.pricing?.platformFee || 0),
                totalAmount: o.pricing?.totalAmount || 0,
                coupon: o.coupon || {},
                offersEarned: o.offersEarned || [],
                shipment: o.shipment || {},
                trackingId: o.shipment?.trackingId || "",
                courier: o.shipment?.courier || "",
                trackingUrl: o.shipment?.trackingUrl || "",
                estimatedDelivery: o.shipment?.estimatedDelivery || null,
                deliveredAt: o.shipment?.deliveredAt || null,
                statusHistory: o.statusHistory || [],
                trackingEvents: o.statusHistory?.map((s) => ({
                    status: s.status,
                    message: s.message,
                    date: s.date
                        ? new Date(s.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })
                        : "",
                    reason: s.reason,
                })) || [],
                deliveryAddress: {
                    addressLine1: o.userInfo?.addressLine1,
                    addressLine2: o.userInfo?.addressLine2,
                    city: o.userInfo?.city,
                    state: o.userInfo?.state,
                    pincode: o.userInfo?.pincode,
                    country: o.userInfo?.country,
                },
                recipientName: o.userInfo?.name,
                recipientPhone: o.userInfo?.phone,
                payment: o.payment || {},
                paymentMethod: o.payment?.method,
                paymentStatus: o.payment?.status,
                invoiceNumber: o.invoiceNumber,
                supportTicketIds: o.supportTicketIds || [],
            };
        } catch (err) {
            console.error("Order fetch error", err);
            return null;
        }
    };

    /* ================= CANCEL ITEM ================= */
    const cancelItem = async (orderId, itemIndex, reason, comment) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = user?.token;

            if (!token) return null;

            const res = await axios.put(
                `${API_BASE}/api/items/${orderId}/${itemIndex}/cancel`,
                { reason, comment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return res.data;
        } catch (err) {
            console.error("Cancel item error", err);
            throw err;
        }
    };

    /* ================= REQUEST RETURN ================= */
    const requestReturnItem = async (orderId, itemIndex, reason, images) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = user?.token;

            if (!token) return null;

            const res = await axios.put(
                `${API_BASE}/api/items/${orderId}/${itemIndex}/return`,
                { reason, images },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return res.data;
        } catch (err) {
            console.error("Return item error", err);
            throw err;
        }
    };

    /* ================= REQUEST EXCHANGE ================= */
    const requestExchangeItem = async (orderId, itemIndex, reason, newSize, newColor, newProductId) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = user?.token;

            if (!token) return null;

            const res = await axios.put(
                `${API_BASE}/api/items/${orderId}/${itemIndex}/exchange`,
                { reason, newSize, newColor, newProductId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return res.data;
        } catch (err) {
            console.error("Exchange item error", err);
            throw err;
        }
    };

    /* ================= GET ITEM DETAILS ================= */
    const getItemDetails = async (orderId, itemIndex) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = user?.token;

            if (!token) return null;

            const res = await axios.get(
                `${API_BASE}/api/items/${orderId}/${itemIndex}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return res.data;
        } catch (err) {
            console.error("Get item details error", err);
            return null;
        }
    };

    return (
        <OrderContext.Provider
            value={{
                orders,
                loading,
                fetchOrders,
                fetchOrderById,
                cancelItem,
                requestReturnItem,
                requestExchangeItem,
                getItemDetails,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => useContext(OrderContext);