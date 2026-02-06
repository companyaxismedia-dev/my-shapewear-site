"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import OfferSection from "@/components/OfferSection";
import HomeHero from "@/components/HomeHero";
import CategorySlider from "@/components/CategorySlider";
import AutoSliceSlider from "@/components/AutoSliceSlider"; 
import Footer from "@/components/Footer";
import { Truck, ShieldCheck, RotateCcw, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden selection:bg-pink-100">
      <Navbar />

      <main className="w-full mx-auto">
        {/* Desktop Mini Menu */}
        {/* <div className="bg-white border-b hidden lg:block px-8 py-2">
          <div className="flex gap-8 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            <span className="text-[#ed4e7e] cursor-pointer">New Arrivals</span>
            <span className="hover:text-[#ed4e7e] cursor-pointer transition-colors">Best Sellers</span>
            <span className="hover:text-[#ed4e7e] cursor-pointer transition-colors">Bridal Store</span>
          </div>
        </div> */}
        <Hero/>
        <div className="px-3 sm:px-4 md:px-10 mt-4 space-y-8">
          {/* <Hero /> */}
          <OfferSection />   
          <HomeHero />
          
          <CategorySlider /> 

          {/* 🟢 FULL AUTO-SLICING SECTIONS ADDED HERE */}
          <div className="mt-12">
             <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-[#ed4e7e] uppercase italic tracking-tighter">
                   Our Exclusive Collections
                </h2>
                <div className="h-1 w-24 bg-pink-100 mx-auto mt-3 rounded-full"></div>
             </div>
             
             {/* Ye component saare pages ko section-wise load karega */}
             <AutoSliceSlider /> 
          </div>
        </div>

        {/* Trust Bar */}
        <div className="bg-[#fce4ec] border-y border-pink-100 py-10 mt-16">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-white p-3 rounded-full shadow-sm"><Truck size={24} className="text-[#ed4e7e]" /></div>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-700 tracking-tighter">Free Shipping</p>
                <p className="text-[9px] text-gray-500 italic">On orders above ₹999</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-white p-3 rounded-full shadow-sm"><ShieldCheck size={24} className="text-[#ed4e7e]" /></div>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-700 tracking-tighter">100% Privacy</p>
                <p className="text-[9px] text-gray-500 italic">Discreet Packaging</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-white p-3 rounded-full shadow-sm"><RotateCcw size={24} className="text-[#ed4e7e]" /></div>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-700 tracking-tighter">Easy Returns</p>
                <p className="text-[9px] text-gray-500 italic">7 Days No Question</p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-white p-3 rounded-full shadow-sm"><Zap size={24} fill="#ed4e7e" className="text-[#ed4e7e]" /></div>
              <div>
                <p className="text-[11px] font-black uppercase text-gray-700 tracking-tighter">Quick COD</p>
                <p className="text-[9px] text-gray-500 italic">Pay on delivery</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
