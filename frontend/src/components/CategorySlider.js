"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

const categoryBanners = [
  {
    img: "/image/CategorySlider/bra.png",
    path: "/bra",
    alt: "Bras",
    title: "Bras",
    desc: "Everyday support with premium comfort.",
  },
  {
    img: "/image/CategorySlider/panties.png",
    path: "/panties",
    alt: "Panties",
    title: "Panties",
    desc: "Soft essentials designed for all‑day ease.",
  },
  {
    img: "/image/CategorySlider/shapewear.png",
    path: "/shapewear",
    alt: "Shapewear",
    title: "Shapewear",
    desc: "Smooth, sculpt, and move with confidence.",
  },
  {
    img: "/image/CategorySlider/curvy-1.png",
    path: "/curvy",
    alt: "Curvy Collection",
    title: "Curvy",
    desc: "Designed for beautiful curves and comfort.",
  },
  {
    img: "/image/CategorySlider/tummy-contol.png",
    path: "/tummy-control",
    alt: "Tummy Control",
    title: "Tummy Control",
    desc: "Targeted shaping with a soft feel.",
  },
];

const MAX_SLIDES_VIEW = 5;

export default function CategorySlider() {
  const enableLoop = categoryBanners.length > MAX_SLIDES_VIEW;

  return (
    <section className="section-padding w-full" style={{ background: "var(--color-bg-alt)" }}>
      <div className="container-imkaa">
        <div className="section-heading-block">
          <h2 className="heading-section">Shop By Category</h2>
          <p className="section-subtitle">Find your perfect fit, from everyday essentials to elevated silhouettes.</p>
        </div>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          observer={true}
          observeParents={true}
          watchOverflow={true}
          loop={enableLoop}
          autoplay={
            enableLoop ? { delay: 3500, disableOnInteraction: false } : false
          }
          breakpoints={{
            320: { slidesPerView: 2, spaceBetween: 10 },
            480: { slidesPerView: 3, spaceBetween: 12 },
            768: { slidesPerView: 3, spaceBetween: 15 },
            1024: { slidesPerView: 5, spaceBetween: 20 },
          }}
          pagination={false}
          navigation={categoryBanners.length > 1}
          className="categorySwiper"
        >
          {categoryBanners.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="h-full">
                <div className="category-card h-full flex flex-col">
                  <Link href={item.path} className="block">
                    <div
                      className="relative w-full overflow-hidden"
                      style={{
                        borderRadius: 18,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-bg)",
                        aspectRatio: "4 / 5",
                      }}
                    >
                      <Image
                        src={item.img}
                        alt={item.alt}
                        fill
                        sizes="(max-width:768px) 80vw, 280px"
                        className="object-cover"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <div className="pt-4 flex flex-col flex-1">
                    <h3 className="title-product" style={{ fontSize: 18, marginBottom: 6 }}>
                      {item.title}
                    </h3>
                    <p className="text-muted-sm" style={{ fontSize: 14, marginBottom: 14 }}>
                      {item.desc}
                    </p>
                    <Link href={item.path} className="btn-secondary-imkaa w-fit mt-auto">
                      Explore Collection
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
