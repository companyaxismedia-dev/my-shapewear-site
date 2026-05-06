"use client";

import { useEffect, useState } from "react";
import { ChevronDown, TicketPercent } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { OfferListSkeleton, SkeletonBlock } from "@/components/loaders/Loaders";

export function BankOfferSection({ compact = false }) {
  const [showMore, setShowMore] = useState(false);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="rounded-[4px] border border-[#ece5e8] bg-white p-4 sm:p-6 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
        <SkeletonBlock className="mb-4 h-5 w-32 rounded-full" />
        <OfferListSkeleton rows={2} />
      </div>
    );
  }

  if (!offer) return null;

  const details = [
    `Minimum order Rs. ${offer.minOrderValue || 0}`,
    `Discount ${offer.discountValue || 0}%`,
    `Code ${offer.code || "N/A"}`,
  ];

  return ( <>
  </>
    // <div
    //   className={`rounded-[4px] border border-[#ece5e8] bg-white shadow-[0_6px_18px_rgba(45,28,35,0.05)] ${
    //     compact ? "p-4" : "p-5 sm:p-6"
    //   }`}
    // >
    //   <div className="flex items-start gap-4">
    //     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fff1f4] text-[#b27b86]">
    //       <TicketPercent className="h-5 w-5" />
    //     </div>

    //     <div className="min-w-0 flex-1">
    //       <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8a7a80]">
    //         Active Offer
    //       </p>
    //       <h3 className="mt-1 text-[18px] font-semibold text-[#2f2428]">Bank offer</h3>
    //       <p className="mt-2 text-[13px] leading-6 text-[#5f4b52]">
    //         {offer.title || offer.description}
    //       </p>

    //       <button
    //         type="button"
    //         onClick={() => setShowMore((prev) => !prev)}
    //         className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#b27b86]"
    //       >
    //         {showMore ? "Show less" : "Show more"}
    //         <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
    //       </button>

    //       {showMore ? (
    //         <div className="mt-4 border-t border-[#f0e6e8] pt-4">
    //           <ul className="space-y-2 text-[13px] leading-5 text-[#5f4b52]">
    //             {details.map((detail) => (
    //               <li key={detail} className="flex items-start gap-2">
    //                 <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[#b27b86]" />
    //                 <span>{detail}</span>
    //               </li>
    //             ))}
    //           </ul>
    //         </div>
    //       ) : null}
    //     </div>
    //   </div>
    // </div>
  );
}
