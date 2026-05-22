"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { getRazorpayMethodConfig, loadRazorpay } from "@/lib/razorpayCheckout";
import { toast } from "sonner";

export default function ChangePaymentModal({
  show,
  setShow,
  orderId,
  refreshOrder,
}) {
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.token;
  };

  const changePayment = async (method) => {
    try {
      const token = getToken();

      if (!token) {
        toast.error("Login required");
        return;
      }

      setLoading(true);

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load");
        setLoading(false);
        return;
      }

      const orderRes = await fetch(`${API_BASE}/api/payment/razorpay/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          paymentMethod: method,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Unable to start payment");
      }

      const prefill = orderData.prefill || {};
      const methodConfig = getRazorpayMethodConfig(method);

      const razor = new window.Razorpay({
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.razorpayOrder.amount,
        currency: "INR",
        name: "Imkaa",
        description: methodConfig.description,
        order_id: orderData.razorpayOrder.id,
        method: methodConfig.method,
        config: methodConfig.config,
        prefill,
        readonly: {
          name: Boolean(prefill.name),
          email: Boolean(prefill.email),
          contact: Boolean(prefill.contact),
        },
        hidden: {
          email: Boolean(prefill.email),
          contact: Boolean(prefill.contact),
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/payment/razorpay/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                orderId,
                ...response,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed");
            }

            await refreshOrder?.();
            setShow(false);
            setLoading(false);
            toast.success("Payment updated successfully");
          } catch (error) {
            setLoading(false);
            toast.error(error.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.error("Payment was cancelled");
          },
        },
        theme: {
          color: "#b27b86",
        },
      });

      razor.open();
    } catch (err) {
      setLoading(false);
      toast.error(err.message || "Payment update failed");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[420px] rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Change Payment Method</h2>

          <button
            type="button"
            onClick={() => setShow(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            <X />
          </button>
        </div>

        <p className="mb-5 text-sm text-gray-500">
          Select a secure online payment method. Payment is confirmed only after Razorpay verification.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => changePayment("UPI")}
            className="w-full rounded border p-3 text-left hover:bg-gray-50 disabled:opacity-60"
          >
            Pay via UPI
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => changePayment("CARD")}
            className="w-full rounded border p-3 text-left hover:bg-gray-50 disabled:opacity-60"
          >
            Pay via Card
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Opening secure Razorpay checkout...</p>
        ) : null}
      </div>
    </div>
  );
}
