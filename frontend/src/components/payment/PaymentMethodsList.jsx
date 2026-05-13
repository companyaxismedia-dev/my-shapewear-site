"use client";

import {
  Building2,
  CreditCard,
  Smartphone,
  Star,
} from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "cod",
    name: "Cash on delivery",
    description: "Pay when your order arrives",
    icon: Building2,
    recommended: true,
  },
  {
    id: "upi",
    name: "UPI",
    description: "Pay using installed UPI apps via Razorpay Intent",
    icon: Smartphone,
  },
  {
    id: "card",
    name: "Card payment",
    description: "Pay securely by credit or debit card",
    icon: CreditCard,
  },
];

export function PaymentMethodsList({ selectedMethod, onMethodChange, compact = false }) {
  const wrapperClass = compact
    ? "space-y-2"
    : "rounded-[4px] border border-[#ece5e8] bg-white p-4 shadow-[0_6px_18px_rgba(45,28,35,0.05)] xl:sticky xl:top-[132px]";

  return (
    <div className={wrapperClass}>
      {!compact ? (
        <div className="mb-4 border-b border-[#f0e6e8] pb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3f6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-[#b27b86]">
            <Star className="h-3.5 w-3.5 fill-current" />
            Recommended
          </div>
          <h2 className="mt-3 text-[18px] font-semibold text-[#2f2428]">
            Payment methods
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-[#6f6167]">
            Choose the option that works best for you.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onMethodChange(method.id)}
              className={`flex w-full items-start gap-3 rounded-[4px] border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-[#b27b86] bg-[#fffafb] shadow-[0_8px_18px_rgba(178,123,134,0.08)]"
                  : "border-[#ece5e8] bg-white hover:border-[#d9c7cd]"
              }`}
            >
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isSelected ? "bg-[#f5e7eb] text-[#b27b86]" : "bg-[#f7f2f4] text-[#7c6f74]"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-semibold text-[#2f2428]">{method.name}</p>
                  {method.recommended ? (
                    <span className="rounded-full border border-[#f0d6dd] bg-[#fff7f9] px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.04em] text-[#b27b86]">
                      Popular
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-[12px] leading-5 text-[#6f6167]">{method.description}</p>
              </div>

              <div
                className={`mt-1 h-4 w-4 rounded-full border ${
                  isSelected ? "border-[#b27b86] bg-[#b27b86]" : "border-[#d4c7cc] bg-white"
                }`}
              >
                {isSelected ? <div className="m-[3px] h-2 w-2 rounded-full bg-white" /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
