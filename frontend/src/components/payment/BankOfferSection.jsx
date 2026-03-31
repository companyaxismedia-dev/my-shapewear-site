"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { OfferListSkeleton, SkeletonBlock } from "@/components/loaders/Loaders";

export function BankOfferSection() {
  const [showMore, setShowMore] = useState(false);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH OFFER FROM BACKEND ================= */
  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/offers/active`);
        const data = await res.json();

        if (data?.success && data?.offer) {
          setOffer(data.offer);
        }
      } catch (err) {
        console.log("Offer load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-4 sm:p-6">
        <SkeletonBlock className="mb-4 h-5 w-32 rounded-full" />
        <OfferListSkeleton rows={2} />
      </div>
    );
  }

  /* ================= NO OFFER ================= */
  if (!offer) return null;

  return (
    <div className="rounded-lg border border-[#eaeaec] bg-white p-4 sm:p-6">

      <div className="flex items-start gap-3 sm:gap-4">

        {/* ICON */}
        <div className="mt-1 flex-shrink-0">
          <svg
            className="h-6 w-6 text-[#535766]"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="6" r="1" />
            <circle cx="12" cy="18" r="1" />
            <circle cx="6" cy="12" r="1" />
            <circle cx="18" cy="12" r="1" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>

        {/* CONTENT */}
        <div className="flex-1">

          <h3 className="mb-2 text-[16px] font-bold text-[#282c3f]">
            Bank Offer
          </h3>

          <p className="mb-3 text-[13px] text-[#535766] leading-5">
            {offer.title || offer.description}
          </p>

          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 text-[13px] font-semibold text-[#ff3f6c]"
          >
            {showMore ? "Show Less" : "Show More"}

            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                showMore ? "rotate-180" : ""
              }`}
            />
          </button>

          {showMore && (
            <div className="mt-4 border-t border-[#eaeaec] pt-4 text-[13px] text-[#535766]">

              <p className="mb-2 font-semibold text-[#282c3f]">
                Offer Details:
              </p>

              <ul className="list-disc list-inside space-y-1">
                <li>Minimum order ₹{offer.minOrderValue}</li>
                <li>Discount: {offer.discountValue}%</li>
                <li>Code: {offer.code}</li>
              </ul>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
