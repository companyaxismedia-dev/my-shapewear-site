"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function HomeHero() {
  // 🟢 State for client-side mounting
  const [mounted, setMounted] = useState(false);
  const [heartStyles, setHeartStyles] = useState([]);

  useEffect(() => {
    // 🟢 Sirf browser par random values generate karein
    const styles = Array.from({ length: 14 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 4}s`,
      fontSize: `${Math.random() * 18 + 14}px`,
    }));
    setHeartStyles(styles);
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white mt-7">
      {/* ================= HEART SLICE POP ANIMATION ================= */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {/* 🟢 Jab tak mounted true na ho (server side), tab tak hearts render nahi honge */}
        {mounted &&
          heartStyles.map((style, i) => (
            <span
              key={i}
              className="absolute animate-heart-pop text-pink-300/60"
              style={style}
            >
              ❤
            </span>
          ))}
      </div>

      {/* ================= HERO BANNER IMAGE ================= */}
      <div className="relative w-full">
        <Image
          src="/hero-image/home-1.jpeg"
          alt="Bootybloom Home Banner"
          width={1920}
          height={850}
          priority
          className="w-full h-auto object-cover"
        />
      </div>

      {/* ================= HEART ANIMATION CSS ================= */}
      <style jsx>{`
        @keyframes heartPop {
          0% {
            transform: translateY(-40px) scale(0.6);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            transform: translateY(120vh) scale(1.15);
            opacity: 0;
          }
        }

        .animate-heart-pop {
          animation: heartPop 7s ease-in infinite;
        }
      `}</style>
    </section>
  );
}