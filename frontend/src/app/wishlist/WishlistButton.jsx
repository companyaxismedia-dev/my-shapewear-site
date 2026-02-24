"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({ onLoginOpen }) {
  const { user } = useAuth();
  const {wishlistCount} =  useWishlist()

  if (!user) {
    return (
      <button
        onClick={onLoginOpen}
        className="relative p-1 hover:text-pink-600 transition cursor-pointer"
      >
        <Heart size={22} />
      </button>
    );
  }

  return (
    <Link href="/wishlist" className="relative p-1">
      <Heart size={22} className="hover:text-pink-600 transition" />
      {wishlistCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
          {wishlistCount}
        </span>
      )}
    </Link>
  );
}

// {wishlistCount > 0 && (
//   <span className="
//     absolute
//     -top-1
//     -right-1
//     bg-pink-600
//     text-white
//     text-[9px]
//     w-4
//     h-4
//     rounded-full
//     flex
//     items-center
//     justify-center
//     font-bold
//     leading-none
//   ">
//     {wishlistCount}
//   </span>
// )}