"use client";
import React, { useState, useEffect } from "react";

export default function OfferSection() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white mt-[-70px] md:mt-6">
      
      {/* Floating hearts */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full pb-3 z-20 overflow-hidden">
        {isClient &&
          Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="absolute animate-heart-pop text-pink-300/70"
              style={{
                top: "0",
                left: window.innerWidth < 768 ? `${i * 6.5}%` : `${i * 7.5}%`,
                animationDelay: `${i * 0.4}s`,
                fontSize: `${(i % 3) * 5 + 20}px`,
              }}
            >
              ❤
            </span>
          ))}
      </div>

      {/* Responsive image */}
      <div className="relative w-full">
        <picture className="w-full block">
          <source
            srcSet="/hero-image/banner1mobile.jpeg"
            media="(max-width: 767px)"
          />
          <img
            src="/hero-image/Banner-1.jpeg"
            alt="Offer Banner"
            width={1966}
            height={835}
            className="w-full h-auto block select-none"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              aspectRatio: "1966 / 835",
            }}
            loading="lazy"
          />
        </picture>
      </div>

      <style jsx global>{`
        @media (max-width: 767px) {
          picture img[alt="Offer Banner"] {
            aspect-ratio: 2 / 3 !important;
            width: 100vw !important;
            height: auto !important;
            object-fit: contain !important;
          }
        }
      `}</style>
    </section>
  );
}
