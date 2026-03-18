"use client";


import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function Hero({ slides }) {
  const [banners, setBanners] = useState(slides || []);

  useEffect(() => {
    if (slides) return;
    fetch(`${API_BASE}/api/banner`)
      .then((res) => res.json())
      .then((data) => setBanners(Array.isArray(data) ? data.filter((b) => b.active) : []))
      .catch(() => setBanners([]));
  }, [slides]);

  return (
    <section className="relative w-full bg-white mt-0 p-0">
      <div className="w-full relative overflow-hidden">
        {banners.length > 0 ? (
          <Swiper
            modules={[Autoplay, Navigation, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop={banners.length > 1}
            speed={1000}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={false}
            className="hero-swiper w-full"
          >
            {banners.map((item, index) => (
              <SwiperSlide key={item._id || index}>
                <div className="w-full flex justify-center items-center leading-[0]">
                  {item.link ? (
                    <a href={item.link} className="w-full block" target="_blank" rel="noreferrer">
                      <picture>
                        <source srcSet={item.mobileUrl} media="(max-width: 767px)" />
                        <img
                          src={item.desktopUrl}
                          alt={item.altText || "Homepage Banner"}
                          width={1966}
                          height={835}
                          className="w-full h-auto block select-none"
                          style={{ objectFit: "contain" }}
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </picture>
                    </a>
                  ) : (
                    <picture>
                      <source srcSet={item.mobileUrl} media="(max-width: 767px)" />
                      <img
                        src={item.desktopUrl}
                        alt={item.altText || "Homepage Banner"}
                        width={1966}
                        height={835}
                        className="w-full h-auto block select-none"
                        style={{ objectFit: "contain" }}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </picture>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div style={{ width: "100%", height: 300, background: "#f3f3f3" }} />
        )}
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
.swiper-button-next, .swiper-button-prev, .swiper-pagination {
    display: none !important;
  }
          /* Hide Pagination Dots on Mobile */
          .swiper-pagination {
            display: none !important;
          }

          /* Keep full image visibility on Mobile */
          .hero-swiper img {
aspect-ratio: auto !important; /* Remove the forced 2/3 ratio */
    object-fit: cover !important;  /* Changed from contain to cover */
    width: 100% !important;
    height: auto !important;
    display: block !important;          }
        }
      `}</style>
    </section>
  );
}