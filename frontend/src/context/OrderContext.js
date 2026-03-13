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
                trackingId: o.trackingId,
                courier: o.courier,

                userInfo: o.userInfo,

                canEditAddress:
                    ["order placed", "processing"].includes(status),

                orderNumber: o.orderNumber,

                status: (o.status || "Order Placed").trim(),
                items: o.products.map((p) => ({
                    name: p.name,
                    img: p.img,
                    size: p.size,
                    price: p.price,
                    listingPrice: p.listingPrice,
                    quantity: p.quantity,
                })),

                listingPrice: o.listingPrice || 0,

                subtotal: o.subtotal || o.totalAmount,

                discount: o.discount || 0,

                fees: o.fees || 0,

                totalAmount: o.finalAmount || o.totalAmount,
                offersEarned: o.offersEarned || [],

                trackingEvents: (o.trackingEvents || []).map((s) => ({
                    status: s.status,
                    time: s.time,
                    date: s.date
                        ? new Date(s.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        })
                        : "",
                })),

                deliveryAddress: {
                    address: o.userInfo?.address,
                    city: o.userInfo?.city,
                    state: o.userInfo?.state,
                    pincode: o.userInfo?.pincode,
                },
                recipientName: o.userInfo?.name,
                recipientPhone: o.userInfo?.phone,

                paymentMethod: o.paymentType,

            };
        } catch (err) {
            console.error("Order fetch error", err);
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
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => useContext(OrderContext);