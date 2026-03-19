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
      setOrderId("IMKAA-" + Math.floor(100000 + Math.random() * 900000));
    }
    window.scrollTo(0, 0);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden relative" style={{ background: "var(--color-bg)" }}>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(232,183,194,0.35)" }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(197,111,127,0.22)" }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full card-imkaa overflow-hidden relative"
        style={{ borderRadius: 28, boxShadow: "0 35px 60px -15px rgba(74,46,53,0.20)" }}
      >
        {/* Progress Bar Top */}
        <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, var(--color-accent), var(--color-primary))" }}></div>

        {/* Content Section */}
        <div className="pt-10 pb-6 text-center px-8" style={{ background: "var(--color-card)" }}>
          <div className="flex justify-center mb-6 relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
              className="p-6 rounded-full shadow-inner"
              style={{ background: "rgba(232,183,194,0.28)" }}
            >
              <CheckCircle size={64} style={{ color: "var(--color-primary)" }} />
            </motion.div>
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 p-2 rounded-full shadow-md"
              style={{ background: "rgba(252,239,234,0.9)", border: "1px solid var(--color-border)" }}
            >
              <PartyPopper style={{ color: "var(--color-primary)" }} size={28} />
            </motion.div>
          </div>
          
          <h1 className="heading-section" style={{ fontWeight: 600, fontSize: "clamp(28px, 3vw, 40px)" }}>
            Order <br /> Confirmed!
          </h1>
          <p className="mt-4 text-[11px] py-2 px-4 inline-block" style={{ color: "var(--color-primary)", background: "rgba(197,111,127,0.06)", border: "1px solid rgba(197,111,127,0.16)", borderRadius: 9999, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Thank you for shopping with IMKAA
          </p>
        </div>

        <div className="px-8 pb-12 space-y-6">
          
          {/* Transaction ID Card */}
          <div className="text-center space-y-2 p-6 border-2 border-dashed" style={{ background: "var(--color-bg-alt)", borderColor: "var(--color-border)", borderRadius: 22 }}>
            <p className="text-muted-sm" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Order Ref Number</p>
            <span className="tracking-wider font-mono px-4 py-1" style={{ fontSize: 18, fontWeight: 700, color: "var(--color-heading)", background: "var(--color-card)", borderRadius: 14, boxShadow: "0 10px 24px rgba(74,46,53,0.10)", border: "1px solid var(--color-border)" }}>
              #{orderId || "..."}
            </span>
          </div>

          {/* Shipping Info */}
          <div className="p-6 flex items-center gap-5" style={{ background: "rgba(197,111,127,0.06)", border: "1px solid rgba(197,111,127,0.16)", borderRadius: 22 }}>
            <div className="p-4 text-white shrink-0" style={{ background: "var(--color-primary)", borderRadius: 18, boxShadow: "0 14px 30px rgba(74,46,53,0.16)" }}>
              <Truck size={28} />
            </div>
            <div>
              <h3 className="title-product" style={{ fontSize: 16 }}>Arriving soon</h3>
              <p className="text-muted-sm" style={{ fontSize: 14, color: "var(--color-primary)", fontWeight: 700, marginTop: 6 }}>3–5 business days</p>
              <p className="text-muted-sm" style={{ fontSize: 13, marginTop: 6 }}>
                Order details have been sent to your email.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Link 
              href="/" 
              className="btn-primary-imkaa w-full"
              style={{ height: 50 }}
            >
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
            
            <a 
              href="https://wa.me/919217521109?text=Hi, I just placed an order! Order ID: %23"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-imkaa w-full"
              style={{ height: 48 }}
            >
              <MessageCircle size={18} style={{ color: "var(--color-primary)" }} /> WhatsApp Support
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
               <p className="text-muted-sm" style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                 <Heart size={12} className="fill-[#C56F7F] text-[#C56F7F]" /> 
                 Loved by thousands of customers
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
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--color-bg)", color: "var(--color-heading)" }}>
      <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: "var(--color-primary)" }} />
      <p className="text-muted-sm" style={{ fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
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