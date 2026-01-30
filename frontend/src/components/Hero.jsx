"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Yahan aap dono images ke link dalenge
const banners = [
  
  {
    desktop: "/hero-image/hero-01.png",
    mobile: "/hero-image/hero-01-mob.png",
  },
  {
    desktop: "/hero-image/hero-2.png",
    mobile: "/hero-image/hero-2-mob.png",
  },
  {
    desktop: "/hero-image/curvy.png",
    mobile: "/hero-image/curvy-mob.png",
  },
  {
    desktop: "/hero-image/hero-02.png",
    mobile: "/hero-image/hero-02-mob.png",
  },
  {
    desktop: "/hero-image/hero-03.png",
    mobile: "/hero-image/hero-03-mob.png",
    
  },
  {
    desktop: "/hero-image/hero-image.png",
    mobile: "/hero-image/hero-image-mob.png",
    
  },
  {
    desktop: "/hero-image/hero-1.png",
    mobile: "/hero-image/hero-1-mob.png", // Agar mobile image na ho to same path bhi dal sakte hain
  },
];

export default function Hero() {
  return (
    <section className="relative w-full group">
      {/* HERO SLIDER */}
      <div className="w-full h-[60vh] md:h-[85vh]">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          loop={banners.length > 1}
          effect="fade"
          speed={1000}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={true}
          className="mySwiper w-full h-full"
        >
          {banners.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="w-full h-full relative">
                {/* Desktop Image: Badi screen par dikhegi, mobile par hidden */}
                <img
                  src={item.desktop}
                  alt={`Banner ${index + 1}`}
                  className="hidden md:block w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                
                {/* Mobile Image: Sirf mobile par dikhegi, desktop par hidden */}
                <img
                  src={item.mobile}
                  alt={`Mobile Banner ${index + 1}`}
                  className="block md:hidden w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* TRUST STRIP */}
      <div className="w-full bg-[#001e3c] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2 text-white font-bold text-[10px] md:text-xs uppercase">
              <span>🚚</span> FREE SHIPPING
            </div>
            <div className="flex items-center justify-center gap-2 text-white font-bold text-[10px] md:text-xs uppercase">
              <span>🔒</span> SECURE CHECKOUT
            </div>
            <div className="flex items-center justify-center gap-2 text-white font-bold text-[10px] md:text-xs uppercase">
              <span>↩</span> 7 DAYS RETURN
            </div>
            <div className="flex items-center justify-center gap-2 text-white font-bold text-[10px] md:text-xs uppercase">
              <span>💵</span> COD AVAILABLE
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          color: white !important;
          background: rgba(0,0,0,0.2);
          width: 40px !important;
          height: 40px !important;
          border-radius: 50%;
          transform: scale(0.7);
        }
        @media (max-width: 768px) {
          .swiper-button-next, .swiper-button-prev { display: none; }
          .swiper-pagination-bullet { width: 6px; height: 6px; }
        }
      `}</style>
    </section>
  );
}