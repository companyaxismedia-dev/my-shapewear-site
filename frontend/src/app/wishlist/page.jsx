"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import { Trash2, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();

  const {
    wishlist,
    loading: wishlistLoading,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist();

  /* ================= REDIRECT FIX ================= */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  if (authLoading) return null;
  if (!user) return null;
  /* ================= LOADING STATE ================= */
  if (wishlistLoading) {
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {wishlist.map((item) => {
            const image =
              item.thumbnail ||
              item.variants?.[0]?.images?.[0]?.url ||
              "/fallback.jpg";

            return (
              <div
                key={item._id}
                className="border border-gray-200 bg-white relative group"
              >
                {/* IMAGE */}
                {/* IMAGE */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#f5f5f5]">

                  <Image
                    src={
                      item.thumbnail ||
                      item?.variants?.[0]?.images?.[0]?.url ||
                      "/fallback.jpg"
                    }
                    alt={item.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width:768px) 50vw, (max-width:1200px) 33vw, 20vw"
                  />

                  {/* REMOVE BUTTON */}
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"
                  >
                    ✕
                  </button>

                </div>

                {/* DETAILS */}
                <div className="p-3">
                  <h3 className="text-sm truncate">{item.name}</h3>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold">₹{item.minPrice}</span>

                    {item.mrp > item.minPrice && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.mrp}
                        </span>
                        <span className="text-xs text-pink-600">
                          {item.discount > 0 && (
                            <span className="text-orange-500 text-xs">
                              ({item.discount}% OFF)
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* MOVE TO BAG */}
                <button
                  onClick={() => {
                    setSelectedItem(item);
                    setShowSizeModal(true);
                  }}
                  className="w-full border-t py-3 text-pink-600 font-semibold text-sm hover:bg-pink-50"
                >
                  MOVE TO BAG
                </button>
              </div>
            );
          })}

        </div>
        {showSizeModal && selectedItem && (
          <div className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-3">

            {/* MODAL */}
            <div className="
      bg-white
      w-full
      max-w-[520px]
      rounded-md
      shadow-2xl
      relative
      overflow-hidden
    ">

              {/* CLOSE */}
              <button
                onClick={() => {
                  setShowSizeModal(false);
                  setSelectedSize(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-black text-3xl leading-none"
              >
                ×
              </button>

              {/* HEADER */}
              <div className="flex gap-3 p-5 sm:p-6">

                <img
                  src={
                    selectedItem.thumbnail ||
                    selectedItem?.variants?.[0]?.images?.[0]?.url
                  }
                  className="w-16 h-20 object-cover rounded-sm"
                />

                <div className="flex-1 pr-8">
                  <h3 className="text-[24px] sm:text-[26px] font-medium text-[#282c3f] leading-6 line-clamp-2">
                    {selectedItem.name}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-[28px]">
                    <span className="font-bold text-[#282c3f]">
                      ₹{selectedItem.minPrice}
                    </span>

                    {selectedItem.mrp > selectedItem.minPrice && (
                      <>
                        <span className="text-gray-400 line-through text-[22px]">
                          ₹{selectedItem.mrp}
                        </span>
                        <span className="text-[#ff905a] font-semibold text-[22px]">
                          ({selectedItem.discount}% OFF)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="border-t border-gray-200" />

              {/* SIZE SECTION */}
              <div className="p-5 sm:p-6">

                <h4 className="text-[40px] font-semibold text-[#282c3f] mb-4">
                  Select Size
                </h4>

                <div className="flex flex-wrap gap-3">

                  {selectedItem.variants?.[0]?.sizes?.map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      className={`
                w-12 h-12 rounded-full border text-sm font-semibold
                transition-all
                ${selectedSize === s.size
                          ? "border-[#ff3f6c] text-[#ff3f6c] bg-white"
                          : "border-gray-300 text-gray-700 hover:border-[#ff3f6c]"
                        }
              `}
                    >
                      {s.size}
                    </button>
                  ))}

                </div>

                {/* DONE BUTTON */}
                <button
                  disabled={!selectedSize}
                  onClick={() => {
                    addToCart({
                      productId: selectedItem._id,
                      name: selectedItem.name,
                      price: selectedItem.minPrice,
                      image:
                        selectedItem.thumbnail ||
                        selectedItem?.variants?.[0]?.images?.[0]?.url,
                      size: selectedSize,
                      quantity: 1,
                    });

                    removeFromWishlist(selectedItem._id);
                    setShowSizeModal(false);
                    setSelectedSize(null);
                  }}
                  className="
            mt-6
            w-full
            h-[52px]
            rounded
            text-white
            text-lg
            font-semibold
            transition
            bg-[#ff3f6c]
            hover:bg-[#ff527b]
            disabled:bg-gray-300
            disabled:cursor-not-allowed
          "
                >
                  Done
                </button>

              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
