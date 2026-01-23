"use client";
import { useState } from "react";
import {
  Zap,
  MessageCircle,
  Smartphone,
  QrCode,
  CheckCircle2,
  Truck,
  HelpCircle,
  X,
  MessageSquare,
  ShieldCheck,
  Star,
  Sparkles,
  ChevronRight
} from "lucide-react";

/* PRODUCT DATA */
const defaultProduct = {
  id: "PROD_001",
  name: "SEAMLESS BOOTY PADS PANTIES",
  price: 1299, // Testing ke liye 1 rakha hai, aap change kar sakte hain
  mainImage: "/image/Women-HIP-PAD-PANTY/hip-pad-1.webp",
  images: [
    "/image/Women-HIP-PAD-PANTY/hip-pad.webp",
    "/image/Women-HIP-PAD-PANTY/hip-pad-2.webp",
    "/image/Women-HIP-PAD-PANTY/HIP-PAD-3.webp",
    "/image/Women-HIP-PAD-PANTY/MANIFIQUE-Padded-Underwear-3.webp",
    "/image/Women-HIP-PAD-PANTY/Seamless-Booty-Pads-Butt-Enhancer-Panties-7.webp"
  ],
  sizes: ["S", "M", "L", "XL", "XXL"]
};

export default function ProductDetails({ product = defaultProduct }) {
  const [mainImage, setMainImage] = useState(product.mainImage);
  const [orderStatus, setOrderStatus] = useState("idle"); // idle, loading, success
  const [showHelp, setShowHelp] = useState(false);
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
  // Live API URL (Aapka domain name yahan aayega)
  const API_URL = "https://www.bootybloom.online/api/orders";

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const isValid =
    formData.name.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.houseNo.trim() !== "" &&
    formData.area.trim() !== "" &&
    formData.pincode.trim() !== "" &&
    selectedSize !== "";

  const handleOrderSubmit = async () => {
    if (!selectedSize) return alert("Please select your Size first!");
    if (!isValid) return alert("Please complete your delivery address details");

    setOrderStatus("loading");

    // Unified Payload for your Backend Schema
    const orderPayload = {
      customerData: {
        name: formData.name,
        phone: formData.phone,
        address: `${formData.houseNo}, ${formData.area}, ${formData.city} - ${formData.pincode}`,
        houseNo: formData.houseNo,
        area: formData.area,
        city: formData.city,
        pincode: formData.pincode
      },
      items: [{
        name: product.name,
        price: product.price,
        size: selectedSize,
        quantity: 1
      }],
      amount: product.price,
      paymentType: "WhatsApp Order / COD",
      status: "Pending"
    };

    try {
      // 1. SAVE TO DATABASE
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        // 2. OPEN WHATSAPP
        const whatsappMsg = `*🚀 NEW ORDER CONFIRMED*
------------------------------
*Product:* ${product.name}
*Size:* ${selectedSize}
*Price:* ₹${product.price}
------------------------------
*Delivery Details:*
*Name:* ${formData.name}
*Address:* ${formData.houseNo}, ${formData.area}
*City:* ${formData.city} - ${formData.pincode}
*Phone:* ${formData.phone}

*Payment:* Cash on Delivery`;
        
        window.open(`https://wa.me/${myWhatsApp}?text=${encodeURIComponent(whatsappMsg)}`, "_blank");
        setOrderStatus("success");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Something went wrong. Please try again.");
        setOrderStatus("idle");
      }
    } catch (error) {
      console.error("Order Error:", error);
      alert("Server error. Please check your connection.");
      setOrderStatus("idle");
    }
  };

  /* SUCCESS SCREEN */
  if (orderStatus === "success") {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-t-8 border-green-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={50} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-[#041f41] italic uppercase">Aapka Order Mil Gaya!</h2>
          <p className="text-gray-500 mt-3 font-medium">Humein aapka order receive ho gaya hai. Hum jald hi aapse contact karenge.</p>
          
          <div className="bg-blue-50 p-6 rounded-2xl mt-8 border-2 border-blue-100">
            <div className="flex items-center justify-center gap-2 font-black text-blue-700 uppercase text-sm tracking-widest">
              <Truck size={20} /> Fast Delivery
            </div>
            <p className="text-2xl font-black mt-2 text-[#041f41]">3 – 5 Days</p>
          </div>

          <button 
            onClick={() => window.location.href = "/"}
            className="mt-8 w-full bg-[#041f41] text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-[1250px] mx-auto px-4 py-8 relative">
      {/* Floating Help Button */}
      <button onClick={() => setShowHelp(true)} className="fixed bottom-6 right-6 z-50 bg-[#25d366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform">
        <MessageCircle size={28} />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT: VISUALS */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-50 aspect-[4/5]">
              <div className="absolute top-5 left-5 z-10 bg-red-600 text-white px-5 py-2 rounded-full font-black text-xs shadow-lg animate-pulse uppercase tracking-tighter">
                Limited Offer: Buy 1 Get 1 Free
              </div>
              <img src={mainImage} className="w-full h-full object-contain" alt="Booty Bloom Product" />
            </div>

            <div className="flex gap-3 mt-6 overflow-x-auto no-scrollbar py-2">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setMainImage(img)}
                  className={`relative flex-shrink-0 w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-blue-600 scale-105' : 'border-transparent opacity-60'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: INFO & FORM */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-[0.2em] mb-2">
               <Star size={16} fill="currentColor"/> Top Rated Seller
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#041f41] leading-[1.1] uppercase italic tracking-tighter mb-4">
              {product.name}
            </h1>
            <div className="flex items-center gap-4">
               <span className="text-5xl font-black text-blue-700 tracking-tighter">₹{product.price}</span>
               <span className="text-xl text-gray-400 line-through font-bold">₹2,499</span>
               <div className="bg-green-100 text-green-700 px-3 py-1 rounded-lg font-black text-sm">SAVE 50%</div>
            </div>
          </div>

          {/* SIZE SELECTION */}
          <div className="space-y-4">
            <label className="text-sm font-black uppercase tracking-widest text-gray-400 flex justify-between">
              Select Your Size <span>Size Guide</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-14 rounded-2xl font-black transition-all flex items-center justify-center border-2 ${selectedSize === size ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 'bg-white border-gray-100 text-gray-600 hover:border-blue-300'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* ORDER FORM */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-gray-50 space-y-6">
            <div className="flex items-center gap-4 mb-2">
               <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><MapPinIcon size={24}/></div>
               <h2 className="text-2xl font-black text-[#041f41] uppercase tracking-tighter italic">Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" onChange={handleChange} value={formData.name} placeholder="Aapka Pura Naam" className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[#041f41] transition-all md:col-span-2" />
              <input name="phone" onChange={handleChange} value={formData.phone} placeholder="WhatsApp Number" className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[#041f41] transition-all md:col-span-2" />
              <input name="houseNo" onChange={handleChange} value={formData.houseNo} placeholder="House / Flat No." className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[#041f41] transition-all" />
              <input name="area" onChange={handleChange} value={formData.area} placeholder="Area / Landmark" className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[#041f41] transition-all" />
              <input name="city" onChange={handleChange} value={formData.city} placeholder="City" className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[#041f41] transition-all" />
              <input name="pincode" onChange={handleChange} value={formData.pincode} placeholder="Pincode" className="p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-[#041f41] transition-all" />
            </div>

            <button
              disabled={orderStatus === "loading"}
              onClick={handleOrderSubmit}
              className="group w-full bg-[#25d366] hover:bg-black text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {orderStatus === "loading" ? "Processing..." : (
                <>CONFIRM ORDER <ChevronRight className="group-hover:translate-x-2 transition-transform"/></>
              )}
            </button>
            
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
              🔒 100% Privacy & Cash on Delivery Available
            </p>
          </div>

          {/* TRUST BADGES */}
          <div className="grid grid-cols-3 gap-4 text-center">
             <div className="p-4 bg-gray-50 rounded-3xl">
                <ShieldCheck size={24} className="mx-auto text-blue-600 mb-2"/>
                <p className="text-[10px] font-black uppercase tracking-tighter">Genuine Product</p>
             </div>
             <div className="p-4 bg-gray-50 rounded-3xl">
                <Truck size={24} className="mx-auto text-pink-500 mb-2"/>
                <p className="text-[10px] font-black uppercase tracking-tighter">Fast Shipping</p>
             </div>
             <div className="p-4 bg-gray-50 rounded-3xl">
                <Sparkles size={24} className="mx-auto text-orange-400 mb-2"/>
                <p className="text-[10px] font-black uppercase tracking-tighter">Premium Quality</p>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

// Simple Helper Icon
function MapPinIcon({size}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
}
