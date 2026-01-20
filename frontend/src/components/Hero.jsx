"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="bg-[#f0f2f5] py-2 md:py-8 px-2 md:px-4">
      <div className="max-w-[1400px] mx-auto bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100">
        <div className="flex flex-col lg:flex-row items-stretch min-h-[500px] md:min-h-[600px]">
          
          {/* Left Section: Text Content */}
          <div className="lg:w-[45%] p-6 md:p-12 lg:p-20 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
            <div className="mb-4 md:mb-6">
              <span className="bg-[#0071dc] text-white text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest shadow-md inline-block">
                ★ ROLLBACK
              </span>
            </div>
            
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-[#041f41] leading-[1] md:leading-[0.9] mb-4 md:mb-6 uppercase italic tracking-tighter">
              SCULPT & SAVE:<br />
              <span className="text-[#0071dc]">UP TO 40% OFF</span><br />
              SHAPEWEAR
            </h1>
            
            <p className="text-gray-600 text-base md:text-xl mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
              Get the perfect fit for less. Premium control panties and hip enhancers now at low prices.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => document.getElementById('main-product-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-[#0071dc] hover:bg-blue-700 text-white font-black py-4 md:py-5 px-8 md:px-12 rounded-xl md:rounded-2xl text-lg md:text-xl shadow-2xl transition-all active:scale-95 uppercase italic tracking-tight"
              >
                SHOP ALL DEALS
              </button>
              
              <Link href="#featured-items" className="w-full sm:w-auto">
                <button className="w-full bg-white border-2 border-[#0071dc] text-[#0071dc] font-black py-4 md:py-5 px-8 md:px-12 rounded-xl md:rounded-2xl text-lg md:text-xl hover:bg-blue-50 transition-all uppercase italic tracking-tight">
                  VIEW ESSENTIALS
                </button>
              </Link>
            </div>
            
            <p className="text-gray-400 text-[10px] md:text-xs mt-6 md:mt-8 italic font-semibold">
              *Offer valid until supplies last. Prices as marked.
            </p>
          </div>

          {/* Right Section: Layered Collage (Responsive Optimized) */}
          <div className="lg:w-[55%] relative min-h-[400px] md:min-h-[500px] lg:min-h-full bg-[#f8f9fa] flex items-center justify-center overflow-hidden p-4 md:p-8 order-1 lg:order-2">
            
            {/* Background Decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-100 rounded-full blur-3xl opacity-40"></div>

            {/* --- MOBILE VIEW: Simple Grid/Stack (Hidden on Desktop) --- */}
            <div className="lg:hidden grid grid-cols-2 gap-3 w-full relative z-10">
               <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white shadow-lg rotate-[-2deg]">
                  <Image src="/image/Women-HIP-PAD-PANTY/hip-pad.webp" alt="img" fill className="object-cover" />
               </div>
               <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-4 border-white shadow-lg rotate-[2deg]">
                  <Image src="/image/Women-HIP-PAD-PANTY/hip-pad-3.webp" alt="img" fill className="object-cover" />
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded italic">HOT</div>
               </div>
               <div className="col-span-2 relative aspect-[16/9] rounded-2xl overflow-hidden border-4 border-white shadow-xl mt-2">
                  <div className="flex h-full">
                    <div className="w-1/2 relative border-r-2 border-white"><Image src="/image/Women-HIP-PAD-PANTY/hip-pad-1.webp" alt="B" fill className="object-cover" /></div>
                    <div className="w-1/2 relative"><Image src="/image/Women-HIP-PAD-PANTY/hip-pad-2.webp" alt="A" fill className="object-cover" /></div>
                  </div>
               </div>
            </div>

            {/* --- DESKTOP VIEW: Layered Collage (Hidden on Mobile) --- */}
            <div className="hidden lg:block absolute inset-0">
                {/* Image 1: Top Left */}
                <div className="absolute w-[42%] aspect-[3/4] top-[10%] left-[5%] -rotate-6 z-20 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white transition-all hover:rotate-0 hover:scale-105 duration-500">
                  <Image src="/image/Women-HIP-PAD-PANTY/hip-pad.webp" alt="Shapewear" fill className="object-cover" />
                </div>

                {/* Image 2: Main Right */}
                <div className="absolute w-[48%] aspect-[3/4] top-[15%] right-[5%] rotate-3 z-30 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white transition-all hover:rotate-0 hover:scale-105 duration-500">
                  <Image src="/image/Women-HIP-PAD-PANTY/hip-pad-3.webp" alt="Shapewear Focus" fill className="object-cover" />
                  <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded italic uppercase z-40">Hot Seller</div>
                </div>

                {/* Before/After: Bottom Layer */}
                <div className="absolute bottom-[8%] left-[10%] w-[60%] flex rounded-3xl overflow-hidden shadow-2xl z-40 border-[6px] border-white bg-white group transition-all hover:scale-105">
                  <div className="w-1/2 aspect-square relative border-r-2 border-gray-100">
                    <Image src="/image/Women-HIP-PAD-PANTY/hip-pad-1.webp" alt="Before" fill className="object-cover" />
                    <div className="absolute bottom-3 left-3 bg-black/80 text-white text-[10px] font-black px-3 py-1 rounded-lg">BEFORE</div>
                  </div>
                  <div className="w-1/2 aspect-square relative">
                    <Image src="/image/Women-HIP-PAD-PANTY/hip-pad-2.webp" alt="After" fill className="object-cover" />
                    <div className="absolute bottom-3 right-3 bg-[#0071dc] text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-lg">AFTER</div>
                  </div>
                </div>

                {/* Info Pill */}
                <div className="absolute top-[65%] right-[5%] bg-white/90 backdrop-blur-md border-2 border-pink-100 px-5 py-3 rounded-2xl shadow-xl z-50 max-w-[180px]">
                   <h4 className="text-[12px] font-black uppercase text-pink-600 mb-1 italic">✨ PERFECT FIT</h4>
                   <p className="text-[10px] text-gray-700 font-bold leading-tight italic">Beautiful curves, stylish look.</p>
                </div>
            </div>

            {/* Floating Sale Badge (Always Visible) */}
            <div className="absolute top-4 right-4 md:top-[5%] md:right-[10%] bg-red-600 text-white w-16 h-16 md:w-24 md:h-24 flex flex-col items-center justify-center rounded-full font-black uppercase italic rotate-12 z-[60] shadow-2xl border-4 border-white animate-bounce text-center leading-tight">
              <span className="text-[10px] md:text-xs">SAVE</span>
              <span className="text-lg md:text-2xl">40%</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
