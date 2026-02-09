"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronRight, Star } from "lucide-react";
import { getCategoryProducts } from "./productsIndex";

// 🟢 IMPORT THE EXISTING MODAL (NO LOGIC DUPLICATION)
import { ProductDetailsModal } from "@/app/bra/page";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const homeSections = [
  { id: "bra", title: "Trending Bras", path: "/bra", count: 8 },
  { id: "panty", title: "Comfy Panties", path: "/panty", count: 8 },
  { id: "lingerie", title: "Lingerie Sets", path: "/lingerie", count: 8 },
  { id: "curvy", title: "Curvy Collection", path: "/curvy", count: 8 },
  { id: "shapewear", title: "Shapewear Styles", path: "/shapewear", count: 8 },
  { id: "tummy-control", title: "Tummy Control", path: "/tummy-control", count: 8 },
];

export default function AutoSliceSlider() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="flex flex-col gap-12 py-10 bg-white">
      {homeSections.map((section) => {
        const products = getCategoryProducts(section.id).slice(0, section.count);

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

            {/* Slider */}
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={15}
              loop
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              breakpoints={{
                320: { slidesPerView: 1.5 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4.5 },
              }}
              pagination={{ clickable: true }}
              navigation
              className="homePageSwiper px-4 pb-12"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
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

      {/* 🟢 SAME MODAL AS BRA PAGE */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      <style jsx global>{`
          /* Give space for dots */
          .homePageSwiper {
            padding-bottom: 40px !important;
          }

          /* Position dots slightly lower but visible */
          .homePageSwiper .swiper-pagination {
            bottom: 8px !important;
          }

          /* Smooth dot animation */
          .homePageSwiper .swiper-pagination-bullet {
            transition:
              width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              background-color 0.35s ease,
              opacity 0.35s ease,
              transform 0.35s ease;
          }

          .homePageSwiper .swiper-pagination-bullet-active {
            transform: scale(1.05);
          }
        `}</style>
    </div>
  );
}

function ProductCard({ product, onOpenDetails }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Image */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-gray-50 cursor-pointer"
        onClick={onOpenDetails}
      >
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-[10px] font-bold px-2 py-0.5 rounded">
          {product.discount} OFF
        </div>
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-1">
          <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[10px] font-bold text-[#ed4e7e]">
            {product.rating}
          </span>
          <span className="text-[9px] text-gray-400">
            ({product.reviews})
          </span>
        </div>

        <h3 className="text-[11px] font-bold text-gray-700 truncate uppercase mb-1">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-black text-gray-900">
            ₹{product.price}
          </span>
          <span className="text-[10px] text-gray-400 line-through">
            ₹{product.oldPrice}
          </span>
        </div>

        {/* Sizes */}
        <div className="mt-auto space-y-3">
          <div className="flex gap-1 mb-1">
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="flex-1 text-center border border-gray-200 text-[10px] py-1 rounded font-bold text-gray-600"
              >
                {size}
              </span>
            ))}
          </div>
        </div>


        {/* Button */}
        <button
          onClick={onOpenDetails}
          className="cursor-pointer mt-auto w-full bg-[#ed4e7e] text-white py-2.5 text-[12px] font-bold uppercase tracking-widest rounded-sm shadow-sm active:scale-95"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
}
