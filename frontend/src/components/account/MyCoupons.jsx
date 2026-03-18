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

      await navigator.clipboard.writeText(code);

      setCopied(code);

      setTimeout(() => setCopied(""), 1500);

    }
    catch (err) {

      console.log("Copy failed");

    }

  };


  /* ================= LOADING ================= */

  if (loading) {

    return (

      <div className="text-gray-500 text-sm">
        Loading coupons...
      </div>

    )

  }


  /* ================= UI ================= */

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

              {/* LEFT DISCOUNT */}

              <div className="w-[130px] flex items-center justify-center bg-pink-50">

                <p className="text-pink-600 font-semibold text-[20px] text-center">
                  {coupon.discountType === "percentage"

                    ? `${coupon.discountValue}% OFF`

                    : `₹${coupon.discountValue} OFF`}

                </p>

              </div>


              {/* RIGHT DETAILS */}

              <div className="flex-1 flex justify-between px-4 py-3">

                <div>

                  {/* CODE */}

                  <div className="inline-block border border-dashed px-2 py-[2px] text-[13px] font-medium mb-1">

                    Code: {coupon.code}

                  </div>


                  {/* DESCRIPTION */}

                  {coupon.description && (

                    <p className="text-gray-700 text-sm mb-1">

                      {coupon.description}

                    </p>

                  )}


                  {/* MIN ORDER */}

                  <p className="text-gray-600 text-[13px]">

                    Minimum purchase: ₹{coupon.minOrderValue || 0}

                  </p>


                  {/* EXPIRY */}

                  <p className="text-gray-500 italic text-[13px]">

                    Expiry:{" "}

                    {coupon.endDate

                      ? new Date(coupon.endDate).toLocaleDateString("en-IN")

                      : "Limited time"}

                  </p>

                </div>


                {/* COPY BUTTON */}

                <button
                  onClick={() => copyCode(coupon.code)}
                  className="text-pink-500 hover:text-pink-600"
                >

                  <Copy size={18} />

                </button>


              </div>

            </div>

          </div>

        ))}

      </div>


      {/* COPY TOAST */}

      {copied && (

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2 rounded text-sm">

          Coupon copied

        </div>

      )}

    </div>

  )

}