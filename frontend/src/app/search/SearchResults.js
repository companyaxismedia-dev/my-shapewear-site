"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter(); // ✅ ADDED ROUTER

  const query = searchParams.get("q");

  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?keyword=${query}&limit=20`
        );

        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
      }
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="section-padding" style={{ background: "var(--color-bg)" }}>
      <div className="container-imkaa">
        <div className="section-heading-block" style={{ marginBottom: 32 }}>
          <h1 className="heading-section" style={{ textAlign: "left", fontSize: "clamp(24px, 2.6vw, 34px)" }}>
            Search results
          </h1>
          <p className="text-body" style={{ fontSize: 15, color: "var(--color-muted)" }}>
            Showing results for “{query}”
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((item) => {
          const image =
            item?.variants?.[0]?.images?.[0]
              ? `${API_BASE}${item.variants[0].images[0]}`
              : "/placeholder.jpg";

          return (
            <div
              key={item._id}
              onClick={() => router.push(`/product/${item.slug}`)} // ✅ REDIRECT FIX
              className="product-card-imkaa cursor-pointer"
            >
              {/* IMAGE AREA */}
              <div className="relative aspect-[3/4] overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
                <img
                  src={image}
                  alt={item.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                />

                {item.discount > 0 && (
                  <div
                    className="absolute top-2 left-2 text-[10px] px-2 py-0.5 font-semibold z-10"
                    style={{
                      background: "var(--color-primary)",
                      color: "#FFF9FA",
                      borderRadius: 9999,
                      boxShadow: "0 6px 18px rgba(74,46,53,0.12)",
                    }}
                  >
                    {item.discount}% OFF
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-4 flex flex-col flex-grow" style={{ background: "var(--color-card)" }}>
                <h3 className="product-card-title mb-1 truncate">{item.name}</h3>

                <div className="flex items-center gap-2">
                  <span className="product-card-price">₹{item.price}</span>

                  {item.mrp && (
                    <span className="product-card-meta line-through">
                      ₹{item.mrp}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1.5">
                  <Star size={12} className="fill-[#C56F7F] text-[#C56F7F]" />
                  <span className="text-muted-sm" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)" }}>
                    {item.rating}
                  </span>
                  <span className="product-card-meta">({item.numReviews})</span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
