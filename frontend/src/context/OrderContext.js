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

            const user = JSON.parse(localStorage.getItem("user"));
            const token = user?.token;

            if (!token) return;

            const res = await axios.get(`${API_BASE}/api/orders/my-orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const mapped = res.data.orders.map((o) => ({
                id: o._id,
                createdAt: o.createdAt,

                status: (() => {
                    const s = o.status?.toLowerCase();

                    if (s === "processing" || s === "shipped") return "on-the-way";
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
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const token = user?.token;

            if (!token) return null;

            const res = await axios.get(`${API_BASE}/api/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const o = res.data.order;

            return {
                id: o._id,
                trackingId: o.trackingId,
                courier: o.courier,

                orderNumber: "OD" + o._id.slice(-12).toUpperCase(),

                status: o.status?.toLowerCase(),

                items: o.products.map((p) => ({
                    name: p.name,
                    img: p.img,
                    size: p.size,
                    price: p.price,
                    quantity: p.quantity,
                })),

                subtotal: o.totalAmount,

                discount: o.discountAmount || 0,

                totalAmount: o.finalAmount || o.totalAmount,

                offersEarned: o.offersEarned || [],

                trackingEvents: (o.statusHistory || []).map((s) => ({
                    status: s.status?.toLowerCase(),
                    time: s.status,
                    date: new Date(s.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }),
                })),

                deliveryAddress: {
                    address: o.userInfo?.address,
                    city: o.userInfo?.city,
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