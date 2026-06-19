"use client";

import React, {
  useEffect,
  useState,
  useRef,
  Fragment,
  useMemo,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Navigation, Pagination } from "swiper/modules";
import { ChevronRight, Heart, Star } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import SectionRenderer from "./SectionRenderer";
import { API_BASE } from "@/lib/api";
import { fetchCategoryTree, filterNavbarCategories } from "@/lib/categories";
import { toast } from "sonner";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function AutoSliceSlider({
  bannerSections = [],
  onUsedBannerIdsChange,
}) {
  const [productsData, setProductsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [hoveredProductId, setHoveredProductId] = useState({});
  const [homeSections, setHomeSections] = useState([]);
  const swiperRefs = useRef({});
  const pausedTranslates = useRef({});
  const resumeTimers = useRef({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const categoryTree = await fetchCategoryTree();
        const dynamicSections = filterNavbarCategories(categoryTree).slice(0, 6).map((category) => ({
          id: category.slug,
          title: category.name,
          path: `/${category.slug}`,
          count: 8,
          categorySlug: category.slug,
        }));

        setHomeSections(dynamicSections);

        const requests = dynamicSections.map(async (section) => {
          const res = await fetch(
            `${API_BASE}/api/products?category=${section.categorySlug}&limit=10`,
            { cache: "no-store" }
          );
          const result = await res.json();

          return {
            id: section.id,
            products: result.success ? result.products : [],
          };
        });

        const results = await Promise.all(requests);

        const data = {};
        results.forEach((r) => {
          data[r.id] = r.products;
        });

        setProductsData(data);
      } catch (err) {
        console.error("Slider fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const visibleSections = useMemo(() => {
    return homeSections.filter((section) => {
      const products = productsData[section.id]?.slice(0, section.count) || [];
      return products.length > 0;
    });
  }, [productsData]);

  // useEffect(() => {
  //   if (!onUsedBannerIdsChange) return;

  //   const neededBannerCount = Math.min(
  //     bannerSections.length,
  //     Math.floor(visibleSections.length / 2)
  //   );

  //   const usedIds = bannerSections
  //     .slice(0, neededBannerCount)
  //     .map((section) => section._id);

  //   onUsedBannerIdsChange(usedIds);
  // }, [bannerSections, visibleSections, onUsedBannerIdsChange]);

  useEffect(() => {
    if (!onUsedBannerIdsChange) return;

    const usedIds = [];

    visibleSections.forEach((_, index) => {
      const beforeBanner = bannerSections[index];
      const afterBanner = bannerSections[index + visibleSections.length];

      if (beforeBanner?._id) {
        usedIds.push(beforeBanner._id);
      }

      if (afterBanner?._id) {
        usedIds.push(afterBanner._id);
      }
    });

    onUsedBannerIdsChange(usedIds);
  }, [bannerSections, visibleSections, onUsedBannerIdsChange]);

  const handleProductHover = (productId, sectionId) => {
    setHoveredProductId((prev) => ({
      ...prev,
      [sectionId]: productId,
    }));
  };

  const handleProductHoverEnd = (sectionId) => {
    setHoveredProductId((prev) => ({
      ...prev,
      [sectionId]: null,
    }));
  };

  const keepSwiperMotionSmooth = (swiper) => {
    if (swiper?.wrapperEl) {
      swiper.wrapperEl.style.transitionTimingFunction = "linear";
    }
  };

  const stopSectionAutoplay = (sectionId) => {
    const swiper = swiperRefs.current[sectionId];

    if (!swiper) return;

    const currentTranslate = swiper.getTranslate();
    pausedTranslates.current[sectionId] = currentTranslate;
    clearTimeout(resumeTimers.current[sectionId]);
    swiper.setTranslate(currentTranslate);
    swiper.setTransition(0);
    swiper.animating = false;
    swiper.autoplay?.stop();
  };

  const startSectionAutoplay = (sectionId, reverseDirection = false) => {
    const swiper = swiperRefs.current[sectionId];

    if (!swiper) return;

    const pausedTranslate = pausedTranslates.current[sectionId];

    if (typeof pausedTranslate === "number") {
      swiper.setTransition(0);
      swiper.setTranslate(pausedTranslate);
    }

    keepSwiperMotionSmooth(swiper);

    window.requestAnimationFrame(() => {
      keepSwiperMotionSmooth(swiper);
      const speed = swiper.params.speed || 6500;

      if (swiper.params.loop) {
        reverseDirection
          ? swiper.slidePrev(speed, true)
          : swiper.slideNext(speed, true);
      }

      clearTimeout(resumeTimers.current[sectionId]);
      resumeTimers.current[sectionId] = setTimeout(() => {
        swiper.autoplay?.start();
        delete resumeTimers.current[sectionId];
      }, speed);

      delete pausedTranslates.current[sectionId];
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="product-card-imkaa">
            <div className="skeleton" style={{ aspectRatio: "6 / 7" }} />
            <div style={{ padding: 10 }}>
              <div
                className="skeleton"
                style={{ height: 14, width: "70%", marginBottom: 10 }}
              />
              <div className="skeleton" style={{ height: 12, width: "45%" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      {visibleSections.map((section, index) => {
        const products = productsData[section.id]?.slice(0, section.count) || [];
        const enableLoop = products.length >= 5;
        const reverseDirection = index % 2 === 1;
        const beforeBanner = bannerSections[index];
        const afterBanner = bannerSections[index + visibleSections.length];

        return (
          <Fragment key={section.id}>

            {/* 🔴 Banner BEFORE slider */}
            {beforeBanner ? (
              <div className="w-full">
                <SectionRenderer section={beforeBanner} compact />
              </div>
            ) : null}

            {/* 🟢 Slider */}
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 lg:mb-5 mb-3 lg:px-4">
                <div>
                  <h3 className="heading-section">
                    {section.title}
                  </h3>
                </div>

                <a href={section.path} className="btn-secondary-imkaa w-fit">
                  View Products <ChevronRight size={16} />
                </a>
              </div>

              <div
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") {
                    stopSectionAutoplay(section.id);
                  }
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === "mouse") {
                    startSectionAutoplay(section.id, reverseDirection);
                  }
                }}
              >
                <Swiper
                  modules={[Autoplay, FreeMode, Navigation]}
                  spaceBetween={15}
                  speed={6500}
                  freeMode={{
                    enabled: true,
                    momentum: false,
                  }}
                  loop={enableLoop}
                  autoplay={
                    enableLoop
                      ? {
                        delay: 0,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: false,
                        reverseDirection,
                      }
                      : false
                  }
                  onInit={(swiper) => {
                    swiperRefs.current[section.id] = swiper;
                    keepSwiperMotionSmooth(swiper);
                  }}
                  onSlideChangeTransitionStart={keepSwiperMotionSmooth}
                  breakpoints={{
                    320: { slidesPerView: 2.1 },
                    480: { slidesPerView: 2.6 },
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 4.2 },
                  }}
                  navigation={false}
                  className="homePageSwiper"
                >
                  {products.map((product) => (
                    <SwiperSlide key={product._id} className="no-swiping">
                      <ProductCard
                        product={product}
                        isHovered={hoveredProductId[section.id] === product._id}
                        onProductHover={() =>
                          handleProductHover(product._id, section.id)
                        }
                        onProductHoverEnd={() =>
                          handleProductHoverEnd(section.id)
                        }
                        onOpenDetails={() => openProductInNewTab(product)}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>

            {/* 🔵 Banner AFTER slider */}
            {afterBanner ? (
              <div className="w-full">
                <SectionRenderer section={afterBanner} compact />
              </div>
            ) : null}

          </Fragment>
        );
      })}
    </div>
  );
}

function openProductInNewTab(product) {
  if (!product?.slug) return;
  window.open(`/product/${product.slug}`, "_blank", "noopener,noreferrer");
}

function ProductCard({
  product,
  isHovered,
  onProductHover,
  onProductHoverEnd,
  onOpenDetails,
}) {
  const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const imageCarouselRef = useRef(null);

  const isWishlisted = wishlist.some((p) => p._id === product._id);

  let image = product.thumbnail || "/images/placeholder.jpg";

  if (image && !image.startsWith("http") && !image.startsWith("data:image")) {
    image = `${API_BASE}${image}`;
  }

  const images =
    product?.variants?.[0]?.images?.length > 0
      ? product.variants[0].images
        .filter((img) => img?.url)
        .map((img) => {
          const url = img.url;
          return url.startsWith("http") || url.startsWith("data:image")
            ? url
            : `${API_BASE}${url}`;
        })
      : [image];

  const price = product?.minPrice || 0;
  const oldPrice = product?.mrp || null;

  const discount =
    oldPrice && price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : null;

  const rating = product?.rating || 4.4;
  const reviews = product?.numReviews || 150;

  return (
    <div className="product-card-imkaa">
      <div
        className="relative aspect-[8/9] overflow-hidden cursor-pointer no-swiping"
        style={{ background: "var(--color-bg-alt)" }}
        onMouseEnter={onProductHover}
        onMouseLeave={onProductHoverEnd}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenDetails();
        }}
      >
        {isHovered && images.length > 1 ? (
          <Swiper
            ref={imageCarouselRef}
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            loop={true}
            noSwipingClass="no-swiping"
            simulateTouch={false}
            autoplay={{
              delay: 1500,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            allowTouchMove={false}
            className="w-full h-full no-swiping"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenDetails();
            }}
          >
            {images.map((img, index) => (
              <SwiperSlide key={index} className="no-swiping">
                <img
                  src={img}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition cursor-pointer no-swiping"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenDetails();
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-top hover:scale-110 transition cursor-pointer"
          />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!user) {
              toast.error("Please login to use wishlist");
              return;
            }

            isWishlisted
              ? removeFromWishlist(product._id)
              : toggleWishlist(product);
          }}
          className="absolute top-2 right-2 z-20 rounded-full w-[28px] h-[28px] flex items-center justify-center hover:scale-110 transition-transform"
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 6px 18px rgba(74,46,53,0.10)",
          }}
        >
          <Heart
            size={16}
            className={`transition-colors ${isWishlisted
              ? "fill-[#C56F7F] stroke-[#C56F7F]"
              : "stroke-[#C56F7F]"
              }`}
          />
        </button>

        {discount && (
          <div
            className="absolute top-2 left-2 text-[10px] px-2 py-0.5 font-semibold"
            style={{
              background: "var(--color-primary)",
              color: "#FFF9FA",
              borderRadius: 9999,
              boxShadow: "0 6px 18px rgba(74,46,53,0.12)",
            }}
          >
            {discount}% OFF
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 flex flex-col flex-grow">
        <h3 className="product-card-title truncate mb-1">{product.name}</h3>

        <div className="flex items-center gap-1 mb-1">
          <Star size={12} className="fill-[#C56F7F] text-[#C56F7F]" />
          <span
            className="text-[12px] font-semibold"
            style={{ color: "var(--color-primary)" }}
          >
            {rating}
          </span>
          <span className="product-card-meta">({reviews})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="product-card-price">₹{price}</span>

          {oldPrice && (
            <span className="product-card-meta line-through">₹{oldPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
