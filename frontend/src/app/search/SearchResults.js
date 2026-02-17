"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

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
    <div className="max-w-[1600px] mx-auto p-4">
      <h2 className="text-lg font-bold mb-6">
        Showing results for "{query}"
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((item) => {
          const image =
            item?.variants?.[0]?.images?.[0]
              ? `${API_BASE}${item.variants[0].images[0]}`
              : "/placeholder.jpg";

          return (
            <div
              key={item._id}
              onClick={() => router.push(`/product/${item.slug}`)} // ✅ REDIRECT FIX
              className="group cursor-pointer flex flex-col bg-white border border-pink-50 relative rounded-sm overflow-hidden shadow-sm h-full transition-all hover:shadow-md"
            >
              {/* IMAGE AREA */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#fff5f8]">
                <img
                  src={image}
                  alt={item.name}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" // ✅ HOVER EFFECT
                />

                {item.discount > 0 && (
                  <div className="absolute top-0 left-0 bg-[#ed4e7e] text-white text-[9px] px-2 py-0.5 font-bold z-10">
                    {item.discount}% OFF
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-3 flex flex-col flex-grow bg-white">
                <h3 className="text-[10px] font-bold truncate uppercase mb-1 text-[#ed4e7e]">
                  {item.name}
                </h3>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-900">
                    ₹{item.price}
                  </span>

                  {item.mrp && (
                    <span className="text-[10px] text-pink-200 line-through font-medium">
                      ₹{item.mrp}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1.5">
                  <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
                  <span className="text-[10px] font-bold">
                    {item.rating}
                  </span>
                  <span className="text-[10px] text-pink-300">
                    ({item.numReviews})
                  </span>
                </div>
              </div> 
            </div>
          );
        })}
      </div>
    </div>
  );
}
