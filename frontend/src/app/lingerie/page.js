"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { Heart, Filter, ChevronDown, Star, Eye, ShoppingBag, X, ShieldCheck, Truck, ShoppingCart, Zap } from "lucide-react";

// Lingerie Products Data - Exact folder path and logic
export const lingierieProducts = Array.from({ length: 42 }, (_, i) => {
  const num = i + 1;
  const currentPrice = 899 + (i * 15);
  const oldPrice = currentPrice + 800;

  return {
    id: `lingerie-${num}`,
    name: `CLOVIA PINK LUXE LACE LINGERIE SET ${num}`,
    price: currentPrice,
    oldPrice: oldPrice,
    img: `/image/lingerie-set-gum/Lingerie-set-gum-${num}.jpg`,
    discount: `${Math.floor(Math.random() * 15) + 45}%`,
    rating: (Math.random() * (5 - 4.3) + 4.3).toFixed(1),
    reviews: 85 + (num * 2),
    offer: "3 For 1099",
    sizes: ["32B", "34B", "36C", "38B", "40C"],
    colors: ["Rose Pink", "Deep Red", "Classic Black", "Wine"]
  };
});

export default function LingeriePage() {
  const [selectedProduct, setSelectedProduct] = useState(null); // Modal state

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden text-[#ed4e7e]">
      <div className="w-full sticky top-0 z-50 bg-white border-b border-pink-50 shadow-sm">
        <Navbar />
      </div>

      {/* Filter Header - Same as Bra Page */}
      <div className="px-4 py-3 border-b border-pink-100 flex justify-between items-center bg-white sticky top-[64px] z-40">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#ed4e7e] uppercase tracking-widest">Sort By:</span>
          <select className="text-[10px] font-bold uppercase outline-none bg-transparent cursor-pointer text-[#ed4e7e]">
            <option>New Arrivals</option>
            <option>Low to High</option>
            <option>High to Low</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-1 text-[10px] font-bold text-[#ed4e7e] uppercase">
            <span className="w-2 h-2 bg-[#ed4e7e] inline-block"></span> Size
          </button>
          <button className="flex items-center gap-2 text-[10px] font-bold text-[#ed4e7e] uppercase border border-[#ed4e7e] px-3 py-1 rounded-sm">
            <Filter size={12} /> Show Filters
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto flex">
        <aside className="hidden lg:block w-64 p-6 border-r border-pink-50 sticky top-[120px] h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
          <h2 className="font-bold text-[10px] mb-6 tracking-widest uppercase text-[#ed4e7e]">Refine Your Selection</h2>
          {["Collection", "Size", "Color", "Discount", "Fabric", "Price Range"].map((f) => (
            <div key={f} className="mb-4 flex justify-between items-center cursor-pointer border-b border-pink-50 pb-2">
              <span className="text-[11px] font-bold text-[#ed4e7e] uppercase">{f}</span>
              <ChevronDown size={14} className="text-pink-300" />
            </div>
          ))}
        </aside>

        <main className="flex-1 p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {lingierieProducts.map((item) => (
              <ProductCard key={item.id} item={item} onOpenDetails={() => setSelectedProduct(item)} />
            ))}
          </div>
        </main>
      </div>

      {/* Modal logic implementation */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Footer />
    </div>
  );
}

