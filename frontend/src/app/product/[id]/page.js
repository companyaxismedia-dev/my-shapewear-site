"use client";
import { useState } from "react";
import {
  MessageCircle,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Star,
  Sparkles,
  ChevronRight,
  BadgePercent
} from "lucide-react";

/* PRODUCT DATA (Ads ke liye updated prices) */
const defaultProduct = {
  id: "PROD_001",
  name: "SEAMLESS BOOTY PADS PANTIES",
  price: 1299, // Testing ke liye 1 rakha hai, aap change kar sakte hain
  price: 2499, // Original Price
  offerPrice: 749, // Ads Offer Price
  mainImage: "/image/Women-HIP-PAD-PANTY/hip-pad-1.webp",
  images: [
    "/image/Women-HIP-PAD-PANTY/hip-pad.webp",
    "/image/Women-HIP-PAD-PANTY/hip-pad-2.webp",
    "/image/Women-HIP-PAD-PANTY/HIP-PAD-3.webp",
    "/image/Women-HIP-PAD-PANTY/MANIFIQUE-Padded-Underwear-3.webp"
  ],
  sizes: ["S", "M", "L", "XL", "XXL"]
};

export default function ProductDetails({ product = defaultProduct }) {
  const [mainImage, setMainImage] = useState(product.mainImage);
  const [orderStatus, setOrderStatus] = useState("idle");
  const [selectedSize, setSelectedSize] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNo: "",
    area: "",
    city: "",
    pincode: ""
  });

  const myWhatsApp = "919217521109";
  const API_URL = "https://www.bootybloom.online/api/orders";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleOrderSubmit = async () => {
    if (!selectedSize) return alert("Pehle apni Size select karein!");
    if (!formData.name || !formData.phone || !formData.area) return alert("Kripya Delivery Details bhariye");

    setOrderStatus("loading");

    const orderPayload = {
      customerData: {
        name: formData.name,
        phone: formData.phone,
        address: `${formData.houseNo}, ${formData.area}, ${formData.city} - ${formData.pincode}`,
      },
      items: [{
        name: product.name,
        price: product.offerPrice,
        size: selectedSize,
        quantity: 1
      }],
      amount: product.offerPrice,
      paymentType: "WhatsApp Order / COD",
      status: "Pending"
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const whatsappMsg = `*🚀 NEW ORDER CONFIRMED*%0A------------------------------%0A*Product:* ${product.name}%0A*Size:* ${selectedSize}%0A*Price:* ₹${product.offerPrice}%0A------------------------------%0A*Delivery Details:*%0A*Name:* ${formData.name}%0A*Address:* ${formData.area}, ${formData.city}%0A*Phone:* ${formData.phone}%0A%0A*Payment:* Cash on Delivery`;
        
        window.open(`https://wa.me/${myWhatsApp}?text=${whatsappMsg}`, "_blank");
        setOrderStatus("success");
      }
    } catch (error) {
      alert("Server error. Please try again.");
      setOrderStatus("idle");
    }
  };

  if (orderStatus === "success") {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-t-8 border-green-500">
          <CheckCircle2 size={60} className="text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-black italic uppercase italic">Order Mil Gaya!</h2>
          <p className="text-gray-500 mt-2">Hum jald hi aapse WhatsApp par contact karenge.</p>
          <button onClick={() => window.location.href = "/"} className="mt-8 w-full bg-black text-white py-4 rounded-2xl font-bold uppercase tracking-widest">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 min-h-screen">
      {/* ⚡ URGENCY BANNER FOR ADS */}
      <div className="bg-red-600 text-white text-center py-2 text-[10px] md:text-xs font-black tracking-widest uppercase animate-pulse">
        🔥 Valentine Special: BUY 1 GET 1 FREE - Limited Time Offer 🔥
      </div>

      <div className="max-w-[1100px] mx-auto bg-white shadow-xl grid grid-cols-1 lg:grid-cols-2">
        
        {/* LEFT: PRODUCT SHOWCASE */}
        <div className="p-4 lg:p-8">
          <div className="relative rounded-[2rem] overflow-hidden bg-gray-100 aspect-[4/5] shadow-inner">
            <img src={mainImage} className="w-full h-full object-contain mix-blend-multiply" alt="Product" />
            <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Star size={14} fill="#EAB308" className="text-yellow-500"/>
              <span className="text-[10px] font-black tracking-tighter uppercase">4.9/5 (950+ Reviews)</span>
            </div>
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setMainImage(img)} className={`w-16 h-20 flex-shrink-0 rounded-xl border-2 transition-all ${mainImage === img ? 'border-blue-600 scale-105' : 'border-transparent opacity-50'}`}>
                <img src={img} className="w-full h-full object-cover rounded-lg" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: PRICING & ORDER FORM */}
        <div className="p-6 lg:p-10 space-y-6">
          <div>
            <div className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1">
              <BadgePercent size={14}/> Special Festive Offer
            </div>
            <h1 className="text-3xl font-black text-[#041f41] leading-tight italic uppercase tracking-tighter">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-4xl font-black text-blue-700 tracking-tighter">₹{product.offerPrice}</span>
              <span className="text-lg text-gray-400 line-through font-bold">₹{product.price}</span>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-black text-xs uppercase italic">Flat 70% OFF</div>
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Your Perfect Size:</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 rounded-xl font-black transition-all border-2 ${selectedSize === size ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-600'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ADS FRIENDLY FORM */}
          <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border-2 border-blue-100 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700 font-black uppercase text-sm italic mb-2">
               <MapPinIcon size={18}/> Direct Shipping Info
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input name="name" onChange={handleChange} placeholder="Full Name" className="p-4 bg-white rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
              <input name="phone" onChange={handleChange} placeholder="WhatsApp Number" className="p-4 bg-white rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
              <input name="area" onChange={handleChange} placeholder="Address (Area / Landmark)" className="p-4 bg-white rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
              <div className="grid grid-cols-2 gap-3">
                <input name="city" onChange={handleChange} placeholder="City" className="p-4 bg-white rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                <input name="pincode" onChange={handleChange} placeholder="Pincode" className="p-4 bg-white rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
              </div>
            </div>

            <button
              disabled={orderStatus === "loading"}
              onClick={handleOrderSubmit}
              className="w-full bg-[#25d366] hover:bg-black text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
            >
              {orderStatus === "loading" ? "Processing..." : (
                <> <MessageCircle fill="white" size={20}/> CONFIRM ON WHATSAPP <ChevronRight/></>
              )}
            </button>
            <div className="flex justify-center gap-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <span>🚚 FREE Delivery</span>
              <span>📦 Cash on Delivery</span>
              <span>🔒 100% Secure</span>
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-3 border-t pt-6">
             <div className="text-center">
                <ShieldCheck size={20} className="mx-auto text-blue-600 mb-1"/>
                <p className="text-[9px] font-black uppercase">Genuine</p>
             </div>
             <div className="text-center">
                <Truck size={20} className="mx-auto text-pink-500 mb-1"/>
                <p className="text-[9px] font-black uppercase">Fast Ship</p>
             </div>
             <div className="text-center">
                <Sparkles size={20} className="mx-auto text-orange-400 mb-1"/>
                <p className="text-[9px] font-black uppercase">Premium</p>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </section>
  );
}

function MapPinIcon({size}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
}
