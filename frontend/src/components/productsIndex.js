import { braProducts } from "@/app/bra/page"; 

export const getCategoryPrice = (category) => {
  let items = [];

  if (category === "bra") {
    items = braProducts;
  }

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
