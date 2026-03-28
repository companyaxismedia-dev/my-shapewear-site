"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const ALL_STEPS = [
  { id: "cart", label: "Cart", href: "/checkout/cart" },
  { id: "address", label: "Address", href: "/checkout/address" },
  { id: "payment", label: "Payment", href: "/checkout/payment" },
  { id: "confirmation", label: "Confirmation", href: null },
];

export default function CheckoutStepper({
  currentStep,
  className = "",
  showConfirmation = true,
}) {
  const steps = showConfirmation ? ALL_STEPS : ALL_STEPS.slice(0, 3);
  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === currentStep));

  return (
    <div className={` ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-start justify-center gap-0">
          {steps.map((step, index) => {
            const isCompleted = index < activeIndex;
            const isCurrent = index === activeIndex;
            const isActive = isCompleted || isCurrent;
            const showLink = step.href && isActive;

            return (
              <div key={step.id} className="flex min-w-0 flex-1 items-start">
                <div className="flex w-[92px] shrink-0 flex-col items-center">
                  {showLink ? (
                    <Link href={step.href} className="shrink-0">
                      <div 
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-medium ${
                          isCurrent
                            ? "border-[#b88a47] bg-[#b88a47] text-white"
                            : isCompleted
                              ? "border-[#b88a47] bg-white text-[#b88a47]"
                              : "border-[#dad3cb] bg-white text-[#a59d94]"
                        }`}
                      >
                        {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> : index + 1}
                      </div>
                    </Link>
                  ) : (
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-medium ${
                        isCurrent
                          ? "border-[#b88a47] bg-[#b88a47] text-white"
                          : isCompleted
                            ? "border-[#b88a47] bg-white text-[#b88a47]"
                            : "border-[#dad3cb] bg-white text-[#a59d94]"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> : index + 1}
                    </div>
                  )}

                  <div className="mt-2 w-full text-center">
                    <span
                      className={`text-[11px] font-medium uppercase tracking-[0.08em] ${
                        isActive ? "text-[#2b2825]" : "text-[#3c3732]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="flex flex-1 items-start px-3 pt-4">
                    <span
                      className={`block h-px w-full border-t border-dashed ${
                        index < activeIndex ? "border-[#b88a47]" : "border-[#d6d1cb]"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
