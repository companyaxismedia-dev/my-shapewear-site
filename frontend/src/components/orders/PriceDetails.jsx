"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function PriceDetails({ order }) {

  const [showFeeDetails, setShowFeeDetails] = useState(false);

  if (!order) return null;

  // Support both direct and nested pricing object
  const pricing = order.pricing || {};
  const mrp = pricing.subtotal || order.listingPrice || order.subtotal || 0;
  const sellingPrice = pricing.subtotal || order.subtotal || 0;
  const discount = (pricing.productDiscount || 0) + (pricing.couponDiscount || 0) || Math.max(mrp - sellingPrice, 0);
  const fees = (pricing.shippingCharge || 0) + (pricing.platformFee || 0) || order.fees || 0;
  const total = pricing.totalAmount || order.totalAmount || sellingPrice + fees;
  const paymentMethod =
    (order.payment?.method || order.paymentMethod) === "COD"
      ? "Cash On Delivery"
      : order.payment?.method || order.paymentMethod || "Online";

  return (
    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 w-full">

      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
        Price details
      </h2>

      <div className="space-y-4">

        {/* MRP */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            MRP price
          </span>

          <span className="text-sm text-gray-400 line-through">
            ₹{mrp}
          </span>
        </div>

        {/* Selling price */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Selling price
          </span>

          <span className="text-sm text-gray-900">
            ₹{sellingPrice}
          </span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span className="text-sm">
              Discount
            </span>

            <span className="text-sm font-medium">
              -₹{discount}
            </span>
          </div>
        )}

        {/* Fees */}
        {fees > 0 && (
          <>
            <button
              onClick={() => setShowFeeDetails(!showFeeDetails)}
              className="w-full flex justify-between items-center py-2 hover:bg-gray-50 rounded"
            >
              <span className="text-sm text-gray-600">
                Total fees
              </span>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900">
                  ₹{fees}
                </span>

                <ChevronDown
                  className={`w-4 h-4 transition ${
                    showFeeDetails ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {showFeeDetails && (
              <div className="bg-gray-50 p-3 rounded text-sm">

                <div className="flex justify-between text-gray-600">
                  <span>Payment handling fee</span>
                  <span>₹{Math.floor(fees * 0.6)}</span>
                </div>

                <div className="flex justify-between text-gray-600 mt-2">
                  <span>Platform fee</span>
                  <span>₹{Math.floor(fees * 0.4)}</span>
                </div>

              </div>
            )}
          </>
        )}

        <div className="border-t border-dashed border-gray-300" />

        {/* TOTAL */}
        <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded font-semibold">

          <span className="text-sm font-bold">
            Total amount
          </span>

          <span className="text-base font-bold">
            ₹{total}
          </span>

        </div>

        {/* PAYMENT METHOD */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex justify-between items-center">

          <span className="text-sm text-gray-600">
            Payment method
          </span>

          <span className="text-sm font-medium flex items-center gap-2">
            <span className="bg-white border border-gray-300 px-2 py-1 rounded text-xs">
              ₹
            </span>
            {paymentMethod}
          </span>

        </div>

      </div>

    </div>
  );
}