"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE =
  typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

export default function SimilarProductsAdvanced({ currentProduct }) {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products?limit=200`);
        const data = await res.json();
        if (data.success) setAllProducts(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ================= TOKENIZER ================= */
  const tokenize = (text = "") =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(" ")
      .filter((w) => w.length > 2);

  /* ================= SIMILAR MATCH ================= */
  const similarProducts = useMemo(() => {
    if (!currentProduct || !allProducts.length) return [];

    const currentTokens = tokenize(currentProduct.name);

    return allProducts
      .filter((p) => p._id !== currentProduct._id)
      .map((product) => {
        const productTokens = tokenize(product.name);

        const matchedWords = currentTokens.filter((w) =>
          productTokens.includes(w)
        );

        const wordScore = matchedWords.length * 3;
        const categoryBoost =
          product.category === currentProduct.category ? 5 : 0;

        const intersection = matchedWords.length;
        const union = new Set([
          ...currentTokens,
          ...productTokens,
        ]).size;

        const jaccard = union > 0 ? (intersection / union) * 10 : 0;

        return {
          ...product,
          finalScore: wordScore + categoryBoost + jaccard,
        };
      })
      .filter((p) => p.finalScore > 5)
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 12);
  }, [currentProduct, allProducts]);

  if (loading || !similarProducts.length) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 pb-20">
      <h2 className="text-xl font-semibold mb-6 tracking-wide">
        SIMILAR PRODUCTS
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6">
        {similarProducts.map((item) => {
          const firstVariant = item.variants?.[0];
          const firstSize = firstVariant?.sizes?.[0];

          const image =
            firstVariant?.images?.[0]?.url
              ? API_BASE + firstVariant.images[0].url
              : "/placeholder.jpg";

          const price = firstSize?.price || item.minPrice || 0;
          const mrp = firstSize?.mrp || item.mrp || 0;

          const discount =
            mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

          return (
            <div
              key={item._id}
              onClick={() => router.push(`/product/${item.slug}`)}
              className="cursor-pointer group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden bg-gray-50">

                {/* colorful rating badge */}
                {item.rating > 0 && (
                  <div className="absolute bottom-2 left-2 bg-white px-2 py-0.5 text-xs font-semibold rounded  shadow-sm z-10 flex items-center gap-1">
                    <span>{item.rating}</span>

                    <span
                      className={
                        item.rating >= 3
                          ? "text-green-600"
                          : "text-yellow-500"
                      }
                    >
                      ★
                    </span>
                  </div>
                )}


                <img
                  src={image}
                  alt={item.name}
                  className="w-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* DETAILS */}
              <div className="p-3">
                <h3 className="text-sm font-medium truncate text-gray-800 group-hover:text-black">
                  {item.brand || item.name}
                </h3>

                <p className="text-sm text-gray-600 truncate">
                  {item.name}
                </p>

                {/* PRICE SECTION */}
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-black">
                    Rs. {price}
                  </span>

                  {mrp > price && (
                    <>
                      <span className="text-sm line-through text-gray-400">
                        Rs. {mrp}
                      </span>

                      {discount && (
                        <span className="text-orange-500 text-sm font-semibold">
                          ({discount}% OFF)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}