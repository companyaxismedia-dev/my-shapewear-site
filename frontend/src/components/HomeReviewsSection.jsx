"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Star,
  Quote,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { API_BASE } from "@/lib/api";

function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function StarsRow({ rating = 5 }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={
            star <= safeRating
              ? "fill-current text-[var(--color-primary)]"
              : "text-[#E8B7C2]"
          }
        />
      ))}
    </div>
  );
}

export default function HomeReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const sliderRef = useRef(null);
  const autoSlideRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const pauseRef = useRef(false);

  const toggleExpand = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    let ignore = false;

    const fetchHomeReviews = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE}/api/reviews/home`, {
          cache: "no-store",
        });

        const data = await res.json();
        const rawReviews = Array.isArray(data?.reviews) ? data.reviews : [];

        const seen = new Set();
        const uniqueReviews = rawReviews.filter((item) => {
          const key = `${item.reviewId || ""}-${item.userName || ""}-${item.comment || ""}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        if (!ignore) {
          setReviews(uniqueReviews);
        }
      } catch (error) {
        console.error("Failed to fetch home reviews", error);
        if (!ignore) setReviews([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchHomeReviews();

    return () => {
      ignore = true;
    };
  }, []);

  const hasReviews = useMemo(() => reviews.length > 0, [reviews]);

  const scrollToIndex = (index, smooth = true) => {
    const el = sliderRef.current;
    if (!el) return;

    const card = el.querySelector("[data-review-card='true']");
    if (!card) return;

    const gap = window.innerWidth >= 768 ? 14 : 12;
    const amount = index * (card.offsetWidth + gap);

    el.scrollTo({
      left: amount,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const goToNext = () => {
    if (!reviews.length) return;
    const next = currentIndex >= reviews.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(next);
    scrollToIndex(next);
  };

  const goToPrev = () => {
    if (!reviews.length) return;
    const prev = currentIndex <= 0 ? reviews.length - 1 : currentIndex - 1;
    setCurrentIndex(prev);
    scrollToIndex(prev);
  };

  useEffect(() => {
    if (!reviews.length) return;

    autoSlideRef.current = setInterval(() => {
      if (pauseRef.current || isDraggingRef.current) return;
      goToNext();
    }, 3200);

    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [reviews, currentIndex]);

  const handleMouseDown = (e) => {
    const el = sliderRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    pauseRef.current = true;
    dragStartXRef.current = e.pageX;
    dragStartScrollRef.current = el.scrollLeft;
    el.classList.add("cursor-grabbing");
  };

  const handleMouseMove = (e) => {
    const el = sliderRef.current;
    if (!el || !isDraggingRef.current) return;

    e.preventDefault();
    const walk = e.pageX - dragStartXRef.current;
    el.scrollLeft = dragStartScrollRef.current - walk;
  };

  const stopDragging = () => {
    const el = sliderRef.current;
    if (!el) return;

    isDraggingRef.current = false;
    el.classList.remove("cursor-grabbing");

    const card = el.querySelector("[data-review-card='true']");
    if (card) {
      const gap = window.innerWidth >= 768 ? 14 : 12;
      const newIndex = Math.round(el.scrollLeft / (card.offsetWidth + gap));
      const safeIndex = Math.max(0, Math.min(newIndex, reviews.length - 1));
      setCurrentIndex(safeIndex);
      scrollToIndex(safeIndex);
    }

    setTimeout(() => {
      pauseRef.current = false;
    }, 1000);
  };

  if (!loading && !hasReviews) return null;

  return (
    <section
      className="relative py-8 md:py-10 overflow-hidden"
      style={{ background: "#FFF8F6" }}
    >
      <div className="container-imkaa">
        <div className="text-center mb-5 md:mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 mb-3 bg-white shadow-sm border-[rgba(197,111,127,0.14)]">
            <Sparkles size={13} style={{ color: "var(--color-primary)" }} />
            <span
              className="text-[12px]"
              style={{
                color: "var(--color-primary)",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Loved by real customers
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-px w-8 md:w-16 bg-[var(--color-primary)]/35" />
            <h2
              className="text-[24px] md:text-[32px] leading-tight"
              style={{
                color: "var(--color-heading)",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
              }}
            >
              Customer Love
            </h2>
            <span className="h-px w-8 md:w-16 bg-[var(--color-primary)]/35" />
          </div>

          <p
            className="text-[13px] md:text-[15px]"
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
            }}
          >
            Real reviews from bra, panty, tummy control, shapewear, curvy and
            lingerie customers.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-[18px] border p-4 animate-pulse bg-white"
                style={{ borderColor: "rgba(197,111,127,0.15)" }}
              >
                <div className="h-4 w-24 rounded bg-[#F6DDE3] mb-3" />
                <div className="h-3 w-20 rounded bg-[#F6DDE3] mb-3" />
                <div className="h-3 w-full rounded bg-[#F8E8EC] mb-2" />
                <div className="h-3 w-[80%] rounded bg-[#F8E8EC] mb-2" />
                <div className="h-3 w-[60%] rounded bg-[#F8E8EC] mb-4" />
                <div className="h-12 w-full rounded-xl bg-[#F8E8EC]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center justify-end gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  pauseRef.current = true;
                  goToPrev();
                  setTimeout(() => {
                    pauseRef.current = false;
                  }, 1200);
                }}
                className="h-9 w-9 rounded-full border flex items-center justify-center bg-white shadow-sm"
                style={{
                  borderColor: "rgba(197,111,127,0.18)",
                  color: "var(--color-heading)",
                }}
                aria-label="Scroll reviews left"
              >
                <ChevronLeft size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  pauseRef.current = true;
                  goToNext();
                  setTimeout(() => {
                    pauseRef.current = false;
                  }, 1200);
                }}
                className="h-9 w-9 rounded-full border flex items-center justify-center bg-white shadow-sm"
                style={{
                  borderColor: "rgba(197,111,127,0.18)",
                  color: "var(--color-heading)",
                }}
                aria-label="Scroll reviews right"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div
              ref={sliderRef}
              className="reviews-scroll flex gap-3 md:gap-3.5 overflow-x-auto scroll-smooth select-none cursor-grab items-start"
              onMouseEnter={() => {
                pauseRef.current = true;
              }}
              onMouseLeave={() => {
                if (!isDraggingRef.current) pauseRef.current = false;
                stopDragging();
              }}
              onTouchStart={() => {
                pauseRef.current = true;
              }}
              onTouchEnd={() => {
                setTimeout(() => {
                  pauseRef.current = false;
                }, 1000);
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDragging}
            >
              {reviews.map((review, index) => {
                const comment =
                  review.comment || "Loved the comfort, fit and feel.";
                const isLong = comment.length > 90;
                const isExpanded = expandedIndex === index;

                return (
                  <div
                    key={review.reviewId || `${review.userName}-${index}`}
                    data-review-card="true"
                    className="reviews-card rounded-[18px] border p-4 shadow-sm bg-white"
                    style={{
                      borderColor: "rgba(197,111,127,0.16)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[15px] md:text-[16px] leading-tight truncate mb-1"
                          style={{
                            color: "var(--color-heading)",
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 700,
                          }}
                        >
                          {review.userName || "Verified Buyer"}
                        </p>

                        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                          <StarsRow rating={review.rating} />
                          {review.verified && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#8D4A59] font-medium">
                              <ShieldCheck size={12} />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="shrink-0 rounded-full p-1.5 bg-[#FFF3F6]"
                        style={{ color: "var(--color-primary)" }}
                      >
                        <Quote size={15} />
                      </div>
                    </div>

                    <div className="review-content">
                      <p
                        className={`text-[13px] md:text-[14px] leading-7 ${
                          isExpanded ? "review-text-expanded" : "review-text-3"
                        }`}
                        style={{
                          color: "var(--color-text)",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        {comment}
                      </p>

                      {isLong && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(index)}
                          className="mt-1 text-[12px] font-semibold hover:underline"
                          style={{ color: "var(--color-primary)" }}
                        >
                          {isExpanded ? "Less" : "More"}
                        </button>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[rgba(197,111,127,0.12)] mt-auto">
                      <div className="flex items-center gap-2.5">
                        {review.productThumbnail ? (
                          <img
                            src={getImageUrl(review.productThumbnail)}
                            alt={review.productName || "Product"}
                            className="w-11 h-14 rounded-xl object-cover border border-[rgba(197,111,127,0.14)]"
                            draggable="false"
                          />
                        ) : (
                          <div className="w-11 h-14 rounded-xl bg-[#FCEFEA]" />
                        )}

                        <div className="min-w-0">
                          <p
                            className="text-[10px] uppercase tracking-[0.14em]"
                            style={{
                              color: "var(--color-primary)",
                              fontWeight: 700,
                            }}
                          >
                            {review.productCategory || "Shapewear"}
                          </p>

                          <p
                            className="text-[12px] md:text-[13px] truncate mt-1"
                            style={{
                              color: "var(--color-heading)",
                              fontWeight: 600,
                            }}
                          >
                            {review.productName || "Premium Product"}
                          </p>
                        </div>
                      </div>

                      {review.productSlug && (
                        <Link
                          href={`/product/${review.productSlug}`}
                          className="inline-flex items-center mt-2.5 text-[13px] font-semibold hover:underline"
                          style={{ color: "var(--color-primary)" }}
                        >
                          View Product
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .reviews-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
          scroll-snap-type: x proximity;
        }

        .reviews-scroll::-webkit-scrollbar {
          display: none;
        }

        .reviews-card {
          scroll-snap-align: start;
          width: 248px;
          min-width: 248px;
          height: 320px;
          display: flex;
          flex-direction: column;
        }

        .review-content {
          min-height: 104px;
          margin-bottom: 12px;
        }

        .review-text-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 84px;
        }

        .review-text-expanded {
          display: block;
          min-height: 84px;
          max-height: 84px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .review-text-expanded::-webkit-scrollbar {
          width: 4px;
        }

        .review-text-expanded::-webkit-scrollbar-thumb {
          background: rgba(197, 111, 127, 0.35);
          border-radius: 999px;
        }

        @media (min-width: 768px) {
          .reviews-card {
            width: 262px;
            min-width: 262px;
            height: 336px;
          }

          .review-content {
            min-height: 112px;
          }

          .review-text-3 {
            min-height: 92px;
          }

          .review-text-expanded {
            min-height: 92px;
            max-height: 92px;
          }
        }
      `}</style>
    </section>
  );
}