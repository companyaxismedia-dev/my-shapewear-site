"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!query) return;

    const fetchProducts = async () => {
      const res = await fetch(
        `${API_BASE}/api/products?keyword=${query}&limit=20`
      );

      const data = await res.json();

      if (data.success) {
        setProducts(data.products);
      }
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <FilterBar />

      <div className="max-w-[1600px] mx-auto p-4">
        <h2 className="text-lg font-bold mb-6">
          Showing results for "{query}"
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-pink-50 rounded-sm shadow-sm"
            >
              <img
                src={item.images?.[0] || "/placeholder.jpg"}
                alt={item.name}
                className="w-full aspect-[3/4] object-cover"
              />

              <div className="p-3">
                <h3 className="text-[10px] font-bold uppercase text-[#ed4e7e]">
                  {item.name}
                </h3>

                <div className="flex gap-2 mt-2">
                  <span className="font-bold text-black">
                    ₹{item.price}
                  </span>
                  {item.mrp && (
                    <span className="line-through text-gray-400 text-sm">
                      ₹{item.mrp}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
