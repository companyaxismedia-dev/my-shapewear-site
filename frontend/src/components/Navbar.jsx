"use client";
import React, { useState } from "react";
import LinkNav from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  User,
  Heart,
  Menu,
  HelpCircle,
  Package,
  X,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Fonts & utils – SAME */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap");
        .clovia-font {
          font-family: "Great Vibes", cursive;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <header className="w-full font-sans shadow-sm">
        {/* ================= TOP BAR (UNCHANGED) ================= */}
        <div className="bg-white px-4 md:px-10 py-2 flex justify-between items-center text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b">
          <div className="flex gap-4">
            <span>Free Returns</span>
            <span>100% Privacy</span>
            <span>Cash on Delivery</span>
          </div>
          <div className="hidden md:flex gap-4 items-center">
            <LinkNav
              href="/track"
              className="flex items-center gap-1 text-pink-600 hover:text-black transition"
            >
              <Package size={13} /> Track Order
            </LinkNav>
            <span>Download the App</span>
            <span>Our Stores</span>
          </div>
        </div>

        {/* ================= MAIN LOGO BAR (UNCHANGED) ================= */}
        <div className="bg-[#fce4ec] px-4 md:px-10 py-4 flex items-center justify-between relative border-b border-pink-100">
          {/* Left: Menu */}
          <div className="flex items-center z-10 lg:w-1/3">
            <button
              className="lg:hidden text-black"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Center Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <LinkNav
              href="/"
              className="flex items-center gap-2 md:gap-3 pointer-events-auto"
            >
              <div className="relative w-12 h-12 md:w-16 md:h-16 drop-shadow-sm">
                <Image
                  src="/image/booty-bloom.webp"
                  alt="Booty Bloom Logo"
                  fill
                  className="object-contain rounded-full border-2 border-orange-400"
                />
              </div>
              <div className="flex items-baseline drop-shadow-sm">
                <span className="clovia-font text-3xl md:text-5xl text-pink-600">
                  Booty
                </span>
                <span className="clovia-font text-3xl md:text-5xl text-orange-500 ml-2">
                  Bloom
                </span>
                <span className="text-gray-800 font-bold text-xs md:text-sm ml-1 lowercase">
                  .online
                </span>
              </div>
            </LinkNav>
          </div>

          {/* Right Icons */}
          <div className="flex items-center justify-end gap-3 md:gap-5 text-gray-700 z-10 lg:w-1/3">
            <LinkNav
              href="/help"
              className="hidden md:block hover:text-pink-600 transition"
            >
              <HelpCircle size={22} />
            </LinkNav>
            <LinkNav href="/login">
              <User size={22} />
            </LinkNav>
            <LinkNav href="/wishlist" className="relative">
              <Heart size={22} />
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </LinkNav>
            <LinkNav href="/cart" className="relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </LinkNav>
          </div>
        </div>

        {/* ================= DESKTOP NAV (UNCHANGED) ================= */}
        <nav className="bg-black text-white px-4 md:px-10">
          <div className="flex items-center justify-center gap-6 md:gap-10 py-3 text-[11px] md:text-[13px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap overflow-x-auto no-scrollbar">
            {[
              "Bras",
              "Panties",
              "Nightwear",
              "Active",
              "Shapewear",
            ].map((i) => (
              <LinkNav
                key={i}
                href={`/${i.toLowerCase()}`}
                className="hover:text-pink-400"
              >
                {i}
              </LinkNav>
            ))}
            <LinkNav
              href="/exclusive"
              className="bg-pink-600 px-3 py-1 rounded-sm"
            >
              Exclusive
            </LinkNav>
            <LinkNav href="/track">Track Order</LinkNav>
            <LinkNav href="/contact">Contact</LinkNav>
            <LinkNav href="/help">Help</LinkNav>
          </div>
        </nav>

        {/* Promo */}
        <div className="bg-[#8b1030] text-white text-center py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
          Valentine Special: Buy 2 Get 1 Free on Best Sellers
        </div>
      </header>

      {/* ================= MOBILE DRAWER (NEW, DESKTOP SAFE) ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div className="bg-white w-[80%] h-full p-5">
            <div className="flex justify-between mb-4">
              <span className="clovia-font text-2xl text-pink-600">
                Booty Bloom
              </span>
              <button onClick={() => setMenuOpen(false)}>
                <X />
              </button>
            </div>

            {[
              "Bras",
              "Panties",
              "Nightwear",
              "Active",
              "Shapewear",
              "Exclusive",
            ].map((item) => (
              <LinkNav
                key={item}
                href={`/${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="block py-3 border-b font-semibold"
              >
                {item}
              </LinkNav>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
