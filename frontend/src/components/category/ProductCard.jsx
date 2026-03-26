"use client";
import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

import { Heart, Star, } from "lucide-react";
import { getImageUrl } from "./helpers";
import Image from "next/image";


export function ProductCard({ item, onOpenDetails }) {
    const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [showSizes, setShowSizes] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const isWishlisted = wishlist.some((p) => p._id === item._id);
    const cardRef = useRef(null);

    // for the simgle image to show 
    const image = getImageUrl(
        item.variants?.[0]?.images?.[0]?.url
    );

    // for the sliding image effect to be on the home page 
    const images =
        item?.variants?.[0]?.images?.length
            ? item.variants[0].images.map((img) =>
                getImageUrl(img.url)
            )
            : [getImageUrl(item.thumbnail)];

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
    console.log("ITEM DATA:", item);
    return (
        <div
            ref={cardRef}
            className="product-card-imkaa group"
        >
            {/* IMAGE CONTAINER */}
            <div className="relative aspect-[3/4] overflow-hidden" style={{ background: "var(--color-bg-alt)" }}>
                {/* Use regular img for API-served images, Next.js Image for public images */}
                {getImageUrl(item.thumbnail).includes('localhost') || getImageUrl(item.thumbnail).includes('uploads') ? (
                    <img
                        src={getImageUrl(item.thumbnail)}
                        alt={item.name}
                        onClick={onOpenDetails}
                        loading="lazy"
                        className={`cursor-pointer w-full h-full object-cover object-top transition-transform duration-500 ${showSizes ? "blur-sm scale-105" : "group-hover:scale-105"}`}
                    />
                ) : (
                    <Image
                        src={getImageUrl(item.thumbnail)}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        alt={item.name}
                        loading="lazy"
                        onClick={onOpenDetails}
                        className={`cursor-pointer w-full h-full object-cover object-top transition-transform duration-500 ${showSizes ? "blur-sm scale-105" : "group-hover:scale-105"}`}
                    />
                )}
                <button
                    onClick={() => {
                        if (!user) return alert("Please login to use wishlist");
                        isWishlisted
                            ? removeFromWishlist(item._id)
                            : toggleWishlist(item);
                    }}
                    className="absolute top-2 right-2 z-20 rounded-full w-[32px] h-[32px] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                    style={{
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid var(--color-border)",
                        boxShadow: "0 6px 18px rgba(74,46,53,0.10)",
                    }}
                >
                    <Heart
                        size={16}
                        className={`transition-colors ${isWishlisted ? "fill-[#C56F7F] stroke-[#C56F7F]" : "stroke-[#C56F7F]"}`}
                    />
                </button>

                {/* RATING BADGE */}
                {item.rating > 0 && (
                    <div
                        className="absolute bottom-2 left-2 px-2 py-1 text-xs font-semibold z-10 flex items-center gap-1"
                        style={{
                            background: "rgba(255,255,255,0.92)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 9999,
                            boxShadow: "0 6px 18px rgba(74,46,53,0.10)",
                            color: "var(--color-body)",
                        }}
                    >
                        {item.rating}
                        {/* <Star size={10} className="fill-[#14958f] stroke-[#14958f]" /> */}
                        <span
                            className={
                                item.rating >= 3
                                    ? ""
                                    : ""
                            }
                            style={{ color: "var(--color-primary)" }}
                        >
                            ★
                        </span>

                        <span className="product-card-meta font-normal text-[11px]">
                            | {item.numReviews || 0}
                        </span>
                    </div>
                )}

                {/* SIZE OVERLAY */}
                {showSizes && (
                    <div className="absolute inset-0 flex items-center justify-center z-[15] p-3" style={{ background: "rgba(255,255,255,0.90)", backdropFilter: "blur(8px)" }}>
                        <div className="text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-primary)" }}>
                                SELECT SIZE
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {item.variants?.[0]?.sizes?.map((s, i) => (
                                    <button
                                        key={i}
                                        disabled={s.stock === 0}
                                        onClick={() => handleSizeSelect(s.size)}
                                        className={`px-3 py-1.5 text-[12px] font-semibold transition-colors ${s.stock === 0 ? "cursor-not-allowed" : ""}`}
                                        style={{
                                            borderRadius: 9999,
                                            border: `1px solid ${s.stock === 0 ? "var(--color-border)" : "var(--color-accent)"}`,
                                            color: s.stock === 0 ? "var(--color-muted)" : "var(--color-primary)",
                                            background: s.stock === 0 ? "rgba(252,239,234,0.4)" : "#FFF4F6",
                                        }}
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
                    <div
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-semibold px-3.5 py-1.5 z-20 whitespace-nowrap"
                        style={{
                            background: "var(--color-primary)",
                            color: "#FFF9FA",
                            borderRadius: 9999,
                            boxShadow: "0 10px 24px rgba(74,46,53,0.18)",
                        }}
                    >
                        Added to Bag
                    </div>
                )}
            </div>

            {/* DETAILS SECTION */}
            <div className="p-4 flex flex-col flex-1" style={{ background: "var(--color-card)" }}>
                <h3 className="product-card-title mb-1 truncate">
                    {item.name}
                </h3>
                <p className="product-card-meta mb-3 truncate">
                    {item.shortDescription}
                </p>

                <div className="flex items-baseline gap-1.5">
                    <span className="product-card-price">₹{item.minPrice}</span>
                    {item.mrp > item.minPrice && (
                        <>
                            <span className="product-card-meta line-through">₹{item.mrp}</span>
                            <span className="product-card-meta font-semibold" style={{ color: "var(--color-primary)" }}>
                                ({item.discount}% OFF)
                            </span>
                        </>
                    )}
                </div>

                {/* ADD TO BAG BUTTON */}
                <button
                    onClick={() => setShowSizes(true)}
                    className="btn-primary-imkaa mt-auto w-full"
                >
                    Add to Bag
                </button>
            </div>
        </div>
    );
}
