"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem("user"));

        if (!stored?.token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/orders`, {
          headers: {
            Authorization: `Bearer ${stored.token}`,
          },
        });

        const data = await res.json();
        setOrders(data?.orders || []);
      } catch (err) {
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading orders...
      </div>
    );
  }

  /* ================= EMPTY STATE ================= */
  if (!orders.length) {
    return (
      <div className="w-full flex flex-col items-center py-12">
        <ShoppingBag size={50} className="mb-3" />
        <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
        <p className="text-gray-500 mb-4">
          You haven't placed any order.
        </p>

        <button
          onClick={() => (window.location.href = "/")}
          className="bg-pink-600 text-white px-6 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  /* ================= ORDER LIST ================= */
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Order History
      </h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border border-gray-200 bg-white rounded-lg p-4 hover:shadow-sm transition"
          >
            {/* TOP INFO */}
            <div className="flex justify-between border-b pb-3 mb-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Order ID
                </p>
                <p className="text-sm font-semibold">{order._id}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Date
                </p>
                <p className="text-sm font-semibold">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase">
                  Total
                </p>
                <p className="text-sm font-semibold text-pink-600">
                  ₹{order.totalAmount || order.total}
                </p>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="space-y-3">
              {(order.items || []).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between"
                >
                  <div className="flex gap-3 items-center">

                    {/* PRODUCT IMAGE */}
                    <img
                      src={item.image || "/image/placeholder.png"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded border"
                    />

                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {item.name}
                      </p>

                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>

                      {/* DELIVERY STATUS */}
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Delivered
                      </p>
                    </div>
                  </div>

                  {/* REORDER BUTTON */}
                  <button className="text-sm border border-pink-500 text-pink-600 px-3 py-1 rounded hover:bg-pink-50">
                    Reorder
                  </button>
                </div>
              ))}
            </div>

            {/* TRACKING STYLE */}
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Order Delivered Successfully
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}