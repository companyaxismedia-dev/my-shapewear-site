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
  Store,
  Smartphone,
} from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBraHovered, setIsBraHovered] = useState(false);
  // Mobile ke liye sub-menu state
  const [mobileBraOpen, setMobileBraOpen] = useState(false);

  const { cart } = useCart();
  const cartCount = cart ? cart.reduce((acc, item) => acc + item.qty, 0) : 0;

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

      <header className="w-full font-sans shadow-sm sticky top-0 z-[100] bg-white">
        <div className="hidden md:block text-[10px] font-semibold uppercase">
          <div className="max-w-[1400px] mx-auto px-6 h-5 flex items-center justify-between text-gray-600 leading-none">

            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className=" text-sm md:text-[11px]">🚚Free Returns</span>
              </div>
              <div className="flex items-center gap-1">
                <span className=" text-sm md:text-[11px]">🔒100% Privacy</span>
              </div>
              <div className="flex items-center gap-1">
                <span className=" text-sm md:text-[11px]">💵Cash on Delivery</span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-6">
              <LinkNav href="/track" className="hover:text-pink-600">Track Order</LinkNav>
              <LinkNav href="/app" className="flex items-center gap-1 hover:text-pink-600">
                <Smartphone size={12} /> Download App
              </LinkNav>
              <LinkNav href="/stores" className="flex items-center gap-1 hover:text-pink-600">
                <Store size={12} /> Our Stores
              </LinkNav>
            </div>
          </div>
        </div>

        {/* ================= MAIN LOGO BAR ================= */}
        <div className="bg-white px-4 md:px-6 lg:px-10">
          <div className="max-w-[1400px] mx-auto py-4 flex items-center justify-between relative">
            <div className="flex items-center z-10 w-1/3">
              <button className="lg:hidden text-black p-2 -ml-2 rounded-md active:bg-pink-100" onClick={() => setMenuOpen(true)}>
                <Menu size={26} />
              </button>
            </div>

            {/* Logo Section - Circles and Borders Removed */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[100]">
              <LinkNav href="/" className="flex items-center pointer-events-auto">
                <div className="relative w-32 h-20 md:w-44 md:h-16 lg:w-44 lg:h-35 p-12 m-12">
                  <Image
                    src="/hero-image/glovialogo.png"
                    alt="Glovia Logo"
                    fill
                    priority
                    className="  object-cover transition-transform duration-300 hover:scale-105 "
                  />
                </div>
              </LinkNav>
            </div>

            <div className="flex items-center justify-end gap-4 text-gray-700 z-10 w-1/3">
              <LinkNav href="/help" className="hidden sm:flex p-1/2 hover:text-pink-600 transition">
                <HelpCircle size={22} />
              </LinkNav>
              <LinkNav href="/login" className="p-1/2"><User size={22} /></LinkNav>
              <LinkNav href="/wishlist" className="relative p-1/2">
                <Heart size={22} />
                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
              </LinkNav>
              <LinkNav href="/cart" className="relative p-1/2">
                <ShoppingCart size={22} />
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              </LinkNav>
            </div>
          </div>
        </div>

        {/* ================= DESKTOP & TAB NAV ================= */}
        <nav className="hidden lg:block bg-black text-white px-4 md:px-6 lg:px-10 relative">
          <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-4 xl:gap-10 hover:cursor-pointer py-3 text-[10px] xl:text-[13px] font-semibold uppercase tracking-wider xl:tracking-[0.15em]">
            <LinkNav href="/" className="text-pink-400 hover:text-white transition-colors">Home</LinkNav>

            <div
              className="static group px-3 py-2"
              onMouseEnter={() => setIsBraHovered(true)}
              onMouseLeave={() => setIsBraHovered(false)}
            >
              <LinkNav href="/bra" className="hover:text-pink-400 transition-colors duration-300 delay-300 flex items-center">
                Bras <ChevronDown size={14} className={`transition-transform duration-300 ${isBraHovered ? "rotate-180" : ""}`} />
              </LinkNav>

              {isBraHovered && (
                <div className="absolute top-full left-0 w-full bg-white text-black shadow-2xl border-t-2 border-pink-600 z-[110] flex">
                  <div className="w-1/4 bg-gray-50 border-r border-gray-100 flex flex-col font-black text-[12px] uppercase tracking-tighter">
                    <div className="p-6 border-b border-gray-200 bg-pink-50 text-pink-600 italic">Bra Collections</div>
                    <div className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer hover:text-pink-600">Shop By Style</div>
                    <div className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer hover:text-pink-600">By Padding</div>
                    <div className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer hover:text-pink-600">By Coverage</div>
                    <div className="p-4 border-b border-gray-100 hover:bg-white cursor-pointer hover:text-pink-600">Specific Solutions</div>
                  </div>

                  <div className="w-3/4 grid grid-cols-4 gap-8 p-10 bg-white">
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
                    <div className="bg-pink-100 p-6 rounded-xl flex flex-col items-center justify-center text-center">
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

            <LinkNav href="/exclusive" className="bg-pink-600 px-3 py-1 rounded-sm whitespace-nowrap">Exclusive</LinkNav>
            <LinkNav href="/track" className="whitespace-nowrap">Track Order</LinkNav>
            <LinkNav href="/contact">Contact</LinkNav>
            <LinkNav href="/help" className="hidden xl:block">Help</LinkNav>
          </div>
        </nav>

        <div className="bg-[#e50075] text-white text-center py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
          Valentine Special: Buy 2 Get 1 Free on Best Sellers
        </div>
      </header>

      {/* ================= MOBILE & TAB DRAWER ================= */}
      {menuOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="bg-white w-[85%] md:w-[45%] h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex justify-between items-center border-b sticky top-0 bg-white">
              <Image src="/hero-image/glovialogo.png" alt="Logo" width={100} height={40} className="object-contain" />
              <X size={28} className="text-gray-500 cursor-pointer" onClick={() => setMenuOpen(false)} />
            </div>

            <div className="p-2 flex flex-col font-bold text-sm uppercase tracking-widest divide-y divide-gray-100">
              <LinkNav href="/" className="px-6 py-5 active:bg-pink-50 flex justify-between items-center" onClick={() => setMenuOpen(false)}>
                Home <ChevronDown size={14} className="-rotate-90 opacity-20" />
              </LinkNav>

              {/* Tappable Bra Section */}
              <div className="flex flex-col">
                <div
                  className="px-6 py-5 active:bg-pink-50 flex justify-between items-center cursor-pointer"
                  onClick={() => setMobileBraOpen(!mobileBraOpen)}
                >
                  <span className={mobileBraOpen ? "text-pink-600" : ""}>Bras</span>
                  <ChevronDown size={18} className={`transition-transform duration-300 ${mobileBraOpen ? "rotate-180 text-pink-600" : ""}`} />
                </div>

                {/* Mobile Sub-categories */}
                {mobileBraOpen && (
                  <div className="bg-gray-50 px-8 py-4 flex flex-col gap-6 lowercase">
                    {Object.entries(braCategories).map(([key, items]) => (
                      <div key={key}>
                        <h3 className="text-[10px] text-pink-500 font-black uppercase mb-3 tracking-tighter">{key}</h3>
                        <div className="flex flex-col gap-3 border-l-2 border-pink-100 pl-4">
                          {items.map((sub) => (
                            <LinkNav
                              key={sub.name}
                              href={sub.path}
                              className="text-gray-600 text-[12px] font-medium"
                              onClick={() => setMenuOpen(false)}
                            >
                              {sub.name}
                            </LinkNav>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <LinkNav href="/panties" className="px-6 py-5 active:bg-pink-50" onClick={() => setMenuOpen(false)}>Panties</LinkNav>
              <LinkNav href="/lingerie" className="px-6 py-5 active:bg-pink-50" onClick={() => setMenuOpen(false)}>Lingerie</LinkNav>
              <LinkNav href="/exclusive" className="px-6 py-5 text-pink-600 active:bg-pink-50" onClick={() => setMenuOpen(false)}>Exclusive Items</LinkNav>

              <LinkNav href="/track" className="px-6 py-5 active:bg-pink-50 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <Package size={18} /> Track Order
              </LinkNav>
              <LinkNav href="/contact" className="px-6 py-5 active:bg-pink-50" onClick={() => setMenuOpen(false)}>Contact Us</LinkNav>
              <LinkNav href="/help" className="px-6 py-5 active:bg-pink-50" onClick={() => setMenuOpen(false)}>Help & FAQ</LinkNav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
