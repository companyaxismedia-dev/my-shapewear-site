"use client";
import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { useCategories } from "@/context/CategoryContext";
import { Truck, ShieldCheck, RotateCcw, Zap, Loader2 } from "lucide-react";

// Lazy load heavy page components for better performance
const Hero = React.lazy(() => import("@/components/Hero"));
const HomeHero = React.lazy(() => import("@/components/HomeHero"));
const CategorySlider = React.lazy(() => import("@/components/CategorySlider"));
const AutoSliceSlider = React.lazy(
  () => import("@/components/AutoSliceSlider"),
);
const Footer = React.lazy(() => import("@/components/Footer"));

export default function Home() {
  const { loadingCats } = useCategories();

  // Show a full-page loading skeleton/spinner while Navbar data (categories) is loading
  if (loadingCats) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-[#ed4e7e] animate-spin" />
        <div className="text-center text-[#ed4e7e] font-black uppercase tracking-[0.2em] animate-pulse">
          Glovia Glamour...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden selection:bg-pink-100">
      <Navbar />

      <main className="w-full mx-auto">
        <Hero />
        <HomeHero />
        <Suspense
          fallback={
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-pink-300 animate-spin" />
            </div>
          }
        >
          <div className="px-3 sm:px-4 md:px-10 mt-4 space-y-8">
            <CategorySlider />

            <div className="mt-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-[#ed4e7e] uppercase italic tracking-tighter">
                  Our Exclusive Collections
                </h2>
                <div className="h-1 w-24 bg-pink-100 mx-auto mt-3 rounded-full"></div>
              </div>

              <AutoSliceSlider />
            </div>
          </div>
        </Suspense>

        {/* Trust Bar - Rendered synchronously for fast visual anchors */}
        <div className="bg-[#fce4ec] border-y border-pink-100 py-10 mt-16">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Truck size={24} className="text-[#ed4e7e]" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-700 tracking-tighter">
                  Free Shipping
                </p>
                <p className="text-[9px] text-gray-500 italic">
                  On orders above ₹999
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <ShieldCheck size={24} className="text-[#ed4e7e]" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-700 tracking-tighter">
                  100% Privacy
                </p>
                <p className="text-[9px] text-gray-500 italic">
                  Discreet Packaging
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <RotateCcw size={24} className="text-[#ed4e7e]" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-700 tracking-tighter">
                  Easy Returns
                </p>
                <p className="text-[9px] text-gray-500 italic">
                  7 Days No Question
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Zap size={24} fill="#ed4e7e" className="text-[#ed4e7e]" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-700 tracking-tighter">
                  Quick COD
                </p>
                <p className="text-[9px] text-gray-500 italic">
                  Pay on delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
}
