"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const categoryBanners = [
  { img: "/image/CategorySlider/tummy-contol.png", path: "/tummy-control" },
  { img: "/image/CategorySlider/shapewear.png", path: "/shapewear" },
  { img: "/image/CategorySlider/curvy-1.png", path: "/curvy" },
  { img: "/image/CategorySlider/bra.png",  path: "/bra" },
  { img: "/image/CategorySlider/panties.png", path: "/panty" },
];

const MAX_SLIDES_VIEW = 5;

export default function CategorySlider() {

  const enableLoop = categoryBanners.length > MAX_SLIDES_VIEW;

  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4">

        <h2 className="text-2xl font-black mb-8 text-gray-800 uppercase italic border-l-4 border-[#ed4e7e] pl-4">
          Shop By Category
        </h2>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          observer={true}
          observeParents={true}
          watchOverflow={true}
          loop={enableLoop}
          autoplay={
            enableLoop
              ? { delay: 3500, disableOnInteraction: false }
              : false
          }
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 10 },
            768: { slidesPerView: 3, spaceBetween: 15 },
            1024: { slidesPerView: 5, spaceBetween: 20 },
          }}
          pagination={false}
          navigation={categoryBanners.length > 1}
          className="categorySwiper"
        >
          {categoryBanners.map((item, index) => (
            <SwiperSlide key={index}>
              <Link href={item.path}>
                <div className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">

                  {/* 🔥 FIXED HEIGHT CONTAINER */}
                  <div className="relative w-full h-[280px] md:h-[320px] bg-gray-100 overflow-hidden">

                    {/* 🔥 ABSOLUTE IMAGE (NO LAYOUT SHIFT) */}
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent flex flex-col justify-end p-4 group-hover:from-[#ed4e7e]/80 transition">
                    <h3 className="text-white text-xl md:text-2xl font-black italic uppercase">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-[10px] uppercase font-bold mt-1 opacity-0 group-hover:opacity-100 transition">
                      Shop Now +
                    </p>
                  </div>

                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
}