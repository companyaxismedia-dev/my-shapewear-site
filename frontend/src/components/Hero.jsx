"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
  // --- HYDRATION FIX CODE ---
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // --------------------------

  const images = useMemo(() => [
    "/image/Women-HIP-PAD-PANTY/hip-pad.webp",
    "/image/Women-HIP-PAD-PANTY/HIP-PAD-3.webp",
    "/image/Women-HIP-PAD-PANTY/hip-pad-1.webp",
    "/image/Women-HIP-PAD-PANTY/hip-pad-2.webp"
  ], []);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative bg-[#f0f2f5] py-4 px-2 md:px-4 overflow-hidden min-h-screen flex flex-col justify-center">
      
      {/* --- BACKGROUND ANIMATION LAYER --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Moving Gradient Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-200/40 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -60, 0] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-blue-200/30 rounded-full blur-[120px]"
        />

        {/* Floating Particles (Hearts/Dots) - WRAPPED WITH MOUNTED CHECK */}
        {mounted && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "110vh", x: `${Math.random() * 100}vw`, opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 1, 0] }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "linear" 
            }}
            className="absolute text-pink-400/20 text-4xl"
          >
            {i % 2 === 0 ? "♥" : "●"}
          </motion.div>
        ))}
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        
        {/* 1. TOP BIG OFFER BANNER */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 bg-gradient-to-r from-red-600 via-pink-600 to-red-600 text-white text-center py-4 rounded-2xl shadow-2xl border-b-4 border-black/10"
        >
          <motion.h2 
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-2xl md:text-5xl font-black italic tracking-tighter uppercase px-2"
          >
            🔥 Valentine Special: BUY 1 GET 1 FREE 🔥
          </motion.h2>
        </motion.div>

        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/50">
          <div className="flex flex-col lg:flex-row items-stretch min-h-[600px] md:min-h-[750px]">
            
            {/* Left Section: Content */}
            <div className="lg:w-[45%] p-8 md:p-16 lg:p-20 flex flex-col justify-center text-center lg:text-left order-2 lg:order-1">
              <motion.div 
                initial={{ x: -30, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                className="mb-6"
              >
                <span className="bg-[#0071dc] text-white text-xs font-black px-5 py-2.5 rounded-full uppercase italic tracking-widest shadow-lg inline-block">
                  ★ BEST SELLER 2026
                </span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[#041f41] leading-[0.9] mb-8 uppercase italic tracking-tighter">
                SCULPT & <span className="text-pink-600">SAVE</span><br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0071dc] to-blue-400">40% OFF</span>
              </h1>
              
              <p className="text-gray-600 text-lg md:text-2xl mb-12 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                Experience instant confidence with our premium collection. Perfect lift, perfect shape.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-black text-white font-black py-5 md:py-7 px-12 md:px-20 rounded-2xl text-xl md:text-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:bg-pink-600 transition-all uppercase italic tracking-wider"
                >
                  SHOP NOW
                </motion.button>
              </div>
            </div>

            {/* Right Section: SLIDER */}
            <div className="lg:w-[55%] relative flex items-center justify-center overflow-hidden order-1 lg:order-2 bg-gradient-to-b from-transparent to-pink-50/30">
              
              <div className="relative w-full h-full p-6 md:p-16 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 100, rotate: 5 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -100, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="relative w-full aspect-[4/5] md:h-[680px] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.2)] border-[12px] border-white"
                  >
                    <Image 
                      src={images[currentIndex]} 
                      alt="Latest Shapewear" 
                      fill 
                      className="object-cover"
                      priority
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 text-white">
                      <p className="font-black text-2xl md:text-3xl italic uppercase tracking-tighter">Premium Quality</p>
                      <p className="font-bold text-sm md:text-base opacity-90 mt-1 italic text-pink-200">✨ Confidence in every curve</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Slider Dots */}
                <div className="absolute bottom-10 flex gap-4 z-30">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-3 transition-all duration-500 rounded-full ${
                        index === currentIndex ? 'w-12 bg-pink-600' : 'w-3 bg-gray-400/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Rotating Sale Badge */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-10 right-10 bg-red-600 text-white w-28 h-28 md:w-40 md:h-40 flex flex-col items-center justify-center rounded-full font-black uppercase italic z-40 shadow-2xl border-8 border-white/30"
              >
                <span className="text-xs md:text-base">HOT SALE</span>
                <span className="text-3xl md:text-5xl leading-none">50%</span>
                <span className="text-xs md:text-base">OFF</span>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}