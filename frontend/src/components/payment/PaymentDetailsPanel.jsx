"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, ShieldCheck, Smartphone } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export function PaymentDetailsPanel({
  selectedMethod,
  selectedAddressId,
  cartTotal,
  orderId,
  setCreatedOrderId,
  appliedCouponCode = "",
  compact = false,
}) {
  const { fetchCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [paymentFailed, setPaymentFailed] = useState(false);

  const router = useRouter();

  const getToken = () => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    return stored?.token;
  };

  const getAddressId = () => selectedAddressId || localStorage.getItem("selectedAddressId");

  const ensureOrder = async (paymentType) => {
    if (orderId) return orderId;

    const token = getToken();
    const addressId = getAddressId();

    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        addressId,
        offerCode: appliedCouponCode || "",
        paymentType,
      }),
    });

    const data = await res.json();
    const newOrderId = data?.order?._id || data?.orderId;

    if (!newOrderId) {
      throw new Error(data?.message || "Order create failed");
    }

    setCreatedOrderId?.(newOrderId);
    return newOrderId;
  };

  const markPaymentFailed = async (currentOrderId, reason = "Payment cancelled by customer") => {
    try {
      await fetch(`${API_BASE}/api/payment/razorpay/fail`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          orderId: currentOrderId,
          reason,
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  const goToPaymentFailure = async (currentOrderId, reason = "cancelled") => {
    await markPaymentFailed(currentOrderId, reason);
    router.push(`/payment-failed?order=${currentOrderId}&reason=${encodeURIComponent(reason)}`);
  };

  const handleRazorpayPayment = async () => {
    if (!cartTotal || Number(cartTotal.finalAmount || cartTotal.sellingPrice) <= 0) {
      toast.error("Invalid order amount");
      return;
    }

    let currentOrderId = null;

    try {
      setPaymentFailed(false);
      setProcessingMessage("Opening secure Razorpay checkout");
      setIsProcessing(true);

      currentOrderId = await ensureOrder("UPI");
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error("Razorpay SDK failed to load");
      }

      const orderRes = await fetch(`${API_BASE}/api/payment/razorpay/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          orderId: currentOrderId,
          paymentMethod: "UPI",
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Unable to start payment");
      }

      const prefill = orderData.prefill || {};

      setIsProcessing(false);

      const razor = new window.Razorpay({
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.razorpayOrder.amount,
        currency: "INR",
        name: "Glovia Glamour",
        description: "Secure Online Payment",
        order_id: orderData.razorpayOrder.id,
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
            setProcessingMessage("Verifying payment");
            setIsProcessing(true);

            const verifyRes = await fetch(`${API_BASE}/api/payment/razorpay/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
              },
              body: JSON.stringify({
                orderId: currentOrderId,
                ...response,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error(verifyData.message || "Payment verification failed");
            }

            await fetchCart();
            setIsProcessing(false);
            router.push(`/order-success/${currentOrderId}`);
          } catch (error) {
            setIsProcessing(false);
            setPaymentFailed(true);
            await goToPaymentFailure(currentOrderId, error.message || "verification_failed");
          }
        },
        modal: {
          ondismiss: async () => {
            setPaymentFailed(true);
            await goToPaymentFailure(currentOrderId, "cancelled");
          },
        },
        theme: {
          color: "#b27b86",
        },
      });

      razor.open();
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
      setPaymentFailed(true);
      toast.error(error.message || "Payment failed");

      if (currentOrderId) {
        await goToPaymentFailure(currentOrderId, error.message || "failed");
      }
    }
  };

  const handleCodOrder = async () => {
    try {
      setPaymentFailed(false);
      setProcessingMessage("Placing COD order");
      setIsProcessing(true);

      const currentOrderId = await ensureOrder("COD");

      await fetchCart();
      setIsProcessing(false);
      router.push(`/order-success/${currentOrderId}`);
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
      setPaymentFailed(true);
      toast.error(error.message || "Order failed");
    }
  };

  const panelClass = compact
    ? "rounded-[4px] border border-[#ece5e8] bg-white p-4"
    : "rounded-[4px] border border-[#ece5e8] bg-white p-5 shadow-[0_6px_18px_rgba(45,28,35,0.05)] sm:p-6";

  if (isProcessing) {
    return (
      <div className={`${panelClass} flex min-h-[360px] flex-col items-center justify-center text-center sm:min-h-[420px]`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f4] text-[#b27b86]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-[22px] font-semibold text-[#2f2428] sm:text-[24px]">{processingMessage}</h2>
        <p className="mt-2 max-w-[280px] text-[14px] leading-6 text-[#6f6167]">
          Please wait while we secure your order.
        </p>
      </div>
    );
  }

  return (
    <div className={panelClass}>
      <div className="mb-5 border-b border-[#f0e6e8] pb-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8a7a80]">
          {selectedMethod === "cod" ? "Cash on delivery" : "Online payment"}
        </p>
        <h2 className="mt-1 text-[22px] font-semibold text-[#2f2428]">
          {selectedMethod === "cod" ? "Pay on delivery" : "Pay securely with Razorpay"}
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-[#6f6167]">
          {selectedMethod === "cod"
            ? "Finish your order now and pay when the package reaches you."
            : "Razorpay will show available UPI, card, wallet, and net banking options inside the secure popup."}
        </p>
      </div>

      {paymentFailed ? (
        <div className="mb-5 rounded-[4px] border border-[#f2d3d8] bg-[#fff7f8] p-3">
          <p className="text-[13px] font-medium text-[#a14e5f]">
            Payment failed or was cancelled. You can try again from the failure page.
          </p>
        </div>
      ) : null}

      {selectedMethod === "cod" ? (
        <div className="space-y-5">
          <div className="rounded-[4px] border border-[#ece5e8] bg-[#fffafb] p-4">
            <p className="text-[14px] font-semibold text-[#2f2428]">Cash on Delivery</p>
            <p className="mt-1 text-[13px] leading-5 text-[#6f6167]">
              Pay when your package arrives. Online payment may be faster and easier to confirm.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCodOrder}
            className="flex h-12 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
          >
            Place COD Order
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-[12px] border border-[#ead8de] bg-[#fffafb] px-4 py-4 shadow-[0_10px_24px_rgba(74,46,53,0.05)]">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#b27b86] shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#2f2428]">
                  One secure Razorpay checkout
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#6f6167]">
                  Choose your preferred method inside the popup.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#ead8de] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6f5961]">
                    <Smartphone className="h-3.5 w-3.5 text-[#b27b86]" />
                    UPI
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#ead8de] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6f5961]">
                    <CreditCard className="h-3.5 w-3.5 text-[#b27b86]" />
                    Cards
                  </span>
                  <span className="rounded-full border border-[#ead8de] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6f5961]">
                    Wallets
                  </span>
                  <span className="rounded-full border border-[#ead8de] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6f5961]">
                    Net Banking
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRazorpayPayment}
            className="flex h-12 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
          >
            Pay Securely With Razorpay
          </button>
        </div>
      )}

      <div className="mt-6 border-t border-[#f0e6e8] pt-4">
        <div className="flex items-start gap-3 rounded-[4px] bg-[#fffafb] p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#03a685]" />
          <div>
            <p className="text-[13px] font-semibold text-[#2f2428]">100% secure checkout</p>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6167]">
              Your payment details are encrypted by Razorpay and never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
