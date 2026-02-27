"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function MyCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  /* ================= FETCH COUPONS ================= */
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetch(`${API_BASE}/offers`);
        const data = await res.json();

        const offers =
          Array.isArray(data?.offers) ? data.offers : [];

        setCoupons(offers);
      } catch (err) {
        console.log("Coupon fetch error", err);
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  /* ================= COPY CODE ================= */
  const copyCode = async (code) => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);

      setTimeout(() => setCopied(""), 1500);
    } catch (err) {
      console.log("Copy failed");
    }
  };

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading coupons...</p>;
  }

  return (
    <div className="w-full">
      {/* TITLE */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        My coupon || Clovia
      </h2>

      <div className="space-y-2">

        {coupons.length === 0 && (
          <p className="text-gray-500 text-sm">No coupons available</p>
        )}

        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="border border-gray-300 bg-white w-full"
          >
            <div className="flex">

              {/* LEFT DISCOUNT BLOCK */}
              <div className="w-[160px] min-h-[75px] border-r border-gray-300 flex items-center justify-center">
                <p className="text-pink-600 font-semibold text-[18px] leading-tight text-center">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% OFF`
                    : `₹${coupon.discountValue} OFF`}
                </p>
              </div>

              {/* RIGHT CONTENT */}
              <div className="flex-1 flex justify-between px-3 py-2">

                <div>
                  {/* CODE */}
                  <div className="inline-block border border-dashed border-gray-400 px-2 py-[2px] text-[13px] font-medium mb-1">
                    Code: {coupon.code}
                  </div>

                  {/* MIN PURCHASE */}
                  <p className="text-gray-700 text-[14px] mb-[2px]">
                    Minimum purchase value: ₹
                    {coupon.minOrderValue || 0}
                  </p>

                  {/* EXPIRY */}
                  <p className="text-gray-500 italic text-[14px]">
                    Expiry:{" "}
                    {coupon.endDate
                      ? new Date(coupon.endDate).toLocaleDateString("en-IN")
                      : "Limited time offer"}
                  </p>
                </div>

                {/* COPY ICON */}
                <button
                  onClick={() => copyCode(coupon.code)}
                  className="text-pink-500 hover:text-pink-600 self-start"
                >
                  <Copy size={18} />
                </button>

              </div>

            </div>
          </div>
        ))}
      </div>

      {/* COPY MESSAGE */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-1 rounded text-sm">
          Saved to clipboard
        </div>
      )}
    </div>
  );
}