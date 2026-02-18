"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Heart,
  Filter,
  Star,
  X,
  ShoppingCart,
  Zap,
  ChevronsDown,
} from "lucide-react";

/* ================= API BASE ================= */

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

/* ================= PAGE ================= */

export default function CurvyPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?category=curvy&limit=50`
        );
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error("Curvy fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-[#ed4e7e] overflow-x-hidden">
      <Navbar />

      {/* TOP FILTER BAR (LIKE BRA) */}
      <div className="px-4 py-3 border-b flex justify-between items-center bg-white sticky top-[64px] z-40">
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Curvy Collection
        </span>

        <button className="flex items-center gap-2 text-[10px] font-bold border border-[#ed4e7e] px-3 py-1 rounded-sm">
          <Filter size={12} /> Show Filters
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 bg-[#fffcfd]">
        {loading ? (
          <p className="text-center">Loading products...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((item) => (
              <ProductCard
                key={item._id}
                item={item}
                onOpenDetails={() => setSelectedProduct(item)}
              />
            ))}
          </div>
        )}
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
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  const image =
    item?.variants?.[0]?.images?.[0]
      ? `${API_BASE}${
          typeof item.variants[0].images[0] === "string"
            ? item.variants[0].images[0]
            : item.variants[0].images[0]?.url
        }`
      : "/fallback.jpg";

  const isWishlisted = wishlist.some((p) => p.id === item._id);

  const handleWishlist = () => {
    if (!user) return alert("Please login to use wishlist");

    isWishlisted
      ? removeFromWishlist(item._id)
      : toggleWishlist({ id: item._id, ...item });
  };

  return (
    <div className="group flex flex-col bg-white border border-pink-50 relative rounded-sm overflow-hidden shadow-sm h-full hover:shadow-md transition">

      <div className="relative aspect-[3/4] overflow-hidden bg-[#fff5f8]">
        <img
          src={image}
          alt={item.name}
          onClick={onOpenDetails}
          className="cursor-pointer w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {item.discount > 0 && (
          <div className="absolute top-0 left-0 bg-[#ed4e7e] text-white text-[9px] px-2 py-0.5 font-bold">
            {item.discount}% OFF
          </div>
        )}

        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow"
        >
          <Heart
            size={18}
            fill={isWishlisted ? "#ed4e7e" : "none"}
            stroke="#ed4e7e"
          />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-grow bg-white">
        <h3 className="text-[10px] font-bold truncate uppercase mb-1">
          {item.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-gray-900">
            ₹{item.minPrice}
          </span>

          {item.mrp > item.minPrice && (
            <span className="text-[10px] text-gray-600 line-through">
              ₹{item.mrp}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1.5 mb-3">
          <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[10px] font-bold">
            {item.rating}
          </span>
          <span className="text-[10px] text-pink-300">
            ({item.numReviews})
          </span>
        </div>

        <button
          onClick={onOpenDetails}
          className="mt-auto w-full bg-[#ed4e7e] text-white py-2.5 text-[12px] font-bold uppercase"
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

  const [variant, setVariant] = useState(product.variants?.[0]);
  const [size, setSize] = useState("");

  const image =
    variant?.images?.[0]
      ? `${API_BASE}${
          typeof variant.images[0] === "string"
            ? variant.images[0]
            : variant.images[0]?.url
        }`
      : "/fallback.jpg";

  const selectedSizeObj =
    variant?.sizes?.find((s) => s.size === size) ||
    variant?.sizes?.[0];

  const handleCartAdd = () => {
    if (!size) return alert("Select size");

    addToCart({
      id: product._id,
      name: product.name,
      price: selectedSizeObj?.price,
      image,
      size,
      quantity: 1,
    });

    alert("Added to cart");
  };

  const handleBuyNow = () => {
    handleCartAdd();
    router.push("/cart");
  };

  const handleShowMore = () => {
    router.push(`/product/${product.slug}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white p-2 rounded-full"
        >
          <X size={22} />
        </button>

        <div className="md:w-1/2 bg-[#fff5f8]">
          <img src={image} className="w-full h-full object-cover" />
        </div>

        <div className="md:w-1/2 p-6 space-y-6 overflow-y-auto">
          <h1 className="text-2xl font-black uppercase">
            {product.name}
          </h1>

          <div className="flex items-center gap-2">
            <Star size={16} className="fill-[#ed4e7e] text-[#ed4e7e]" />
            <span className="font-bold">{product.rating}</span>
            <span className="text-gray-500 text-sm">
              ({product.numReviews} Reviews)
            </span>
          </div>

          <div className="flex gap-3">
            <span className="text-3xl font-black text-[#ed4e7e]">
              ₹{selectedSizeObj?.price}
            </span>
            {selectedSizeObj?.mrp > selectedSizeObj?.price && (
              <span className="line-through text-gray-400">
                ₹{selectedSizeObj?.mrp}
              </span>
            )}
          </div>

          {/* COLOR */}
          <div>
            <p className="text-xs font-bold uppercase mb-2">
              Select Color
            </p>
            <div className="flex gap-2">
              {product.variants?.map((v, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setVariant(v);
                    setSize("");
                  }}
                  className="px-3 py-1 border rounded"
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
              {variant?.sizes?.map((s) => (
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

          <button
            onClick={handleBuyNow}
            className="w-full bg-black text-white py-3 font-bold uppercase"
          >
            <Zap size={16} className="inline mr-2" />
            Buy Now
          </button>

          <button
            onClick={handleShowMore}
            className="w-full border border-[#ed4e7e] text-[#ed4e7e] py-3 font-bold uppercase"
          >
            Show More Details
          </button>
        </div>
      </div>
    </div>
  );
}
