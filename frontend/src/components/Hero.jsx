"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const banners = [
  { desktop: "/hero-image/clovia1.webp", mobile: "/hero-image/cloviamobile.jpeg", alt: "Premium Lingerie" },
  { desktop: "/hero-image/hero-n-1.jpeg", mobile: "/hero-image/hero-n-1.jpeg", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-se.png", mobile: "/hero-image/hero-se.png", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-ba-2.jpeg", mobile: "/hero-image/hero-ba-2.jpeg", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-n-2.jpeg", mobile: "/hero-image/hero-n-2.jpeg", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-n-4.jpeg", mobile: "/hero-image/hero-n-4.jpeg", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/hero-ba-1.png", mobile: "/hero-image/hero-ba-1.png", alt: "Comfortable Everyday Bras" },
  { desktop: "/hero-image/curvy.png", mobile: "/hero-image/curvy.png", alt: "Comfortable Everyday Bras" },

];

export default function Hero() {
  return (
    <section className="relative w-full bg-white">
      <div className="w-full relative overflow-hidden">
        <Swiper
          modules={[Autoplay, Navigation, Pagination, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={true}
          speed={1000}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          className="hero-swiper w-full"
        >
          {banners.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="w-full flex justify-center items-center leading-[0]">
                <picture className="w-full block">
                  <source
                    srcSet={item.mobile}
                    media="(max-width: 767px)"
                  />
                  <img
                    src={item.desktop}
                    alt={item.alt}
                    width={1966}
                    height={835}
                    className="w-full h-auto block select-none"
                    style={{
                      height: 'auto',
                      width: '100%',
                      objectFit: 'contain',
                      aspectRatio: '1966 / 835',
                    }}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </picture>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        /* DESKTOP ARROWS: Minimalist & Blended like Clovia */
        .swiper-button-next, .swiper-button-prev {
          color: #000 !important;
          background: transparent !important;
          width: 30px !important;
          height: 60px !important;
          transition: transform 0.2s ease;
        }

        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 28px !important;
          font-weight: 200 !important;
          text-shadow: 0px 0px 4px rgba(0,0,0,0.4);
        }

        /* DESKTOP DOTS STYLING */
        .swiper-pagination-bullet { 
          background: #9d577a !important; 
          opacity: 0.6; 
          width: 8px;
          height: 8px;
        }
        .swiper-pagination-bullet-active {
          background: #ed4e7e !important;
          width: 22px;
          border-radius: 10px;
          opacity: 1;
        }

        @media (max-width: 767px) {
          /* Hide Arrows on Mobile */
          .swiper-button-next, .swiper-button-prev {
            display: none !important;
          }

          /* Hide Pagination Dots on Mobile */
          .swiper-pagination {
            display: none !important;
          }

          /* Keep full image visibility on Mobile */
          .hero-swiper img {
            aspect-ratio: 2 / 3 !important; 
            object-fit: contain !important;
            width: 100vw !important;
            height: auto !important;
          }
        }
      `}</style>
    </section>
  );
}