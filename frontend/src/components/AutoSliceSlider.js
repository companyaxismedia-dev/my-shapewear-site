"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { ChevronRight, Star } from "lucide-react";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const homeSections = [
  { title: "Trending Bras", path: "/bra", folder: "bra", prefix: "bra", count: 8, price: 499, oldPrice: 999, off: "50%" },
  { title: "Comfy Panties", path: "/panty", folder: "panty", prefix: "panty", count: 8, price: 299, oldPrice: 599, off: "50%" },
  { title: "Lingerie Sets", path: "/lingerie", folder: "lingerie-set-gum", prefix: "Lingerie-set-gum", count: 8, price: 899, oldPrice: 1799, off: "50%" },
  { title: "Curvy Collection", path: "/curvy", folder: "curvy", prefix: "curvy", count: 8, price: 699, oldPrice: 1399, off: "50%" },
  { title: "Shapewear Styles", path: "/shapewear", folder: "shapewear", prefix: "shapewear", count: 8, price: 599, oldPrice: 1199, off: "50%" },
  // 🟢 NAYA SECTION: Tummy Control
  { title: "Tummy Control", path: "/tummy-control", folder: "tummy-control", prefix: "tummy-control", count: 8, price: 799, oldPrice: 1499, off: "45%" },
];

export default function AutoSliceSlider() {
  return (
    <div className="flex flex-col gap-12 py-10 bg-white">
      {homeSections.map((section, idx) => (
        <div key={idx} className="w-full">
          
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6 px-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase italic border-l-4 border-[#ed4e7e] pl-4">
              {section.title}
            </h2>
            <a 
              href={section.path} 
              className="flex items-center gap-1 text-[10px] font-bold bg-[#ed4e7e] text-white px-4 py-2 rounded-full shadow-md hover:bg-black transition-all uppercase"
            >
              View All <ChevronRight size={14} />
            </a>
          </div>

          {/* Swiper Slider */}
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={15}
            loop={true}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            breakpoints={{
              320: { slidesPerView: 1.5, spaceBetween: 10 },
              768: { slidesPerView: 3, spaceBetween: 15 },
              1024: { slidesPerView: 4.5, spaceBetween: 20 },
            }}
            pagination={{ clickable: true }}
            navigation={true}
            className="homePageSwiper px-4 pb-12"
          >
            {Array.from({ length: section.count }).map((_, i) => (
              <SwiperSlide key={i}>
                <ProductCard section={section} index={i} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ))}

      {/* Navigation Arrows Style */}
      <style jsx global>{`
        .homePageSwiper .swiper-button-next, 
        .homePageSwiper .swiper-button-prev {
          color: #ed4e7e !important;
          background: white;
          width: 35px !important;
          height: 35px !important;
          border-radius: 50%;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .homePageSwiper .swiper-pagination-bullet-active {
          background: #ed4e7e !important;
        }
      `}</style>
    </div>
  );
}

function ProductCard({ section, index }) {
  const imagePath = `/image/${section.folder}/${section.prefix}-${index + 1}.jpg`;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md flex flex-col h-full">
      
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        <img
          src={imagePath}
          alt={section.title}
          className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-110"
          onError={(e) => { e.target.src = "/image/booty-bloom.webp"; }}
        />
        <div className="absolute top-2 left-2 bg-[#ed4e7e] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
          {section.off} OFF
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3 bg-white flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={10} fill={i < 4 ? "#fbbf24" : "none"} color={i < 4 ? "#fbbf24" : "#ccc"} />
          ))}
          <span className="text-[9px] text-gray-400 font-bold">(125)</span>
        </div>

        <h3 className="text-[11px] font-bold text-gray-700 truncate mb-1 uppercase">
          {section.prefix} Style {index + 1}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-black text-gray-900">₹{section.price}</span>
          <span className="text-[10px] text-gray-400 line-through">₹{section.oldPrice}</span>
        </div>

        {/* Permanent Sizes & Button */}
        <div className="mt-auto space-y-3">
          <div className="flex gap-1">
            {["S", "M", "L", "XL"].map((size) => (
              <button key={size} className="flex-1 text-center border border-gray-200 text-[10px] py-1 rounded hover:border-[#ed4e7e] hover:text-[#ed4e7e] transition-colors font-bold text-gray-600">
                {size}
              </button>
            ))}
          </div>
          
          <button 
    className="w-full bg-[#ed4e7e] text-white py-2.5 text-[12px] font-bold uppercase tracking-widest rounded-sm shadow-sm border-none cursor-pointer flex items-center justify-center active:scale-95"
    style={{ backgroundColor: '#ed4e7e', color: 'white' }} 
  >
    ADD TO CART
  </button>
        </div>
      </div>
    </div>
  );
}