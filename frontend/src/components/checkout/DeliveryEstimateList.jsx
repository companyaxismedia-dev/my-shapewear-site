"use client";

import { API_BASE } from "@/lib/api";
import {
  formatDeliveryDate,
  getProductId,
  useDeliveryEstimates,
} from "@/hooks/useDeliveryEstimates";

const resolveImage = (image) => {
  if (!image) return "/placeholder.png";
  if (/^https?:\/\//i.test(image) || image.startsWith("/image")) return image;
  return `${API_BASE}${image}`;
};

export default function DeliveryEstimateList({
  cartItems = [],
  pincode = "",
  visibleItems,
  itemClassName = "flex items-center gap-3",
  imageClassName = "h-14 w-11 rounded-[4px] object-cover",
  textClassName = "text-[13px] leading-5 text-[#5f4b52]",
}) {
  const items = visibleItems || cartItems;
  const { estimates, loading } = useDeliveryEstimates(cartItems, pincode);
  const cleanPincode = String(pincode || "").trim();
  const hasValidPincode = /^[1-9][0-9]{5}$/.test(cleanPincode);

  if (!items.length) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const productId = getProductId(item);
        const estimate = estimates[productId];
        const dateText = estimate?.expectedDeliveryDate
          ? formatDeliveryDate(estimate.expectedDeliveryDate)
          : item.deliveryDate || "5-7 Business Days";

        return (
          <div key={item.id || productId} className={itemClassName}>
            <img
              src={resolveImage(item.image)}
              alt={item.name}
              className={imageClassName}
            />
            <p className={textClassName}>
              {!hasValidPincode ? (
                <>
                  Estimated delivery by{" "}
                  <span className="font-semibold text-[#2f2428]">{dateText}</span>
                </>
              ) : loading && !estimate ? (
                <span className="font-semibold text-[#6f6167]">Checking delivery date...</span>
              ) : estimate?.serviceable === false ? (
                <span className="font-semibold text-[#b25b6b]">
                  Not deliverable to {cleanPincode}
                </span>
              ) : (
                <>
                  Estimated delivery by{" "}
                  <span className="font-semibold text-[#2f2428]">{dateText}</span>
                  {estimate?.codAvailable === false ? (
                    <span className="block text-[12px] text-[#8c7480]">
                      Pay on delivery unavailable for this item
                    </span>
                  ) : null}
                </>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
}
