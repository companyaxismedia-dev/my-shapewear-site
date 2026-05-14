"use client";

import DeliveryEstimateList from "./DeliveryEstimateList";

export default function DeliveryEstimates({ cartItems = [], pincode = "" }) {
  if (!cartItems.length) return null;

  return (
    <div className="mb-6">
      <p className="mb-4 text-[14px] font-bold uppercase text-[#535766]">
        Delivery Estimates
      </p>
      <DeliveryEstimateList
        cartItems={cartItems}
        pincode={pincode}
        itemClassName="flex gap-3 border-b border-[#eaeaec] py-3 last:border-0"
        imageClassName="h-16 w-12 object-cover"
        textClassName="text-[14px] leading-5 text-[#282c3f]"
      />
    </div>
  );
}
