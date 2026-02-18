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
  X,
  ShoppingCart,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

/* ================= API BASE ================= */

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

/* ================= PAGE ================= */

export default function PantyPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?category=panties&limit=50`
        );
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (error) {
        console.error("Error fetching panties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#ed4e7e]">
      <Navbar />

      <div className="px-4 py-3 border-b flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Panties Collection
        </span>
        <button className="flex items-center gap-2 text-[10px] font-bold border px-3 py-1 rounded-sm">
          <Filter size={12} /> Filters
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        <aside className="hidden lg:block w-64 p-6 border-r">
          <h2 className="font-bold text-[10px] uppercase mb-6">
            Refine Your Selection
          </h2>
          {["Size", "Color", "Discount", "Price Range"].map((f) => (
            <div
              key={f}
              className="mb-4 flex justify-between items-center border-b pb-2 text-[11px] font-bold uppercase"
            >
              {f} <ChevronDown size={14} />
            </div>
          ))}
        </aside>

        <main className="flex-1 p-4">
          {loading ? (
            <p className="text-center">Loading products...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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

      <Footer />
    </div>
  );
}

/* ================= PRODUCT CARD ================= */

function ProductCard({ item, onOpenDetails }) {
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  const variant = item?.variants?.[0];
  const imageObj = variant?.images?.[0];

  const image = imageObj
    ? `${API_BASE}${typeof imageObj === "string" ? imageObj : imageObj.url}`
    : "/fallback.jpg";

  const firstSize = variant?.sizes?.[0];
  const price = firstSize?.price || 0;
  const mrp = firstSize?.mrp || 0;

  const discount =
    mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const rating = item?.rating || 0;
  const reviews = item?.numReviews || 0;

  const isWishlisted = wishlist.some((p) => p.id === item._id);

  const handleWishlist = () => {
    if (!user) return alert("Please login to use wishlist");
    isWishlisted
      ? removeFromWishlist(item._id)
      : toggleWishlist({ id: item._id, ...item });
  };

  return (
    <div className="group border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition">
      <div
        className="relative aspect-[3/4] bg-[#fff5f8] cursor-pointer"
        onClick={onOpenDetails}
      >
        <img
          src={image}
          alt={item.name}
          className="w-full h-full object-cover"
        />

        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-[9px] px-2 py-1 font-bold">
            {discount}% OFF
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWishlist();
          }}
          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow"
        >
          <Heart
            size={16}
            fill={isWishlisted ? "#ed4e7e" : "none"}
            stroke="#ed4e7e"
          />
        </button>
      </div>

      <div className="p-3">
        <h3 className="text-[11px] font-bold uppercase truncate">
          {item.name}
        </h3>

        {/* ⭐ RATING SECTION */}
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[11px] font-bold text-black">
            {rating}
          </span>
          <span className="text-[10px] text-gray-400">
            ({reviews})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-black text-black">₹{price}</span>
          {mrp > price && (
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

  const [variant, setVariant] = useState(product?.variants?.[0]);
  const [size, setSize] = useState("");

  const imageObj = variant?.images?.[0];

  const image = imageObj
    ? `${API_BASE}${typeof imageObj === "string" ? imageObj : imageObj.url}`
    : "/fallback.jpg";

  const selectedSizeObj = variant?.sizes?.find((s) => s.size === size);

  const rating = product?.rating || 0;
  const reviews = product?.numReviews || 0;

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

          {/* ⭐ MODAL RATING */}
          <div className="flex items-center gap-2">
            <Star size={16} className="fill-[#ed4e7e] text-[#ed4e7e]" />
            <span className="font-bold">{rating}</span>
            <span className="text-gray-500 text-sm">
              ({reviews} Reviews)
            </span>
          </div>

          <div className="text-2xl font-black text-[#ed4e7e]">
            ₹{selectedSizeObj?.price || variant?.sizes?.[0]?.price}
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
        </div>
      </div>
    </div>
  );
}
