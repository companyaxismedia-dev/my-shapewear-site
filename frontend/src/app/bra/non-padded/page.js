"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Heart,
  Filter,
  ChevronDown,
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

export default function NonPaddedPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?category=bra&limit=100`
        );
        const data = await res.json();

        if (data.success) {
          // ✅ STRICT FILTER: only non-padded + active
          const filtered = data.products.filter(
            (p) =>
              p.isActive === true &&
              (p.name?.toLowerCase().includes("non") ||
                p.slug?.toLowerCase().includes("non"))
          );

          setProducts(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#ed4e7e]">
      <Navbar />

      <div className="px-4 py-3 border-b flex justify-between items-center sticky top-[64px] bg-white z-40">
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Non Padded Bras
        </span>

        <button className="flex items-center gap-2 text-[10px] font-bold border border-[#ed4e7e] px-3 py-1 rounded-sm">
          <Filter size={12} /> Show Filters
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        <aside className="hidden lg:block w-64 p-6 border-r sticky top-[120px] h-[calc(100vh-120px)] overflow-y-auto">
          <h2 className="font-bold text-[10px] mb-6 uppercase tracking-widest">
            Refine Your Selection
          </h2>

          {["Size", "Color", "Discount", "Price Range", "Material"].map(
            (f) => (
              <div
                key={f}
                className="mb-4 flex justify-between items-center border-b pb-2 text-[11px] font-bold uppercase"
              >
                {f} <ChevronDown size={14} />
              </div>
            )
          )}
        </aside>

        <main className="flex-1 p-4">
          {loading ? (
            <p className="text-center">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-center font-bold">No Products Found</p>
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
        </main>
      </div>

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

/* ================= PRODUCT CARD ================= */

function ProductCard({ item, onOpenDetails }) {
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  const variant = item?.variants?.[0];

  const image =
    variant?.images?.[0]
      ? `${API_BASE}${
          typeof variant.images[0] === "string"
            ? variant.images[0]
            : variant.images[0]?.url
        }`
      : "/fallback.jpg";

  /* ✅ SAFE PRICE CALCULATION */

  const allSizes = variant?.sizes || [];

  const prices = allSizes
    .map((s) => s.price)
    .filter((p) => typeof p === "number");

  const mrps = allSizes
    .map((s) => s.mrp)
    .filter((m) => typeof m === "number");

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const mrp = mrps.length ? Math.max(...mrps) : 0;

  const discount =
    mrp > minPrice ? Math.round(((mrp - minPrice) / mrp) * 100) : 0;

  const isWishlisted = wishlist.some((p) => p.id === item._id);

  const handleWishlist = () => {
    if (!user) return alert("Please login to use wishlist");

    isWishlisted
      ? removeFromWishlist(item._id)
      : toggleWishlist({ id: item._id, ...item });
  };

  return (
    <div className="group bg-white border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative aspect-[3/4] bg-[#fff5f8] overflow-hidden">
        <img
          src={image}
          alt={item.name}
          onClick={onOpenDetails}
          className="w-full h-full object-cover object-top cursor-pointer transition-transform duration-500 group-hover:scale-105"
        />

        {discount > 0 && (
          <div className="absolute top-0 left-0 bg-[#ed4e7e] text-white text-[9px] px-2 py-0.5 font-bold">
            {discount}% OFF
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

      <div className="p-3 flex flex-col">
        <h3 className="text-[10px] font-bold uppercase truncate mb-1">
          {item.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="font-black text-gray-900">₹{minPrice}</span>

          {mrp > minPrice && (
            <span className="text-[10px] line-through text-gray-400">
              ₹{mrp}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1">
          <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[10px] font-bold">
            {item.rating || 0}
          </span>
          <span className="text-[10px] text-gray-400">
            ({item.numReviews || 0})
          </span>
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

  const [variant, setVariant] = useState(product?.variants?.[0]);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden flex flex-col md:flex-row">
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
            onClick={() => router.push(`/product/${product.slug}`)}
            className="w-full border border-[#ed4e7e] text-[#ed4e7e] py-3 font-bold uppercase"
          >
            Show More Details <ChevronsDown />
          </button>
        </div>
      </div>
    </div>
  );
}
