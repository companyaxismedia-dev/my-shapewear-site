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
  Zap,
  ChevronsDown,
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

export default function PaddedPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?category=bra&subCategory=padded&limit=50`
        );
        const data = await res.json();

        if (data.success) {
          const activeProducts = data.products.filter(
            (p) => p.isActive === true
          );
          setProducts(activeProducts);
        }
      } catch (error) {
        console.error("Error fetching padded bras:", error);
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
          Padded Bras Collection
        </span>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
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

  const imageObj =
    variant?.images?.find((img) => img.isPrimary) ||
    variant?.images?.[0];

  const image = imageObj
    ? `${API_BASE}${imageObj.url || imageObj}`
    : "/fallback.jpg";

  const minPrice = item?.minPrice || 0;
  const mrp = item?.mrp || 0;
  const discount =
    mrp > minPrice ? Math.round(((mrp - minPrice) / mrp) * 100) : 0;

  const isWishlisted = wishlist.some((p) => p.id === item._id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) return alert("Please login");

    isWishlisted
      ? removeFromWishlist(item._id)
      : toggleWishlist({ id: item._id, ...item });
  };

  return (
    <div
      className="border rounded-sm overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={onOpenDetails}
    >
      <div className="relative aspect-[3/4] bg-[#fff5f8]">
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
          onClick={handleWishlist}
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

        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[11px] font-bold text-black">
            {item.rating || 0}
          </span>
          <span className="text-[10px] text-gray-400">
            ({item.numReviews || 0})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-black text-black">
            ₹{minPrice}
          </span>
          {mrp > minPrice && (
            <span className="text-[10px] line-through text-gray-400">
              ₹{mrp}
            </span>
          )}
        </div>

        <button className="mt-3 w-full bg-[#ed4e7e] text-white py-2 text-xs font-bold uppercase">
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

  const imageObj =
    variant?.images?.find((img) => img.isPrimary) ||
    variant?.images?.[0];

  const image = imageObj
    ? `${API_BASE}${imageObj.url || imageObj}`
    : "/fallback.jpg";

  const selectedSizeObj =
    variant?.sizes?.find((s) => s.size === size);

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

          <div className="text-2xl font-black text-[#ed4e7e]">
            ₹{selectedSizeObj?.price || product.minPrice}
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
