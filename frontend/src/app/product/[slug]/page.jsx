"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SimilarProducts from "@/components/SimilarProducts";
import ColorTooltip from "@/components/product/ColorTooltip";
import SizeChartModal from "@/components/product/SizeChartModal";
import CalculateSizeModal from "@/components/product/CalculateSizeModal";
import { useCart } from "@/context/CartContext";
import {
  ChevronRight,
  Heart,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const getImageUrl = (url) => {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("data:")) return url;
  if (url.startsWith("http")) return url;
  return API_BASE + url;
};

const formatCurrency = (value) => `\u20B9${Number(value || 0).toLocaleString("en-IN")}`;

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
  const mobileCarouselRef = useRef(null);

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
          const firstSize = firstVariant?.sizes?.[0] || null;
          const firstMedia = firstVariant?.images?.[0]?.url || firstVariant?.video || "";

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
      ...(selectedVariant?.images?.map((img) => ({
        type: "image",
        src: getImageUrl(img.url),
      })) || []),
      ...(selectedVariant?.video
        ? [{ type: "video", src: getImageUrl(selectedVariant.video) }]
        : []),
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
    const nextMedia = getImageUrl(variant.images?.[0]?.url || variant.video || "");
    setSelectedVariant(variant);
    setSelectedSize(variant.sizes?.[0] || null);
    setActiveMedia(nextMedia);
    setMobileActiveIndex(0);
    if (mobileCarouselRef.current) {
      mobileCarouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Select size");
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price,
      image: activeMedia,
      size: selectedSize.size,
      quantity: 1,
    });
    alert("Added to bag");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8f6]">
        <div className="fixed left-0 right-0 top-0 z-[60] border-b border-pink-50 bg-white shadow-sm">
          <Navbar />
        </div>
        <div className="px-4 pb-10 pt-24 text-center text-sm text-[#8c7480]">Loading product...</div>
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
  const activeIsVideo = activeMedia?.includes(".mp4") || activeMedia?.includes("video");

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
          content: <p className="text-[14px] leading-6 text-[#5f4a52]">{product.productDetails}</p>,
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
          content: (
            <div className="grid gap-2 text-[14px] text-[#5f4a52] sm:grid-cols-2">
              {product.sizeAndFits.map((item, index) => (
                <div key={`${item.label}-${index}`} className="rounded-2xl border border-[#f0d9df] bg-[#fff8f6] px-4 py-3">
                  <p className="text-[12px] text-[#9c828d]">{item.label}</p>
                  <p className="mt-1 font-semibold text-[#553842]">{item.value}</p>
                </div>
              ))}
            </div>
          ),
        }
      : null,
    product.specifications?.length
      ? {
          title: "Specifications",
          content: (
            <div className="grid gap-2 text-[14px] text-[#5f4a52] sm:grid-cols-2">
              {product.specifications.map((item, index) => (
                <div key={`${item.key}-${index}`} className="rounded-2xl border border-[#f0d9df] bg-[#fff8f6] px-4 py-3">
                  <p className="text-[12px] text-[#9c828d]">{item.key}</p>
                  <p className="mt-1 font-semibold text-[#553842]">{item.value}</p>
                </div>
              ))}
            </div>
          ),
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#fff8f6]">
      <div className="fixed left-0 right-0 top-0 z-[60] border-b border-pink-50 bg-white shadow-sm">
        <Navbar />
      </div>

      <div className="px-0 pt-[72px] md:px-4 md:pt-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="hidden md:grid md:grid-cols-[minmax(620px,0.95fr)_minmax(360px,0.85fr)] md:gap-9">
            <section className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-4">
              <div className="flex flex-col gap-3">
                {mediaItems.map((media, index) => (
                  <button
                    key={`${media.type}-${index}`}
                    type="button"
                    onClick={() => setActiveMedia(media.src)}
                    onMouseEnter={() => setActiveMedia(media.src)}
                    onFocus={() => setActiveMedia(media.src)}
                    className={`overflow-hidden rounded-2xl border bg-[#fff8f6] ${
                      activeMedia === media.src
                        ? "border-[#c56f7f] shadow-[0_0_0_2px_rgba(197,111,127,0.16)]"
                        : "border-[#ead7dd]"
                    }`}
                  >
                    {media.type === "video" ? (
                      <video src={media.src} muted className="aspect-[4/5] h-full w-full object-cover" />
                    ) : (
                      <img src={media.src} alt={`${product.name} ${index + 1}`} className="aspect-[4/5] h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-[28px] bg-[#fff] shadow-[0_8px_28px_rgba(74,46,53,0.06)]">
                {activeIsVideo ? (
                  <video src={activeMedia} controls autoPlay className="min-h-[620px] w-full object-cover" />
                ) : (
                  <img src={activeMedia} alt={product.name} className="min-h-[620px] w-full object-cover" />
                )}
              </div>
            </section>

            <section className="space-y-6 rounded-[28px] border border-[#ead7dd] bg-white p-7 shadow-[0_8px_28px_rgba(74,46,53,0.06)]">
              <div className="space-y-2">
                {product.brand ? (
                  <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#c56f7f]">{product.brand}</p>
                ) : null}
                <h1 className="font-['Playfair_Display'] text-[clamp(28px,3vw,38px)] font-semibold leading-[1.12] text-[#4a2e35]">
                  {product.name}
                </h1>
                {product.description ? (
                  <p className="text-[15px] leading-6 text-[#6f5560]">{product.description}</p>
                ) : null}
                {product.rating > 0 ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ead7dd] bg-[#fff8f6] px-3 py-2 text-[13px] font-semibold text-[#2f7d63]">
                    <Star size={14} className="fill-current" />
                    <span>{product.rating}</span>
                    <span className="text-[#b7a1a9]">|</span>
                    <span>{product.numReviews || 0} Ratings</span>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-[#f1e4e8] pt-5">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-[34px] font-bold text-[#9e4c60]">{formatCurrency(price)}</span>
                  {mrp ? <span className="text-[16px] text-[#ad98a1] line-through">{formatCurrency(mrp)}</span> : null}
                  {discount > 0 ? <span className="text-[15px] font-bold text-[#d66d52]">({discount}% OFF)</span> : null}
                </div>
              </div>

              {product.variants?.length ? (
                <div className="space-y-4">
                  <p className="text-[14px] font-bold uppercase tracking-[0.08em] text-[#4a2e35]">Available Colors</p>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant, index) => {
                      const previewImage = getImageUrl(variant.images?.[0]?.url);
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
                            className={`h-11 w-11 overflow-hidden rounded-full border-2 ${
                              selectedVariant?.color === variant.color
                                ? "border-[#c56f7f] shadow-[0_0_0_3px_rgba(197,111,127,0.15)]"
                                : "border-[#dfccd2]"
                            }`}
                          >
                            {isImageSwatch ? (
                              <img src={getImageUrl(variant.colorCode)} alt={variant.color} className="h-full w-full object-cover" />
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
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[14px] font-bold uppercase tracking-[0.08em] text-[#4a2e35]">Select Size</p>
                    <div className="flex items-center gap-2 text-[13px] font-semibold uppercase text-[#c56f7f]">
                      <button type="button" onClick={() => setShowSizeChart(true)}>Size Chart</button>
                      <span className="text-[#c5a7b1]">|</span>
                      <button type="button" onClick={() => setShowCalcSize(true)}>Calculate Your Size</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedVariant.sizes.map((sizeItem, index) => (
                      <button
                        key={`${sizeItem.size}-${index}`}
                        type="button"
                        disabled={sizeItem.stock === 0}
                        onClick={() => setSelectedSize(sizeItem)}
                        className={`h-12 w-12 rounded-full border text-sm font-semibold ${
                          selectedSize?.size === sizeItem.size
                            ? "border-[#c56f7f] bg-[#c56f7f] text-white"
                            : "border-[#dfccd2] bg-white text-[#4a2e35]"
                        } ${sizeItem.stock === 0 ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        {sizeItem.size}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-[minmax(0,1fr)_180px] gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#c56f7f] px-5 text-[15px] font-semibold text-[#fff9fa]"
                >
                  <ShoppingBag size={18} />
                  Add to Bag
                </button>
                <button
                  type="button"
                  className="flex h-[52px] items-center justify-center gap-2 rounded-full border border-[#e8b7c2] bg-[#fff4f6] px-5 text-[15px] font-semibold text-[#a35668]"
                >
                  <Heart size={18} />
                  Wishlist
                </button>
              </div>

              <div className="space-y-3 border-y border-[#f1e4e8] py-5">
                <div className="flex items-center gap-3 text-[14px] text-[#6f5560]"><Truck size={16} /> Delivery options available</div>
                <div className="flex items-center gap-3 text-[14px] text-[#6f5560]"><ShieldCheck size={16} /> 100% original products</div>
                <div className="flex items-center gap-3 text-[14px] text-[#6f5560]"><Ruler size={16} /> Easy size guidance for better fit</div>
              </div>
            </section>
          </div>

          <div className="mt-5 hidden gap-4 md:grid md:grid-cols-2">
            {detailSections.map((section, index) => (
              <section
                key={`${section.title}-${index}`}
                className={`rounded-[22px] border border-[#ead7dd] bg-white p-5 shadow-[0_4px_18px_rgba(74,46,53,0.04)] ${
                  section.title === "Specifications" || section.title === "Customer Reviews" ? "" : ""
                }`}
              >
                <h3 className="font-['Inter'] text-[22px] font-bold text-[#4a2e35]">{section.title}</h3>
                <div className="mt-3">{section.content}</div>
              </section>
            ))}

            {topReviews.length ? (
              <section className="rounded-[22px] border border-[#ead7dd] bg-white p-5 shadow-[0_4px_18px_rgba(74,46,53,0.04)] md:col-span-2">
                <h3 className="font-['Inter'] text-[22px] font-bold text-[#4a2e35]">Customer Reviews</h3>
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
              </section>
            ) : null}
          </div>

          <div className="block md:hidden">
            <section className="bg-white">
              <div
                ref={mobileCarouselRef}
                onScroll={handleMobileCarouselScroll}
                className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
              >
                {mediaItems.map((media, index) => (
                  <div key={`${media.type}-${index}`} className="relative min-w-full snap-center">
                    {media.type === "video" ? (
                      <video src={media.src} controls autoPlay className="h-[520px] w-full rounded-b-[28px] object-cover" />
                    ) : (
                      <img src={media.src} alt={`${product.name} ${index + 1}`} className="h-[520px] w-full rounded-b-[28px] object-cover" />
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
                <div className="flex justify-center gap-1.5 py-3">
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

              <div className="px-4 pb-2">
                <div className="rounded-[22px] bg-white py-2">
                  {product.brand ? (
                    <p className="mb-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[#c56f7f]">{product.brand}</p>
                  ) : null}
                  <h1 className="font-['Inter'] text-[24px] font-semibold leading-[1.2] text-[#2f2428]">
                    {product.name}
                  </h1>
                  {product.description ? (
                    <p className="mt-1 text-[14px] leading-5 text-[#5f4a52]">{product.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[14px] text-[#7f6a72]">MRP</span>
                    <span className="text-[22px] font-bold text-[#9e4c60]">{formatCurrency(price)}</span>
                    {mrp > price ? <span className="text-[13px] text-[#ad98a1] line-through">{formatCurrency(mrp)}</span> : null}
                    {discount > 0 ? <span className="text-[13px] font-semibold text-[#d66d52]">({discount}% OFF)</span> : null}
                  </div>
                </div>

                {product.variants?.length ? (
                  <div className="mt-3 rounded-[22px] border border-[#f0d9df] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-[#3e2f35]">
                        Colour <span className="font-normal text-[#7f6a72]">{selectedVariant?.color || ""}</span>
                      </p>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {product.variants.map((variant, index) => {
                        const previewImage = getImageUrl(variant.images?.[0]?.url);
                        return (
                          <button
                            key={`${variant.color}-${index}`}
                            type="button"
                            onClick={() => handleVariantChange(variant)}
                            className={`relative h-16 w-16 min-w-16 overflow-hidden rounded-2xl border-2 ${
                              selectedVariant?.color === variant.color ? "border-[#c56f7f]" : "border-[#f0d9df]"
                            }`}
                          >
                            <img src={previewImage} alt={variant.color} className="h-full w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {selectedVariant?.sizes?.length ? (
                  <div className="mt-3 rounded-[22px] border border-[#f0d9df] bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-[15px] font-semibold text-[#2f2428]">Select Size</p>
                      <button type="button" onClick={() => setShowSizeChart(true)} className="text-[13px] font-semibold text-[#c56f7f]">
                        Size Chart
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {selectedVariant.sizes.map((sizeItem, index) => (
                        <button
                          key={`${sizeItem.size}-${index}`}
                          type="button"
                          disabled={sizeItem.stock === 0}
                          onClick={() => setSelectedSize(sizeItem)}
                          className={`flex h-14 min-w-14 items-center justify-center rounded-2xl border text-[18px] font-semibold ${
                            selectedSize?.size === sizeItem.size
                              ? "border-[#c56f7f] bg-[#c56f7f] text-white"
                              : "border-[#ead7dd] bg-white text-[#3a2c31]"
                          } ${sizeItem.stock === 0 ? "cursor-not-allowed opacity-40" : ""}`}
                        >
                          {sizeItem.size}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#ead7dd] bg-white text-[15px] font-semibold text-[#4a2e35]"
                  >
                    <Heart size={18} />
                    Wishlist
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff4f86] text-[15px] font-semibold text-white shadow-[0_10px_20px_rgba(255,79,134,0.18)]"
                  >
                    <ShoppingBag size={18} />
                    Add to Bag
                  </button>
                </div>

                <div className="mt-4 rounded-[22px] border border-[#ead7dd] bg-white p-4">
                  <h2 className="text-[17px] font-semibold text-[#2f2428]">Check Delivery</h2>
                  <div className="mt-3 rounded-2xl border border-[#ead7dd] px-4 py-3 text-[14px] font-semibold text-[#d95b7d]">
                    Enter PIN Code
                  </div>

                  <div className="mt-4 space-y-4 text-[14px] leading-5 text-[#4e3b42]">
                    <div className="flex items-start gap-3">
                      <Truck size={18} className="mt-0.5 shrink-0" />
                      <p><span className="font-semibold text-[#2f2428]">Express delivery</span> might be available</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                      <p><span className="font-semibold text-[#2f2428]">Pay on delivery</span> might be available</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Ruler size={18} className="mt-0.5 shrink-0" />
                      <p><span className="font-semibold text-[#2f2428]">Easy return support</span> for sizing and product issues</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[22px] border border-[#ead7dd] bg-white p-4">
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

      {showSizeChart ? <SizeChartModal onClose={() => setShowSizeChart(false)} /> : null}
      {showCalcSize ? <CalculateSizeModal onClose={() => setShowCalcSize(false)} /> : null}
      <Footer />
    </div>
  );
}
