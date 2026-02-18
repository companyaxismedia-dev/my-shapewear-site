"use client";

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronRight, Star, X, ShoppingCart, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

/* ================= API BASE ================= */

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

/* ================= CATEGORY MAP ================= */

const categoryMap = {
  bra: "bra",
  panties: "panties",
  lingerie: "lingerie",
  shapewear: "shapewear",
};

const homeSections = [
  { id: "bra", title: "Trending Bras", path: "/bra", count: 8 },
  { id: "panties", title: "Comfy Panties", path: "/panties", count: 8 },
  { id: "lingerie", title: "Lingerie Sets", path: "/lingerie", count: 8 },
  { id: "shapewear", title: "Shapewear Styles", path: "/shapewear", count: 8 },
];

export default function AutoSliceSlider() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsData, setProductsData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const data = {};

      for (const section of homeSections) {
        try {
          const res = await fetch(
            `${API_BASE}/api/products?category=${categoryMap[section.id]}&limit=20`
          );
          const result = await res.json();

          data[section.id] = result.success
            ? result.products.filter((p) => p.isActive)
            : [];
        } catch {
          data[section.id] = [];
        }
      }

      setProductsData(data);
      setLoading(false);
    };

    loadProducts();
  }, []);

  if (loading) return null;

  return (
    <div className="flex flex-col gap-14 py-12 bg-white">
      {homeSections.map((section) => {
        const products =
          productsData[section.id]?.slice(0, section.count) || [];

        if (!products.length) return null;

        return (
          <div key={section.id} className="w-full">
            <div className="flex justify-between items-center mb-6 px-4">
              <h2 className="text-xl md:text-2xl font-black uppercase border-l-4 border-[#ed4e7e] pl-4">
                {section.title}
              </h2>

              <a
                href={section.path}
                className="flex items-center gap-1 text-[10px] font-bold bg-[#ed4e7e] text-white px-4 py-2 rounded-full uppercase"
              >
                View All <ChevronRight size={14} />
              </a>
            </div>

            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={16}
              loop
              autoplay={{ delay: 3500 }}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                320: { slidesPerView: 1.4 },
                640: { slidesPerView: 2.5 },
                1024: { slidesPerView: 4 },
              }}
              className="px-4 pb-12"
            >
              {products.map((product) => (
                <SwiperSlide key={product._id}>
                  <ProductCard
                    product={product}
                    onOpenDetails={() => setSelectedProduct(product)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        );
      })}

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

function ProductCard({ product, onOpenDetails }) {
  const variant = product?.variants?.[0] || {};

  const primaryImage =
    variant?.images?.find((img) => img.isPrimary) ||
    variant?.images?.[0];

  const image =
    typeof primaryImage === "string"
      ? `${API_BASE}${primaryImage}`
      : primaryImage?.url
      ? `${API_BASE}${primaryImage.url}`
      : "/placeholder.jpg";

  const sizeObj = variant?.sizes?.[0] || {};
  const price = sizeObj?.price || product?.minPrice || 0;
  const mrp = sizeObj?.mrp || product?.mrp || null;

  const discount =
    mrp && price
      ? Math.round(((mrp - price) / mrp) * 100)
      : null;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border flex flex-col h-full">
      <div
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
        onClick={onOpenDetails}
      >
        <img
          src={image}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition"
        />

        {discount && (
          <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-[10px] px-2 py-1 font-bold rounded">
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-[11px] font-bold truncate uppercase mb-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-1">
          <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[10px] font-bold">
            {product.rating || 0}
          </span>
          <span className="text-[9px] text-gray-400">
            ({product.numReviews || 0})
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-black">
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
          className="mt-auto w-full bg-[#ed4e7e] text-white py-2 text-xs font-bold uppercase rounded"
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

  const primaryImage =
    variant?.images?.find((img) => img.isPrimary) ||
    variant?.images?.[0];

  const image =
    typeof primaryImage === "string"
      ? `${API_BASE}${primaryImage}`
      : primaryImage?.url
      ? `${API_BASE}${primaryImage.url}`
      : "/placeholder.jpg";

  const selectedSize =
    variant?.sizes?.find((s) => s.size === size);

  const handleAdd = () => {
    if (!size) return alert("Select size");

    addToCart({
      id: product._id,
      name: product.name,
      price: selectedSize?.price,
      image,
      size,
      quantity: 1,
    });

    alert("Added to cart");
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-4xl w-full rounded-xl flex flex-col md:flex-row relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <X size={20} />
        </button>

        <div className="md:w-1/2">
          <img src={image} className="w-full h-full object-cover" />
        </div>

        <div className="md:w-1/2 p-6 space-y-6">
          <h2 className="text-xl font-black uppercase">
            {product.name}
          </h2>

          <div className="text-2xl font-black text-[#ed4e7e]">
            ₹{selectedSize?.price || product.minPrice}
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
            onClick={handleAdd}
            className="w-full bg-[#ed4e7e] text-white py-3 font-bold uppercase"
          >
            <ShoppingCart size={16} className="inline mr-2" />
            Add To Cart
          </button>

          <button
            onClick={() => router.push(`/product/${product.slug}`)}
            className="w-full bg-black text-white py-3 font-bold uppercase"
          >
            <Zap size={16} className="inline mr-2" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
