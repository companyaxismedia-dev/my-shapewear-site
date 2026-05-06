"use client";
import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { Heart, Star } from "lucide-react";
import { getImageUrl } from "./helpers";
import Image from "next/image";
import { toast } from "sonner";
import { FALLBACK_PRODUCT_IMAGE, getPrimaryProductImage } from "@/lib/images";

export function ProductCard({ item, onOpenDetails }) {
    const { wishlist, toggleWishlist, removeFromWishlist } = useWishlist();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [showSizes, setShowSizes] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const isWishlisted = wishlist.some((p) => p._id === item._id);
    const cardRef = useRef(null);

    const image = getImageUrl(item.variants?.[0]?.images?.[0]?.url || item.thumbnail);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                setShowSizes(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const sizeOptions = item.variants?.[0]?.sizes || [];
    const hasInStockSize = sizeOptions.some((s) => Number(s?.stock || 0) > 0);

    const handleSizeSelect = (sizeOption) => {
        if (Number(sizeOption?.stock || 0) <= 0) {
            toast.error("This size is out of stock");
            return;
        }

        const variant = item.variants?.[0];
        addToCart({
            productId: item._id,
            name: item.name,
            price: variant?.price || item.minPrice,
            image,
            size: sizeOption.size,
            quantity: 1,
        });
        setShowSizes(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
    };

    const imageSrc = getPrimaryProductImage(item);
    const usePlainImg = imageSrc.includes("localhost") || imageSrc.includes("uploads");

    return (
        <div
            ref={cardRef}
            className="group flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#efdbe0] bg-white shadow-[0_2px_10px_rgba(74,46,53,0.04)] transition-transform duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_24px_rgba(74,46,53,0.08)]"
        >
            <div
                className="relative aspect-[4/5] overflow-hidden bg-[#fcefea]"
                style={{ background: "var(--color-bg-alt)" }}
            >
                {usePlainImg ? (
                    <img
                        src={imageSrc}
                        alt={item.name}
                        onError={(event) => {
                            event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                        }}
                        onClick={onOpenDetails}
                        loading="lazy"
                        className={`h-full w-full cursor-pointer object-cover object-top transition-transform duration-500 ${showSizes ? "scale-105 blur-sm" : "group-hover:scale-105"}`}
                    />
                ) : (
                    <Image
                        src={imageSrc}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
                        alt={item.name}
                        loading="lazy"
                        onError={(event) => {
                            event.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                        }}
                        onClick={onOpenDetails}
                        className={`cursor-pointer object-cover object-top transition-transform duration-500 ${showSizes ? "scale-105 blur-sm" : "group-hover:scale-105"}`}
                    />
                )}

                <button
                    onClick={() => {
                        if (!user) {
                            toast.error("Please login to use wishlist");
                            return;
                        }
                        isWishlisted ? removeFromWishlist(item._id) : toggleWishlist(item);
                    }}
                    className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[#ead7dd] bg-[rgba(255,255,255,0.92)] shadow-[0_6px_18px_rgba(74,46,53,0.10)] transition-transform hover:scale-110"
                >
                    <Heart
                        size={16}
                        className={`transition-colors ${isWishlisted ? "fill-[#C56F7F] stroke-[#C56F7F]" : "stroke-[#C56F7F]"}`}
                    />
                </button>

                {item.rating > 0 && (
                    <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full border border-[#ead7dd] bg-[rgba(255,255,255,0.92)] px-2 py-1 text-[11px] font-semibold text-[#6f5560] shadow-[0_6px_18px_rgba(74,46,53,0.10)]">
                        <span>{item.rating}</span>
                        <Star size={10} className="fill-[#C56F7F] stroke-[#C56F7F]" />
                        <span className="text-[11px] font-normal leading-[1.25] text-[#8c7480]">
                            | {item.numReviews || 0}
                        </span>
                    </div>
                )}

                {showSizes && (
                    <div
                        className="absolute inset-0 z-[15] flex items-center justify-center p-3"
                        style={{ background: "rgba(255,255,255,0.90)", backdropFilter: "blur(8px)" }}
                    >
                        <div className="text-center">
                            <p
                                className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
                                style={{ color: "var(--color-primary)" }}
                            >
                                SELECT SIZE
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {sizeOptions.map((s, i) => {
                                    const isOutOfStock = Number(s?.stock || 0) <= 0;

                                    return (
                                        <button
                                            key={i}
                                            type="button"
                                            disabled={isOutOfStock}
                                            onClick={() => handleSizeSelect(s)}
                                            className={`relative overflow-hidden px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                                                isOutOfStock ? "cursor-not-allowed opacity-50" : ""
                                            }`}
                                            style={{
                                                borderRadius: 9999,
                                                border: `1px solid ${isOutOfStock ? "var(--color-border)" : "var(--color-accent)"}`,
                                                color: isOutOfStock ? "var(--color-muted)" : "var(--color-primary)",
                                                background: isOutOfStock ? "rgba(252,239,234,0.4)" : "#FFF4F6",
                                            }}
                                        >
                                            {s.size}
                                            {isOutOfStock ? (
                                                <span className="pointer-events-none absolute left-1/2 top-1/2 h-px w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current opacity-70" />
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {showSuccess && (
                    <div
                        className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-semibold"
                        style={{
                            background: "var(--color-primary)",
                            color: "#FFF9FA",
                            boxShadow: "0 10px 24px rgba(74,46,53,0.18)",
                        }}
                    >
                        Added to Bag
                    </div>
                )}
            </div>

            <div className="flex min-h-[112px] flex-col gap-2 bg-white px-3 py-3">
                <div className="grid min-h-[58px] gap-[3px]">
                    <h3 className="line-clamp-1 text-[13px] font-semibold leading-[1.2] text-[#5b3c46]">
                        {item.name}
                    </h3>
                    <p className="line-clamp-1 min-h-[13px] text-[11px] leading-[1.25] text-[#8c7480]">
                        {item.shortDescription || " "}
                    </p>

                    <div className="mb-0 flex min-h-[16px] flex-wrap items-baseline gap-1.5">
                        <span className="text-[12px] font-bold text-[#a04f62]">{`\u20B9${item.minPrice}`}</span>
                        {item.mrp > item.minPrice && (
                            <>
                                <span className="text-[11px] leading-[1.25] text-[#8c7480] line-through">
                                    {`\u20B9${item.mrp}`}
                                </span>
                                <span className="text-[11px] font-semibold leading-[1.25]" style={{ color: "var(--color-primary)" }}>
                                    ({item.discount}% OFF)
                                </span>
                            </>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        if (!hasInStockSize) return;
                        setShowSizes(true);
                    }}
                    disabled={!hasInStockSize}
                    className="mt-auto flex h-[34px] w-full items-center justify-center rounded-[8px] bg-[#c56f7f] px-[14px] text-[12px] font-semibold tracking-[0.01em] text-[#fff9fa] transition-colors duration-200 hover:bg-[#b45e6f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {hasInStockSize ? "Add to Bag" : "Out of Stock"}
                </button>
            </div>
        </div>
    );
}
