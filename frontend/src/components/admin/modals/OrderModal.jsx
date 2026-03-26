"use client"
import React, { useState } from "react"

export default function OrderModal({ orderId, order, show, onClose, onUpdated }) {
  if (!show) return null

  const statuses = [
    "Order Placed",
    "Processing",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ]

  const [status, setStatus] = useState(order?.status ?? statuses[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("adminToken")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/orders/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ orderId: orderId || order?._id, status }),
      })
      if (!res.ok) throw new Error("Failed to update status")
      const data = await res.json()
      if (onUpdated) onUpdated(data)
      onClose()
    } catch (err) {
      setError(err.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose}></div>

      <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold">Update Item Statuses</h3>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block text-sm text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 w-full input"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-muted">Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
