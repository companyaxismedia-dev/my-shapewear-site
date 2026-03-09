"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/admin/orders/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ids: [id] }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch order');
        const ord = (data.orders && data.orders[0]) || null;
        setOrder(ord);
        setStatus(ord?.status || 'Order Placed');
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const updateStatus = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/admin/orders/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: id, status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Update failed');
      setOrder(data.order || order);
      toast.success('Status updated');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading order...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="p-6 space-y-6 flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">Order ID: {String(order._id)}</h1>
              <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-800">{order.paymentStatus || 'Payment'}</span>
              <span className="px-3 py-1 rounded bg-red-100 text-red-800">{order.status || 'Status'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm space-y-4">
          <h2 className="font-semibold">Order Items</h2>
          <div className="space-y-3">
            {(order.products || []).map((p) => (
              <div key={p._id || p.productId} className="flex items-center gap-4 border-b pb-3">
                <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                  {p.images?.[0] ? <img src={p.images[0].url || p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">Qty: {p.quantity} • ₹{p.price ?? p.salePrice ?? p.finalPrice}</div>
                </div>
                <div className="text-right">₹{(p.quantity * (p.price || p.salePrice || 0)).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <h2 className="font-semibold">Order Summary</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>Subtotal</div><div className="text-right">₹{order.subtotal ?? order.finalAmount ?? 0}</div>
            <div>Shipping</div><div className="text-right">₹{order.shippingCost ?? 0}</div>
            <div>Discount</div><div className="text-right">-₹{order.discount ?? 0}</div>
            <div className="font-semibold">Total</div><div className="text-right font-semibold">₹{order.finalAmount ?? 0}</div>
          </div>
        </div>
      </div>

      <aside className="w-80 space-y-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Customer</h3>
          <div className="text-sm">{order.userInfo?.name || 'Guest'}</div>
          <div className="text-sm text-gray-500">{order.userInfo?.email}</div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Contact</h3>
          <div className="text-sm">{order.userInfo?.phone || '-'}</div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Shipping address</h3>
          <div className="text-sm">
            {order.shippingAddress?.address || order.userInfo?.address || '-'}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <label className="block text-sm font-medium">Status</label>
          <select value={status} onChange={(e)=>setStatus(e.target.value)} className="w-full mt-2 input">
            <option>Order Placed</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
          <div className="flex gap-2 mt-3">
            <button onClick={()=>router.back()} className="btn-muted">Back</button>
            <button onClick={updateStatus} disabled={saving} className="btn-primary">{saving? 'Saving...' : 'Update status'}</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
