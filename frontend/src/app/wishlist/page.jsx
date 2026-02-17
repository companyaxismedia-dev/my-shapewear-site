"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import { Trash2, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    wishlist,
    loading,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  /* ================= REDIRECT FIX ================= */
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (!user) return null;

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-gray-500">
          Loading wishlist...
        </div>
        <Footer />
      </div>
    );
  }

  /* ================= EMPTY STATE ================= */
  if (wishlist.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center text-center">
          <Heart size={90} className="text-pink-500 mb-6" />

          <h1 className="text-3xl font-semibold text-gray-900">
            Your Save for later list is empty!
          </h1>

          <p className="text-gray-500 mt-2">
            Check out the wide range of products we offer
          </p>

          <div className="mt-6 bg-gray-100 px-6 py-3 rounded text-sm text-gray-600">
            Bras &nbsp;|&nbsp; Panties &nbsp;|&nbsp; Nightwear &nbsp;|&nbsp;
            <span className="text-pink-600 font-semibold">Offers</span>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  /* ================= WISHLIST ITEMS ================= */
  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-semibold text-pink-600 flex items-center gap-2">
            ❤️ YOUR WISHLIST ITEMS [{wishlist.length}]
          </h1>

          <button
            onClick={clearWishlist}
            className="border border-gray-300 px-5 py-2 rounded hover:bg-red-50 hover:border-red-400 hover:text-red-500 transition text-sm"
          >
            Delete All
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="border rounded-xl overflow-hidden bg-white hover:shadow-xl transition group"
            >
              <div className="relative">
                <Image
                  src={item.img || item.image}
                  alt={item.name}
                  width={400}
                  height={550}
                  className="w-full object-cover"
                />

                {/* Remove Button */}
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-red-50 transition"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>

                {/* Offer Badge */}
                {item.offer && (
                  <span className="absolute bottom-2 right-2 bg-pink-600 text-white text-[10px] px-2 py-1 font-semibold">
                    {item.offer}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm text-gray-800 line-clamp-2 mb-2">
                  {item.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-gray-900">
                    ₹{item.price}
                  </span>

                  {item.oldPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{item.oldPrice}
                    </span>
                  )}
                </div>

                <button className="w-full bg-pink-600 text-white text-xs py-2 rounded hover:bg-pink-700 transition">
                  ADD TO CART
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
