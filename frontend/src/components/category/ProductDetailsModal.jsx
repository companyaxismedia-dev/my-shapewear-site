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

    // const image =
    //   variant?.images?.[0]
    //     ? `${API_BASE}${variant.images[0]}`
    //     : "/fallback.jpg";
    // const image = getImageUrl(
    //     variant?.images?.[0]
    // );
    //     const image = getImageUrl(
    //     variant?.images?.[0]
    // );


    const image = getImageUrl(
        variant?.images?.[0]?.url || variant?.images?.[0]
    );

    // const handleCartAdd = () => {
    //     if (!size) return alert("Select size");

    //     addToCart({
    //         productId: product._id,
    //         size,
    //         quantity: 1,
    //     });

    //     alert("Added to cart");
    // };


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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh]">
                <div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full cursor-pointer hover:rotate-90 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="md:w-1/2 bg-[#fff5f8]">
                    <img
                        src={image}
                        className="w-full h-full object-cover"
                        alt={product.name}
                    />
                </div>

                <div className="md:w-1/2 p-4 space-y-4 overflow-y-auto">
                    <h1 className="text-2xl font-black uppercase">
                        {product.name}
                    </h1>

                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-[#ed4e7e]">
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
                            <span className="line-through text-gray-400">
                                ₹{product.mrp}
                            </span>
                        )}
                    </div>


                    {/* COLOR */}
                    {/* {product.variants?.length > 1 && ( */}

                    <div>
                        <p className="text-xs font-bold uppercase mb-2">
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
                                    className={`px-3 py-1 border rounded transition ${variant?.color === v.color
                                        ? "bg-[#ed4e7e] text-white border-[#ed4e7e]"
                                        : "hover:scale-105"
                                        }`}>

                                    {/* {v.color} */}
                                    {v.color || `Color ${i + 1}`}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* SIZE */}
                    <div>
                        <p className="text-xs font-bold uppercase mb-2">
                            Select Size
                        </p>
                        <div className="flex gap-2 flex-wrap">
                            {/* {variant?.sizes?.map((s) => ( */}
                            {(variant?.sizes || []).map((s) => (
                                <button
                                    key={s.size}
                                    onClick={() => setSize(s.size)}
                                    className={`px-4 py-2 border rounded transition ${size === s.size
                                        ? "bg-[#ed4e7e] text-white"
                                        : "hover:scale-105"
                                        }`}                >
                                    {s.size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <button
                        onClick={handleCartAdd}
                        className="w-full bg-[#ed4e7e] text-white py-3 font-bold uppercase hover:scale-105 transition"
                    >
                        <ShoppingCart size={16} className="inline mr-2" />
                        Add to Cart
                    </button>

                    <button
                        onClick={handleBuyNow}
                        className="w-full bg-black text-white py-3 font-bold uppercase hover:scale-105 transition"
                    >
                        <Zap size={16} className="inline mr-2" />
                        Buy Now
                    </button>

                    {/* ✅ SHOW MORE DETAILS BUTTON */}
                    <button
                        onClick={handleShowMore}
                        className="w-full flex items-center justify-center gap-2 border border-[#ed4e7e] text-[#ed4e7e] py-3 font-bold uppercase hover:bg-[#ed4e7e] hover:text-white transition-all duration-300 group"
                    >
                        Show More Details
                        <ChevronsDown className="group-hover:translate-y-1 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </div>
    );
}