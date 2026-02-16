// import { braProducts } from "@/app/bra/page";
import { curvyProduct } from "@/app/curvy/page";
import { lingierieProducts } from "@/app/lingerie/page";
import { pantyProducts } from "@/app/panties/page";
import { shapeProducts } from "@/app/shapewear/page";
import { tummyProduct } from "@/app/tummy-control/page";


const API_BASE =
  typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";


export const getCategoryProducts = async (category) => {
  try {
    if (category === "bra") {
      const res = await fetch(`${API_BASE}/api/products?category=bra&limit=20`);
      const data = await res.json();
      return data.success ? data.products : [];
    }
    if (category === "panty") return pantyProducts;
    if (category === "lingerie") return lingierieProducts;
    if (category === "curvy") return curvyProduct;
    if (category === "shapewear") return shapeProducts;
    if (category === "tummy-control") return tummyProduct;
    return [];

  } catch (error) {
    console.error("Category fetch error:", error);
    return [];

  }
};

export const getCategoryPrice = async (category) => {
  const items = await getCategoryProducts(category);

  if (!items || !items.length)
    return { price: 0, oldPrice: 0, off: "0%" };

  const cheapest = items.reduce((min, p) =>
    p.price < min.price ? p : min
  );

  return {
    price: cheapest.price,
    oldPrice: cheapest.mrp || cheapest.oldPrice || 0,
    off: cheapest.discount
      ? `${cheapest.discount}%`
      : "0%",
  };
};
