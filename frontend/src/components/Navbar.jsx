"use client";
import React, { useState } from "react";
import LinkNav from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext"; 
import {
  ShoppingCart,
  User,
  Heart,
  Menu,
  HelpCircle,
  Package,
  X,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBraHovered, setIsBraHovered] = useState(false); // For Mega Menu
  const [braMobileOpen, setBraMobileOpen] = useState(false); // For Mobile Accordion
  
  const { cart } = useCart(); 
  const cartCount = cart ? cart.reduce((acc, item) => acc + item.qty, 0) : 0;

  // Bra Categories Structure
  const braCategories = {
    styles: [
      { name: "Padded Bras", path: "/bra/padded" },
      { name: "Push-up Bras", path: "/bra/push-up" },
      { name: "T-Shirt Bras", path: "/bra/t-shirt" },
      { name: "Bralettes", path: "/bra/bralette" },
      { name: "Sports Bras", path: "/bra/sports" },
    ],
    padding: [
      { name: "Non Padded", path: "/bra/non-padded" },
      { name: "Lightly Padded", path: "/bra/lightly-padded" },
      { name: "Heavily Padded", path: "/bra/heavily-padded" },
    ],
    coverage: [
      { name: "Full Coverage", path: "/bra/full" },
      { name: "Medium Coverage", path: "/bra/medium" },
      { name: "Demi Cup", path: "/bra/demi" },
    ],
    solutions: [
      { name: "Backless Solution", path: "/bra/backless" },
      { name: "Bridal Wear", path: "/bra/bridal" },
      { name: "Maternity Bras", path: "/bra/maternity" },
      { name: "Teenager Bras", path: "/bra/teenager" },
    ]
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap");
        .clovia-font {
          font-family: "Great Vibes", cursive;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <header className="w-full font-sans shadow-sm sticky top-0 z-[100]">
        {/* ================= TOP BAR ================= */}
        <div className="bg-white px-4 md:px-10 py-2 flex justify-between items-center text-[10px] md:text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b">
          <div className="flex gap-4">
            <span>Free Returns</span>
            <span>100% Privacy</span>
            <span>Cash on Delivery</span>
          </div>
          <div className="hidden md:flex gap-4 items-center">
            <LinkNav href="/track" className="flex items-center gap-1 text-pink-600 hover:text-black transition">
              <Package size={13} /> Track Order
            </LinkNav>
            <span>Download the App</span>
            <span>Our Stores</span>
          </div>
        </div>

        {/* ================= MAIN LOGO BAR ================= */}
        <div className="bg-[#fce4ec] px-4 md:px-10 py-4 flex items-center justify-between relative border-b border-pink-100">
          <div className="flex items-center z-10 lg:w-1/3">
            <button className="lg:hidden text-black" onClick={() => setMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <LinkNav href="/" className="flex items-center gap-2 md:gap-3 pointer-events-auto">
              <div className="relative w-12 h-12 md:w-16 md:h-16 drop-shadow-sm">
                <Image
                  src="/image/booty-bloom.webp"
                  alt="Booty Bloom Logo"
                  fill
                  className="object-contain rounded-full border-2 border-orange-400"
                />
              </div>
              <div className="flex items-baseline drop-shadow-sm">
                <span className="clovia-font text-3xl md:text-5xl text-pink-600">Booty</span>
                <span className="clovia-font text-3xl md:text-5xl text-orange-500 ml-2">Bloom</span>
                <span className="text-gray-800 font-bold text-xs md:text-sm ml-1 lowercase">.online</span>
              </div>
            </LinkNav>
          </div>

          <div className="flex items-center justify-end gap-3 md:gap-5 text-gray-700 z-10 lg:w-1/3">
            <LinkNav href="/help" className="hidden md:block hover:text-pink-600 transition">
              <HelpCircle size={22} />
            </LinkNav>
            <LinkNav href="/login"><User size={22} /></LinkNav>
            <LinkNav href="/wishlist" className="relative">
              <Heart size={22} />
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
            </LinkNav>
            <LinkNav href="/cart" className="relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </LinkNav>
          </div>
        </div>

        {/* ================= DESKTOP NAV WITH VERTICAL MEGA MENU ================= */}
        <nav className="bg-black text-white px-4 md:px-10 relative">
          <div className="flex items-center justify-center gap-6 md:gap-10 py-3 text-[11px] md:text-[13px] font-semibold uppercase tracking-[0.15em] whitespace-nowrap overflow-x-auto no-scrollbar">
            <LinkNav href="/" className="text-pink-400 hover:text-white transition-colors">Home</LinkNav>

            {/* --- VERTICAL MEGA MENU: BRAS --- */}
            <div 
              className="static group" 
              onMouseEnter={() => setIsBraHovered(true)} 
              onMouseLeave={() => setIsBraHovered(false)}
            >
              <LinkNav href="/bra" className="hover:text-pink-400 transition-colors flex items-center gap-1 py-1">
                Bras <ChevronDown size={14} className={isBraHovered ? "rotate-180 transition-transform" : "transition-transform"} />
              </LinkNav>

              {isBraHovered && (
                <div className="absolute top-full left-0 w-full bg-white text-black shadow-2xl border-t-2 border-pink-600 z-[110] flex animate-in fade-in slide-in-from-top-2 duration-300">
                  
                  {/* Left Sidebar for Vertical Category Titles */}
                  <div className="w-1/4 bg-gray-50 border-r border-gray-100 flex flex-col font-black text-[12px] uppercase tracking-tighter">
                    <div className="p-6 border-b border-gray-200 bg-pink-50 text-pink-600 italic">Bra Collections</div>
                    <div className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer hover:text-pink-600">Shop By Style</div>
                    <div className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer hover:text-pink-600">By Padding</div>
                    <div className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer hover:text-pink-600">By Coverage</div>
                    <div className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer hover:text-pink-600">Specific Solutions</div>
                  </div>

                  {/* Right Content Grid */}
                  <div className="w-3/4 grid grid-cols-4 gap-8 p-10 bg-white">
                    
                    {/* Column 1: Styles */}
                    <div>
                      <h3 className="font-black text-pink-600 mb-4 text-[13px] border-b-2 border-pink-100 pb-2 uppercase tracking-tight">Styles</h3>
                      <ul className="flex flex-col gap-3">
                        {braCategories.styles.map((item) => (
                          <li key={item.name}>
                            <LinkNav href={item.path} className="hover:text-pink-600 text-[11px] font-bold transition-all hover:translate-x-1 block italic">{item.name}</LinkNav>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 2: Padding */}
                    <div>
                      <h3 className="font-black text-pink-600 mb-4 text-[13px] border-b-2 border-pink-100 pb-2 uppercase tracking-tight">Padding</h3>
                      <ul className="flex flex-col gap-3">
                        {braCategories.padding.map((item) => (
                          <li key={item.name}>
                            <LinkNav href={item.path} className="hover:text-pink-600 text-[11px] font-bold transition-all hover:translate-x-1 block italic">{item.name}</LinkNav>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Column 3: Coverage & Solutions */}
                    <div className="flex flex-col gap-8">
                        <div>
                            <h3 className="font-black text-pink-600 mb-4 text-[13px] border-b-2 border-pink-100 pb-2 uppercase tracking-tight">Coverage</h3>
                            <ul className="flex flex-col gap-3">
                                {braCategories.coverage.map((item) => (
                                <li key={item.name}>
                                    <LinkNav href={item.path} className="hover:text-pink-600 text-[11px] font-bold transition-all hover:translate-x-1 block italic">{item.name}</LinkNav>
                                </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-black text-pink-600 mb-4 text-[13px] border-b-2 border-pink-100 pb-2 uppercase tracking-tight">Solutions</h3>
                            <ul className="flex flex-col gap-3">
                                {braCategories.solutions.map((item) => (
                                <li key={item.name}>
                                    <LinkNav href={item.path} className="hover:text-pink-600 text-[11px] font-bold transition-all hover:translate-x-1 block italic">{item.name}</LinkNav>
                                </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Column 4: Banner */}
                    <div className="bg-pink-100 p-6 rounded-xl flex flex-col items-center justify-center text-center">
                        <div className="relative w-16 h-16 mb-2">
                           <Image src="/image/booty-bloom.webp" alt="Promo" fill className="object-contain" />
                        </div>
                        <p className="text-[10px] font-black text-pink-500 uppercase">Special Offer</p>
                        <h4 className="clovia-font text-3xl text-gray-800">Buy 2 Get 1</h4>
                        <LinkNav href="/bra" className="mt-4 bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase">Shop Now</LinkNav>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {[
              { name: "Panties", path: "/panties" },
              { name: "Lingerie", path: "/lingerie" },
              { name: "Shapewear", path: "/shapewear" },
              { name: "Curvy", path: "/curvy" },
              { name: "Tummy Control", path: "/tummy-control" },
            ].map((link) => (
              <LinkNav key={link.name} href={link.path} className="hover:text-pink-400 transition-colors">{link.name}</LinkNav>
            ))}

            <LinkNav href="/exclusive" className="bg-pink-600 px-3 py-1 rounded-sm">Exclusive</LinkNav>
            <LinkNav href="/track">Track Order</LinkNav>
            <LinkNav href="/contact">Contact</LinkNav>
            <LinkNav href="/help">Help</LinkNav>
          </div>
        </nav>

        <div className="bg-[#8b1030] text-white text-center py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
          Valentine Special: Buy 2 Get 1 Free on Best Sellers
        </div>
      </header>

      {/* ================= MOBILE DRAWER (Logic Unchanged) ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-[150] bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="bg-white w-[85%] h-full p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="clovia-font text-3xl text-pink-600">Booty Bloom</span>
              </div>
              <button onClick={() => setMenuOpen(false)} className="text-gray-500"><X size={28} /></button>
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto h-[80vh] no-scrollbar">
              <LinkNav href="/" onClick={() => setMenuOpen(false)} className="block py-4 border-b text-sm font-black uppercase tracking-widest text-pink-600">Home</LinkNav>
              
              <div className="border-b">
                <button 
                  onClick={() => setBraMobileOpen(!braMobileOpen)}
                  className="w-full flex justify-between items-center py-4 text-sm font-black uppercase tracking-widest text-gray-800"
                >
                  Bras <ChevronDown size={18} className={braMobileOpen ? "rotate-180 transition-transform" : ""} />
                </button>
                {braMobileOpen && (
                  <div className="bg-gray-50 pl-4 py-2 flex flex-col gap-4">
                    <div>
                      <p className="text-[10px] font-black text-pink-500 uppercase">Shop By Style</p>
                      {braCategories.styles.map((sub) => (
                        <LinkNav key={sub.name} href={sub.path} onClick={() => setMenuOpen(false)} className="block py-1 text-xs font-bold text-gray-600 uppercase mt-1">{sub.name}</LinkNav>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-pink-500 uppercase">Padding</p>
                      {braCategories.padding.map((sub) => (
                        <LinkNav key={sub.name} href={sub.path} onClick={() => setMenuOpen(false)} className="block py-1 text-xs font-bold text-gray-600 uppercase mt-1">{sub.name}</LinkNav>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {[
                { name: "Panties", path: "/panties" },
                { name: "Lingerie", path: "/lingerie" },
                { name: "Shapewear", path: "/shapewear" },
                { name: "Curvy", path: "/curvy" },
                { name: "Tummy Control", path: "/tummy-control" },
                { name: "Exclusive Offers", path: "/exclusive" },
              ].map((item) => (
                <LinkNav key={item.name} href={item.path} onClick={() => setMenuOpen(false)} className="block py-4 border-b text-sm font-black uppercase tracking-widest text-gray-800">{item.name}</LinkNav>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}