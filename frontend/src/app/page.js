"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductDetails from "@/components/ProductDetails";
import ProductGrid from "@/components/ProductGrid";
import ReviewSection from "@/components/ReviewSection";
import StickyBuy from "@/components/StickyBuy";
import Footer from "@/components/Footer";
import { Truck, ShieldCheck, RotateCcw, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] overflow-x-hidden">
      <Navbar />

      <main className="max-w-[1440px] mx-auto pb-24">

        {/* Secondary Menu – Desktop Only */}
        <div className="bg-white border-b hidden lg:block px-8 py-2">
          <div className="flex gap-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            <span className="text-blue-600 cursor-pointer">New Arrivals</span>
            <span className="hover:text-blue-600 cursor-pointer">Best Sellers</span>
            <span className="hover:text-blue-600 cursor-pointer">Track Order</span>
          </div>
        </div>

        {/* Hero */}
        <div className="px-3 sm:px-4 md:px-8 mt-4">
          <Hero />
        </div>

        {/* Trust Bar – Mobile Friendly */}
        <div className="bg-[#041f41] text-white py-3 mt-2">
          <div className="
            flex md:justify-center gap-6
            overflow-x-auto md:overflow-visible
            px-4
            text-[10px] sm:text-[11px]
            font-bold uppercase tracking-wider
            scrollbar-hide
          ">
            <span className="flex items-center gap-2 whitespace-nowrap">
              <Truck size={15} className="text-[#ffc220]" />
              Free Express Shipping
            </span>

            <span className="flex items-center gap-2 whitespace-nowrap">
              <ShieldCheck size={15} className="text-[#ffc220]" />
              Secure Checkout
            </span>

            <span className="flex items-center gap-2 whitespace-nowrap">
              <RotateCcw size={15} className="text-[#ffc220]" />
              7 Days Return
            </span>

            <span className="flex items-center gap-2 whitespace-nowrap text-green-400">
              <Zap size={15} fill="currentColor" />
              Cash On Delivery
            </span>
          </div>
        </div>

        {/* Product Details */}
        <section className="px-3 sm:px-4 md:px-8 mt-6">
          <ProductDetails />
        </section>

        {/* Reviews */}
        <section className="px-3 sm:px-4 md:px-8 mt-10">
          <ReviewSection />
        </section>

        {/* Explore More */}
        <section className="px-3 sm:px-4 md:px-8 mt-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-black text-[#041f41] uppercase italic tracking-tighter">
              Explore More
            </h2>
            <button className="text-[11px] md:text-[12px] font-black underline text-[#041f41] uppercase tracking-widest">
              View all
            </button>
          </div>

          <ProductGrid />
        </section>

      </main>

      {/* Mobile Sticky CTA */}
      <StickyBuy />

      {/* Footer */}
      <Footer />
    </div>
  );
}
