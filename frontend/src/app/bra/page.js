"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import {
  Heart,
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
          setProducts(data.products.filter((p) => p.isActive));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#ed4e7e]">
      <Navbar />

      <div className="px-4 py-3 border-b sticky top-[64px] bg-white z-40">
        <span className="text-[10px] font-bold uppercase tracking-widest">
          Bras Collection
        </span>
      </div>

      <div className="max-w-[1600px] mx-auto p-4">
        {loading ? (
          <p className="text-center">Loading...</p>
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
  const primaryImage =
    variant?.images?.find((img) => img.isPrimary) ||
    variant?.images?.[0];

  const image = primaryImage
    ? `${API_BASE}${primaryImage.url}`
    : "/fallback.jpg";

  const discount =
    item.mrp > item.minPrice
      ? Math.round(((item.mrp - item.minPrice) / item.mrp) * 100)
      : 0;

  const isWishlisted = wishlist.some((p) => p.id === item._id);

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) return alert("Login required");
    isWishlisted
      ? removeFromWishlist(item._id)
      : toggleWishlist({ id: item._id, ...item });
  };

  return (
    <div
      onClick={onOpenDetails}
      className="border rounded-sm shadow-sm hover:shadow-md cursor-pointer"
    >
      <div className="relative aspect-[3/4] bg-[#fff5f8]">
        <img
          src={image}
          alt={item.name}
          className="w-full h-full object-cover"
        />

        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-xs px-2 py-1 font-bold">
            {discount}% OFF
          </div>
        )}

        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 bg-white p-1 rounded-full"
        >
          <Heart
            size={16}
            fill={isWishlisted ? "#ed4e7e" : "none"}
            stroke="#ed4e7e"
          />
        </button>
      </div>

      <div className="p-3">
        <h3 className="text-xs font-bold uppercase truncate">
          {item.name}
        </h3>

        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="fill-[#ed4e7e]" />
          <span className="text-xs text-black font-bold">
            {item.rating}
          </span>
          <span className="text-xs text-gray-400">
            ({item.numReviews})
          </span>
        </div>

        <div className="flex gap-2 mt-1">
          <span className="font-black text-black">
            ₹{item.minPrice}
          </span>
          {item.mrp > item.minPrice && (
            <span className="text-xs line-through text-gray-400">
              ₹{item.mrp}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= MODAL ================= */

export function ProductDetailsModal({ product, onClose }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const [variant, setVariant] = useState(product?.variants?.[0]);
  const [size, setSize] = useState("");
  const [activeImage, setActiveImage] = useState(
    variant?.images?.[0]
  );
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    setActiveImage(
      variant?.images?.find((img) => img.isPrimary) ||
        variant?.images?.[0]
    );
  }, [variant]);

  const selectedSizeObj = variant?.sizes?.find(
    (s) => s.size === size
  );

  const handleCartAdd = () => {
    if (!size) return alert("Select size");
    if (selectedSizeObj?.stock === 0)
      return alert("Out of stock");

    addToCart({
      id: product._id,
      name: product.name,
      price: selectedSizeObj.price,
      image: `${API_BASE}${activeImage.url}`,
      size,
      quantity: 1,
    });

    alert("Added to cart");
  };

  const checkDelivery = () => {
    const available = product.serviceablePincodes?.find(
      (p) => p.pincode === pincode
    );
    if (available)
      alert(
        `Delivery in ${available.estimatedDays} days ${
          available.codAvailable ? "(COD Available)" : ""
        }`
      );
    else alert("Not serviceable");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-5xl w-full rounded-xl flex flex-col md:flex-row overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X size={22} />
        </button>

        {/* IMAGE SECTION */}
        <div className="md:w-1/2 p-4">
          <img
            src={`${API_BASE}${activeImage?.url}`}
            className="w-full h-[400px] object-cover rounded"
          />

          <div className="flex gap-2 mt-3">
            {variant?.images?.map((img, i) => (
              <img
                key={i}
                src={`${API_BASE}${img.url}`}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 object-cover cursor-pointer border ${
                  activeImage?.url === img.url
                    ? "border-[#ed4e7e]"
                    : ""
                }`}
              />
            ))}
          </div>
        </div>

        {/* DETAILS */}
        <div className="md:w-1/2 p-6 space-y-5 overflow-y-auto">
          <h1 className="text-xl font-black uppercase">
            {product.name}
          </h1>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#ed4e7e]">
              ₹{selectedSizeObj?.price || product.minPrice}
            </span>
            {product.mrp > product.minPrice && (
              <span className="line-through text-gray-400">
                ₹{product.mrp}
              </span>
            )}
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
                  disabled={s.stock === 0}
                  onClick={() => setSize(s.size)}
                  className={`px-4 py-2 border rounded text-sm ${
                    size === s.size
                      ? "bg-[#ed4e7e] text-white"
                      : ""
                  } ${
                    s.stock === 0
                      ? "opacity-40 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          {/* OFFERS */}
          {product.offers?.length > 0 && (
            <div className="bg-pink-50 p-3 rounded text-xs">
              <p className="font-bold mb-1">Available Offers:</p>
              {product.offers.map((o, i) => (
                <p key={i}>
                  {o.title} — Code: {o.code}
                </p>
              ))}
            </div>
          )}

          {/* PINCODE */}
          <div>
            <p className="text-xs font-bold uppercase mb-1">
              Check Delivery
            </p>
            <div className="flex gap-2">
              <input
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value)
                }
                placeholder="Enter Pincode"
                className="border px-2 py-1 text-sm"
              />
              <button
                onClick={checkDelivery}
                className="bg-black text-white px-3 text-sm"
              >
                Check
              </button>
            </div>
          </div>

          <button
            onClick={handleCartAdd}
            className="w-full bg-[#ed4e7e] text-white py-3 font-bold"
          >
            <ShoppingCart size={16} className="inline mr-2" />
            Add To Cart
          </button>

          <button
            onClick={() => router.push("/cart")}
            className="w-full bg-black text-white py-3 font-bold"
          >
            <Zap size={16} className="inline mr-2" />
            Buy Now
          </button>

          <button
            onClick={() =>
              router.push(`/product/${product.slug}`)
            }
            className="w-full border border-[#ed4e7e] text-[#ed4e7e] py-3 font-bold"
          >
            Show More Details <ChevronsDown />
          </button>
        </div>
      </div>
    </div>
  );
}
