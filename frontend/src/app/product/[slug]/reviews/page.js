"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ReviewPage() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [visible, setVisible] = useState(10);
  const [loading, setLoading] = useState(true);

  const observer = useRef();

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products/slug/${slug}`
        );
        const data = await res.json();

        if (data.success) {
          setProduct(data.product);
          setReviews(data.product.reviews || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /* ================= INFINITE SCROLL ================= */

  const lastReviewRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setVisible((prev) => prev + 10);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  if (loading || !product) return null;

  /* ================= RATING BREAKDOWN ================= */

  let ratingBreakdown = product.ratingBreakdown;

  if (!ratingBreakdown && reviews.length) {
    ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => ratingBreakdown[r.rating]++);
  }

  const imageUrl =
    product.variants?.[0]?.images?.[0]
      ? `${API_BASE}${product.variants[0].images[0]}`
      : "/placeholder.jpg";

  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* ================= TOP SECTION ================= */}
        <div className="grid lg:grid-cols-3 gap-12">

          {/* LEFT PRODUCT INFO */}
          <div>
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full rounded-md object-cover"
            />

            <h2 className="mt-6 text-lg font-semibold">
              {product.brand || "Brand"}
            </h2>

            <p className="text-gray-600 text-sm">
              {product.name}
            </p>

            <div className="mt-4 text-xl font-bold">
              ₹{product.price}
              {product.mrp && (
                <span className="ml-3 text-gray-400 line-through text-base">
                  ₹{product.mrp}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT RATING SUMMARY */}
          <div className="lg:col-span-2">

            <h3 className="text-lg font-semibold mb-6">
              RATINGS
            </h3>

            <div className="flex flex-col lg:flex-row gap-12">

              {/* OVERALL */}
              <div className="min-w-[150px]">
                <div className="text-5xl font-bold">
                  {product.rating?.toFixed(1)}
                </div>

                <div className="flex items-center mt-2 text-green-600">
                  <Star size={18} fill="currentColor" />
                  <span className="ml-2 text-gray-600 text-sm">
                    {product.numReviews} Ratings
                  </span>
                </div>
              </div>

              {/* BARS */}
              <div className="flex-1 space-y-4">

                {[5,4,3,2,1].map((star) => {
                  const count =
                    ratingBreakdown?.[star] || 0;

                  const percent =
                    product.numReviews > 0
                      ? (count /
                          product.numReviews) *
                        100
                      : 0;

                  const colors = {
                    5: "bg-green-600",
                    4: "bg-green-500",
                    3: "bg-yellow-400",
                    2: "bg-orange-400",
                    1: "bg-red-500",
                  };

                  return (
                    <div
                      key={star}
                      className="flex items-center gap-4"
                    >
                      <span className="w-6 text-sm">
                        {star}
                      </span>

                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-700 ${colors[star]}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <span className="w-12 text-right text-sm text-gray-600">
                        {count}
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        </div>

        {/* ================= REVIEW LIST ================= */}
        <div className="mt-14">

          <h3 className="text-lg font-semibold mb-6">
            Customer Reviews ({product.numReviews})
          </h3>

          <div className="space-y-10">

            {reviews.slice(0, visible).map((review, index) => {

              const isLast = index === visible - 1;

              return (
                <div
                  key={index}
                  ref={isLast ? lastReviewRef : null}
                  className="border-t pt-8"
                >
                  {/* STAR ROW */}
                  <div className="flex items-center gap-1 text-green-600">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill="currentColor"
                      />
                    ))}
                  </div>

                  {/* COMMENT */}
                  <p className="mt-3 text-gray-700 text-sm leading-relaxed">
                    {review.comment}
                  </p>

                  {/* FOOTER */}
                  <div className="mt-4 flex justify-between text-xs text-gray-500">
                    <div>
                      {review.user?.name || "Verified Buyer"} •{" "}
                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-black">
                        <ThumbsUp size={14} />
                        {review.helpful || 0}
                      </div>
                      <div className="flex items-center gap-1 cursor-pointer hover:text-black">
                        <ThumbsDown size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {visible < reviews.length && (
            <div className="text-center mt-10 text-gray-400">
              Loading more reviews...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
