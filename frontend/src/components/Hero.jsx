"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const banners = [
  { desktop: "/hero-image/hero-n-3.jpeg", mobile: "/hero-image/hero-n-3.jpeg", alt: "Premium Lingerie Collection" },
  { desktop: "/hero-image/hero-n-1.jpeg", mobile: "/hero-image/hero-n-1.jpeg", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-se.png", mobile: "/hero-image/hero-se.png", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-ba-2.jpeg", mobile: "/hero-image/hero-ba-2.jpeg", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-n-2.jpeg", mobile: "/hero-image/hero-n-2.jpeg", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-n-4.jpeg", mobile: "/hero-image/hero-n-4.jpeg", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-ba-1.png", mobile: "/hero-image/hero-ba-1.png", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/curvy.png", mobile: "/hero-image/curvy.png", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-n-5.jpeg", mobile: "/hero-image/hero-n-5.jpeg", alt: "Comfortable Everyday Bras" },
];

export default function Hero() {
  return (
    <section className="relative w-full">
      <div className="w-full relative overflow-hidden bg-[#f8f8f8]">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={true}
          speed={1000}
          autoplay={{ 
            delay: 4000, 
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          navigation={true}
          className="w-full"
        >
          {banners.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="w-full">
                <picture className="w-full block">
                  {/* Mobile Image (767px tak) */}
                  <source srcSet={item.mobile} media="(max-width: 767px)" />
                  {/* Desktop Image: 'h-auto' ensures aspect ratio is maintained like Clovia */}
                  <img
                    src={item.desktop}
                    alt={item.alt}
                    className="w-full h-auto block" 
                    style={{ maxHeight: 'none' }} // Remove hard height limits to prevent cropping
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </picture>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* TRUST STRIP
      <div className="w-full bg-gradient-to-r from-[#001e3c] via-[#4a0e2e] to-[#8b1030] py-3 md:py-4 relative z-20">
        <div className="max-w-7xl mx-auto px-2">
          <div className="grid grid-cols-4 gap-1 md:gap-4 text-white">
            <div className="flex flex-col items-center text-center">
              <span className="text-base md:text-xl">🚚</span>
              <p className="text-[7px] md:text-xs font-bold uppercase">Free Shipping</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-base md:text-xl">🔒</span>
              <p className="text-[7px] md:text-xs font-bold uppercase">Secure Pay</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-base md:text-xl">↩</span>
              <p className="text-[7px] md:text-xs font-bold uppercase">7 Day Return</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-base md:text-xl">💵</span>
              <p className="text-[7px] md:text-xs font-bold uppercase">COD Available</p>
            </div>
          </div>
        </div>
      </div> */}

      <style jsx global>{`
        .swiper-button-next, .swiper-button-prev {
          color: #fff !important;
          background: rgba(0,0,0,0.3);
          width: 40px !important;
          height: 40px !important;
          border-radius: 50%;
          --swiper-navigation-size: 18px;
          transition: all 0.3s ease;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: rgba(0,0,0,0.6);
        }
        @media (max-width: 768px) {
          .swiper-button-next, .swiper-button-prev { display: none; }
        }
        .swiper-pagination-bullet { background: #ccc !important; opacity: 0.8; }
        .swiper-pagination-bullet-active {
          background: #db2777 !important;
          width: 30px;
          border-radius: 5px;
        }
      `}</style>
    </section>
  );
}