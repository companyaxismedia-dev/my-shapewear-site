// import { braProducts } from "@/app/bra/page";
import { curvyProduct } from "@/app/curvy/page";
import { lingierieProducts } from "@/app/lingerie/page";
import { pantyProducts } from "@/app/panties/page";
import { shapeProducts } from "@/app/shapewear/page";
import { tummyProduct } from "@/app/tummy-control/page";


/* ================= API BASE ================= */

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ================= FETCH CATEGORY PRODUCTS ================= */

export const getCategoryProducts = async (category) => {
  try {
    const res = await fetch(
      `${API_BASE}/api/products?category=${category}&limit=20`
    );

    const data = await res.json();

    if (!data.success) return [];

    return data.products;

  } catch (error) {
    console.error("Category fetch error:", error);
    return [];
  }
};

/* ================= GET LOWEST PRICE ================= */

export const getCategoryPrice = async (category) => {
  const items = await getCategoryProducts(category);

  if (!items || !items.length)
    return { price: 0, oldPrice: 0, off: "0%" };

  // Normalize price from variants
  const normalized = items.map((p) => {
    const variant = p.variants?.[0] || {};

    return {
      price: variant.price || p.price || 0,
      mrp: variant.mrp || p.mrp || 0,
      discount: p.discount || 0,
    };
  });

  const cheapest = normalized.reduce((min, p) =>
    p.price < min.price ? p : min
  );

  return {
    price: cheapest.price,
    oldPrice: cheapest.mrp,
    off:
      cheapest.mrp && cheapest.price
        ? `${Math.round(
            ((cheapest.mrp - cheapest.price) / cheapest.mrp) * 100
          )}%`
        : "0%",
  };
};
