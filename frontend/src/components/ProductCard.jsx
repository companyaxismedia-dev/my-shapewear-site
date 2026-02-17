"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { 
  Star, Heart, ShoppingCart, Zap, Share2, 
  ChevronRight, ShieldCheck, Truck, RotateCcw, MapPin
} from "lucide-react";

export default function ProductPage() {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [isClient, setIsClient] = useState(false);
  
  // Pincode Logic States
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  // Next.js Hydration Fix (image_bd689c.png error solution)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const product = {
    id: "clovia-bra-001",
    name: "Non-Padded Non-Wired Full Figure Bra in Black - Cotton & Lace",
    price: 577,
    oldPrice: 1299,
    discount: "54% OFF",
    rating: 4.6,
    totalRatings: 8,
    image: "/image/bra/bra-2.jpg", 
    colors: ["Black", "Nude", "Pink", "Blue"],
    features: ["COTTON BRAS", "DOUBLE LAYERED CUPS", "FULL COVERAGE", "NON PADDED"]
  };

  const handlePincodeCheck = () => {
    if (pincode.length === 6) {
      setDeliveryStatus("Checking...");
      setTimeout(() => {
        setDeliveryStatus("Delivery by Thursday, 29th Jan");
      }, 1000);
    } else {
      alert("Please enter a valid 6-digit pincode");
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first!");
      return;
    }
    addToCart({ ...product, size: selectedSize, color: selectedColor, qty: 1 });
    alert(`Size ${selectedSize} added to your bag!`);
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-white font-sans pb-20 md:pb-10">
      {/* Top Offer Bar (image_c7561a.png) */}
      <div className="bg-pink-50 text-[#ed4e7e] text-center py-2 text-[11px] font-bold uppercase tracking-wider sticky top-0 z-50">
        Get ₹100 off on orders above ₹799! Use code- CLO100
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <nav className="text-[10px] text-gray-400 font-bold uppercase mb-6 flex items-center gap-1">
          Home <ChevronRight size={10}/> Bras <ChevronRight size={10}/> {product.name}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* LEFT: Image Gallery */}
          <div className="flex gap-4">
            <div className="hidden md:flex flex-col gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-16 h-20 border rounded-md overflow-hidden cursor-pointer hover:border-[#ed4e7e]">
                  <Image src={product.image} alt="thumb" width={80} height={100} className="object-cover" />
                </div>
              ))}
            </div>
            <div className="flex-1 relative">
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden border border-gray-100 shadow-sm">
                <Image src={product.image} alt={product.name} fill className="object-cover" priority />
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-3">
                <button onClick={handleCartAdd} className="w-full bg-white border-2 border-[#ed4e7e] text-[#ed4e7e] py-4 rounded-xl font-bold flex items-center justify-center gap-2 uppercase text-xs tracking-widest hover:bg-pink-50 transition-all">
                              <ShoppingCart size={18} /> Add to Cart
                            </button>
                <button onClick={handleCartAdd} className="w-full bg-white border-2 border-[#ed4e7e] text-[#ed4e7e] py-4 rounded-xl font-bold flex items-center justify-center gap-2 uppercase text-xs tracking-widest hover:bg-pink-50 transition-all">
                              <ShoppingCart size={18} /> Buy
                            </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Content Area */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h1 className="text-xl font-bold text-gray-800 leading-tight mb-2">{product.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-[#041f41]">₹{product.price}</span>
                <span className="text-lg text-gray-300 line-through">₹{product.oldPrice}</span>
                <span className="text-green-500 font-bold text-sm bg-green-50 px-2 py-0.5 rounded">{product.discount}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-1">(inclusive of all taxes)</p>
            </div>

            {/* Available Offers (image_c7561a.png) */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">Available Offers</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border border-pink-100 bg-pink-50/30 p-3 rounded-lg flex flex-col gap-1">
                  <p className="text-[11px] font-black text-gray-800">Get Product at <span className="text-[#ed4e7e]">₹366.33</span></p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">3 Bras @ 1099</p>
                  <button className="text-[9px] font-black text-blue-500 uppercase mt-1 self-start border-b border-blue-500">View Items</button>
                </div>
                <div className="border border-dashed border-gray-200 p-3 rounded-lg">
                  <p className="text-[11px] font-black text-green-600">Get ₹239 OFF</p>
                  <p className="text-[9px] text-gray-500">Valid on orders above ₹1299</p>
                  <div className="bg-gray-100 text-[10px] font-bold px-2 py-1 mt-2 inline-block rounded">CLO239</div>
                </div>
              </div>
            </div>

            {/* Color & Size (image_c74e61.png) */}
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="font-bold text-[11px] text-gray-600 uppercase tracking-widest">Select Color: <span className="text-black font-black">{selectedColor}</span></p>
                <div className="flex gap-3">
                  {product.colors.map(color => (
                    <button 
                      key={color} 
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full border-2 p-0.5 ${selectedColor === color ? 'border-[#ed4e7e]' : 'border-transparent'}`}
                    >
                      <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: color.toLowerCase() }}></div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center max-w-sm">
                  <p className="font-bold text-[11px] text-gray-600 uppercase tracking-widest">Select Size</p>
                  <p className="text-[10px] text-blue-500 font-bold border-b border-blue-500 cursor-pointer">Size Chart</p>
                </div>
                <div className="flex flex-wrap gap-2 max-w-md">
                  {["32B", "34B", "36C", "38B", "40C"].map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-10 rounded-md font-bold text-xs border transition-all ${selectedSize === size ? 'bg-[#041f41] text-white border-[#041f41] shadow-md scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pincode Check (image_bd56cc.png) */}
            <div className="space-y-3 border-t pt-6">
              <p className="font-bold text-[11px] text-gray-600 uppercase tracking-widest flex items-center gap-2">
                <Truck size={14} /> Estimate Delivery
              </p>
              <div className="flex max-w-sm border rounded-md overflow-hidden focus-within:border-[#ed4e7e] transition-colors">
                <input 
                  type="text" 
                  placeholder="Enter Pincode" 
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm outline-none"
                />
                <button 
                  onClick={handlePincodeCheck}
                  className="px-6 py-3 bg-white text-[#ed4e7e] font-black text-xs uppercase hover:bg-pink-50 transition-colors"
                >
                  Check
                </button>
              </div>
              {deliveryStatus && <p className="text-[11px] font-bold text-green-600 italic">{deliveryStatus}</p>}
            </div>

            {/* Action Buttons (image_bd568b.png) */}
            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white py-4 md:static z-20 border-t md:border-0">
               <button 
                onClick={handleAddToCart}
                className="flex-1 bg-[#ed4e7e] text-white py-4 rounded-md font-black uppercase tracking-[0.1em] text-[11px] flex items-center justify-center gap-2 hover:brightness-110 shadow-lg"
              >
                <ShoppingCart size={18} /> Add to C
              </button>
            </div>

            {/* Trust Markers (image_bd56ab.png) */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t pb-8">
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck size={20} className="text-gray-400" />
                <span className="text-[9px] font-bold text-gray-500 uppercase">100% Original</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 border-x">
                <RotateCcw size={20} className="text-gray-400" />
                <span className="text-[9px] font-bold text-gray-500 uppercase">15 Days Return</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Truck size={20} className="text-gray-400" />
                <span className="text-[9px] font-bold text-gray-500 uppercase">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}