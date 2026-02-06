"use client";
import React from "react";
import Link from "next/link"; // Link import kiya
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const categoryBanners = [
  { img: "/image/CategorySlider/tummy-contol.jpg", title: "Tummy Control", path: "/tummy-control" },
  { img: "/image/CategorySlider/shapewear.png",  path: "/shapewear" },
  { img: "/image/CategorySlider/curvy-1.png",  path: "/curvy" },
  { img: "/image/CategorySlider/bra.png", path: "/bra" },
  { img: "/image/CategorySlider/panties.png",  path: "/panty" },
];

export default function CategorySlider() {
  return (
    <section className="w-full py-12 bg-white">
      <div className="max-w-[1440px] mx-auto px-4">
        
        <h2 className="text-2xl font-black mb-8 text-gray-800 uppercase italic border-l-4 border-[#ed4e7e] pl-4">
          Shop By Category
        </h2>
        
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={15}
          loop={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 10 },
            768: { slidesPerView: 3, spaceBetween: 15 },
            1024: { slidesPerView: 5, spaceBetween: 20 },
          }}
          pagination={{ clickable: true }}
          navigation={true}
          className="categorySwiper"
        >
          {categoryBanners.map((item, index) => (
            <SwiperSlide key={index}>
              {/* Har image ko Link ke andar wrap kiya hai */}
              <Link href={item.path}>
                <div className="relative group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="aspect-[3/4] w-full">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Elegant Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-4 transition-opacity group-hover:from-[#ed4e7e]/80">
                    <h3 className="text-white text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-[10px] uppercase font-bold tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop Now +
                    </p>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .categorySwiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #ed4e7e !important;
          opacity: 0.3;
        }
        .categorySwiper .swiper-pagination-bullet-active {
          opacity: 1;
          width: 20px;
          border-radius: 4px;
        }
        .categorySwiper .swiper-button-next, 
        .categorySwiper .swiper-button-prev {
          color: #ed4e7e !important;
          background: white;
          width: 35px !important;
          height: 35px !important;
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .categorySwiper .swiper-button-next:after, 
        .categorySwiper .swiper-button-prev:after {
          font-size: 14px !important;
          font-weight: bold;
        }
        @media (max-width: 768px) {
          .categorySwiper .swiper-button-next, 
          .categorySwiper .swiper-button-prev { display: none; }
        }
      `}</style>
    </section>
  );
}