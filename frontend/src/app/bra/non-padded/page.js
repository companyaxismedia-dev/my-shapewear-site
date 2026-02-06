"use client";

import { useState } from "react";
import Image from "next/image";
import { allProducts } from "@/data/products";

export default function NonPaddedPage() {
  const products = allProducts.filter(
    (p) => p.category === "non-padded"
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* PAGE TITLE */}
      <h1 className="text-3xl font-bold mb-10">
        Non-Padded Bras
      </h1>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- PRODUCT CARD ---------------- */

function ProductCard({ product }) {
  const [activeImage, setActiveImage] = useState(
    product.variants[0].images[0]
  );

  // ✅ price string → number
  const prices = product.variants.map((v) =>
    Number(v.price.replace(/,/g, ""))
  );
  const startingPrice = Math.min(...prices);

  return (
    <div className="bg-white border rounded-2xl p-4 hover:shadow-xl transition">
      
      {/* MAIN IMAGE */}
      <div className="relative w-full aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden mb-4">
        <Image
          src={activeImage}
          alt={product.name}
          fill
          className="object-contain"
          sizes="(max-width:768px) 100vw, 33vw"
        />
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 mb-3">
        {product.variants[0].images.map((img, i) => (
          <button
            key={i}
            onMouseEnter={() => setActiveImage(img)}
            className={`w-12 h-12 relative border rounded-md overflow-hidden
              ${activeImage === img ? "border-pink-600" : "border-gray-300"}
            `}
          >
            <Image
              src={img}
              alt="thumb"
              fill
              className="object-contain"
            />
          </button>
        ))}
      </div>

      {/* PRODUCT NAME */}
      <h3 className="text-sm font-semibold leading-snug mb-2">
        {product.name}
      </h3>

      {/* PRICE */}
      <p className="text-pink-600 font-bold text-lg">
        Starting from ₹{startingPrice.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
