"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle, Truck, ShoppingBag, MessageCircle, 
  PartyPopper, Heart, Loader2 
} from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    // Backend se aane wali ID ko fetch karna
    const id = searchParams.get("id");
    if (id) {
      // Agar MongoDB ID hai toh last 8 characters dikhayenge clean look ke liye
      setOrderId(id.toUpperCase().slice(-8));
    } else {
      setOrderId("BB-" + Math.floor(100000 + Math.random() * 900000));
    }
    window.scrollTo(0, 0);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#ed4e7e] flex items-center justify-center px-4 py-12 font-sans overflow-hidden relative">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-[3.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden relative"
      >
        {/* Progress Bar Top */}
        <div className="h-3 bg-gradient-to-r from-green-400 to-green-500 w-full"></div>

        {/* Content Section */}
        <div className="bg-white pt-10 pb-6 text-center px-8">
          <div className="flex justify-center mb-6 relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              className="bg-green-100 p-6 rounded-full shadow-inner"
            >
              <CheckCircle size={64} className="text-green-500" />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-pink-100 p-2 rounded-full shadow-md"
            >
              <PartyPopper className="text-[#ed4e7e]" size={28} />
            </motion.div>
          </div>
          
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 leading-tight">
            Order <br /> Confirmed!
          </h1>
          <p className="mt-4 text-[#ed4e7e] font-black uppercase tracking-widest text-[11px] bg-[#ed4e7e]/5 py-2 px-4 rounded-full inline-block border border-[#ed4e7e]/10">
            Welcome to the Bloom Club! 🌸
          </p>
        </div>

        <div className="px-8 pb-12 space-y-6">
          
          {/* Transaction ID Card */}
          <div className="text-center space-y-2 bg-gray-50 p-6 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Order Ref Number</p>
            <span className="text-xl font-black text-gray-800 tracking-wider font-mono bg-white px-4 py-1 rounded-lg shadow-sm border border-gray-100">
              #{orderId || "..."}
            </span>
          </div>

          {/* Shipping Info */}
          <div className="bg-[#ed4e7e]/5 border border-[#ed4e7e]/10 rounded-[2.5rem] p-6 flex items-center gap-5">
            <div className="bg-[#ed4e7e] p-4 rounded-3xl text-white shadow-lg shadow-[#ed4e7e]/20 shrink-0">
              <Truck size={28} />
            </div>
            <div>
              <h3 className="font-black text-gray-800 uppercase italic text-sm leading-none">Arriving Soon</h3>
              <p className="text-xs text-[#ed4e7e] font-black mt-1 tracking-wide">3 – 5 Business Days</p>
              <p className="text-[10px] text-gray-400 font-bold mt-1 leading-tight uppercase">
                Order details sent to your Email.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link 
              href="/" 
              className="flex items-center justify-center gap-3 w-full bg-[#ed4e7e] text-white py-6 rounded-full font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-[#ed4e7e]/20 active:scale-95"
            >
              <ShoppingBag size={20} /> Continue Shopping
            </Link>
            
            <a 
              href="https://wa.me/919217521109?text=Hi, I just placed an order! Order ID: %23"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-white text-gray-800 border-2 border-gray-100 py-5 rounded-full font-black uppercase tracking-widest text-[11px] hover:border-green-500 hover:text-green-600 transition-all active:scale-95"
            >
              <MessageCircle size={18} className="text-green-500" /> WhatsApp Support
            </a>
          </div>

          {/* Social Proof Footer */}
          <div className="pt-4 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
               <div className="flex -space-x-2 mb-1">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                    </div>
                  ))}
               </div>
               <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                 <Heart size={10} className="text-[#ed4e7e] fill-[#ed4e7e]" /> 
                 Loved by 50k+ Happy Bloomers
               </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Minimalist Loading State
function SuccessLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#ed4e7e] text-white">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="font-black uppercase italic tracking-widest text-xs animate-pulse">
        Generating Receipt...
      </p>
    </div>
  );
}

// Export with Suspense for Next.js 13+ SearchParams compatibility
export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}