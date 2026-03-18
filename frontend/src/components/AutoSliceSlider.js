"use client";

import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronRight, Heart, Star } from "lucide-react";
import { ProductDetailsModal } from "./category/ProductDetailsModal";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const categoryMap = {
  bra: "bra",
  panties: "panties",
  lingerie: "lingerie",
  curvy: "curvy",
  shapewear: "shapewear",
  "tummy-control": "shapewear",
};

const homeSections = [
  { id: "bra", title: "Trending Bras", path: "/bra", count: 8 },
  { id: "panties", title: "Comfy Panties", path: "/panties", count: 8 },
  { id: "lingerie", title: "Lingerie Sets", path: "/lingerie", count: 8 },
  { id: "curvy", title: "Curvy Collection", path: "/curvy", count: 8 },
  { id: "shapewear", title: "Shapewear Styles", path: "/shapewear", count: 8 },
  { id: "tummy-control", title: "Tummy Control", path: "/tummy-control", count: 8 },
];

export default function AutoSliceSlider() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsData, setProductsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoveredProductId, setHoveredProductId] = useState({});
  const swiperRefs = useRef({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const requests = homeSections.map(async (section) => {
          const backendCategory = categoryMap[section.id];
          const res = await fetch(
            // `${API_BASE}/api/products?category=${backendCategory}&isNewArrival=true&limit=10`,   for new arrival products
            `${API_BASE}/api/products?category=${backendCategory}&limit=10`,
            { cache: "force-cache" }
          );
          const result = await res.json();

          return {
            id: section.id,
            products: result.success ? result.products : [],
          };
        });

        const results = await Promise.all(requests);

        const data = {};
        results.forEach((r) => {
          data[r.id] = r.products;
        });

        setProductsData(data);
      } catch (err) {
        console.error("Slider fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);
  // product hover swipper handler and to pause the autoplay
  const handleProductHover = (productId, sectionId) => {
    setHoveredProductId((prev) => ({
      ...prev,
      [sectionId]: productId,
    }));
    if (swiperRefs.current[sectionId]) {
      swiperRefs.current[sectionId].autoplay.stop();
    }
  };
  // resuming the Swiper autoplay for this section when hover ends
  const handleProductHoverEnd = (sectionId) => {
    setHoveredProductId((prev) => ({
      ...prev,
      [sectionId]: null,
    }));
    if (swiperRefs.current[sectionId]) {
      swiperRefs.current[sectionId].autoplay.start();
    }
  };

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }
  return (
    <div className="flex flex-col gap-12 py-10 bg-white">
      {homeSections.map((section, index) => {
        const products =
          productsData[section.id]?.slice(0, section.count) || [];

        if (!products.length) return null;

        const enableLoop = products.length >= 5;
        const enableNav = products.length > 1;
        const reverseDirection = index % 2 === 1; // different direction

        return (
          <div key={section.id} className="w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-4">
              <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase italic border-l-4 border-[#ed4e7e] pl-4">
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
              modules={[Autoplay, Navigation]}
              spaceBetween={15}
              loop={enableLoop}
              autoplay={
                enableLoop
                  ? { delay: 4000, disableOnInteraction: false, reverseDirection }
                  : false
              }
              onInit={(swiper) => {
                swiperRefs.current[section.id] = swiper;
              }}
              breakpoints={{
                320: { slidesPerView: 1.5 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4.5 },
              }}
              // navigation={enableNav}
              navigation={false}
              className="homePageSwiper px-4">
              {products.map((product) => (
                <SwiperSlide key={product._id} className="no-swiping">
                  <ProductCard
                    product={product}
                    isHovered={hoveredProductId[section.id] === product._id}
                    onProductHover={() => handleProductHover(product._id, section.id)}
                    onProductHoverEnd={() => handleProductHoverEnd(section.id)}
                    onOpenDetails={() => {
                      // Open modal instantly with product data
                      setSelectedProduct(product);
                      
                      // Fetch detailed product data in background
                      fetch(`${API_BASE}/api/products/${product._id}`)
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.success) {
                            setSelectedProduct(data.product);
                          }
                        })
                        .catch((err) => console.error("Modal fetch error:", err));
                    }}
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


function ProductCard({
  product,
  isHovered,
  onProductHover,
  onProductHoverEnd,
  onOpenDetails
}) {
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const imageCarouselRef = useRef(null);

  const isWishlisted = wishlist.some((p) => p._id === product._id);

  let image = product.thumbnail || "/images/placeholder.jpg";

  if (image && !image.startsWith("http") && !image.startsWith("data:image")) {
    image = `${API_BASE}${image}`;
  }

  // Prepare images for carousel
  const images = product?.variants?.[0]?.images?.length > 0
    ? product.variants[0].images
      .filter((img) => img?.url)
      .map((img) => {
        const url = img.url;
        return url.startsWith("http") || url.startsWith("data:image")
          ? url
          : `${API_BASE}${url}`;
      })
    : [image];

  const price = product?.minPrice || 0;
  const oldPrice = product?.mrp || null;

  const discount =
    oldPrice && price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const rating = product?.rating || 4.4;
  const reviews = product?.numReviews || 150;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">

      {/* IMAGE */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-gray-50 cursor-pointer no-swiping"
        onMouseEnter={onProductHover}
        onMouseLeave={onProductHoverEnd}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenDetails();
        }}
      >
        {isHovered && images.length > 1 ? (
          <Swiper
            ref={imageCarouselRef}
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            loop={true}
            noSwipingClass="no-swiping"
            simulateTouch={false}
            autoplay={{
              delay: 1500,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            allowTouchMove={false}
            className="w-full h-full no-swiping"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenDetails();
            }}
          >
            {images.map((img, index) => (
              <SwiperSlide key={index} className="no-swiping">
                <img
                  src={img}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition cursor-pointer no-swiping"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenDetails();
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-top hover:scale-110 transition cursor-pointer"
          />
        )}

        {/* WISHLIST BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!user) return alert("Please login to use wishlist");

            isWishlisted
              ? removeFromWishlist(product._id)
              : toggleWishlist(product);
          }}
          className="absolute top-2 right-2 z-20 bg-white rounded-full w-[30px] h-[30px] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart
            size={16}
            className={`transition-colors ${isWishlisted
              ? "fill-[#ed4e7e] stroke-[#ed4e7e]"
              : "stroke-[#ed4e7e]"
              }`}
          />
        </button>

        {discount && (
          <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-[10px] px-2 py-0.5 font-bold rounded">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* DETAILS */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-[11px] font-bold truncate uppercase mb-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-1">
          <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[10px] font-bold text-[#ed4e7e]">
            {rating}
          </span>
          <span className="text-[9px] text-gray-400">
            ({reviews})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-gray-900">
            ₹{price}
          </span>

          {oldPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{oldPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}