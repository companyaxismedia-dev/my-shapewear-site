"use client";


import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const resolveImage = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
};

export default function Hero({ slides }) {
  const [banners, setBanners] = useState([]);
  const [useProvidedSlides, setUseProvidedSlides] = useState(Boolean(slides));

  useEffect(() => {
    // If slides were explicitly provided (even if empty), use them
    if (useProvidedSlides) {
      console.log("✅ Using provided slides:", slides);
      setBanners(slides || []);
      return;
    }

    // Otherwise fetch from API
    console.log("📡 Fetching from banner API");
    fetch(`${API_BASE}/api/banner`)
      .then((res) => res.json())
      .then((data) => {
        const activebanners = Array.isArray(data) ? data.filter((b) => b.active) : [];
        console.log("📡 Banners from API:", activebanners);
        setBanners(activebanners);
      })
      .catch((err) => {
        console.error("Banner API error:", err);
        setBanners([]);
      });
  }, [slides, useProvidedSlides]);

  return (
    <section className="relative w-full mt-0 p-0" style={{ background: "var(--color-bg)" }}>
      <div className="w-full relative overflow-hidden section-full-width">
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
                        {item.mobileUrl ? (
                          <source srcSet={resolveImage(item.mobileUrl)} media="(max-width: 767px)" />
                        ) : null}
                        <img
                          src={resolveImage(item.desktopUrl)}
                          alt={item.altText || "Homepage Banner"}
                          className="w-full h-auto block select-none"
                          style={{ objectFit: "cover", background: "#fff" }}
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </picture>
                    </a>
                  ) : (
                    <picture>
                      {item.mobileUrl ? (
                        <source srcSet={resolveImage(item.mobileUrl)} media="(max-width: 767px)" />
                      ) : null}
                      <img
                        src={resolveImage(item.desktopUrl)}
                        alt={item.altText || "Homepage Banner"}
                        className="w-full h-auto block select-none"
                        style={{ objectFit: "cover", background: "#fff" }}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </picture>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div style={{ width: "100%", height: 320, background: "var(--color-bg-alt)" }} />
        )}
      </div>

      <style jsx global>{`
        /* DESKTOP ARROWS: Minimalist & Blended like Clovia */
        .swiper-button-next, .swiper-button-prev {
          color: #6A4B56 !important;
          background: transparent !important;
          width: 30px !important;
          height: 60px !important;
          transition: transform 0.2s ease;
        }

        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 28px !important;
          font-weight: 200 !important;
          text-shadow: 0px 0px 4px rgba(74,46,53,0.25);
        }

        /* DESKTOP DOTS STYLING */
        .swiper-pagination-bullet {
          background: #E8B7C2 !important;
          opacity: 0.6;
          width: 8px;
          height: 8px;
        }
        .swiper-pagination-bullet-active {
          background: #C56F7F !important;
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
            aspect-ratio: auto !important;
            object-fit: contain !important;
            object-position: center top !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            display: block !important;
            background: #fff !important;
          }
        }
      `}</style>
    </section>
  );
}
