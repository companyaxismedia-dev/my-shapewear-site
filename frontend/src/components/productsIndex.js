import { braProducts } from "@/app/bra/page";
import { curvyProduct } from "@/app/curvy/page";
import { lingierieProducts } from "@/app/lingerie/page";
import { pantyProducts } from "@/app/panties/page";
import { shapeProducts } from "@/app/shapewear/page";
import { tummyProduct } from "@/app/tummy-control/page";


export const getCategoryProducts = (category) => {
  if (category === "bra") return braProducts;
  if (category === "panty") return pantyProducts;
  if (category === "lingerie") return lingierieProducts;
  if (category === "curvy") return curvyProduct;
  if (category === "shapewear") return shapeProducts;
  if (category === "tummy-control") return tummyProduct;
  return [];
};

export const getCategoryPrice = (category) => {
  const items = getCategoryProducts(category);

  if (!items.length) return { price: 0, oldPrice: 0, off: "0%" };

  const cheapest = items.reduce((min, p) =>
    p.price < min.price ? p : min
  );

  return {
    price: cheapest.price,
    oldPrice: cheapest.oldPrice,
    off: cheapest.discount,
  };
};
