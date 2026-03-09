"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";

export default function OrderModal({ order, onClose, onUpdated }) {
  const [status, setStatus] = useState(order?.status || "Order Placed");
  const [saving, setSaving] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const save = async () => {
    try {
      setSaving(true);
      await apiRequest(`/api/admin/orders/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: order.orderId, status }),
      });
      setSaving(false);
      if (onUpdated) onUpdated();
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Order Details</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        <div className="space-y-3">
          <div><strong>Order:</strong> {order.id}</div>
          <div><strong>Customer:</strong> {order.customer}</div>
          <div><strong>Date:</strong> {new Date(order.date).toLocaleString()}</div>
          <div><strong>Items:</strong> {order.items}</div>
          <div><strong>Total:</strong> ₹{order.total}</div>

          <div>
            <label className="block text-sm font-medium">Status</label>
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="border rounded px-2 py-1">
              <option>Order Placed</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
            <button onClick={save} disabled={saving} className="px-3 py-2 bg-blue-600 text-white rounded">{saving? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
