"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export function PriceDetailsSection() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= TOKEN ================= */
  const getToken = () => {
    const stored = JSON.parse(localStorage.getItem("user"));
    return stored?.token;
  };

  /* ================= FETCH CART ================= */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await fetch(`${API_BASE}/api/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setCartItems(data?.items || []);
      } catch (err) {
        console.log("Price fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  /* ================= CALCULATIONS ================= */

  const totalMrp = cartItems.reduce(
    (sum, i) => sum + (i.product?.minPrice || 0) * i.qty,
    0
  );

  const discount = 0; // future offer integration
  const earlyAccessFee = 49;
  const platformFee = 23;
  const codFee = 10;

  const finalAmount =
    totalMrp - discount + earlyAccessFee + platformFee + codFee;

  const priceDetails = [
    {
      label: "Total MRP",
      value: `₹${totalMrp}`,
      highlight: false,
    },
    {
      label: "Discount on MRP",
      value: `-₹${discount}`,
      highlight: true,
    },
    {
      label: "Early Access Fee",
      value: `₹${earlyAccessFee}`,
      highlight: false,
    },
    {
      label: "Platform Fee",
      value: `₹${platformFee}`,
      highlight: false,
      info: true,
    },
    {
      label: "Cash/Pay on Delivery Fee",
      value: `₹${codFee}`,
      highlight: false,
      info: true,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <p className="text-sm text-gray-500">Loading price details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#eaeaec] rounded-lg p-4">

      {/* HEADER */}
      <p className="text-[12px] font-bold uppercase text-[#535766] mb-4">
        PRICE DETAILS ({cartItems.length} Items)
      </p>

      {/* PRICE ROWS */}
      <div className="space-y-3 text-[14px]">

        {priceDetails.map((item, i) => (
          <div key={i} className="flex justify-between items-center">

            <div className="flex items-center gap-1">
              <span
                className={
                  item.highlight
                    ? "text-[#03a685] font-semibold"
                    : "text-[#535766]"
                }
              >
                {item.label}
              </span>

              {item.info && (
                <span className="text-[#ff3f6c] text-[12px] font-semibold cursor-pointer">
                  Know More
                </span>
              )}
            </div>

            <span
              className={
                item.highlight
                  ? "text-[#03a685] font-semibold"
                  : "text-[#282c3f]"
              }
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* DIVIDER */}
      <div className="border-t border-[#eaeaec] my-4" />

      {/* TOTAL */}
      <div className="flex justify-between font-bold text-[15px] text-[#282c3f]">
        <span>Total Amount</span>
        <span>₹{finalAmount}</span>
      </div>

      {/* PAYMENT OPTIONS */}
      <div className="mt-6 pt-4 border-t border-[#eaeaec]">
        <p className="text-[11px] font-bold text-[#535766] mb-3 uppercase">
          Payment Options
        </p>

        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1 text-[11px] bg-[#f5f5f6] rounded">
            VISA
          </div>
          <div className="px-3 py-1 text-[11px] bg-[#f5f5f6] rounded">
            MASTER
          </div>
          <div className="px-3 py-1 text-[11px] bg-[#f5f5f6] rounded">
            AMEX
          </div>
        </div>
      </div>

    </div>
  );
}