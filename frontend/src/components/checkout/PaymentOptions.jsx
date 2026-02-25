"use client";

import { ShieldCheck, Plus } from "lucide-react";

const PAYMENT_MODES = [
  {
    id: "rec",
    label: "Recommended",
    icon: <Plus className="w-4 h-4 text-pink-500 rotate-45" />,
  },
  { id: "cod", label: "Cash On Delivery" },
  { id: "upi", label: "UPI (Pay via any App)" },
  { id: "card", label: "Credit/Debit Card", offers: "4 Offers" },
  { id: "paylater", label: "Pay Later" },
  { id: "wallets", label: "Wallets", offers: "1 Offer" },
  { id: "emi", label: "EMI", offers: "1 Offer" },
  { id: "net", label: "Net Banking" },
];

export default function PaymentOptions({ onPlaceOrder }) {
  return (
    <div className="flex flex-col md:flex-row border rounded-lg overflow-hidden min-h-[400px]">
      {/* LEFT PAYMENT TABS */}
      <div className="w-full md:w-1/3 bg-gray-50 border-r">
        {PAYMENT_MODES.map((item) => (
          <button
            key={item.id}
            className={`w-full px-4 py-4 text-left text-sm font-bold flex items-center justify-between border-b last:border-b-0 transition-colors ${
              item.id === "cod"
                ? "bg-white border-l-4 border-l-pink-500 text-pink-500"
                : "text-gray-600 hover:bg-gray-100"
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

      {/* RIGHT PAYMENT CONTENT */}
      <div className="flex-1 p-8 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold">Cash on Delivery (Cash/UPI)</h3>
          <ShieldCheck className="w-8 h-8 text-gray-200" />
        </div>

        <p className="text-sm text-gray-500 mb-6">
          For this option, there is a fee of ₹10. You can Pay online to avoid this.
        </p>

        <button
          onClick={onPlaceOrder}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white h-12 uppercase font-bold tracking-widest rounded"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}