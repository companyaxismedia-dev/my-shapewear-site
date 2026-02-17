"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import {
  Heart, Filter, ChevronDown, Star, Eye, X,
  ShieldCheck, Truck, ShoppingCart, Zap
} from "lucide-react";

/* ================= PRODUCT DATA ================= */

const generateCurvyProducts = () =>
  Array.from({ length: 42 }, (_, i) => {
    const num = i + 1;
    const price = 799 + (i * 15);
    const mrp = price + 1000;

    return {
      id: `curvy-${num}`,
      name: `Glovia Curve Supreme Support Bra ${num}`,
      price,
      oldPrice: mrp,
      img: `/image/curvy/curvy-${num}.jpg`,
      discount: Math.round(((mrp - price) / mrp) * 100),
      rating: (4.4 + (i % 5) * 0.1).toFixed(1),
      reviews: 120 + (i * 3),
      offer: "3 FOR 1499",
      sizes: ["34C", "36D", "38C", "40D", "42DD"],
      colors: [
        { name: "Pink", code: "#ffc0cb" },
        { name: "Black", code: "#000000" },
        { name: "Nude", code: "#e3bc9a" }
      ]
    };
  });

/* ================= PAGE ================= */

export default function CurvyPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = useMemo(() => generateCurvyProducts(), []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden text-[#ed4e7e]">
      <Navbar />

      {/* Banner */}
      <div className="bg-pink-50 py-6 text-center border-b border-pink-100">
        <h1 className="text-2xl font-bold uppercase tracking-widest">
          Curvy Collection
        </h1>
        <p className="text-[11px] italic opacity-80">
          Luxury support crafted for fuller silhouettes
        </p>
      </div>

      {/* Filter Header */}
      <div className="px-4 py-3 border-b flex justify-between items-center sticky top-[64px] bg-white z-40">
        <span className="text-[10px] font-bold uppercase">
          42 Products
        </span>
        <button className="flex items-center gap-2 text-[10px] font-bold border px-3 py-1 rounded-sm">
          <Filter size={12} /> Filters
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        <main className="flex-1 p-4 bg-[#fffcfd]">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onOpenDetails={() => setSelectedProduct(item)}
              />
            ))}
          </div>
        </main>
      </div>

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Footer />
    </div>
  );
}

/* ================= PRODUCT CARD ================= */

function ProductCard({ item, onOpenDetails }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="group bg-white border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition">

      <div className="relative aspect-[3/4] bg-[#fff5f8] overflow-hidden">
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition"
        />

        <div className="absolute top-0 left-0 bg-[#ed4e7e] text-white text-[9px] px-2 py-0.5 font-bold">
          {item.discount}% OFF
        </div>

        <div className="absolute bottom-0 right-0 bg-[#AD1457] text-white text-[9px] px-2 py-1 font-bold italic">
          {item.offer}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <div
            onClick={onOpenDetails}
            className="bg-white p-2 rounded-full shadow-md cursor-pointer"
          >
            <Eye size={18} />
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col">
        <h3 className="text-[11px] font-bold uppercase truncate mb-1">
          {item.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="font-black text-gray-900">₹{item.price}</span>
          <span className="text-[10px] line-through text-gray-400">
            ₹{item.oldPrice}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-1">
          <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[10px] font-bold">{item.rating}</span>
          <span className="text-[10px] text-gray-400">
            ({item.reviews})
          </span>
        </div>

        <button
          onClick={onOpenDetails}
          className="mt-3 w-full bg-[#ed4e7e] text-white py-2 text-xs font-bold uppercase rounded-sm"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}

/* ================= MODAL ================= */

function ProductDetailsModal({ product, onClose }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [size, setSize] = useState("");
  const [color, setColor] = useState(product.colors[0]);

  const handleCartAdd = () => {
    if (!size) return alert("Please select size");

    addToCart({
      ...product,
      selectedSize: size,
      selectedColor: color.name,
      quantity: 1
    });

    onClose();
  };

  const handleBuyNow = () => {
    handleCartAdd();
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-4xl w-full rounded-xl overflow-hidden flex flex-col md:flex-row relative">

        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={20} />
        </button>

        <div className="md:w-1/2">
          <img
            src={product.img}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="md:w-1/2 p-6 space-y-6">
          <h1 className="text-xl font-black uppercase">
            {product.name}
          </h1>

          <div className="flex gap-3">
            <span className="text-2xl font-black text-[#ed4e7e]">
              ₹{product.price}
            </span>
            <span className="line-through text-gray-400">
              ₹{product.oldPrice}
            </span>
          </div>

          {/* Color */}
          <div>
            <p className="text-xs font-bold uppercase mb-2">
              Select Color
            </p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color.name === c.name
                      ? "border-[#ed4e7e]"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c.code }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <p className="text-xs font-bold uppercase mb-2">
              Select Size
            </p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-4 py-2 border rounded ${
                    size === s
                      ? "bg-[#ed4e7e] text-white"
                      : ""
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCartAdd}
            className="w-full bg-[#ed4e7e] text-white py-3 font-bold uppercase"
          >
            <ShoppingCart size={16} className="inline mr-2" />
            Add To Cart
          </button>

          <button
            onClick={handleBuyNow}
            className="w-full border border-[#ed4e7e] text-[#ed4e7e] py-3 font-bold uppercase"
          >
            <Zap size={16} className="inline mr-2" />
            Buy Now
          </button>

          <div className="flex justify-between text-[10px] font-bold uppercase pt-4 border-t">
            <span className="flex items-center gap-1">
              <Truck size={14} /> Fast Delivery
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} /> Premium Quality
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
