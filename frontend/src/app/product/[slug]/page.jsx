"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SimilarProducts from "@/components/SimilarProducts";
import ColorTooltip from "@/components/product/ColorTooltip";
import DeliveryPincodeChecker from "@/components/product/DeliveryPincodeChecker";
import SizeChartModal from "@/components/product/SizeChartModal";
import CalculateSizeModal from "@/components/product/CalculateSizeModal";
import { useCart } from "@/context/CartContext";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import {
  AsyncImage,
  ButtonLoaderLabel,
  ProductPageSkeleton,
} from "@/components/loaders/Loaders";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api";
import { FALLBACK_PRODUCT_IMAGE, resolveImageUrl } from "@/lib/images";

const getImageUrl = (url) => {
  return resolveImageUrl(url);
};

const formatCurrency = (value) => `\u20B9${Number(value || 0).toLocaleString("en-IN")}`;
const isSizeInStock = (sizeItem) => Number(sizeItem?.stock || 0) > 0;
const getFirstInStockSize = (sizes = []) => sizes.find(isSizeInStock) || null;

const normalizeRichText = (value) => {
  if (!value) return "";
  return String(value).replace(/\sdata-(start|end)="[^"]*"/g, "");
};

const DetailList = ({ items = [], labelKey, valueKey }) => (
  <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
    {items.map((item, index) => (
      <div
        key={`${item[labelKey]}-${index}`}
        className="border-b border-[#f1e4e8] py-3"
      >
        <p className="text-[12px] text-[#8c7480]">{item[labelKey]}</p>
        <p className="mt-1 text-[14px] font-medium leading-5 text-[#4a2e35]">{item[valueKey]}</p>
      </div>
    ))}
  </div>
);

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [activeMedia, setActiveMedia] = useState("");
  const [loading, setLoading] = useState(true);
  const [hoveredColor, setHoveredColor] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showCalcSize, setShowCalcSize] = useState(false);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const mobileCarouselRef = useRef(null);
  const mobileAddToCartRef = useRef(null);
  const [showStickyBuyBar, setShowStickyBuyBar] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products/slug/${slug}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          const nextProduct = data.product;
          const firstVariant = nextProduct.variants?.[0] || null;
          const firstSize = getFirstInStockSize(firstVariant?.sizes || []);
          const firstMedia = firstVariant?.video || firstVariant?.images?.[0]?.url || firstVariant?.images?.[0] || "";

          setProduct(nextProduct);
          setSelectedVariant(firstVariant);
          setSelectedSize(firstSize);
          setActiveMedia(getImageUrl(firstMedia));
          setMobileActiveIndex(0);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  const mediaItems = useMemo(
    () => [
      ...(selectedVariant?.video
        ? [{ type: "video", src: getImageUrl(selectedVariant.video) }]
        : []),
      ...(selectedVariant?.images?.map((img) => ({
        type: "image",
        src: getImageUrl(img?.url || img),
      })) || []),
    ],
    [selectedVariant]
  );

  useEffect(() => {
    if (!mediaItems.length) return;
    const nextIndex = Math.max(
      0,
      mediaItems.findIndex((media) => media.src === activeMedia)
    );
    const resolvedIndex = nextIndex === -1 ? 0 : nextIndex;
    setMobileActiveIndex(resolvedIndex);
    if (!activeMedia) {
      setActiveMedia(mediaItems[0].src);
    }
  }, [mediaItems, activeMedia]);

  useEffect(() => {
    const target = mobileAddToCartRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBuyBar(!entry.isIntersecting);
      },
      { threshold: 0.35 }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [product, selectedVariant, selectedSize]);

  const handleMobileCarouselScroll = () => {
    if (!mobileCarouselRef.current || !mediaItems.length) return;
    const { scrollLeft, clientWidth } = mobileCarouselRef.current;
    const nextIndex = Math.round(scrollLeft / clientWidth);
    if (nextIndex !== mobileActiveIndex && mediaItems[nextIndex]) {
      setMobileActiveIndex(nextIndex);
      setActiveMedia(mediaItems[nextIndex].src);
    }
  };

  const handleVariantChange = (variant) => {
    const nextMedia = getImageUrl(variant.video || variant.images?.[0]?.url || variant.images?.[0] || "");
    setSelectedVariant(variant);
    setSelectedSize(getFirstInStockSize(variant.sizes || []));
    setActiveMedia(nextMedia);
    setMobileActiveIndex(0);
    if (mobileCarouselRef.current) {
      mobileCarouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Select size");
      return;
    }

    if (!isSizeInStock(selectedSize)) {
      toast.error("This size is out of stock");
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart({
        productId: product._id,
        name: product.name,
        price,
        image: activeMedia,
        size: selectedSize.size,
        quantity: 1,
      });
      toast.success("Added to bag");
    } finally {
      setAddingToCart(false);
    }
  };

  const openLightbox = (index) => {
    if (!mediaItems[index]) return;
    setLightboxIndex(index);
    setActiveMedia(mediaItems[index].src);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const goToLightboxMedia = (direction) => {
    setLightboxIndex((current) => {
      if (current === null || !mediaItems.length) return current;
      const nextIndex = (current + direction + mediaItems.length) % mediaItems.length;
      setActiveMedia(mediaItems[nextIndex].src);
      return nextIndex;
    });
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") goToLightboxMedia(-1);
      if (event.key === "ArrowRight") goToLightboxMedia(1);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, mediaItems.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f6]">
        <div className="fixed left-0 right-0 top-0 z-[60] border-b border-pink-50 bg-white shadow-sm">
          <Navbar />
        </div>
        <ProductPageSkeleton />
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fff8f6]">
        <div className="fixed left-0 right-0 top-0 z-[60] border-b border-pink-50 bg-white shadow-sm">
          <Navbar />
        </div>
        <div className="px-4 pb-10 pt-24 text-center text-sm text-[#8c7480]">Product not found.</div>
        <Footer />
      </div>
    );
  }

  const price = selectedSize?.price || product.minPrice || 0;
  const mrp = selectedSize?.mrp || product.mrp || 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const topReviews = product.reviews?.slice(0, 5) || [];
  const selectedSizeOutOfStock = selectedSize ? !isSizeInStock(selectedSize) : true;

  const detailSections = [
    product.materialCare?.length
      ? {
        title: "Fabrics & Care",
        content: (
          <div className="space-y-2 text-[14px] leading-6 text-[#5f4a52]">
            {product.materialCare.map((item, index) => (
              <p key={`${item}-${index}`}>{item}</p>
            ))}
          </div>
        ),
      }
      : null,
    product.productDetails
      ? {
        title: "Product Details",
        content: (
          <div
            className="prose prose-p:my-0 prose-ul:my-0 prose-li:my-1 max-w-none text-[14px] leading-6 text-[#5f4a52] prose-strong:text-[#4a2e35]"
            dangerouslySetInnerHTML={{ __html: normalizeRichText(product.productDetails) }}
          />
        ),
      }
      : null,
    product.features?.length
      ? {
        title: "Features",
        content: (
          <ul className="space-y-2 pl-4 text-[14px] leading-6 text-[#5f4a52]">
            {product.features.map((feature, index) => (
              <li key={`${feature}-${index}`}>{feature}</li>
            ))}
          </ul>
        ),
      }
      : null,
    product.sizeAndFits?.length
      ? {
        title: "Size & Fit",
        content: <DetailList items={product.sizeAndFits} labelKey="label" valueKey="value" />,
      }
      : null,
    product.specifications?.length
      ? {
        title: "Specifications",
        content: <DetailList items={product.specifications} labelKey="key" valueKey="value" />,
      }
      : null,
  ].filter(Boolean);
  const lightboxMedia = lightboxIndex !== null ? mediaItems[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed left-0 right-0 top-0 z-[60] border-b border-pink-50 bg-white shadow-sm">
        <Navbar />
      </div>

      <div className="px-0 pt-[72px] md:px-6 md:pt-24 2xl:px-8">
        <div className="mx-auto max-w-[1880px]">
          <div className="hidden lg:grid lg:grid-cols-[minmax(620px,1fr)_minmax(360px,520px)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(760px,1fr)_minmax(420px,540px)]">
            <section className="grid grid-cols-2 gap-3 xl:gap-4">
              {mediaItems.map((media, index) => (
                <button
                  key={`${media.type}-${index}`}
                  type="button"
                  onClick={() => openLightbox(index)}
                  onMouseEnter={() => setActiveMedia(media.src)}
                  onFocus={() => setActiveMedia(media.src)}
                  className={`group overflow-hidden bg-[#fff3f5] text-left ${activeMedia === media.src ? "outline outline-2 outline-[#c56f7f]" : ""}`}
                >
                  {media.type === "video" ? (
                    <video
                      src={media.src}
                      muted
                      autoPlay
                      loop
                      playsInline
                      className="aspect-[3/4] h-full w-full object-cover"
                    />
                  ) : (
                    <AsyncImage
                      src={media.src}
                      alt={`${product.name} ${index + 1}`}
                      className="aspect-[3/4] h-full w-full transition duration-300 group-hover:scale-[1.02]"
                      skeletonClassName=""
                    />
                  )}
                </button>
              ))}
            </section>

            <section className="space-y-5 bg-white px-2 pb-8 xl:px-4">
              <div className="space-y-2 border-b border-[#f1e4e8] pb-4">
                {product.brand ? (
                  <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#c56f7f]">{product.brand}</p>
                ) : null}
                <h1 className="font-['Inter'] text-[22px] font-semibold leading-[1.25] text-[#282c3f] xl:text-[24px]">
                  {product.name}
                </h1>
                {product.description ? (
                  <p className="max-w-[52ch] text-[14px] leading-6 text-[#6f5560]">{product.description}</p>
                ) : null}
                {product.rating > 0 ? (
                  <div className="inline-flex items-center gap-2 border border-[#dfe1e8] px-3 py-1.5 text-[13px] font-semibold text-[#2f7d63]">
                    <span>{product.rating}</span>
                    <Star size={13} className="fill-current" />
                    <span className="text-[#b7a1a9]">|</span>
                    <span className="text-[#6f5560]">{product.numReviews || 0} Ratings</span>
                  </div>
                ) : null}
              </div>

              <div className="border-b border-[#f1e4e8] pb-5">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="text-[24px] font-bold text-[#282c3f]">{formatCurrency(price)}</span>
                  {mrp ? <span className="text-[15px] text-[#8c7480] line-through">{formatCurrency(mrp)}</span> : null}
                  {discount > 0 ? <span className="text-[14px] font-bold text-[#c56f7f]">({discount}% OFF)</span> : null}
                </div>
                <p className="mt-1 text-[12px] font-medium text-[#2f7d63]">Inclusive of all taxes</p>
              </div>

              {product.variants?.length ? (
                <div className="space-y-3">
                  <p className="text-[14px] font-bold uppercase tracking-[0.04em] text-[#282c3f]">
                    Colour <span className="font-medium normal-case tracking-normal text-[#6f5560]">{selectedVariant?.color || ""}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant, index) => {
                      const previewImage = getImageUrl(variant.images?.[0]?.url || variant.images?.[0]);
                      const isImageSwatch =
                        variant.colorCode?.startsWith("http") || variant.colorCode?.startsWith("data:");

                      return (
                        <div
                          key={`${variant.color}-${index}`}
                          className="relative"
                          onMouseEnter={() => setHoveredColor({ color: variant.color, image: previewImage })}
                          onMouseLeave={() => setHoveredColor(null)}
                        >
                          {hoveredColor?.color === variant.color ? <ColorTooltip color={variant.color} image={previewImage} /> : null}
                          <button
                            type="button"
                            onClick={() => handleVariantChange(variant)}
                            className={`h-12 w-12 overflow-hidden rounded-full border-2 ${selectedVariant?.color === variant.color
                              ? "border-[#c56f7f]"
                              : "border-[#dfccd2]"
                              }`}
                          >
                            {isImageSwatch ? (
                              <AsyncImage
                                src={getImageUrl(variant.colorCode)}
                                alt={variant.color}
                                className="h-full w-full rounded-full"
                                skeletonClassName="rounded-full"
                              />
                            ) : (
                              <span className="block h-full w-full" style={{ backgroundColor: variant.colorCode || "#d9ced3" }} />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {selectedVariant?.sizes?.length ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[14px] font-bold uppercase tracking-[0.04em] text-[#282c3f]">Select Size</p>
                    <div className="flex items-center gap-2 text-[12px] font-semibold uppercase text-[#c56f7f]">
                      <button type="button" onClick={() => setShowSizeChart(true)}>Size Chart</button>
                      <span className="text-[#c5a7b1]">|</span>
                      <button type="button" onClick={() => setShowCalcSize(true)}>Calculate Size</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedVariant.sizes.map((sizeItem, index) => {
                      const isOutOfStock = !isSizeInStock(sizeItem);

                      return (
                        <button
                          key={`${sizeItem.size}-${index}`}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(sizeItem)}
                          className={`relative h-11 min-w-11 overflow-hidden rounded-full border px-3 text-sm font-semibold ${selectedSize?.size === sizeItem.size
                            ? "border-[#c56f7f] bg-[#c56f7f] text-white"
                            : "border-[#dfccd2] bg-white text-[#282c3f]"
                            } ${isOutOfStock ? "cursor-not-allowed opacity-45" : ""}`}
                        >
                          {sizeItem.size}
                          {isOutOfStock ? (
                            <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current opacity-70" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-[minmax(0,1fr)_170px] gap-3 border-b border-[#f1e4e8] pb-5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart || selectedSizeOutOfStock}
                  className="flex h-[50px] items-center justify-center gap-2 bg-[#c56f7f] px-5 text-[14px] font-bold uppercase tracking-[0.03em] text-[#fff9fa] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingToCart ? (
                    <ButtonLoaderLabel label="Adding..." />
                  ) : (
                    <>
                      <ShoppingBag size={17} />
                      {selectedSizeOutOfStock ? "Out of Stock" : "Add to Bag"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="flex h-[50px] items-center justify-center gap-2 border border-[#d9dce4] bg-white px-5 text-[14px] font-bold uppercase tracking-[0.03em] text-[#282c3f]"
                >
                  <Heart size={17} />
                  Wishlist
                </button>
              </div>

              <DeliveryPincodeChecker productId={product._id} />

              {detailSections.length ? (
                <div className="space-y-5">
                  {detailSections.map((section, index) => (
                    <section key={`${section.title}-${index}`} className={`${index > 0 ? "border-t border-[#f1e4e8] pt-5" : ""}`}>
                      <h3 className="font-['Inter'] text-[16px] font-bold uppercase tracking-[0.04em] text-[#282c3f]">{section.title}</h3>
                      <div className="mt-3">{section.content}</div>
                    </section>
                  ))}
                </div>
              ) : null}

              {topReviews.length ? (
                <section className={`${detailSections.length ? "border-t border-[#f1e4e8] pt-5" : ""}`}>
                  <h3 className="font-['Inter'] text-[16px] font-bold uppercase tracking-[0.04em] text-[#282c3f]">Customer Reviews</h3>
                  <div className="mt-4 space-y-4">
                    {topReviews.map((review, index) => (
                      <div key={`${review.comment}-${index}`} className="border-b border-[#f1e4e8] pb-4">
                        <div className="mb-2 inline-flex items-center gap-1 bg-[#2f9f8f] px-1.5 py-0.5 text-[12px] font-bold text-white">
                          <span>{review.rating}</span>
                          <Star size={11} className="fill-current" />
                        </div>
                        <p className="text-[14px] leading-6 text-[#282c3f]">{review.comment}</p>
                        {review.userName ? (
                          <p className="mt-2 text-[12px] text-[#8c7480]">{review.userName}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/product/${slug}/reviews`)}
                    className="mt-4 inline-flex items-center gap-1 text-[14px] font-bold text-[#c56f7f]"
                  >
                    View All Reviews <ChevronRight size={16} />
                  </button>
                </section>
              ) : null}
            </section>
          </div>

          <div className="block lg:hidden">
            <section className="bg-white pb-2">
              <div
                ref={mobileCarouselRef}
                onScroll={handleMobileCarouselScroll}
                className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth bg-white"
              >
                {mediaItems.map((media, index) => (
                  <div
                    key={`${media.type}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openLightbox(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") openLightbox(index);
                    }}
                    className="relative min-w-full snap-center"
                  >
                    {media.type === "video" ? (
                      <video
                        src={media.src}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="h-[420px] w-full object-cover sm:h-[560px]"
                      />
                    ) : (
                      <AsyncImage
                        src={media.src}
                        alt={`${product.name} ${index + 1}`}
                        className="h-[420px] w-full sm:h-[560px]"
                        skeletonClassName=""
                      />
                    )}
                    {index === mobileActiveIndex && product.rating > 0 ? (
                      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-[rgba(255,255,255,0.94)] px-3 py-1.5 text-[13px] font-semibold text-[#2f7d63] shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                        <span>{product.rating}</span>
                        <Star size={12} className="fill-current" />
                        <span className="text-[#7f6a72]">|</span>
                        <span className="text-[#7f6a72]">{product.numReviews || 0}</span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {mediaItems.length > 1 ? (
                <div className="flex justify-center gap-1.5 bg-white py-3">
                  {mediaItems.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setMobileActiveIndex(index);
                        setActiveMedia(mediaItems[index].src);
                        mobileCarouselRef.current?.scrollTo({
                          left: (mobileCarouselRef.current?.clientWidth || 0) * index,
                          behavior: "smooth",
                        });
                      }}
                      className={`h-1.5 rounded-full transition-all ${mobileActiveIndex === index ? "w-5 bg-[#c56f7f]" : "w-1.5 bg-[#d8c2c9]"}`}
                    />
                  ))}
                </div>
              ) : null}

              <div className="px-4 pb-2 pt-2 sm:px-5">
                <div className="border-b border-[#f1e4e8] pb-5 pt-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {product.brand ? (
                        <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.08em] text-[#c56f7f]">{product.brand}</p>
                      ) : null}
                      <h1 className="font-['Inter'] text-[22px] font-semibold leading-[1.2] text-[#2f2428] sm:text-[26px]">
                        {product.name}
                      </h1>
                      {product.description ? (
                        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#665159] sm:text-[14px]">{product.description}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f0d9df] bg-white text-[#7a5d66]"
                    >
                      <Heart size={18} />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end gap-x-2 gap-y-1">
                    <span className="text-[13px] text-[#7f6a72]">MRP</span>
                    <span className="text-[28px] font-bold leading-none text-[#2f2428]">{formatCurrency(price)}</span>
                    {mrp > price ? <span className="text-[15px] text-[#ad98a1] line-through">{formatCurrency(mrp)}</span> : null}
                    {discount > 0 ? <span className="rounded-md bg-[#fff1f5] px-2 py-1 text-[12px] font-bold text-[#c56f7f]">{discount}% OFF</span> : null}
                  </div>

                  {discount > 0 ? (
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] bg-[#fff5f8] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[13px] font-semibold text-[#2f2428]">Deal price</p>
                          <p className="mt-1 text-[20px] font-bold text-[#2f2428]">{formatCurrency(price)}</p>
                        </div>
                        <div className="rounded-full bg-[#c56f7f] px-3 py-1 text-[12px] font-bold text-white">
                          Save {formatCurrency(mrp - price)}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {product.variants?.length ? (
                  <div className="border-b border-[#f1e4e8] py-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[16px] font-semibold text-[#2f2428]">
                        Colour <span className="font-normal text-[#7f6a72]">{selectedVariant?.color || ""}</span>
                      </p>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {product.variants.map((variant, index) => {
                        const previewImage = getImageUrl(variant.images?.[0]?.url || variant.images?.[0]);
                        return (
                          <button
                            key={`${variant.color}-${index}`}
                            type="button"
                            onClick={() => handleVariantChange(variant)}
                            className={`relative h-20 w-16 min-w-16 overflow-hidden rounded-[18px] border-2 bg-[#fff8fa] ${selectedVariant?.color === variant.color ? "border-[#d96b88] shadow-[0_0_0_2px_rgba(217,107,136,0.14)]" : "border-[#f0d9df]"
                              }`}
                          >
                            <AsyncImage
                              src={previewImage}
                              alt={variant.color}
                              className="h-full w-full rounded-[16px]"
                              skeletonClassName="rounded-[16px]"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {selectedVariant?.sizes?.length ? (
                  <div className="border-b border-[#f1e4e8] py-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[16px] font-semibold text-[#2f2428]">Select Size</p>
                      <button type="button" onClick={() => setShowSizeChart(true)} className="text-[13px] font-semibold text-[#c56f7f]">
                        Size Chart
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {selectedVariant.sizes.map((sizeItem, index) => {
                        const isOutOfStock = !isSizeInStock(sizeItem);

                        return (
                          <button
                            key={`${sizeItem.size}-${index}`}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => setSelectedSize(sizeItem)}
                            className={`relative flex h-14 min-w-[64px] items-center justify-center overflow-hidden rounded-[18px] border px-4 text-[18px] font-semibold ${selectedSize?.size === sizeItem.size
                              ? "border-[#c56f7f] bg-[#c56f7f] text-white"
                              : "border-[#ead7dd] bg-white text-[#3a2c31]"
                              } ${isOutOfStock ? "cursor-not-allowed opacity-45" : ""}`}
                          >
                            {sizeItem.size}
                            {isOutOfStock ? (
                              <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current opacity-70" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div ref={mobileAddToCartRef} className="py-5">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingToCart || selectedSizeOutOfStock}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-[18px] bg-[#c56f7f] text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(197,111,127,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {addingToCart ? (
                      <ButtonLoaderLabel label="Adding..." />
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        {selectedSizeOutOfStock ? "Out of Stock" : "Add to Bag"}
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-[#f1e4e8] py-5">
                  <DeliveryPincodeChecker productId={product._id} title="Check Delivery" compact />
                </div>

                <div className="border-t border-[#f1e4e8] py-5">
                  {detailSections.map((section, index) => (
                    <div key={`${section.title}-${index}`} className={`${index > 0 ? "mt-5 border-t border-[#f2e3e8] pt-5" : ""}`}>
                      <h3 className="text-[16px] font-semibold text-[#2f2428]">{section.title}</h3>
                      <div className="mt-2">{section.content}</div>
                    </div>
                  ))}

                  {topReviews.length ? (
                    <div className={`${detailSections.length ? "mt-5 border-t border-[#f2e3e8] pt-5" : ""}`}>
                      <h3 className="text-[16px] font-semibold text-[#2f2428]">Customer Reviews</h3>
                      <div className="mt-3 space-y-3">
                        {topReviews.map((review, index) => (
                          <div key={`${review.comment}-${index}`} className="rounded-2xl border border-[#f0d9df] bg-[#fffdfd] px-4 py-3">
                            <div className="mb-2 inline-flex items-center gap-2 text-[13px] font-bold text-[#2f7d63]">
                              <Star size={13} className="fill-current" />
                              <span>{review.rating}</span>
                            </div>
                            <p className="text-[14px] leading-6 text-[#5f4a52]">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push(`/product/${slug}/reviews`)}
                        className="mt-4 inline-flex items-center gap-1 text-[14px] font-bold text-[#c56f7f]"
                      >
                        View All Reviews <ChevronRight size={16} />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          </div>

          <SimilarProducts currentProduct={product} />
        </div>
      </div>

      {lightboxMedia ? (
        <div className="fixed inset-0 z-[90] bg-[#263b2b] lg:bg-white">
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close media viewer"
            className="absolute left-3 top-3 z-[93] flex h-11 w-11 items-center justify-center text-[#282c3f] lg:left-5 lg:top-5"
          >
            <X size={30} strokeWidth={1.8} />
          </button>

          <div className="flex h-full w-full items-center justify-center px-0 py-6 lg:px-16 lg:py-12">
            <div className="relative flex h-[min(88vh,900px)] w-full max-w-[min(100vw,560px)] items-center justify-center bg-white lg:h-full lg:max-w-none">
              {lightboxMedia.type === "video" ? (
                <video
                  key={lightboxMedia.src}
                  src={lightboxMedia.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[82vh] max-w-[94vw] object-contain lg:max-h-[88vh] lg:max-w-[82vw]"
                />
              ) : (
                <img
                  key={lightboxMedia.src}
                  src={lightboxMedia.src}
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                  }}
                  alt={`${product.name} full view ${lightboxIndex + 1}`}
                  className="max-h-[82vh] max-w-[94vw] object-contain lg:max-h-[88vh] lg:max-w-[82vw]"
                />
              )}
            </div>
          </div>

          {mediaItems.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => goToLightboxMedia(-1)}
                aria-label="Previous media"
                className="absolute left-4 top-1/2 z-[92] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#282c3f] shadow-[0_4px_16px_rgba(0,0,0,0.12)] lg:left-6 lg:h-20 lg:w-11 lg:rounded-md"
              >
                <ChevronLeft size={28} strokeWidth={2.3} />
              </button>
              <button
                type="button"
                onClick={() => goToLightboxMedia(1)}
                aria-label="Next media"
                className="absolute right-4 top-1/2 z-[92] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#282c3f] shadow-[0_4px_16px_rgba(0,0,0,0.12)] lg:right-6 lg:h-20 lg:w-11 lg:rounded-md"
              >
                <ChevronRight size={28} strokeWidth={2.3} />
              </button>

              <div className="absolute bottom-5 left-1/2 z-[92] flex -translate-x-1/2 items-center gap-2 lg:bottom-7">
                {mediaItems.map((media, index) => (
                  <button
                    key={`${media.type}-dot-${index}`}
                    type="button"
                    onClick={() => {
                      setLightboxIndex(index);
                      setActiveMedia(media.src);
                    }}
                    aria-label={`Open media ${index + 1}`}
                    className={`h-2 rounded-full transition-all ${index === lightboxIndex ? "w-4 bg-[#8c8c8c]" : "w-2 bg-[#d7d7d7]"}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-[#f0d9df] bg-[rgba(255,255,255,0.96)] px-3 py-3 shadow-[0_-10px_26px_rgba(74,46,53,0.08)] backdrop-blur transition-transform duration-200 lg:hidden ${
          showStickyBuyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-[1240px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9a8089]">Price</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[20px] font-bold leading-none text-[#2f2428]">{formatCurrency(price)}</span>
              {mrp > price ? <span className="text-[12px] text-[#ad98a1] line-through">{formatCurrency(mrp)}</span> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart || selectedSizeOutOfStock}
            className="flex h-12 min-w-[176px] items-center justify-center gap-2 rounded-[16px] bg-[#c56f7f] px-5 text-[15px] font-semibold text-white shadow-[0_12px_24px_rgba(197,111,127,0.2)] disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[220px]"
          >
            {addingToCart ? (
              <ButtonLoaderLabel label="Adding..." />
            ) : (
              <>
                <ShoppingBag size={18} />
                {selectedSizeOutOfStock ? "Out of Stock" : "Add to Bag"}
              </>
            )}
          </button>
        </div>
      </div>

      {showSizeChart ? (
        <SizeChartModal
          onClose={() => setShowSizeChart(false)}
          category={selectedVariant?.category || product?.category || product?.mainCategory}
        />
      ) : null}
      {product?.category === "bra" && showCalcSize ? (
        <CalculateSizeModal onClose={() => setShowCalcSize(false)} />
      ) : null}
      <Footer />
    </div>
  );
}
