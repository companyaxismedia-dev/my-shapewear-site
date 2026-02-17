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
  ShieldCheck,
  Truck,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

export default function BraPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?category=bra&limit=50`
        );
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching bras:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden text-[#ed4e7e]">
      <div className="w-full sticky top-0 z-50 bg-white border-b border-pink-50 shadow-sm">
        <Navbar />
      </div>

      <div className="px-4 py-3 border-b border-pink-100 flex justify-between items-center bg-white sticky top-[64px] z-40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Sort By:
          </span>
          <select className="text-[10px] font-bold uppercase outline-none bg-transparent cursor-pointer">
            <option>Low to High</option>
            <option>High to Low</option>
            <option>New Arrivals</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-1 text-[10px] font-bold uppercase">
            <span className="w-2 h-2 bg-[#ed4e7e] inline-block"></span> Size
          </button>
          <button className="flex items-center gap-2 text-[10px] font-bold uppercase border border-[#ed4e7e] px-3 py-1 rounded-sm">
            <Filter size={12} /> Show Filters
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        <aside className="hidden lg:block w-64 p-6 border-r border-pink-50 sticky top-[120px] h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
          <h2 className="font-bold text-[10px] mb-6 tracking-widest uppercase">
            Refine Your Selection
          </h2>
          {["Size", "Color", "Discount", "Padded", "Price Range", "Material"].map(
            (f) => (
              <div
                key={f}
                className="mb-4 flex justify-between items-center cursor-pointer border-b border-pink-50 pb-2"
              >
                <span className="text-[11px] font-bold uppercase">{f}</span>
                <ChevronDown size={14} />
              </div>
            )
          )}
        </aside>

        <main className="flex-1 p-4">
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

function ProductCard({ item, onOpenDetails }) {
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  const image =
  item.variants?.[0]?.images?.[0]
    ? `${API_BASE}${item.variants[0].images[0]}`
    : "/fallback.jpg";


  const isWishlisted = wishlist.some((p) => p.id === item._id);

  const handleWishlist = () => {
    if (!user) {
      alert("Please login to use wishlist");
      return;
    }

    isWishlisted
      ? removeFromWishlist(item._id)
      : toggleWishlist({ id: item._id, ...item });
  };

  return (
    <div className="group flex flex-col bg-white border border-pink-50 relative rounded-sm overflow-hidden shadow-sm h-full transition-all hover:shadow-md">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#fff5f8]">
        <img
          src={image}
          alt={item.name}
          onClick={onOpenDetails}
          className="cursor-pointer w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {item.discount > 0 && (
          <div className="absolute top-0 left-0 bg-[#ed4e7e] text-white text-[9px] px-2 py-0.5 font-bold z-10">
            {item.discount}% OFF
          </div>
        )}

        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-20 bg-white p-1 rounded-full shadow"
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
            ₹{item.price}
          </span>
          {item.mrp && (
            <span className="text-[10px] text-pink-200 line-through font-medium">
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

        <div className="mt-auto w-full px-1 pb-1">
          <button
            onClick={onOpenDetails}
            className="w-full bg-[#ed4e7e] text-white py-2.5 text-[12px] font-bold uppercase tracking-widest rounded-sm shadow-sm flex items-center justify-center active:scale-95 transition-all"
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductDetailsModal({ product, onClose }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [variant, setVariant] = useState(
    product.variants?.[0]
  );
  const [size, setSize] = useState("");

  const image =
    variant?.images?.[0]
      ? `${API_BASE}${variant.images[0]}`
      : product.images?.[0]
      ? `${API_BASE}${product.images[0]}`
      : "/fallback.jpg";

  const handleCartAdd = () => {
    if (!size) return alert("Select size");

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

  const handleBuyNow = () => {
    handleCartAdd();
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full"
        >
          <X size={24} />
        </button>

        <div className="md:w-1/2 bg-[#fff5f8]">
          <img
            src={image}
            className="w-full h-full object-cover"
            alt={product.name}
          />
        </div>

        <div className="md:w-1/2 p-6 space-y-6 overflow-y-auto">
          <h1 className="text-2xl font-black uppercase">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-[#ed4e7e]">
              ₹{variant?.price}
            </span>
            {product.mrp && (
              <span className="text-lg text-gray-300 line-through">
                ₹{product.mrp}
              </span>
            )}
          </div>

          <div>
            <p className="text-xs font-bold uppercase mb-2">
              Select Color
            </p>
            <div className="flex gap-2">
              {product.variants?.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setVariant(v)}
                  className="px-3 py-1 border rounded"
                >
                  {v.color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase mb-2">
              Select Size
            </p>
            <div className="flex gap-2 flex-wrap">
              {variant?.sizes?.map((s) => (
                <button
                  key={s.size}
                  onClick={() => setSize(s.size)}
                  className="px-4 py-2 border rounded"
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
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            className="w-full bg-black text-white py-3 font-bold uppercase"
          >
            <Zap size={16} className="inline mr-2" />
            Buy Now
          </button>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-xs uppercase">
              <Truck size={14} /> Fast Delivery
            </div>
            <div className="flex items-center gap-2 text-xs uppercase">
              <ShieldCheck size={14} /> 100% Original
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
