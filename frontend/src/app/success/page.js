"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Truck, ShoppingBag, MessageCircle } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("LOADING...");

  useEffect(() => {
    // Checkout page se jo ID aayegi use yahan dikhayenge
    const id = searchParams.get("id");
    if (id) {
      setOrderId(id.slice(-8).toUpperCase()); // Last 8 digits dikhane ke liye
    } else {
      setOrderId("BBLOOM-" + Math.floor(1000 + Math.random() * 9000));
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Green Header */}
        <div className="bg-green-500 p-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <CheckCircle size={80} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Order Placed!</h1>
          <p className="mt-2 text-green-100 font-medium italic">Thank you for shopping with Booty Bloom</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Order ID Section */}
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Aapka Order ID</p>
            <div className="bg-gray-50 py-4 rounded-2xl border-2 border-dashed border-gray-200">
              <span className="text-2xl font-black text-blue-600 tracking-wider">#{orderId}</span>
            </div>
          </div>

          {/* Delivery Info Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 leading-tight">Estimated Delivery</h3>
              <p className="text-sm text-blue-700 font-bold">3 – 5 Working Days</p>
              <p className="text-[11px] text-blue-500 mt-1">Aapko WhatsApp par tracking link mil jayega</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 pt-4">
            <Link href="/" className="flex items-center justify-center gap-2 w-full bg-[#041f41] text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
              <ShoppingBag size={20} /> Continue Shopping
            </Link>
            
            <a 
              href="https://wa.me/919217521109" 
              target="_blank"
              className="flex items-center justify-center gap-2 w-full bg-white text-green-600 border-2 border-green-600 py-4 rounded-xl font-bold hover:bg-green-50 transition-all active:scale-95"
            >
              <MessageCircle size={20} /> Contact Support
            </a>
          </div>

          {/* Verification Badge */}
          <div className="pt-6 border-t text-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-6 h-[px] bg-gray-200"></span>
              50,000+ Verified Customers
              <span className="w-6 h-[px] bg-gray-200"></span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// Main component with Suspense for Next.js 13+ searchParams support
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Success Details...</div>}>
      <SuccessContent />
    </Suspense>
  );
}