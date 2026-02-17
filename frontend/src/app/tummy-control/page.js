"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import {
  Heart,
  Filter,
  ChevronDown,
  Star,
  Eye,
  X,
  ShieldCheck,
  Truck,
  ShoppingCart,
  Zap,
} from "lucide-react";

/* ================= API BASE ================= */

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

export default function TummyControlPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);

  /* ================= FETCH FROM BACKEND ================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?category=shapewear&limit=50`
        );
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Tummy Control fetch error:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden text-[#ed4e7e]">
      <div className="w-full sticky top-0 z-50 bg-white border-b border-pink-50 shadow-sm">
        <Navbar />
      </div>

      <div className="bg-pink-50 py-6 text-center border-b border-pink-100">
        <h1 className="text-2xl font-bold text-[#ed4e7e] uppercase tracking-widest">
          Tummy Control Collection
        </h1>
        <p className="text-[11px] text-[#ed4e7e] mt-1 italic opacity-80">
          Seamless compression for a perfect silhouette
        </p>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        <main className="flex-1 p-4 bg-[#fffcfd]">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpenDetails={() => setSelectedProduct(product)}
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

function ProductCard({ product, onOpenDetails }) {
  const variant = product?.variants?.[0] || {};
  const imagePath = variant?.images?.[0];

  const image = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `${API_BASE}${imagePath}`
    : "/placeholder.jpg";

  const price = variant?.price || product.price || 0;
  const oldPrice = variant?.mrp || product.mrp || null;

  const discount =
    oldPrice && price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const sizes = variant?.sizes?.map((s) => s.size) || [];

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-gray-50 cursor-pointer"
        onClick={onOpenDetails}
      >
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-110"
        />

        {discount && (
          <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-[11px] font-bold text-gray-700 truncate uppercase mb-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-black text-gray-900">
            ₹{price}
          </span>

          {oldPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{oldPrice}
            </span>
          )}
        </div>

        <button
          onClick={onOpenDetails}
          className="mt-auto w-full bg-[#ed4e7e] text-white py-2.5 text-[12px] font-bold uppercase tracking-widest rounded-sm active:scale-95 transition"
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

  const variant = product?.variants?.[0] || {};
  const imagePath = variant?.images?.[0];

  const image = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `${API_BASE}${imagePath}`
    : "/placeholder.jpg";

  const sizes = variant?.sizes?.map((s) => s.size) || [];
  const [size, setSize] = useState("");

  const handleCartAdd = () => {
    if (!size) return alert("Please select size");
    addToCart(product, size);
    onClose();
  };

  const handleBuyNow = () => {
    if (!size) return alert("Please select size");
    addToCart(product, size);
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full"
        >
          <X size={22} />
        </button>

        <div className="md:w-1/2 bg-[#fff5f8]">
          <img src={image} className="w-full h-full object-cover" />
        </div>

        <div className="md:w-1/2 p-6 space-y-6">
          <h1 className="text-2xl font-black uppercase">
            {product.name}
          </h1>

          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-4 py-2 border rounded ${
                  size === s
                    ? "bg-[#ed4e7e] text-white"
                    : "border-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleCartAdd}
            className="w-full bg-[#ed4e7e] text-white py-3 font-bold rounded"
          >
            ADD TO CART
          </button>

          <button
            onClick={handleBuyNow}
            className="w-full bg-black text-white py-3 font-bold rounded"
          >
            BUY NOW
          </button>
        </div>
      </div>
    </div>
  );
}
