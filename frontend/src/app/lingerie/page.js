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

/* ================= PAGE ================= */

export default function LingeriePage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLingerie = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?category=lingerie`
        );
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Lingerie fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLingerie();
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#ed4e7e]">
      <Navbar />

      {/* HEADER */}
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <span className="text-[12px] font-bold uppercase">
          Lingerie Collection
        </span>
        <button className="flex items-center gap-2 text-[10px] font-bold border px-3 py-1 rounded-sm">
          <Filter size={12} /> Filters
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        <aside className="hidden lg:block w-64 p-6 border-r">
          <h2 className="font-bold text-[10px] uppercase mb-4">
            Refine Your Selection
          </h2>

          {["Size", "Color", "Price", "Collection"].map((f) => (
            <div
              key={f}
              className="flex justify-between items-center border-b py-2 text-[11px] font-bold uppercase"
            >
              {f} <ChevronDown size={14} />
            </div>
          ))}
        </aside>

        <main className="flex-1 p-4">
          {loading ? (
            <p>Loading lingerie...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item) => (
                <ProductCard
                  key={item._id}
                  product={item}
                  onOpenDetails={() => setSelectedProduct(item)}
                />
              ))}
            </div>
          )}
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
  const image =
    product.variants?.[0]?.images?.[0]
      ? `${API_BASE}${product.variants[0].images[0]}`
      : "/placeholder.jpg";

  const price = product.variants?.[0]?.price || 0;
  const mrp = product.variants?.[0]?.mrp || null;

  const discount =
    mrp && price
      ? Math.round(((mrp - price) / mrp) * 100)
      : null;

  return (
    <div className="group border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition">
      <div
        className="relative aspect-[3/4] bg-[#fff5f8] cursor-pointer"
        onClick={onOpenDetails}
      >
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        {discount && (
          <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-[9px] px-2 py-1 font-bold">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-[11px] font-bold uppercase truncate">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-black text-black">
            ₹{price}
          </span>
          {mrp && (
            <span className="text-[10px] line-through text-gray-400">
              ₹{mrp}
            </span>
          )}
        </div>

        <button
          onClick={onOpenDetails}
          className="mt-3 w-full bg-[#ed4e7e] text-white py-2 text-xs font-bold uppercase"
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

  const [variant, setVariant] = useState(product.variants[0]);
  const [size, setSize] = useState("");

  const image =
    variant?.images?.[0]
      ? `${API_BASE}${variant.images[0]}`
      : "/placeholder.jpg";

  const handleCartAdd = () => {
    if (!size) return alert("Please select size");

    addToCart({
      id: product._id,
      name: product.name,
      price: variant.price,
      image,
      size,
      quantity: 1,
    });

    alert("Added to cart");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <div className="bg-white max-w-4xl w-full rounded-xl overflow-hidden flex flex-col md:flex-row relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={20} />
        </button>

        <div className="md:w-1/2">
          <img src={image} className="w-full h-full object-cover" />
        </div>

        <div className="md:w-1/2 p-6 space-y-6">
          <h1 className="text-xl font-black uppercase">
            {product.name}
          </h1>

          <div className="flex gap-3">
            <span className="text-2xl font-black text-[#ed4e7e]">
              ₹{variant.price}
            </span>
            {variant.mrp && (
              <span className="line-through text-gray-400">
                ₹{variant.mrp}
              </span>
            )}
          </div>

          {/* COLOR */}
          <div>
            <p className="text-xs font-bold uppercase mb-2">
              Select Color
            </p>
            <div className="flex gap-2">
              {product.variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setVariant(v)}
                  className="px-3 py-1 border rounded text-xs"
                >
                  {v.color}
                </button>
              ))}
            </div>
          </div>

          {/* SIZE */}
          <div>
            <p className="text-xs font-bold uppercase mb-2">
              Select Size
            </p>
            <div className="flex gap-2 flex-wrap">
              {variant.sizes.map((s) => (
                <button
                  key={s.size}
                  onClick={() => setSize(s.size)}
                  className={`px-4 py-2 border rounded ${
                    size === s.size
                      ? "bg-[#ed4e7e] text-white"
                      : ""
                  }`}
                >
                  {s.size}
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
        </div>
      </div>
    </div>
  );
}
