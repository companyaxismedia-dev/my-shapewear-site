"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import OrderModal from "@/components/admin/modals/OrderModal";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";

const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

const resolveImageUrl = (item) => {
  const rawImage =
    item?.img ||
    item?.image ||
    item?.images?.[0]?.url ||
    item?.images?.[0] ||
    "";

  if (!rawImage) return "";
  if (rawImage.startsWith("http")) return rawImage;
  return `${API_BASE}${rawImage}`;
};

export default function AdminOrderDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFulfillModal, setShowFulfillModal] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/details`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: [id] }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Failed to fetch order");
        setOrder((data.orders && data.orders[0]) || null);
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const selectedItemIndex = useMemo(() => {
    const rawIndex = Number(searchParams.get("item") || 0);
    if (!Number.isFinite(rawIndex) || rawIndex < 0) return 0;
    return rawIndex;
  }, [searchParams]);

  if (loading) return <div className="p-6">Loading order...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const products = order.products || [];
  const activeItem = products[selectedItemIndex] || products[0] || null;
  const activeImage = resolveImageUrl(activeItem);
  const itemTimeline = [...(activeItem?.itemStatusHistory || [])].sort(
    (a, b) =>
      new Date(b.date || order.updatedAt || order.createdAt) -
      new Date(a.date || order.updatedAt || order.createdAt)
  );

  const openItem = (itemIndex) => {
    router.push(`/admin/orders/${id}?item=${itemIndex}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="admin-card flex flex-wrap items-start justify-between gap-4 p-5">
        <div>
          <h1 className="text-2xl font-semibold">Order ID: {String(order.orderNumber || order._id)}</h1>
          <div className="mt-1 text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()} | {order.userInfo?.name || "Guest"}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
              {order.paymentStatus || order.payment?.status || "Payment pending"}
            </span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-700">
              {activeItem?.itemStatus || order.status || "Order Placed"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowFulfillModal(true)} className="btn-muted">
            Update Item Statuses
          </button>
          <button className="btn-primary">Create shipping label</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-6">
          <div className="admin-card p-5">
            <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-2xl bg-gray-100">
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={activeItem?.name || "Order item"}
                    className="h-full min-h-[180px] w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-[180px] items-center justify-center text-sm text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-gray-400">Selected Item</div>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                    {activeItem?.name || "Order item"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Size: {activeItem?.size || "-"} | Color: {activeItem?.color || "-"} | Qty: {activeItem?.quantity || 1}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Item Status</div>
                    <div className="mt-2 font-medium">{activeItem?.itemStatus || "Order Placed"}</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Unit Price</div>
                    <div className="mt-2 font-medium">{formatMoney(activeItem?.price)}</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Line Total</div>
                    <div className="mt-2 font-medium">
                      {formatMoney(activeItem?.lineTotal || (activeItem?.price || 0) * (activeItem?.quantity || 1))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Latest Update</div>
                      <div className="mt-1 text-base font-medium">
                        {activeItem?.itemStatus || order.status || "Order Placed"}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(
                        itemTimeline[0]?.date || order.updatedAt || order.createdAt
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Other items in this order</h3>
                <p className="text-sm text-gray-500">
                  Click an item to open that specific admin order detail view
                </p>
              </div>
              <div className="text-sm text-gray-500">{products.length} item(s)</div>
            </div>

            <div className="mt-4 space-y-3">
              {products.map((item, itemIndex) => {
                const itemImage = resolveImageUrl(item);
                const isActive = itemIndex === selectedItemIndex;

                return (
                  <button
                    key={`${item._id || itemIndex}-${itemIndex}`}
                    type="button"
                    onClick={() => openItem(itemIndex)}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-rose-300 bg-rose-50/40"
                        : "border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/20"
                    }`}
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-100">
                      {itemImage ? (
                        <img src={itemImage} alt={item.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs uppercase tracking-[0.18em] text-gray-400">Product</div>
                      <div className="truncate text-base font-medium">{item.name}</div>
                      <div className="mt-1 text-sm text-gray-500">
                        Size: {item.size || "-"} | Qty: {item.quantity || 1}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.itemStatus || "Order Placed"}</div>
                      <div className="mt-1 text-sm text-gray-500">{formatMoney(item.lineTotal || item.price)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="admin-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              <span className="text-sm text-gray-500">{order.payment?.method || "COD"}</span>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span>Subtotal</span>
                <span>{formatMoney(order.totalAmount ?? order.subtotal ?? order.pricing?.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span>Total</span>
                <span className="font-semibold">{formatMoney(order.finalAmount ?? order.pricing?.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="admin-card p-5">
            <h3 className="text-lg font-semibold">Item Timeline</h3>
            <div className="mt-4 space-y-4">
              {(itemTimeline.length
                ? itemTimeline
                : [
                    {
                      status: activeItem?.itemStatus || order.status,
                      date: order.updatedAt || order.createdAt,
                    },
                  ]).map((event, index) => (
                <div key={`${event.status}-${event.date}-${index}`} className="flex items-start gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-rose-500" />
                  <div>
                    <div className="font-medium">{event.status}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(event.date || order.updatedAt || order.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="text-lg font-semibold">Customer</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div>{order.userInfo?.name || "Guest"}</div>
              <div className="text-gray-500">{order.userInfo?.email || "-"}</div>
              <div className="text-gray-500">{order.userInfo?.phone || "-"}</div>
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="text-lg font-semibold">Shipping Address</h3>
            <div className="mt-3 text-sm text-gray-600">
              {order.shippingAddress?.address || order.userInfo?.address || "-"}
            </div>
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
            if (data?.order) setOrder(data.order);
            else if (data?._id) setOrder(data);
          }}
        />
      )}
    </div>
  );
}
