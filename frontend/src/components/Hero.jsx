"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-[#f0f2f5] py-4 md:py-8 px-3 sm:px-4">
      <div className="max-w-[1400px] mx-auto bg-white rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100">

        <div className="flex flex-col lg:flex-row">

          {/* ===== LEFT CONTENT ===== */}
          <div className="lg:w-[45%] p-6 sm:p-8 md:p-14 lg:p-20 flex flex-col justify-center text-center lg:text-left">

            <div className="mb-4 flex justify-center lg:justify-start">
              <span className="bg-[#0071dc] text-white text-[10px] sm:text-xs font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest shadow">
                ★ Rollback
              </span>
            </div>

            <h1 className="
              text-3xl sm:text-4xl md:text-6xl lg:text-8xl
              font-black text-[#041f41]
              leading-tight md:leading-[0.95]
              uppercase italic tracking-tighter mb-4
            ">
              Sculpt & Save
              <br />
              <span className="text-[#0071dc]">Up to 40% Off</span>
              <br />
              Shapewear
            </h1>

            <p className="text-gray-600 text-sm sm:text-base md:text-xl mb-6 md:mb-10 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
              Get the perfect fit for less. Premium control panties and hip enhancers now at low prices.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <button
                onClick={() =>
                  document
                    .getElementById("main-product-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="
                  w-full sm:w-auto
                  bg-[#0071dc] hover:bg-blue-700 text-white
                  font-black py-4 px-8 md:py-5 md:px-12
                  rounded-xl md:rounded-2xl
                  text-base md:text-xl
                  shadow-xl transition-all active:scale-95
                  uppercase italic
                "
              >
                Shop All Deals
              </button>

              <Link href="#featured-items" className="w-full sm:w-auto">
                <button
                  className="
                    w-full
                    bg-white border-2 border-[#0071dc] text-[#0071dc]
                    font-black py-4 px-8 md:py-5 md:px-12
                    rounded-xl md:rounded-2xl
                    text-base md:text-xl
                    hover:bg-blue-50 transition-all
                    uppercase italic
                  "
                >
                  View Essentials
                </button>
              </Link>
            </div>

            <p className="text-gray-400 text-[10px] sm:text-xs mt-6 italic font-semibold">
              *Offer valid until supplies last. Prices as marked.
            </p>
          </div>

          {/* ===== RIGHT IMAGES ===== */}
          <div className="lg:w-[55%] relative bg-[#f8f9fa] flex items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8">

            {/* Mobile Simple Image */}
            <div className="block lg:hidden w-full max-w-xs relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <Image
                src="/image/Women-HIP-PAD-PANTY/hip-pad-3.webp"
                alt="Shapewear"
                fill
                className="object-cover"
              />

              <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                SAVE 40%
              </div>
            </div>

            {/* ===== DESKTOP COLLAGE ===== */}
            <div className="hidden lg:block absolute inset-0">

              {/* Glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[80%] h-[80%] bg-blue-50 rounded-full blur-3xl opacity-50" />
              </div>

              {/* Image 1 */}
              <div className="absolute w-[45%] aspect-[3/4] top-[10%] left-[5%] -rotate-6 z-20 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white">
                <Image
                  src="/image/Women-HIP-PAD-PANTY/hip-pad.webp"
                  alt="Shapewear Front"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Image 2 */}
              <div className="absolute w-[50%] aspect-[3/4] top-[15%] right-[5%] rotate-3 z-30 rounded-[2rem] overflow-hidden shadow-2xl border-[6px] border-white">
                <Image
                  src="/image/Women-HIP-PAD-PANTY/hip-pad-3.webp"
                  alt="Shapewear Back"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded italic">
                  Hot Seller
                </div>
              </div>

              {/* Save Badge */}
              <div className="absolute top-[6%] right-[10%] bg-red-600 text-white w-24 h-24 flex flex-col items-center justify-center rounded-full font-black uppercase italic rotate-12 z-50 shadow-2xl border-4 border-white">
                <span className="text-xs">Save</span>
                <span className="text-2xl">40%</span>
              </div>

              {/* Before After */}
              <div className="absolute bottom-[8%] left-[10%] w-[60%] flex rounded-3xl overflow-hidden shadow-2xl z-40 border-[6px] border-white bg-white">
                <div className="w-1/2 aspect-square relative">
                  <Image
                    src="/image/Women-HIP-PAD-PANTY/hip-pad-1.webp"
                    alt="Before"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded">
                    Before
                  </span>
                </div>
                <div className="w-1/2 aspect-square relative">
                  <Image
                    src="/image/Women-HIP-PAD-PANTY/hip-pad-2.webp"
                    alt="After"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 right-2 bg-[#0071dc] text-white text-[10px] px-2 py-1 rounded">
                    After
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
