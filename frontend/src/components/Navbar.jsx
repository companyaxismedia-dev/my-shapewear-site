"use client";
import React from 'react';
import LinkNav from "next/link";
import { Search, ShoppingCart, User, Heart, Menu, HelpCircle, Package } from "lucide-react";

export default function Navbar() {
  return (
    <>
      {/* 1. Google Font Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .clovia-font {
          font-family: 'Great Vibes', cursive;
        }
      `}</style>

      <header className="w-full font-sans shadow-sm">
        {/* Top Utilities Bar */}
        <div className="bg-white px-4 md:px-10 py-2 flex justify-between items-center text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b">
          <div className="flex gap-4">
            <span>Free Returns</span>
            <span>100% Privacy</span>
            <span>Cash on Delivery</span>
          </div>
          <div className="hidden md:flex gap-4 items-center">
            {/* ADDED: Top Bar Track Link */}
            <LinkNav href="/track" className="flex items-center gap-1 text-pink-600 hover:text-black transition">
              <Package size={13} /> Track Order
            </LinkNav>
            <span>Download the App</span>
            <span>Our Stores</span>
          </div>
        </div>

        {/* Main Logo & Search Section */}
        <div className="bg-white px-4 md:px-10 py-4 flex items-center justify-between gap-4">
          <button className="lg:hidden text-black">
            <Menu size={24} />
          </button>

          {/* Styled Booty Bloom Logo */}
          <LinkNav href="/" className="flex flex-col items-center group">
            <div className="flex items-baseline">
              <span className="clovia-font text-4xl md:text-5xl text-black transition-colors group-hover:text-pink-600">
                Booty Bloom
              </span>
              <span className="text-pink-600 font-bold text-sm ml-1">.online</span>
            </div>
          </LinkNav>

          {/* Minimalist Search with Updated Placeholder */}
          <div className="hidden md:flex flex-grow max-w-xl relative mx-10">
            <input 
              type="text" 
              placeholder="Search products or enter phone to track order..." 
              className="w-full bg-gray-50 py-2.5 px-10 rounded-full text-sm border border-gray-100 focus:outline-none focus:border-pink-200 transition"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-5 text-gray-700">
            <LinkNav href="/help" className="hidden md:block hover:text-pink-600 transition" title="Help">
              <HelpCircle size={22} strokeWidth={1.2} />
            </LinkNav>
            
            <LinkNav href="/login" className="hover:text-pink-600 transition">
              <User size={22} strokeWidth={1.2} />
            </LinkNav>
            <LinkNav href="/wishlist" className="relative hover:text-pink-600 transition">
              <Heart size={22} strokeWidth={1.2} />
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </LinkNav>
            <LinkNav href="/cart" className="relative hover:text-pink-600 transition">
              <ShoppingCart size={22} strokeWidth={1.2} />
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">0</span>
            </LinkNav>
          </div>
        </div>

        {/* Black Navigation Menu */}
        <nav className="bg-black text-white px-4 md:px-10">
          <div className="flex items-center justify-center gap-6 md:gap-10 py-3 text-[11px] md:text-[13px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap overflow-x-auto no-scrollbar">
            <LinkNav href="/bras" className="hover:text-pink-400 transition">Bras</LinkNav>
            <LinkNav href="/panties" className="hover:text-pink-400 transition">Panties</LinkNav>
            <LinkNav href="/nightwear" className="hover:text-pink-400 transition">Nightwear</LinkNav>
            <LinkNav href="/active" className="hover:text-pink-400 transition">Active</LinkNav>
            <LinkNav href="/shapewear" className="hover:text-pink-400 transition">Shapewear</LinkNav>
            <LinkNav href="/exclusive" className="bg-pink-600 px-3 py-1 rounded-sm text-white">Exclusive</LinkNav>
            
            {/* ADDED: Menu Track Link */}
            <LinkNav href="/track" className="hover:text-pink-400 transition flex items-center gap-1">
              Track Order
              <span className="h-1.5 w-1.5 bg-pink-500 rounded-full animate-pulse"></span>
            </LinkNav>
            
            <LinkNav href="/help" className="hover:text-pink-400 transition">Help</LinkNav>
          </div>
        </nav>

        {/* Promo Bar */}
        <div className="bg-[#8b1030] text-white text-center py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
          Valentine Special: Buy 2 Get 1 Free on Best Sellers
        </div>
      </header>
    </>
  );
}