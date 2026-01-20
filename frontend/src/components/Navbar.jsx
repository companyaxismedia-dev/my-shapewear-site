"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  MapPin,
  ChevronDown,
  Heart,
  Grid,
  Menu
} from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 font-sans">

      {/* ===== TOP BLUE NAVBAR ===== */}
      <div className="bg-[#0071dc] px-3 sm:px-4 md:px-10 py-3 flex items-center gap-3 md:gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#ffc220] bg-white">
            <Image
              src="/image/logo.webp.jpeg"
              alt="Booty Bloom Logo"
              fill
              className="object-cover"
            />
          </div>
          <span className="hidden sm:block text-white text-lg md:text-2xl font-bold">
            BOOTY BLOOM
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 relative max-w-full md:max-w-3xl">
          <input
            type="text"
            placeholder="Search products"
            className="w-full py-2.5 pl-4 pr-10 rounded-full text-sm text-black focus:outline-none"
          />
          <button className="absolute right-1 top-1 bg-[#041f41] p-2 rounded-full text-white">
            <Search size={18} />
          </button>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-3 text-white shrink-0">

          {/* Desktop Only */}
          <Link
            href="/reorder"
            className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#004f9a]"
          >
            <Heart size={18} />
            <span className="text-sm font-bold">My Items</span>
          </Link>

          <Link
            href="/login"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#004f9a]"
          >
            <User size={18} />
            <span className="text-sm font-bold hidden md:block">Account</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-[#ffc220] text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* ===== SECONDARY NAV ===== */}
      <div className="bg-white px-3 sm:px-4 md:px-10 py-2 shadow-sm">

        {/* Mobile Scrollable Nav */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar text-sm font-bold text-[#2e2f32]">

          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 whitespace-nowrap">
            <Grid size={16} /> Departments <ChevronDown size={14} />
          </button>

          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-gray-100 whitespace-nowrap">
            <Grid size={16} /> Services <ChevronDown size={14} />
          </button>

          <Link href="/deals" className="px-3 py-1.5 whitespace-nowrap">
            Get it Fast
          </Link>
          <Link href="/deals" className="px-3 py-1.5 whitespace-nowrap">
            Rollbacks
          </Link>
          <Link href="/deals" className="px-3 py-1.5 whitespace-nowrap">
            New Arrivals
          </Link>
          <Link href="/deals" className="px-3 py-1.5 whitespace-nowrap">
            Best Sellers
          </Link>
        </div>
      </div>
    </header>
  );
}
