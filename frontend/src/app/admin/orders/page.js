"use client";
import React, { useEffect, useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then(res => res.json())
      .then(data => setOrders(data.orders || []));
  }, []);

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-black mb-6 uppercase italic">
        Store Management / Orders
      </h1>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-[#041f41] text-white uppercase text-xs">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Product</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-4 font-bold">
                  {order.userInfo?.name}
                  <br />
                  <span className="text-xs text-gray-400">
                    {order.userInfo?.phone}
                  </span>
                </td>
                <td className="p-4">
                  {order.products?.[0]?.name}
                  <br />
                  <span className="text-xs text-gray-500">
                    Size: {order.products?.[0]?.size}
                  </span>
                </td>
                <td className="p-4 font-black text-blue-600">
                  ₹{order.totalAmount}
                </td>
                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Paid
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== MOBILE CARDS ===== */}
      <div className="md:hidden space-y-4">
        {orders.map((order, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow border p-4 space-y-3"
          >
            <div>
              <p className="font-black text-[#041f41]">
                {order.userInfo?.name}
              </p>
              <p className="text-sm text-gray-500">
                {order.userInfo?.phone}
              </p>
            </div>

            <div className="text-sm">
              <p className="font-bold">
                {order.products?.[0]?.name}
              </p>
              <p className="text-gray-500">
                Size: {order.products?.[0]?.size}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-black text-blue-600">
                ₹{order.totalAmount}
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                Paid
              </span>
            </div>

            <p className="text-xs text-gray-400">
              {new Date(order.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
