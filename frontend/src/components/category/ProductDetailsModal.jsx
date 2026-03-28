"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { X, ShoppingCart, Zap, ChevronsDown, } from "lucide-react";
import { getImageUrl } from "./helpers";

export function ProductDetailsModal({ product, onClose }) {
    const { addToCart } = useCart();
    const router = useRouter();

    const [variant, setVariant] = useState(product.variants?.[0]);
    const [size, setSize] = useState("");

    const image = getImageUrl(
        variant?.images?.[0]?.url || variant?.images?.[0]
    );

    const handleCartAdd = () => {
        if (!size) return alert("Select size");

        const selectedSize =
            variant?.sizes?.find((s) => s.size === size);

        addToCart({
            productId: product._id,
            name: product.name,
            image,
            price: selectedSize?.price || product.minPrice,
            mrp: product.mrp,
            size,
            quantity: 1,
        });

        alert("Added to cart");
    };

    const handleBuyNow = () => {
        handleCartAdd();
        router.push("/cart");
    };

    const handleShowMore = () => {
        router.push(`/product/${product.slug}`); // ✅ Navigate using slug
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm p-4"
            style={{ background: "rgba(74,46,53,0.35)" }}
        >
            <div className="w-full max-w-4xl card-imkaa relative flex flex-col md:flex-row max-h-[90vh]">
                <div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 rounded-full cursor-pointer hover:rotate-90 transition"
                        style={{
                            background: "rgba(255,255,255,0.92)",
                            border: "1px solid var(--color-border)",
                            boxShadow: "0 10px 24px rgba(74,46,53,0.14)",
                            color: "var(--color-body)",
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="md:w-1/2" style={{ background: "var(--color-bg-alt)" }}>
                    <img
                        src={image}
                        className="w-full h-full object-cover"
                        alt={product.name}
                    />
                </div>

                <div className="md:w-1/2 p-4 space-y-4 overflow-y-auto">
                    <h1 className="title-product" style={{ fontSize: 22 }}>
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-2">
                        <span className="price-text" style={{ fontSize: 22 }}>
                            {/* ₹{
                                variant?.sizes?.find((s) => s.size === size)?.price ||
                                variant?.sizes?.[0]?.price ||
                                product.minPrice ||
                                0
                            } */}

                            ₹{
                                variant?.sizes?.find((s) => s.size === size)?.price ??
                                variant?.sizes?.[0]?.price ??
                                product?.minPrice ??
                                0
                            }
                        </span>

                        {product.mrp > product.minPrice && (
                            <span className="product-card-meta line-through">
                                ₹{product.mrp}
                            </span>
                        )}
                    </div>


                    {/* COLOR */}
                    {/* {product.variants?.length > 1 && ( */}

                    <div>
                        <p className="text-muted-sm" style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                            Select Color
                        </p>
                        <div className="flex gap-2">
                            {product.variants?.map((v, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setVariant(v);
                                        setSize("");
                                    }}
                                    className="px-3 py-2 transition"
                                    style={{
                                        borderRadius: 9999,
                                        border: `1px solid ${variant?.color === v.color ? "var(--color-primary)" : "var(--color-border)"}`,
                                        background: variant?.color === v.color ? "var(--color-primary)" : "var(--color-card)",
                                        color: variant?.color === v.color ? "#FFF9FA" : "var(--color-body)",
                                        fontWeight: 600,
                                        fontSize: 13,
                                    }}
                                >

                                    {/* {v.color} */}
                                    {v.color || `Color ${i + 1}`}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* SIZE */}
                    <div>
                        <p className="text-muted-sm" style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                            Select Size
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {/* {variant?.sizes?.map((s) => ( */}
                            {(variant?.sizes || []).map((s) => (
                                <button
                                    key={s.size}
                                    onClick={() => setSize(s.size)}
                                    className="px-4 py-2 transition"
                                    style={{
                                        borderRadius: 9999,
                                        border: `1px solid ${size === s.size ? "var(--color-primary)" : "var(--color-border)"}`,
                                        background: size === s.size ? "var(--color-primary)" : "#FFF4F6",
                                        color: size === s.size ? "#FFF9FA" : "var(--color-primary)",
                                        fontWeight: 600,
                                        fontSize: 13,
                                    }}
                                >
                                    {s.size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <button
                        onClick={handleCartAdd}
                        className="btn-primary-imkaa w-full"
                    >
                        <ShoppingCart size={16} className="inline mr-2" />
                        Add to Bag
                    </button>

                    <button
                        onClick={handleBuyNow}
                        className="btn-secondary-imkaa w-full"
                    >
                        <Zap size={16} className="inline mr-2" />
                        Buy Now
                    </button>

                    {/* ✅ SHOW MORE DETAILS BUTTON */}
                    <button
                        onClick={handleShowMore}
                        className="btn-secondary-imkaa w-full"
                    >
                        Discover More
                        <ChevronsDown className="group-hover:translate-y-1 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
    );
}