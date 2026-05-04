"use client";

const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export function PriceDetailsSection({
  itemCount = 1,
  totalMrp = 0,
  sellingPrice = 0,
  discount = 0,
  couponDiscount = 0,
  platformFee = 23,
  finalAmount,
  appliedCouponCode = "",
  compact = false,
}) {
  const resolvedFinalAmount =
    finalAmount !== undefined
      ? Number(finalAmount || 0)
      : Math.max(Number(sellingPrice || 0) + Number(platformFee || 0) - Number(couponDiscount || 0), 0);

  const priceDetails = [
    { label: "Total MRP", value: formatPrice(totalMrp) },
    { label: "Discount on MRP", value: `-${formatPrice(discount)}`, highlight: true },
    ...(couponDiscount > 0
      ? [
          {
            label: `Coupon Discount${appliedCouponCode ? ` (${appliedCouponCode})` : ""}`,
            value: `-${formatPrice(couponDiscount)}`,
            highlight: true,
          },
        ]
      : []),
    { label: "Platform Fee", value: formatPrice(platformFee) },
  ];

  return (
    <div
      className={`rounded-[4px] border border-[#ece5e8] bg-white shadow-[0_6px_18px_rgba(45,28,35,0.05)] ${
        compact ? "" : "p-6"
      }`}
    >
      <div className={compact ? "" : "mb-5"}>
        <h3 className="text-[16px] font-medium text-[#2f2428]">Price Details</h3>
        <p className="mt-1 text-[12px] uppercase tracking-[0.04em] text-[#8a7a80]">
          {itemCount} item{itemCount > 1 ? "s" : ""} in this order
        </p>
      </div>

      <div className={`space-y-4 ${compact ? "mt-4" : "border-t border-[#eee3e6] pt-5"}`}>
        {priceDetails.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-[13px]">
            <span className={item.highlight ? "text-[#2f9a52]" : "text-[#3f3036]"}>{item.label}</span>
            <span className={item.highlight ? "font-medium text-[#2f9a52]" : "font-medium text-[#2f2428]"}>
              {item.value}
            </span>
          </div>
        ))}

        <div className="border-t border-[#eee3e6] pt-5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-[#2f2428]">Total Amount</span>
            <span className="text-[18px] font-semibold text-[#b27b86]">{formatPrice(resolvedFinalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[4px] border border-[#f0e6e8] bg-[#fffafb] p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6c5f65]">
          Accepted Payment Types
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["UPI", "Cards", "Wallets", "Net Banking", "COD"].map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#e7d8dd] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.03em] text-[#5f4b52]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
