"use client";
import React, { useState, useEffect } from "react";
import { allProducts } from "@/data/products";
import Link from "next/link";
import { ShoppingCart, Star, Heart, ChevronDown } from "lucide-react";

export default function CategoryPage({ params }) {
  const categoryName = params.slug;
  const [isClient, setIsClient] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({}); // Card wise size track karne ke liye

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredProducts = allProducts.filter(p => p.category === categoryName);

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  if (!isClient) return null;

  return (
    <div className="flex flex-col md:flex-row max-w-[1440px] mx-auto bg-white min-h-screen">
      
      {/* --- SIDEBAR FILTERS (As seen in image_c76501.png) --- */}
      <aside className="w-full md:w-64 p-6 border-r border-gray-100 hidden md:block sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-6">Refine Your Selection</h2>
        
        <div className="space-y-6">
          {["SIZE", "COLOR", "DISCOUNT", "PADDED", "PRICE RANGE", "MATERIAL"].map((filter) => (
            <div key={filter} className="border-b border-gray-50 pb-4">
              <button className="flex justify-between items-center w-full group">
                <span className="text-[10px] font-black text-gray-800 tracking-wider group-hover:text-pink-500 transition-colors">{filter}</span>
                <ChevronDown size={14} className="text-gray-300" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 p-4 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-[#041f41]">
            {categoryName} <span className="text-pink-600">Premium Collection</span>
          </h1>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
            Home / {categoryName} / Showing {filteredProducts.length} items
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-4 gap-y-10">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group flex flex-col">
                
                {/* Image Container */}
                <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-gray-50 mb-4">
                  <Link href={`/product/${product.id}`}>
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                  </Link>
                  
                  {/* Badges (From image_c76501.png) */}
                  <div className="absolute top-0 left-0 flex flex-col gap-1">
                    <div className="bg-[#041f41]/10 backdrop-blur-sm text-[#041f41] text-[9px] font-black px-2 py-0.5">
                      {product.discount || "57% OFF"}
                    </div>
                  </div>

                  {/* 3 For 1099 Label */}
                  <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-0.5 text-[8px] font-black text-gray-800 italic">
                    3 For 1099
                  </div>

                  {/* Wishlist Icon */}
                  <button className="absolute bottom-4 right-4 text-gray-400 hover:text-pink-500 transition-colors hidden group-hover:block">
                    <Heart size={20} />
                  </button>

                  {/* QUICK ADD SIZE OVERLAY (Matches image_c76501.png) */}
                  <div className="absolute bottom-0 left-0 w-full bg-white/95 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-3">
                    <p className="text-[10px] font-black text-pink-500 uppercase mb-2 tracking-tighter">Quick Add Size:</p>
                    <div className="flex flex-wrap gap-1">
                      {["32B", "34B", "36C", "38B", "40C"].map((size) => (
                        <button
                          key={size}
                          onClick={() => handleSizeSelect(product.id, size)}
                          className={`text-[9px] w-8 h-8 flex items-center justify-center border transition-all font-bold ${
                            selectedSizes[product.id] === size 
                            ? "bg-[#041f41] text-white border-[#041f41]" 
                            : "border-gray-200 text-gray-600 hover:border-pink-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="space-y-1.5 px-1">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-bold text-[11px] uppercase truncate text-gray-500 tracking-tight">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-900">₹{product.offerPrice}</span>
                    <span className="text-[10px] text-gray-300 line-through">₹{product.price}</span>
                  </div>

                  <p className="text-[9px] text-pink-500 font-bold italic">(inclusive of all taxes)</p>

                  <div className="flex items-center gap-1 mt-1">
                    <Star size={10} fill="currentColor" className="text-yellow-400"/>
                    <span className="text-[10px] font-bold text-gray-400">{product.rating || "4.1"} ({product.reviewsCount || "124"})</span>
                  </div>

                  {/* ADD TO CART BUTTON (Clovia Style) */}
                  <button 
                    className={`w-full mt-4 py-3 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${
                      selectedSizes[product.id] 
                      ? "bg-[#ed4e7e] text-white shadow-lg shadow-pink-100" 
                      : "bg-pink-100 text-pink-400 cursor-not-allowed"
                    }`}
                  >
                    {selectedSizes[product.id] ? `Add Size ${selectedSizes[product.id]}` : "Add To Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingCart size={30} className="text-gray-200" />
             </div>
             <p className="font-bold text-gray-400 uppercase text-[11px] tracking-widest">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}