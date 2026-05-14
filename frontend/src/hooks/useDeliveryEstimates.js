"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/api";

export const DELIVERY_PINCODE_STORAGE_KEY = "glovia_delivery_pincode";

export const getProductId = (item) => {
  const value = item?.productId || item?.product?._id || item?.product?.id || item?._id;
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || value);
};

export const formatDeliveryDate = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
};

export function useDeliveryEstimates(cartItems = [], pincode = "") {
  const [estimates, setEstimates] = useState({});
  const [loading, setLoading] = useState(false);

  const productIds = useMemo(
    () => [...new Set(cartItems.map(getProductId).filter(Boolean))],
    [cartItems],
  );

  useEffect(() => {
    const cleanPincode = String(pincode || "").trim();

    if (!/^[1-9][0-9]{5}$/.test(cleanPincode) || !productIds.length) {
      setEstimates({});
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadEstimates = async () => {
      try {
        setLoading(true);
        const responses = await Promise.all(
          productIds.map(async (productId) => {
            const res = await fetch(
              `${API_BASE}/api/products/${productId}/delivery?pincode=${cleanPincode}`,
              { cache: "no-store", signal: controller.signal },
            );
            const data = await res.json();
            return [productId, res.ok && data?.success ? data : null];
          }),
        );

        if (!controller.signal.aborted) {
          setEstimates(Object.fromEntries(responses));
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Delivery estimates failed:", error);
          setEstimates({});
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadEstimates();

    return () => controller.abort();
  }, [productIds.join(","), pincode]);

  return { estimates, loading };
}
