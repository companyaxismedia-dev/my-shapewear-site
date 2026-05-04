"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const UPI_APPS = ["Google Pay", "PhonePe", "Paytm"];
const BANKS = ["Axis Bank", "HDFC Bank", "ICICI Bank", "Kotak", "SBI"];
const WALLETS = ["Paytm", "Amazon Pay", "PhonePe Wallet"];
const EMI_OPTIONS = ["3 Months", "6 Months", "9 Months", "12 Months"];

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
  const [upiMode, setUpiMode] = useState("scan");
  const [upiIdSelected, setUpiIdSelected] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardError, setCardError] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedWallet, setSelectedWallet] = useState("");

  const router = useRouter();

  const getToken = () => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    return stored?.token;
  };

  const getAddressId = () => selectedAddressId || localStorage.getItem("selectedAddressId");

  const ensureOrder = async () => {
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

  const updateOrderPayment = async (currentOrderId, paymentMethod, paymentStatus) => {
    await fetch(`${API_BASE}/api/orders/update-payment/${currentOrderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        paymentMethod,
        paymentStatus,
      }),
    });
  };

  const handleRazorpayPayment = async (type) => {
    if (!cartTotal || Number(cartTotal.sellingPrice) <= 0) {
      toast.error("Invalid order amount");
      return;
    }

    try {
      setPaymentFailed(false);
      const currentOrderId = await ensureOrder();
      const loaded = await loadRazorpay();

      if (!loaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const orderRes = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          amount: cartTotal.sellingPrice,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        setPaymentFailed(true);
        return;
      }

      const razor = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "IMKAA",
        description: `${type} Payment`,
        order_id: orderData.order.id,
        handler: async (response) => {
          setProcessingMessage(`Processing ${type} payment`);
          setIsProcessing(true);

          const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            setIsProcessing(false);
            setPaymentFailed(true);
            return;
          }

          await updateOrderPayment(currentOrderId, type, "Paid");
          await fetchCart();
          setIsProcessing(false);
          router.push(`/order-success/${currentOrderId}`);
        },
        theme: {
          color: "#b27b86",
        },
      });

      razor.open();
    } catch (error) {
      console.log(error);
      setPaymentFailed(true);
      setIsProcessing(false);
      toast.error(error.message || "Payment failed");
    }
  };

  const handlePaymentProcess = async (type) => {
    try {
      setPaymentFailed(false);
      setProcessingMessage(`Processing ${type} payment`);
      setIsProcessing(true);

      const currentOrderId = await ensureOrder();
      await updateOrderPayment(currentOrderId, type, type === "COD" ? "Pending" : "Paid");

      await fetchCart();
      setIsProcessing(false);
      router.push(`/order-success/${currentOrderId}`);
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
      setPaymentFailed(true);
      toast.error(error.message || "Payment failed");
    }
  };

  const validateCard = () => {
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 13) {
      setCardError("Enter a valid card number");
      return false;
    }
    if (!cardName) {
      setCardError("Enter the name on card");
      return false;
    }
    if (!cardExpiry || cardExpiry.length < 5) {
      setCardError("Enter a valid expiry date");
      return false;
    }
    if (!cardCvv || cardCvv.length < 3) {
      setCardError("Enter a valid CVV");
      return false;
    }
    setCardError("");
    return true;
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    const parts = digits.match(/.{1,4}/g);
    return parts ? parts.join(" ") : "";
  };

  const panelClass = compact
    ? "rounded-[4px] border border-[#ece5e8] bg-white p-4"
    : "rounded-[4px] border border-[#ece5e8] bg-white p-5 shadow-[0_6px_18px_rgba(45,28,35,0.05)] sm:p-6";

  const fieldClass =
    "h-12 w-full rounded-[4px] border border-[#d8cdd2] bg-white px-4 text-[14px] text-[#2f2428] outline-none transition focus:border-[#b27b86]";

  const optionCard = (selected) =>
    `w-full rounded-[4px] border px-4 py-3 text-left transition ${
      selected ? "border-[#b27b86] bg-[#fffafb]" : "border-[#ece5e8] bg-white hover:border-[#d9c7cd]"
    }`;

  if (isProcessing) {
    return (
      <div className={`${panelClass} flex min-h-[420px] flex-col items-center justify-center text-center`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f4] text-[#b27b86]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-[24px] font-semibold text-[#2f2428]">{processingMessage}</h2>
        <p className="mt-2 text-[14px] text-[#6f6167]">Please wait while we secure your order.</p>
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
          {getPanelTitle(selectedMethod)}
        </h2>
        <p className="mt-2 text-[13px] leading-5 text-[#6f6167]">
          {getPanelDescription(selectedMethod)}
        </p>
      </div>

      {paymentFailed ? (
        <div className="mb-5 rounded-[4px] border border-[#f2d3d8] bg-[#fff7f8] p-3">
          <p className="text-[13px] font-medium text-[#a14e5f]">Payment failed. Please try again.</p>
          <button
            type="button"
            onClick={() => setPaymentFailed(false)}
            className="mt-2 text-[13px] font-semibold text-[#b27b86]"
          >
            Retry payment
          </button>
        </div>
      ) : null}

      {selectedMethod === "cod" ? (
        <div className="space-y-5">
          <div className="rounded-[4px] border border-[#ece5e8] bg-[#fffafb] p-4">
            <p className="text-[14px] font-semibold text-[#2f2428]">Cash on Delivery</p>
            <p className="mt-1 text-[13px] leading-5 text-[#6f6167]">
              A handling fee of Rs. 10 applies to COD orders. Pay online to skip this fee.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handlePaymentProcess("COD")}
            className="flex h-12 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
          >
            Place Order
          </button>
        </div>
      ) : null}

      {selectedMethod === "upi" ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setUpiMode("scan");
                setUpiIdSelected(false);
              }}
              className={optionCard(upiMode === "scan")}
            >
              <p className="text-[14px] font-semibold text-[#2f2428]">Scan QR</p>
              <p className="mt-1 text-[12px] text-[#6f6167]">Use any UPI app</p>
            </button>
            <button
              type="button"
              onClick={() => setUpiMode("id")}
              className={optionCard(upiMode === "id")}
            >
              <p className="text-[14px] font-semibold text-[#2f2428]">Enter UPI ID</p>
              <p className="mt-1 text-[12px] text-[#6f6167]">Pay with your VPA</p>
            </button>
          </div>

          {upiMode === "scan" ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setUpiIdSelected(true)}
                className={optionCard(upiIdSelected)}
              >
                <p className="text-[14px] font-semibold text-[#2f2428]">Scan & Pay</p>
                <p className="mt-1 text-[12px] text-[#6f6167]">Confirm before opening your UPI app.</p>
              </button>

              {upiIdSelected ? (
                <>
                  <div className="rounded-[4px] border border-dashed border-[#d9c7cd] bg-[#fffafb] p-6 text-center">
                    <img
                      src="/cleaned_qr.png"
                      alt="UPI QR"
                      className="mx-auto h-44 w-44 object-contain"
                    />
                    <p className="mt-3 text-[13px] text-[#5f4b52]">Scan this code with your preferred UPI app.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRazorpayPayment("UPI")}
                    className="flex h-12 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
                  >
                    Pay Now
                  </button>
                </>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {UPI_APPS.map((app) => (
                  <div key={app} className="rounded-[4px] border border-[#ece5e8] bg-white px-3 py-3 text-center text-[13px] font-medium text-[#4a3c42]">
                    {app}
                  </div>
                ))}
              </div>
              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
                className={fieldClass}
              />
              <button
                type="button"
                onClick={() => handleRazorpayPayment("UPI")}
                className="flex h-12 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
              >
                Pay Now
              </button>
            </div>
          )}
        </div>
      ) : null}

      {selectedMethod === "card" ? (
        <div className="space-y-4">
          {cardError ? (
            <div className="rounded-[4px] border border-[#f2d3d8] bg-[#fff7f8] p-3 text-[13px] font-medium text-[#a14e5f]">
              {cardError}
            </div>
          ) : null}

          <input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="Card Number"
            className={fieldClass}
          />
          <input
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Name on card"
            className={fieldClass}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              placeholder="MM/YY"
              className={fieldClass}
            />
            <div className="relative">
              <input
                type={showCvv ? "text" : "password"}
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                placeholder="CVV"
                className={`${fieldClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowCvv((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8d727b]"
              >
                {showCvv ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (validateCard()) {
                handleRazorpayPayment("CARD");
              }
            }}
            className="flex h-12 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
          >
            Pay Now
          </button>
        </div>
      ) : null}

      {selectedMethod === "wallet" ? (
        <div className="space-y-3">
          {WALLETS.map((wallet) => (
            <button
              key={wallet}
              type="button"
              onClick={() => setSelectedWallet(wallet)}
              className={optionCard(selectedWallet === wallet)}
            >
              <p className="text-[14px] font-semibold text-[#2f2428]">{wallet}</p>
            </button>
          ))}

          {selectedWallet ? (
            <button
              type="button"
              onClick={() => handlePaymentProcess("WALLET")}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
            >
              Pay Now
            </button>
          ) : null}
        </div>
      ) : null}

      {selectedMethod === "emi" ? (
        <div className="space-y-3">
          {EMI_OPTIONS.map((emi) => (
            <button
              key={emi}
              type="button"
              onClick={() => setSelectedEmi(emi)}
              className={optionCard(selectedEmi === emi)}
            >
              <p className="text-[14px] font-semibold text-[#2f2428]">{emi}</p>
              <p className="mt-1 text-[12px] text-[#6f6167]">Flexible monthly installments</p>
            </button>
          ))}

          {selectedEmi ? (
            <button
              type="button"
              onClick={() => handlePaymentProcess("EMI")}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
            >
              Pay Now
            </button>
          ) : null}
        </div>
      ) : null}

      {selectedMethod === "netbank" ? (
        <div className="space-y-3">
          {BANKS.map((bank) => (
            <button
              key={bank}
              type="button"
              onClick={() => setSelectedBank(bank)}
              className={optionCard(selectedBank === bank)}
            >
              <p className="text-[14px] font-semibold text-[#2f2428]">{bank}</p>
            </button>
          ))}

          {selectedBank ? (
            <button
              type="button"
              onClick={() => handlePaymentProcess("NETBANKING")}
              className="mt-2 flex h-12 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[14px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
            >
              Pay Now
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 border-t border-[#f0e6e8] pt-4">
        <div className="flex items-start gap-3 rounded-[4px] bg-[#fffafb] p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#03a685]" />
          <div>
            <p className="text-[13px] font-semibold text-[#2f2428]">100% secure checkout</p>
            <p className="mt-1 text-[12px] leading-5 text-[#6f6167]">
              Your payment details are encrypted and never shared with merchants.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPanelTitle(selectedMethod) {
  switch (selectedMethod) {
    case "cod":
      return "Pay on delivery";
    case "upi":
      return "UPI payment";
    case "card":
      return "Card payment";
    case "wallet":
      return "Wallet payment";
    case "emi":
      return "Choose an EMI plan";
    case "netbank":
      return "Net banking";
    default:
      return "Payment details";
  }
}

function getPanelDescription(selectedMethod) {
  switch (selectedMethod) {
    case "cod":
      return "Finish your order now and pay when the package reaches you.";
    case "upi":
      return "Use any UPI app to make a fast and secure payment.";
    case "card":
      return "We support all major domestic and international cards.";
    case "wallet":
      return "Select your preferred wallet and continue securely.";
    case "emi":
      return "Select an installment option that suits your budget.";
    case "netbank":
      return "Pay directly from your bank using a secure redirect.";
    default:
      return "Review your payment details and continue.";
  }
}
