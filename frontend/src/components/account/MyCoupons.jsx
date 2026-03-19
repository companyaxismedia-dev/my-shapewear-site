"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { toast } from "sonner";


export default function MyCoupons() {

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchCoupons = async () => {

      try {

        const res = await fetch(`${API_BASE}/api/offers`);

        const data = await res.json();

        if (data?.success) {

          setCoupons(data.offers || []);

        } else {

          setCoupons([]);

        }

      }
      catch (err) {

        console.log("Coupon fetch error", err);

        setCoupons([]);

      }
      finally {

        setLoading(false);

      }

    }

    fetchCoupons();

  }, []);


  /* ================= COPY CODE ================= */

  const copyCode = async (code) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older/mobile browsers
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      toast.success(`Copied: ${code}`);
    } catch (err) {
      toast.error("Failed to copy coupon");
    }
  };

  if (loading) {

    return (

      <div className="text-gray-500 text-sm">
        Loading coupons...
      </div>

    )

  }
  return (

    <div className="w-full max-w-4xl">

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        My Coupons
      </h2>
      {coupons.length === 0 && (

        <div className="bg-white border p-6 rounded text-gray-500">
          No coupons available
        </div>

      )}
      <div className="space-y-4">

        {coupons.map((coupon) => (

          <div
            key={coupon._id}
            className="border border-gray-200 bg-white rounded-md overflow-hidden shadow-sm"
          >

            <div className="flex">
              <div className="w-[130px] flex items-center justify-center bg-pink-50">

                <p className="text-pink-600 font-semibold text-[20px] text-center">
                  {coupon.discountType === "percentage"

                    ? `${coupon.discountValue}% OFF`

                    : `₹${coupon.discountValue} OFF`}

                </p>

              </div>
              <div className="flex-1 flex justify-between px-4 py-3">

                <div>
                  <div className="inline-block border border-dashed px-2 py-[2px] text-[13px] font-medium mb-1">

                    Code: {coupon.code}

                  </div>
                  {coupon.description && (

                    <p className="text-gray-700 text-sm mb-1">

                      {coupon.description}

                    </p>

                  )}
                  <p className="text-gray-600 text-[13px]">

                    Minimum purchase: ₹{coupon.minOrderValue || 0}

                  </p>
                  <p className="text-gray-500 italic text-[13px]">

                    Expiry:{" "}

                    {coupon.endDate

                      ? new Date(coupon.endDate).toLocaleDateString("en-IN")

                      : "Limited time"}

                  </p>

                </div>
                <button
                  onClick={() => copyCode(coupon.code)}
                  className="hover:text-[#76424c] text-[#C56F7F] transition cursor-pointer"
                >

                  <Copy size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

  )

}