"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import OrderModal from "@/components/admin/modals/OrderModal";
import { toast } from "sonner";

export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [timeline, setTimeline] = useState(true);

  const [showFulfillModal, setShowFulfillModal] = useState(false);

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

  const sortedTimeline = [...(order.statusHistory || [])].sort(
    (a, b) =>
      new Date(b.date || order.updatedAt) -
      new Date(a.date || order.updatedAt)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="admin-card p-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Order ID: {String(order._id)}</h1>
          <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()} • from {order.source || 'Store'}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-sm">{order.paymentStatus || 'Payment pending'}</span>
            <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-sm">{order.status || 'Unfulfilled'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-muted">Restock</button>
          <button className="btn-muted">Edit</button>
          <button className="btn-muted">More actions</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {/* Order Item card */}
          <div className="admin-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Order Item</h2>
              <div className="text-sm text-gray-500">{(order.products || []).length} item(s)</div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">{(order.products || []).length} item(s)</div>
                <button onClick={() => setItemsOpen(v => !v)} className="text-sm text-gray-500">{itemsOpen ? 'Collapse ▲' : 'Expand ▼'}</button>
              </div>

              {itemsOpen && (
                <div className="mt-3 space-y-4">
                  {(order.products || []).map((p, idx) => (
                    <div key={p._id || idx} className="border rounded p-3 bg-white flex items-start gap-4">
                      <div className="w-20 h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                        {/* Order model uses `img` and `img` string; fallback to images array */}
                        {p.img ? <img src={p.img} alt={p.name} className="w-full h-full object-cover" /> : (p.images?.[0] ? <img src={p.images[0].url || p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : null)}
                      </div>

                      <div className="flex-1">
                        {/* category above name if available */}
                        {p.category && <div className="text-xs text-gray-400">{p.category}</div>}
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-500 mt-1">Size: {p.size || 'Standard'} • Color: {p.color || '-'}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm">{p.quantity} x ₹{(p.price ?? p.salePrice ?? 0).toFixed(2)}</div>
                        <div className="font-semibold">₹{((p.quantity || 0) * (p.price || 0)).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>
          </div>

          {/* action buttons moved outside individual item boxes: show below the items, right-aligned */}
          <div className="flex justify-end gap-3 mt-2">
            <button onClick={() => setShowFulfillModal(true)} className="btn-muted">Update Order Status</button>
            <button className="btn-primary">Create shipping label</button>
          </div>


          {/* Order Summary */}
          <div className="admin-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Order Summary</h2>
              <span className="px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-sm">{order.paymentStatus || 'Payment pending'}</span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm text-gray-500">Summary</h4>
                <button onClick={() => setSummaryOpen(v => !v)} className="text-sm text-gray-500">{summaryOpen ? 'Collapse ▲' : 'Expand ▼'}</button>
              </div>

              {summaryOpen && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>Subtotal</div><div className="text-right">₹{order.totalAmount ?? order.subtotal ?? 0}</div>
                  <div>Discount</div><div className="text-right">-₹{order.discountAmount ?? order.discount ?? 0}</div>
                  <div>Shipping</div><div className="text-right">₹{order.shippingCost ?? 0}</div>
                  <div className="font-semibold">Total</div><div className="text-right font-semibold">₹{order.finalAmount ?? 0}</div>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button className="btn-muted">Send invoice</button>
                <button className="btn-primary">Collect payment</button>
              </div>
            </div>
          </div>

          {/* Timeline / Comments */}
          <div className="admin-card p-4">
            <h3 className="font-semibold">Timeline</h3>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm text-gray-500">Order events and comments</h4>
                <button onClick={() => setTimeline(v => !v)} className="text-sm text-gray-500">{timeline ? 'Collapse ▲' : 'Expand ▼'}</button>
              </div>

              <div className="mt-3 space-y-3">
                {(timeline ? sortedTimeline : sortedTimeline.slice(0, 3)).map((h, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center text-sm">{(h.status || '').slice(0, 1)}</div>
                    <div>
                      <div className="text-sm font-medium">{h.status}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(h.date || order.updatedAt || order.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}

                <textarea placeholder="Leave a comment..." className="input w-full mt-2" rows={3}></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">
          <div className="admin-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notes</h3>
              <button className="text-sm text-gray-500">✎</button>
            </div>
            <div className="mt-2 text-sm text-gray-600">{order.notes || 'No notes'}</div>
          </div>

          <div className="admin-card p-4">
            <h3 className="font-semibold">Customers</h3>
            <div className="mt-2 text-sm">{order.userInfo?.name || 'Guest'}</div>
            <div className="text-xs text-gray-500 mt-1">{(order.userInfo?.orderCount || 1)} order(s)</div>
          </div>

          <div className="admin-card p-4">
            <h3 className="font-semibold">Contact Information</h3>
            <div className="mt-2 text-sm">{order.userInfo?.email || '-'}</div>
            <div className="text-sm">{order.userInfo?.phone || '-'}</div>
          </div>

          <div className="admin-card p-4">
            <h3 className="font-semibold">Shipping address</h3>
            <div className="mt-2 text-sm">{order.shippingAddress?.address || order.userInfo?.address || '-'}</div>
            <div className="text-sm text-gray-500 mt-2">{order.shippingAddress?.phone || ''}</div>
            <a className="text-sm text-primary mt-2 inline-block">View Map</a>
          </div>

          <div className="admin-card p-4">
            <h3 className="font-semibold">Billing address</h3>
            <div className="mt-2 text-sm">{order.billingAddress?.address || 'Same as shipping'}</div>
          </div>

          <div className="admin-card p-4">
            <h3 className="font-semibold">Conversion summary</h3>
            <div className="mt-2 text-sm text-gray-500">There aren't any conversion details available for this order.</div>
          </div>
        </aside>
      </div>
      {showFulfillModal && (
        <OrderModal
          orderId={order._id}
          order={order}
          show={showFulfillModal}
          onClose={() => setShowFulfillModal(false)}
          onUpdated={(data) => {
            if (data && data.order) setOrder(data.order)
            else if (data && data._id) setOrder(data)
          }}
        />
      )}
    </div>
  );
}