function ProductCard({ item, onOpenDetails }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="group flex flex-col bg-white border border-pink-50 relative rounded-sm overflow-hidden shadow-sm h-full transition-all hover:shadow-md">

      <div className="relative aspect-[3/4] overflow-hidden bg-[#fff5f8]">
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-0 left-0 bg-[#ed4e7e] text-white text-[9px] px-2 py-0.5 font-bold z-10">{item.discount} OFF</div>
        <div className="absolute bottom-0 right-0 bg-[#AD1457] text-white text-[9px] px-2 py-1 font-bold italic z-10">{item.offer}</div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div onClick={onOpenDetails} className="bg-white/90 p-2 rounded-full shadow-md text-[#ed4e7e] cursor-pointer">
            <Eye size={18} />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white/95 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-pink-100 z-30">
          <p className="text-[8px] font-bold text-pink-400 uppercase mb-1">Quick Add Size:</p>
          <div className="flex flex-wrap gap-1">
            {item.sizes.map((size) => (
              <span key={size} className="text-[9px] border border-pink-100 px-1 py-0.5 hover:bg-[#ed4e7e] hover:text-white cursor-pointer bg-white text-[#ed4e7e] font-bold">
                {size}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-grow bg-white">
        <h3 className="text-[10px] text-[#ed4e7e] font-bold truncate uppercase mb-1">{item.name}</h3>
        <div className="flex items-start justify-between gap-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-900">₹{item.price}</span>
              <span className="text-[10px] text-pink-200 line-through font-medium">₹{item.oldPrice}</span>
            </div>
            <p className="text-[8px] text-pink-400 font-medium italic">(inclusive of all taxes)</p>
          </div>
          <button onClick={() => setIsWishlisted(!isWishlisted)} className="pt-0.5">
            <Heart size={18} fill={isWishlisted ? "#ed4e7e" : "none"} stroke="#ed4e7e" />
          </button>
        </div>

        <div className="flex items-center gap-1 mt-1.5 mb-3">
          <Star size={10} className="fill-[#ed4e7e] text-[#ed4e7e]" />
          <span className="text-[10px] font-bold text-[#ed4e7e]">{item.rating}</span>
          <span className="text-[10px] text-pink-300 font-medium">({item.reviews})</span>
        </div>

        <div className="mt-3 w-full px-1 pb-1">
          <button
            onClick={onOpenDetails}
            className="w-full bg-[#ed4e7e] text-white py-2.5 text-[12px] font-bold uppercase tracking-widest rounded-sm shadow-sm border-none cursor-pointer flex items-center justify-center active:scale-95 transition-all"
            style={{ backgroundColor: '#ed4e7e', color: 'white' }}
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailsModal({ product, onClose }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [size, setSize] = useState("");
  const [color, setColor] = useState(product.colors[0]);

  const handleCartAdd = () => {
    if (!size) { alert("Please select a size!"); return; }
    addToCart(product, size);
    alert("Success! Item added to cart.");
    onClose();
  };

  const handleBuyNow = () => {
    if (!size) { alert("Please select a size!"); return; }
    addToCart(product, size);
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in duration-300 flex flex-col md:flex-row max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-white/80 rounded-full text-gray-800 hover:bg-white shadow-md transition-all">
          <X size={24} />
        </button>

        <div className="md:w-1/2 bg-[#fff5f8] overflow-hidden">
          <img src={product.img} className="w-full h-full object-cover" alt={product.name} />
        </div>

        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto no-scrollbar space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ed4e7e] bg-pink-50 px-2 py-1 rounded">Luxe Collection</span>
            <h1 className="text-2xl font-black text-gray-800 uppercase leading-tight">{product.name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-[#ed4e7e]">₹{product.price}</span>
              <span className="text-lg text-gray-300 line-through">₹{product.oldPrice}</span>
              <span className="text-sm font-bold text-green-500">{product.discount} OFF</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">Select Color: <span className="text-gray-800">{color}</span></p>
              <div className="flex gap-3">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full border-2 transition-all ${color === c ? 'border-[#ed4e7e] p-0.5' : 'border-gray-200'}`}>
                    <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.toLowerCase().replace(' ', '') }}></div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">Select Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSize(s)} className={`px-5 py-2 border-2 font-bold text-sm transition-all rounded-md ${size === s ? 'bg-[#ed4e7e] text-white border-[#ed4e7e]' : 'border-gray-100 text-gray-600 hover:border-pink-300'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6">
            <button
              onClick={handleCartAdd}
              className="w-full bg-[#ed4e7e] text-white py-2.5 text-[12px] font-bold uppercase tracking-widest rounded-sm shadow-sm border-none cursor-pointer flex items-center justify-center active:scale-95 transition-all"
              style={{ backgroundColor: '#ed4e7e', color: 'white' }}
            >
              <ShoppingCart size={16} className="mr-2" /> ADD TO CART
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full bg-[#ed4e7e] text-white py-2.5 text-[12px] font-bold uppercase tracking-widest rounded-sm shadow-sm border-none cursor-pointer flex items-center justify-center active:scale-95 transition-all"
              style={{ backgroundColor: '#ed4e7e', color: 'white' }}
            >
              <Zap size={16} className="mr-2" /> BUY NOW
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase"><Truck size={14} className="text-[#ed4e7e]" /> Express Delivery</div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase"><ShieldCheck size={14} className="text-[#ed4e7e]" /> Luxe Quality</div>
          </div>
        </div>
      </div>
    </div>
  );
}