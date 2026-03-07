"use client";

import {
  CreditCard,
  Building2,
  Wallet,
  Zap,
  Repeat2,
  Star,
} from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "cod",
    name: "Cash On Delivery (Cash/UPI)",
    icon: Building2,
    recommended: true,
    offers: null,
  },
  {
    id: "upi",
    name: "UPI (Pay via any App)",
    icon: Zap,
    recommended: false,
    offers: null,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    recommended: false,
    offers: "8 Offers",
  },
  {
    id: "later",
    name: "Pay Later",
    icon: Repeat2,
    recommended: false,
    offers: null,
  },
  {
    id: "wallet",
    name: "Wallets",
    icon: Wallet,
    recommended: false,
    offers: "1 Offer",
  },
  {
    id: "emi",
    name: "EMI",
    icon: CreditCard,
    recommended: false,
    offers: "2 Offers",
  },
  {
    id: "netbank",
    name: "Net Banking",
    icon: Building2,
    recommended: false,
    offers: null,
  },
];

export function PaymentMethodsList({
  selectedMethod,
  onMethodChange,
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-[#f5f5f6] lg:sticky lg:top-20">

      {/* Recommended Header */}
      <div className="flex items-center gap-2 border-b bg-white px-4 py-3">
        <Star className="h-4 w-4 text-pink-500 fill-pink-500" />
        <span className="text-sm font-semibold text-pink-500">
          Recommended
        </span>
      </div>

      {/* METHODS LIST */}
      <div>

        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              className={`w-full border-b px-4 py-4 flex items-center gap-3 text-left transition ${
                isSelected
                  ? "bg-white border-l-4 border-l-pink-500"
                  : "bg-[#f5f5f6] hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5 text-gray-500 flex-shrink-0" />

              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${
                    isSelected ? "text-[#282c3f]" : "text-[#535766]"
                  }`}
                >
                  {method.name}
                </p>

                {method.offers && (
                  <p className="mt-1 text-xs font-semibold text-[#03a685]">
                    {method.offers}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}