"use client";

import { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { API_BASE } from "@/lib/api";

const PAYMENT_MODES = [
  {
    id: "rec",
    label: "Recommended",
    icon: <Plus className="w-4 h-4 text-pink-500 rotate-45" />,
  },
  { id: "cod", label: "Cash On Delivery" },
  { id: "upi", label: "UPI (Pay via any App)" },
  { id: "card", label: "Credit/Debit Card", offers: "4 Offers" },
  { id: "wallets", label: "Wallets", offers: "1 Offer" },
  { id: "net", label: "Net Banking" },
];

export default function PaymentOptions({
  selectedAddressId,
  onOrderSuccess,
}) {
  const [activeMode, setActiveMode] = useState("cod");
  const [loading, setLoading] = useState(false);

  /* ================= TOKEN ================= */
  const getToken = () => {
    const stored = JSON.parse(localStorage.getItem("user"));
    return stored?.token;
  };

  /* ================= PLACE ORDER ================= */
  const placeOrder = async () => {
    try {
      const token = getToken();

      if (!token) {
        alert("Login required");
        return;
      }

      if (!selectedAddressId) {
        alert("Please select address");
        return;
      }

      setLoading(true);

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentType: activeMode === "cod" ? "COD" : "Online",
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Order failed");
        return;
      }

      onOrderSuccess && onOrderSuccess(data);

    } catch (err) {
      console.log("Order error:", err);
      alert("Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row border border-[#eaeaec] overflow-hidden bg-white">

      {/* ================= LEFT PAYMENT LIST ================= */}
      <div className="w-full md:w-[320px] bg-[#f5f5f6] border-r border-[#eaeaec]">

        {PAYMENT_MODES.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMode(item.id)}
            className={`w-full px-4 py-4 text-left text-sm font-bold flex items-center justify-between border-b border-[#eaeaec] transition ${
              activeMode === item.id
                ? "bg-white border-l-4 border-l-[#ff3f6c] text-[#ff3f6c]"
                : "text-[#535766] hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>

            {item.offers && (
              <span className="text-[10px] text-green-600">
                {item.offers}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="flex-1 p-6 md:p-8">

        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-[16px] text-[#282c3f]">
            {activeMode === "cod"
              ? "Cash on Delivery (Cash/UPI)"
              : "Online Payment"}
          </h3>

          <ShieldCheck className="w-7 h-7 text-gray-300" />
        </div>

        {activeMode === "cod" ? (
          <p className="text-sm text-[#535766] mb-6">
            For this option, there is a fee of ₹10. Pay online to avoid COD fee.
          </p>
        ) : (
          <p className="text-sm text-[#535766] mb-6">
            Secure payment powered by Razorpay. Pay safely using UPI, Card or Net Banking.
          </p>
        )}

        {/* PLACE ORDER BUTTON */}
        <button
          onClick={placeOrder}
          disabled={loading}
          className="w-full bg-[#ff3f6c] hover:bg-[#ff527b] text-white h-12 uppercase font-bold tracking-widest rounded-sm transition disabled:opacity-60"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>

      </div>
    </div>
  );
}