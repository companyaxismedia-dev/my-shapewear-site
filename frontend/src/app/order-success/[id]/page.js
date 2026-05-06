"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutStepper from "@/app/checkout/components/CheckoutStepper";
import { API_BASE } from "@/lib/api";

const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export default function OrderSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?.token) return;

        const res = await fetch(`${API_BASE}/api/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json();
        if (data?.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  const orderNumber = useMemo(() => {
    if (!order) return "";
    return order.orderNumber || String(order._id || "").slice(-8).toUpperCase();
  }, [order]);

  const itemCount = useMemo(() => {
    if (!order?.products) return 0;
    return order.products.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [order]);

  const deliveryAddress = useMemo(() => {
    if (!order?.userInfo) return "";

    return [
      order.userInfo.addressLine1,
      order.userInfo.addressLine2,
      order.userInfo.city,
      order.userInfo.state,
      order.userInfo.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-[#4a2e35]">
        <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
          <Navbar />
        </div>
        <div className="pt-[52px] lg:pt-0">
          <div className="hidden pt-20 lg:block">
            <CheckoutStepper currentStep="confirmation" />
            <div className="mx-auto w-full max-w-[1140px] px-5 py-8 lg:px-7">
              <div className="rounded-[4px] border border-[#ece5e8] bg-white p-8 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                <p className="text-[14px] text-[#6f6167]">Confirming your order...</p>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white text-[#4a2e35]">
        <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
          <Navbar />
        </div>
        <div className="pt-[52px] lg:pt-0">
          <div className="hidden pt-20 lg:block">
            <CheckoutStepper currentStep="confirmation" />
            <div className="mx-auto w-full max-w-[1140px] px-5 py-8 lg:px-7">
              <div className="rounded-[4px] border border-[#ece5e8] bg-white p-8 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                <h1 className="text-[28px] font-semibold text-[#2f2428]">Order not found</h1>
                <p className="mt-2 text-[14px] text-[#6f6167]">
                  We could not load this order confirmation right now.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-[8px] bg-[#b27b86] px-5 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#4a2e35]">
      <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
        <Navbar />
      </div>

      <div className="pt-[52px] lg:pt-0">
        <div className="lg:hidden">
          <div className="sticky top-[52px] z-30 border-b border-[#ece5e8] bg-white">
            <div className="flex items-center justify-between px-4 py-2">
              <div>
                <p className="text-[15px] font-semibold uppercase tracking-[0.02em] text-[#2f2428]">
                  Order Confirmed
                </p>
              </div>

              <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6d5f65]">
                Complete
              </span>
            </div>
          </div>

          <div className="space-y-3 bg-[#f9f5f6] px-0 pb-10">
            <div className="bg-white px-4 py-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfaf4] text-[#2f9a52]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#b27b86]">
                  Thank you for shopping with IMKAA
                </p>
                <h1 className="mt-2 text-[28px] font-semibold text-[#2f2428]">Order confirmed</h1>
                <p className="mt-2 max-w-[300px] text-[14px] leading-6 text-[#6f6167]">
                  Your order has been placed successfully. We will keep you updated as it moves forward.
                </p>
              </div>
            </div>

            <div className="bg-white px-4 py-4">
              <div className="rounded-[4px] border border-[#ece5e8] bg-[#fffafb] p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8a7a80]">
                  Order Reference
                </p>
                <p className="mt-2 text-[20px] font-semibold text-[#2f2428]">{orderNumber}</p>
                <p className="mt-2 text-[13px] leading-5 text-[#6f6167]">
                  {itemCount} item{itemCount > 1 ? "s" : ""} • {formatPrice(order.pricing?.totalAmount)}
                </p>
              </div>
            </div>

            <div className="bg-white px-4 py-4">
              <div className="space-y-4">
                <InfoRow
                  icon={<Truck className="h-5 w-5 text-[#b27b86]" />}
                  title="Expected delivery"
                  text="Usually within 3-5 business days"
                />
                <InfoRow
                  icon={<MapPin className="h-5 w-5 text-[#b27b86]" />}
                  title={`${order.userInfo?.name || "Delivery address"} • ${order.userInfo?.phone || ""}`}
                  text={deliveryAddress}
                />
                <InfoRow
                  icon={<ShieldCheck className="h-5 w-5 text-[#03a685]" />}
                  title="Payment status"
                  text={`${order.payment?.status || "Pending"} via ${order.payment?.method || "COD"}`}
                />
              </div>
            </div>

            <div className="bg-white px-4 py-4">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[#6c5f65]">
                Price Summary
              </h3>
              <div className="mt-4 space-y-3 text-[14px]">
                <SummaryRow label="Total MRP" value={formatPrice(order.pricing?.subtotal)} />
                <SummaryRow label="Product Discount" value={`-${formatPrice(order.pricing?.productDiscount)}`} positive />
                {order.pricing?.couponDiscount > 0 ? (
                  <SummaryRow
                    label={`Coupon Discount${order.coupon?.code ? ` (${order.coupon.code})` : ""}`}
                    value={`-${formatPrice(order.pricing?.couponDiscount)}`}
                    positive
                  />
                ) : null}
                <SummaryRow label="Platform Fee" value={formatPrice(order.pricing?.platformFee)} />
                <div className="border-t border-[#f0e6e8] pt-3">
                  <SummaryRow
                    label="Total Paid"
                    value={formatPrice(order.pricing?.totalAmount)}
                    strong
                  />
                </div>
              </div>
            </div>

            <div className="bg-white px-4 py-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/order/${order._id}`)}
                  className="inline-flex h-12 items-center justify-center rounded-[4px] bg-[#b27b86] px-4 text-[14px] font-semibold uppercase tracking-[0.03em] text-white"
                >
                  View Order Details
                </button>
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center rounded-[4px] border border-[#d9c7cd] px-4 text-[14px] font-semibold uppercase tracking-[0.03em] text-[#4a3c42]"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden pt-20 lg:block">
          <CheckoutStepper currentStep="confirmation" />

          <div className="mx-auto w-full max-w-[1140px] px-5 py-8 lg:px-7">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-9">
              <div className="space-y-6">
                <div className="rounded-[4px] border border-[#ece5e8] bg-white px-8 py-8 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-[620px]">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#b27b86]">
                        Confirmation
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfaf4] text-[#2f9a52]">
                          <CheckCircle2 className="h-9 w-9" />
                        </div>
                        <div>
                          <h1 className="text-[34px] font-semibold text-[#2f2428]">Order confirmed</h1>
                          <p className="mt-2 text-[14px] leading-6 text-[#6f6167]">
                            Your order has been placed successfully and is now being prepared for the next step.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[4px] border border-[#ece5e8] bg-[#fffafb] px-5 py-4">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8a7a80]">
                        Order Reference
                      </p>
                      <p className="mt-2 text-[22px] font-semibold text-[#2f2428]">{orderNumber}</p>
                      <p className="mt-2 text-[13px] leading-5 text-[#6f6167]">
                        {itemCount} item{itemCount > 1 ? "s" : ""} • {formatPrice(order.pricing?.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                  <InfoCard
                    icon={<Truck className="h-5 w-5 text-[#b27b86]" />}
                    title="Expected delivery"
                    text="Usually within 3-5 business days"
                  />
                  <InfoCard
                    icon={<PackageCheck className="h-5 w-5 text-[#b27b86]" />}
                    title="Order tracking"
                    text="Track, update or review this order from your order details page."
                  />
                  <InfoCard
                    icon={<ShieldCheck className="h-5 w-5 text-[#03a685]" />}
                    title="Payment status"
                    text={`${order.payment?.status || "Pending"} via ${order.payment?.method || "COD"}`}
                  />
                </div>

                <div className="rounded-[4px] border border-[#ece5e8] bg-white p-6 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                  <div className="flex items-center gap-3 border-b border-[#eee3e6] pb-5">
                    <MapPin className="h-5 w-5 text-[#b27b86]" />
                    <div>
                      <h2 className="text-[18px] font-semibold text-[#2f2428]">Delivering to</h2>
                      <p className="mt-1 text-[13px] text-[#6f6167]">
                        {order.userInfo?.name} • {order.userInfo?.phone}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-[14px] leading-6 text-[#5f4b52]">{deliveryAddress}</p>
                </div>

                <div className="rounded-[4px] border border-[#ece5e8] bg-white p-6 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                  <div className="flex items-center justify-between gap-4 border-b border-[#eee3e6] pb-5">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-[#b27b86]" />
                      <div>
                        <h2 className="text-[18px] font-semibold text-[#2f2428]">Order summary</h2>
                        <p className="mt-1 text-[13px] text-[#6f6167]">
                          Review the final amount saved with your order.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/order/${order._id}`)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border border-[#d9c7cd] px-4 text-[12px] font-semibold uppercase tracking-[0.03em] text-[#4a3c42] transition hover:border-[#b27b86] hover:text-[#b27b86]"
                    >
                      Order Details
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-4">
                    <SummaryRow label="Total MRP" value={formatPrice(order.pricing?.subtotal)} />
                    <SummaryRow label="Product Discount" value={`-${formatPrice(order.pricing?.productDiscount)}`} positive />
                    {order.pricing?.couponDiscount > 0 ? (
                      <SummaryRow
                        label={`Coupon Discount${order.coupon?.code ? ` (${order.coupon.code})` : ""}`}
                        value={`-${formatPrice(order.pricing?.couponDiscount)}`}
                        positive
                      />
                    ) : null}
                    <SummaryRow label="Platform Fee" value={formatPrice(order.pricing?.platformFee)} />
                    <SummaryRow label="Shipping" value={order.pricing?.shippingCharge ? formatPrice(order.pricing?.shippingCharge) : "FREE"} />
                    <div className="border-t border-[#eee3e6] pt-5">
                      <SummaryRow
                        label="Total Paid"
                        value={formatPrice(order.pricing?.totalAmount)}
                        strong
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-start lg:sticky lg:top-[132px]">
                <div className="space-y-5">
                  <div className="rounded-[4px] border border-[#ece5e8] bg-white p-6 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8a7a80]">
                      What happens next
                    </p>

                    <div className="mt-5 space-y-4">
                      <TimelineItem
                        icon={<CheckCircle2 className="h-4 w-4 text-white" />}
                        active
                        title="Order placed"
                        text="Your order has been received and confirmed."
                      />
                      <TimelineItem
                        icon={<PackageCheck className="h-4 w-4 text-white" />}
                        title="Preparing shipment"
                        text="We are getting your items ready for dispatch."
                      />
                      <TimelineItem
                        icon={<Clock3 className="h-4 w-4 text-white" />}
                        title="Delivery updates"
                        text="Tracking details will appear on the order details page."
                      />
                    </div>
                  </div>

                  <div className="rounded-[4px] border border-[#ece5e8] bg-[#fffafb] p-5 text-[13px] leading-6 text-[#6f6167] shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                    Need anything else? You can review or track this order anytime from your account.
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => router.push(`/order/${order._id}`)}
                      className="inline-flex h-12 items-center justify-center rounded-[4px] bg-[#b27b86] px-4 text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
                    >
                      View Order
                    </button>
                    <Link
                      href="/"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] border border-[#d9c7cd] px-4 text-[14px] font-semibold uppercase tracking-[0.03em] text-[#4a3c42] transition hover:border-[#b27b86] hover:text-[#b27b86]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, positive = false, strong = false }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className={strong ? "text-[15px] font-semibold text-[#2f2428]" : "text-[#3f3036]"}>
        {label}
      </span>
      <span
        className={
          strong
            ? "text-[18px] font-semibold text-[#b27b86]"
            : positive
              ? "font-medium text-[#2f9a52]"
              : "font-medium text-[#2f2428]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function InfoRow({ icon, title, text }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-[14px] font-semibold text-[#2f2428]">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-[#6f6167]">{text}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="rounded-[4px] border border-[#ece5e8] bg-white p-5 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff3f6]">
        {icon}
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-[#2f2428]">{title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-[#6f6167]">{text}</p>
    </div>
  );
}

function TimelineItem({ icon, title, text, active = false }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          active ? "bg-[#2f9a52]" : "bg-[#b27b86]"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[14px] font-semibold text-[#2f2428]">{title}</p>
        <p className="mt-1 text-[13px] leading-5 text-[#6f6167]">{text}</p>
      </div>
    </div>
  );
}
