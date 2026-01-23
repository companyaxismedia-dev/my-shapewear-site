"use client";

import { useEffect, useState } from "react";

const banners = [
  "/hero-image/hero-1.png",
  "/hero-image/hero-2.png",
  "/hero-image/hero-3.png",
];

export default function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">

      {/* HERO SLIDER */}
      <div
        className="relative w-full"
        style={{ height: "85vh" }}   // 🔥 MOST IMPORTANT
      >
        {banners.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === active ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={src}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* LEFT ARROW */}
        <button
          onClick={() =>
            setActive((active - 1 + banners.length) % banners.length)
          }
          className="absolute left-5 top-1/2 -translate-y-1/2 z-20
                     bg-black/50 text-white w-10 h-10 rounded-full"
        >
          ‹
        </button>

        {/* RIGHT ARROW */}
        <button
          onClick={() => setActive((active + 1) % banners.length)}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-20
                     bg-black/50 text-white w-10 h-10 rounded-full"
        >
          ›
        </button>
      </div>

      {/* TRUST STRIP */}
      <div className="w-full bg-[#001e3c] py-3">
        <div className="max-w-7xl mx-auto flex justify-around text-xs font-bold text-white uppercase">
          <span>🚚 Free Shipping</span>
          <span className="hidden md:block">🔒 Secure Checkout</span>
          <span className="hidden md:block">↩ 7 Days Return</span>
          <span>💵 Cash on Delivery</span>
        </div>
      </div>

    </section>
  );
}
