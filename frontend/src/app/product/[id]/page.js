"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { 
  Star, ShoppingCart, Zap, Heart, Share2, StarHalf
} from "lucide-react";

export default function ProductDetailsPage() {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("34B");
  const [activeTab, setActiveTab] = useState("Description");
  const [isMounted, setIsMounted] = useState(false);

  // --- AMAZON STYLE LOGIC START ---
  
  // 1. Data Structure with Variants
  const product = {
    id: "bra-002",
    name: "Non-Padded Non-Wired Full Figure Bra - Cotton & Lace",
    rating: 4.6,
    totalRatings: 8,
    discount: "3% OFF",
    // Variants array for Amazon-like switching
    variants: [
      {
        color: "Black",
        hex: "#000000",
        price: 577,
        oldPrice: 599,
        images: [
          "/non-padded/Non-Padded-Bras-1.jpg", 
          "/non-padded/Non-Padded-Bras-2.jpg",
          "/non-padded/Non-Padded-Bras-3.jpg"
        ]
      },
      {
        color: "Blue",
        hex: "#2b4562",
        price: 550,
        oldPrice: 599,
        images: [
          "/non-padded/Non-Padded-Bras-4.jpg",
          "/non-padded/Non-Padded-Bras-5.jpg"
        ]
      },
      {
        color: "Beige",
        hex: "#f5f5dc",
        price: 577,
        oldPrice: 599,
        images: [
          "/non-padded/Non-Padded-Bras-6.jpg",
          "/non-padded/Non-Padded-Bras-7.jpg"
        ]
      }
    ],
    features: ["COTTON BRAS", "DOUBLE LAYERED CUPS", "FULL COVERAGE", "NON PADDED"],
    description: "Meticulously crafted from breathable cotton spandex fabric with delicate lace. Designed for all-day comfort without bulk.",
    reviews: [
      { id: 1, user: "Anjali Sharma", rating: 5, comment: "Very comfortable! Perfect for daily wear.", date: "22 Jan 2026" },
      { id: 2, user: "Megha Gupta", rating: 4, comment: "Good support and soft fabric.", date: "15 Jan 2026" }
    ]
  };

  // 2. States for Selection
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [activeImage, setActiveImage] = useState(selectedVariant.images[0]);

  // 3. Update Image when Color changes
  const handleColorChange = (variant) => {
    setSelectedVariant(variant);
    setActiveImage(variant.images[0]); // Reset main image to first image of new color
  };

  // --- AMAZON STYLE LOGIC END ---

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: THUMBNAILS (Amazon Style) */}
          <div className="hidden lg:flex lg:col-span-1 flex-col gap-3">
            {selectedVariant.images.map((img, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setActiveImage(img)}
                className={`aspect-[3/4] relative border-2 cursor-pointer rounded-md overflow-hidden ${activeImage === img ? 'border-pink-500' : 'border-gray-100'}`}
              >
                <Image src={img} alt="thumb" fill className="object-cover" />
              </div>
            ))}
          </div>

          {/* CENTER: MAIN IMAGE */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[3/4] relative rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <Image 
                src={activeImage} 
                alt={product.name} 
                fill 
                className="object-cover transition-all duration-300"
                priority
              />
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button className="p-3 bg-white/90 backdrop-blur rounded-full shadow-lg text-gray-400 hover:text-pink-500">
                  <Heart size={22} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <header className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-orange-400 text-white px-2 py-0.5 rounded font-bold text-sm">
                  {product.rating} <Star size={14} className="fill-current ml-1" />
                </div>
                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest border-l pl-3">
                  {product.totalRatings} Verified Reviews
                </span>
              </div>
            </header>

            <div className="flex items-baseline gap-4 border-b pb-6">
              <span className="text-4xl font-black text-[#041f41]">₹{selectedVariant.price}</span>
              <span className="text-xl text-gray-300 line-through font-bold">₹{selectedVariant.oldPrice}</span>
              <span className="text-[#ed4e7e] font-black text-sm uppercase italic bg-pink-50 px-2 rounded">
                {product.discount}
              </span>
            </div>

            {/* COLOR SELECTION (Swatches) */}
            <div className="space-y-3">
              <label className="font-bold text-xs text-gray-400 uppercase tracking-widest">
                Color: <span className="text-gray-900">{selectedVariant.color}</span>
              </label>
              <div className="flex gap-3">
                {product.variants.map((v) => (
                  <button 
                    key={v.color} 
                    onClick={() => handleColorChange(v)}
                    className={`w-14 h-18 border-2 rounded-lg overflow-hidden transition-all ${
                      selectedVariant.color === v.color ? 'border-pink-500 scale-105 shadow-md' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-full h-12">
                      <Image src={v.images[0]} alt={v.color} fill className="object-cover" />
                    </div>
                    <div className="text-[10px] py-1 bg-gray-50 font-bold">{v.color}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* SIZE SELECTION */}
            <div className="space-y-3">
              <label className="font-bold text-xs text-gray-400 uppercase tracking-widest text-pink-500">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {["32B", "34B", "36B", "38B", "40B"].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-12 flex items-center justify-center border-2 font-black text-xs transition-all rounded-xl ${
                      selectedSize === size ? 'bg-[#041f41] text-white border-[#041f41]' : 'bg-white text-gray-400 border-gray-100 hover:border-pink-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <button 
                onClick={() => addToCart({ ...product, size: selectedSize, color: selectedVariant.color, qty: 1 })}
                className="flex-1 bg-white border-2 border-[#041f41] text-[#041f41] py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gray-50 transition-all"
              >
                <ShoppingCart size={18} /> Add to Bag
              </button>
              <button className="flex-1 bg-[#ed4e7e] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:opacity-90 transition-all">
                <Zap size={18} fill="white" /> Buy Now
              </button>
            </div>

            {/* TABS (Description/Reviews) */}
            <div className="mt-4">
               <div className="flex gap-8 border-b">
                 {["Description", "Reviews"].map(tab => (
                   <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold uppercase ${activeTab === tab ? 'border-b-2 border-pink-500 text-black' : 'text-gray-400'}`}>
                     {tab}
                   </button>
                 ))}
               </div>
               <div className="py-4 text-sm text-gray-600">
                 {activeTab === "Description" ? <p>{product.description}</p> : <p>Great product, very comfortable!</p>}
               </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}