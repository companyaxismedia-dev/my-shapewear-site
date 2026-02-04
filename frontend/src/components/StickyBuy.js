"use client";
import { ShoppingBag, Zap } from "lucide-react";

export default function StickyBuy() {
  const scrollToProduct = () => {
    window.scrollTo({ top: 500, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:hidden bg-white/80 backdrop-blur-md border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">Price Starting</p>
          <p className="text-xl font-black text-[#041f41]">₹1,299</p>
        </div>
        <button 
          onClick={scrollToProduct}
          className="flex-[2] bg-[#ffc220] hover:bg-[#f2b81a] text-[#041f41] h-12 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-tighter text-sm shadow-lg active:scale-95 transition-all"
        >
          <Zap size={18} fill="currentColor" /> Buy Now
        </button>
      </div>
    </div>
  );
}