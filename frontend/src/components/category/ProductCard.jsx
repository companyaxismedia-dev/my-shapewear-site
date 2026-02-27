"use client";
import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

import { Heart, Star, } from "lucide-react";
import { getImageUrl } from "./helpers";


export function ProductCard({ item, onOpenDetails }) {
    const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [showSizes, setShowSizes] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const isWishlisted = wishlist.some((p) => p._id === item._id);
    const cardRef = useRef(null);

    const image = getImageUrl(
        item.variants?.[0]?.images?.[0]?.url
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setShowSizes(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSizeSelect = (size) => {
        const variant = item.variants?.[0];
        addToCart({
            productId: item._id,
            name: item.name,
            price: variant?.price || item.minPrice,
            image,
            size,
            quantity: 1,
        });
        setShowSizes(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
    };

    return (
        <div
            ref={cardRef}
            className="flex flex-col bg-white border border-[#e8e8e8] overflow-hidden relative transition-shadow duration-200 hover:shadow-xl group"
        >
            {/* IMAGE CONTAINER */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f6]">
                {/* <img
                    src={item.thumbnail}
                    // {...console.log(item)}
                    alt={item.name}
                    onClick={onOpenDetails}
                    className={`cursor-pointer w-full h-full object-cover object-top transition-transform duration-500 ${showSizes ? "blur-sm scale-105" : "group-hover:scale-105"
                        }`}
                /> */}
                <img
                    src={getImageUrl(item.thumbnail)}
                    alt={item.name}
                    onClick={onOpenDetails}
                    className={`cursor-pointer w-full h-full object-cover object-top transition-transform duration-500 ${showSizes ? "blur-sm scale-105" : "group-hover:scale-105"
                        }`}
                />
                <button
                    onClick={() => {
                        if (!user) return alert("Please login to use wishlist");
                        isWishlisted
                            ? removeFromWishlist(item._id)
                            : toggleWishlist(item);
                    }}
                    className="absolute top-2 right-2 z-20 bg-white border-none rounded-full w-[30px] h-[30px] flex items-center justify-center cursor-pointer shadow-md hover:scale-110 transition-transform"
                >
                    <Heart
                        size={16}
                        className={`transition-colors ${isWishlisted ? "fill-[#ed4e7e] stroke-[#ed4e7e]" : "stroke-[#ed4e7e]"}`}
                    />
                </button>

                {/* RATING BADGE */}
                {item.rating > 0 && (
                    <div className="absolute bottom-2 left-2 bg-white/95 rounded-sm px-1.5 py-0.5 flex items-center gap-1 text-[12px] font-bold text-[#282c3f] z-10">
                        {item.rating}
                        <Star size={10} className="fill-[#14958f] stroke-[#14958f]" />
                        <span className="text-[#94969f] font-normal text-[11px]">
                            | {item.numReviews || 0}
                        </span>
                    </div>
                )}

                {/* SIZE OVERLAY */}
                {showSizes && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-[15] p-3">
                        <div className="text-center">
                            <p className="text-[11px] font-bold uppercase text-[#ed4e7e] tracking-widest mb-3">
                                SELECT SIZE
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {item.variants?.[0]?.sizes?.map((s, i) => (
                                    <button
                                        key={i}
                                        disabled={s.stock === 0}
                                        onClick={() => handleSizeSelect(s.size)}
                                        className={`px-2.5 py-1 border text-[12px] font-semibold rounded-sm transition-colors ${s.stock === 0
                                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                            : "border-[#ed4e7e] text-[#ed4e7e] hover:bg-[#ed4e7e] hover:text-white"
                                            }`}
                                    >
                                        {s.size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SUCCESS MESSAGE */}
                {showSuccess && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#282c3f] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full z-20 whitespace-nowrap animate-bounce">
                        Added to Bag
                    </div>
                )}
            </div>

            {/* DETAILS SECTION */}
            <div className="p-2.5 flex flex-col flex-1 bg-white">
                <h3 className="text-[12px] font-bold text-[#282c3f] mb-0.5 truncate uppercase">
                    {item.name}
                </h3>
                <p className="text-[12px] text-[#535766] mb-1.5 truncate">
                    {item.subCategory || "Bra"}
                </p>

                <div className="flex items-baseline gap-1.5">
                    <span className="text-[14px] font-bold text-[#282c3f]">Rs. {item.minPrice}</span>
                    {item.mrp > item.minPrice && (
                        <>
                            <span className="text-[12px] text-[#94969f] line-through">Rs. {item.mrp}</span>
                            <span className="text-[12px] text-[#ff905a] font-semibold">({item.discount}% OFF)</span>
                        </>
                    )}
                </div>

                {/* ADD TO BAG BUTTON */}
                <button
                    onClick={() => setShowSizes(true)}
                    className="mt-auto w-full py-2 text-[12px] font-bold uppercase tracking-wider text-white bg-[#ed4e7e] border border-[#ed4e7e] cursor-pointer hover:bg-[#d43d6a] transition-colors"
                >
                    ADD TO BAG
                </button>
            </div>
        </div>
    );
}
