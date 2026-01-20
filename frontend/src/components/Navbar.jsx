"use client";
import Image from "next/image"; // Link ko Image se replace kiya
import LinkNav from "next/link";
import { Search, ShoppingCart, User, MapPin, ChevronDown, Heart, Grid } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 font-sans">
      {/* Primary Blue Navbar */}
      <div className="bg-[#0071dc] px-4 md:px-10 py-3 flex items-center gap-4 md:gap-8">
        
        {/* Updated Logo Section using your logo.webp.jpeg */}
        <LinkNav href="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-full border-2 border-[#ffc220] bg-white transition group-hover:scale-105">
            <Image 
              src="/image/logo.webp.jpeg" // Aapki upload ki hui file ka path
              alt="Booty Bloom Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="text-white text-xl md:text-2xl font-bold tracking-tight hidden sm:block">
            BOOTY BLOOM
          </span>
        </LinkNav>

        {/* Pickup & Delivery Selector */}
        <button className="hidden xl:flex items-center gap-2 text-white hover:bg-[#004f9a] px-3 py-2 rounded-full transition shrink-0">
          <div className="w-8 h-8 bg-[#004f9a] rounded-full flex items-center justify-center">
             <MapPin size={16} />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[12px] font-bold">How do you want your items?</span>
            <span className="text-[11px] opacity-90">Sacramento, 95829 • Sacramento Supercenter</span>
          </div>
          <ChevronDown size={14} />
        </button>

        {/* Big Search Bar */}
        <div className="flex-grow relative max-w-4xl">
          <input 
            type="text" 
            placeholder="Search everything at VitalStore online and in store" 
            className="w-full py-2.5 px-5 rounded-full text-black focus:outline-none placeholder:text-gray-600 text-sm"
          />
          <div className="absolute right-1 top-1 bg-[#041f41] p-2 rounded-full text-white cursor-pointer hover:bg-black transition">
            <Search size={18} />
          </div>
        </div>

        {/* Right Section: My Items, Account & Cart */}
        <div className="flex items-center gap-2 md:gap-6 text-white whitespace-nowrap">
          <LinkNav href="/reorder" className="hidden lg:flex items-center gap-2 hover:bg-[#004f9a] px-3 py-2 rounded-full">
            <Heart size={18} />
            <div className="flex flex-col items-start leading-none">
                <span className="text-[12px]">Reorder</span>
                <span className="text-sm font-bold">My Items</span>
            </div>
          </LinkNav>
          
          <LinkNav href="/login" className="flex items-center gap-2 hover:bg-[#004f9a] px-3 py-2 rounded-full">
            <User size={18} />
            <div className="flex flex-col items-start leading-none">
                <span className="text-[12px]">Sign In</span>
                <span className="text-sm font-bold">Account</span>
            </div>
          </LinkNav>

          <LinkNav href="/cart" className="relative flex flex-col items-center group px-2">
            <ShoppingCart size={24} />
            <span className="absolute -top-1 right-0 bg-[#ffc220] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0071dc]">
              0
            </span>
            <span className="text-[10px] font-bold mt-0.5">$0.00</span>
          </LinkNav>
        </div>
      </div>

      {/* Secondary White Sub-Nav */}
      <div className="bg-white px-4 md:px-10 py-1.5 flex items-center justify-between shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 text-sm font-bold text-[#2e2f32]">
            <button className="flex items-center gap-1 hover:bg-gray-100 px-3 py-1.5 rounded-full">
                <Grid size={16} /> Departments <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-1 hover:bg-gray-100 px-3 py-1.5 rounded-full border-r pr-4 border-gray-300">
                <Grid size={16} /> Services <ChevronDown size={14} />
            </button>
            
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-4 ml-2 overflow-x-auto no-scrollbar whitespace-nowrap">
              <LinkNav href="/deals" className="hover:underline">Get it Fast</LinkNav>
              <LinkNav href="/deals" className="hover:underline">Rollbacks & More</LinkNav>
              <LinkNav href="/deals" className="hover:underline">Valentine's Day</LinkNav>
              <LinkNav href="/deals" className="hover:underline">New Arrivals</LinkNav>
              <LinkNav href="/deals" className="hover:underline">bettergoods</LinkNav>
            </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-4 text-sm font-bold">
            <LinkNav href="/help" className="hover:underline">Help</LinkNav>
        </div>
      </div>
    </header>
  );
}
