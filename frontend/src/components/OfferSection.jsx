"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function OfferSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* 🔴 FIXED: Hydration error hatane ke liye isClient check */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {isClient && Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="absolute animate-heart-pop text-pink-300/70"
            style={{
              left: `${(i * 7.5)}%`, // Consistent spacing instead of random
              animationDelay: `${i * 0.4}s`,
              fontSize: `${(i % 3) * 5 + 20}px`,
            }}
          >
            ❤
          </span>
        ))}
      </div>

      <div className="relative w-full">
        <Image
          src="/hero-image/hero-n.jpeg"
          alt="Offer Banner"
          width={1920}
          height={700}
          priority
          className="relative z-0 w-full h-auto object-cover"
        />
      </div>
    </section>
  );
}