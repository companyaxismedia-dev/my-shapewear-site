import { API_BASE } from "@/lib/api";

export const FALLBACK_PRODUCT_IMAGE = "/fallback.svg";

export const resolveImageUrl = (image) => {
  const path = typeof image === "object" ? image?.url || image?.path : image;
  const cleanPath = String(path || "").trim();

  if (!cleanPath) return FALLBACK_PRODUCT_IMAGE;
  if (cleanPath.startsWith("http")) return cleanPath;
  if (cleanPath.startsWith("data:")) return cleanPath;
  if (cleanPath.startsWith("blob:")) return cleanPath;

  return `${API_BASE}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
};

export const getPrimaryProductImage = (product) => {
  const variantImage =
    product?.variants?.[0]?.images?.find?.((img) => img?.isPrimary)?.url ||
    product?.variants?.[0]?.images?.[0]?.url ||
    product?.variants?.[0]?.images?.[0];

  return resolveImageUrl(product?.thumbnail || product?.image || variantImage);
};
