"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import Image from "next/image";
import { fetchCategoryTree } from "@/lib/categories";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const categoryVisuals = {
  bra: {
    img: "/image/CategorySlider/bra.png",
    desc: "Everyday support with premium comfort.",
  },
  panties: {
    img: "/image/CategorySlider/panties.png",
    desc: "Soft essentials designed for all-day ease.",
  },
  shapewear: {
    img: "/image/CategorySlider/shapewear.png",
    desc: "Smooth, sculpt, and move with confidence.",
  },
  curvy: {
    img: "/image/CategorySlider/curvy-1.png",
    desc: "Designed for beautiful curves and comfort.",
  },
  "tummy-control": {
    img: "/image/CategorySlider/tummy-contol.png",
    desc: "Targeted shaping with a soft feel.",
  },
};

const MAX_SLIDES_VIEW = 5;

export default function CategorySlider() {
  const [categoryBanners, setCategoryBanners] = React.useState([]);

  React.useEffect(() => {
    let active = true;

    fetchCategoryTree()
      .then((tree) => {
        if (!active) return;

        const banners = tree.slice(0, 6).map((category) => ({
          img: categoryVisuals[category.slug]?.img || "/image/CategorySlider/shapewear.png",
          path: `/${category.slug}`,
          alt: category.name,
          title: category.name,
          desc:
            categoryVisuals[category.slug]?.desc ||
            "Explore bestselling styles in this collection.",
        }));

        setCategoryBanners(banners);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

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
          observer
          observeParents
          watchOverflow
          loop={enableLoop}
          autoplay={enableLoop ? { delay: 3500, disableOnInteraction: false } : false}
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
          {categoryBanners.map((item) => (
            <SwiperSlide key={item.path}>
              <div className="h-full">
                <div className="category-card h-full flex flex-col justify-between">
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

                  <div className="pt-4 flex flex-col flex-1 min-h-[180px]">
                    <h3 className="title-product" style={{ fontSize: 18, marginBottom: 6 }}>
                      {item.title}
                    </h3>
                    <p className="text-muted-sm" style={{ fontSize: 14, marginBottom: 14 }}>
                      {item.desc}
                    </p>
                    <Link
                      href={item.path}
                      className="btn-secondary-imkaa mt-auto self-center text-center"
                      style={{
                        padding: "10px 16px",
                        fontSize: "13px",
                        lineHeight: 1.2,
                      }}
                    >
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
