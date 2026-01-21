"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Zap,
  CreditCard,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  Truck,
  ShieldCheck,
  Sparkles,
  Award
} from "lucide-react";

/* ---------------- PRODUCT DATA ---------------- */
const defaultProduct = {
  id: "seamless-booty-pads-panties",
  name: "SEAMLESS BOOTY PADS PANTIES",
  originalPrice: 2500,
  price: 1,
  mainImage: "/image/Women-HIP-PAD-PANTY/hip-pad-1.webp",
  images: [
    "/image/Women-HIP-PAD-PANTY/hip-pad.webp",
    "/image/Women-HIP-PAD-PANTY/hip-pad-2.webp",
    "/image/Women-HIP-PAD-PANTY/HIP-PAD-3.webp",
    "/image/Women-HIP-PAD-PANTY/MANIFIQUE-Padded-Underwear-3.webp",
    "/image/Women-HIP-PAD-PANTY/Seamless-Booty-Pads-Butt-Enhancer-Panties-7.webp",
    "/image/Women-HIP-PAD-PANTY/sizes.webp"
  ]
};

export default function ProductDetails({ product = defaultProduct }) {
  const [mainImage, setMainImage] = useState(product.mainImage);
  const [selectedSize, setSelectedSize] = useState("M");
  const [orderStatus, setOrderStatus] = useState("idle");
  const [lastOrderId, setLastOrderId] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNo: "",
    area: "",
    city: "",
    pincode: "",
    state: ""
  });

  const myWhatsApp = "919217521109";

  // Hydration fix & Razorpay Script Load
  useEffect(() => {
    setIsClient(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(s);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const isValid =
    formData.name.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.houseNo.trim() !== "" &&
    formData.area.trim() !== "" &&
    formData.pincode.trim() !== "";

  // --- SAVE ORDER FUNCTION ---
  const saveOrder = async (payMethod, payId = "N/A") => {
    try {
      const fullAddress = `${formData.houseNo}, ${formData.area}, ${formData.city}, ${formData.pincode}, ${formData.state || 'N/A'}`;

      const orderPayload = {
        customerData: {
          name: formData.name,
          phone: formData.phone,
          address: fullAddress, 
          houseNo: formData.houseNo,
          area: formData.area,
          city: formData.city,
          pincode: formData.pincode,
          state: formData.state || "N/A"
        },
        items: [{
          name: product.name,
          price: product.price,
          size: selectedSize,
          quantity: 1
        }],
        amount: product.price,
        paymentId: payId,
        paymentType: payMethod === "ONLINE" ? "Online Paid" : "WhatsApp Order"
      };

      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      
      let newId = "NEW";
      if (data.success && data.order) {
        newId = data.order._id.slice(-6).toUpperCase();
      } else if (data._id) {
        newId = data._id.slice(-6).toUpperCase();
      }
      setLastOrderId(newId);
      return newId; 
    } catch (err) {
      console.error("Order Save Error:", err);
      return "NEW";
    }
  };

  // SUCCESS SCREEN
  if (orderStatus === "success") {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-white p-8 rounded-3xl shadow-xl border"
        >
          <CheckCircle2 size={70} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-[#041f41] mb-2">Order Placed!</h2>
          <p className="text-gray-500 mb-4">Aapka Order ID: <span className="font-bold text-blue-600">#{lastOrderId}</span></p>
          <div className="bg-blue-50 p-5 rounded-xl mb-6">
            <div className="flex items-center gap-2 font-bold text-blue-700">
              <Truck size={18} /> Estimated Delivery
            </div>
            <p className="text-xl font-black mt-2">3 – 5 Working Days</p>
            <p className="text-xs text-gray-500 mt-2 italic">Aapko WhatsApp par tracking link mil jayega.</p>
          </div>
          <button onClick={() => setOrderStatus("idle")} className="text-blue-600 font-bold underline">
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden min-h-screen py-10">
      {/* BACKGROUND PARTICLES - Only rendered on client to avoid Math.random hydration error */}
      {isClient && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "110vh", x: `${Math.random() * 100}vw`, opacity: 0 }}
              animate={{ y: "-10vh", opacity: [0, 0.5, 0] }}
              transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, delay: i * 2 }}
              className="absolute text-pink-400/20 text-2xl"
            >
              {i % 2 === 0 ? "♥" : "●"}
            </motion.div>
          ))}
        </div>
      )}

      <div id="main-product-section" className="relative z-10 max-w-[1200px] mx-auto px-3 sm:px-4">
        {/* BANNER */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 bg-gradient-to-r from-red-600 via-pink-600 to-red-600 text-white text-center py-4 rounded-2xl shadow-lg border-b-4 border-red-800"
        >
          <h2 className="text-xl md:text-4xl font-black italic tracking-tighter uppercase">
            🔥 Valentine Special: BUY 1 GET 1 FREE 🔥
          </h2>
        </motion.div>

        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white p-4 sm:p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* LEFT : PRODUCT VISUALS */}
            <div className="space-y-6">
              <div className="relative aspect-[4/5] rounded-[2rem] bg-gray-50 overflow-hidden border-4 border-white shadow-inner">
                <Image src={mainImage} alt={product.name} fill className="object-contain p-4" />
                <motion.span 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute top-5 left-5 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg"
                >
                  BEST SELLER
                </motion.span>
              </div>

              <div className="flex gap-3 overflow-x-auto justify-center pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`relative w-16 h-20 flex-shrink-0 rounded-xl border-2 transition-all ${
                      mainImage === img ? "border-blue-600 scale-105 shadow-md" : "border-gray-200 opacity-60"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover rounded-lg" />
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-5xl font-black text-[#041f41] uppercase italic leading-tight">
                  {product.name}
                </h1>

                <div className="relative bg-blue-50 p-6 rounded-[2rem] border border-blue-100 overflow-hidden">
                  <div className="flex flex-wrap items-baseline gap-4">
                    <p className="text-5xl sm:text-7xl font-black text-blue-700 tracking-tighter">
                      ₹{product.price}
                    </p>
                    <div className="relative">
                      <span className="text-2xl sm:text-3xl font-bold text-gray-400">
                        ₹{product.originalPrice}
                      </span>
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="absolute top-1/2 left-0 h-[3px] bg-red-500 -rotate-12 origin-left"
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-blue-600 font-black italic flex items-center gap-1 uppercase text-lg">
                      <Zap size={20} fill="currentColor" className="text-yellow-500" /> BUY 1 GET 1 FREE
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="font-bold mb-3 text-[#041f41] uppercase text-sm tracking-widest">Select Your Size:</p>
                  <div className="flex gap-3">
                    {["S", "M", "L", "XL"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-14 h-14 rounded-2xl border-2 font-black transition-all ${
                          selectedSize === s ? "bg-[#041f41] text-white border-[#041f41] shadow-lg scale-110" : "border-gray-200 text-gray-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT : FORM & CHECKOUT */}
            <div className="space-y-6">
              <div className="bg-gray-50 border-2 border-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl">
                <h2 className="font-black text-2xl mb-6 flex items-center gap-3 text-[#041f41]">
                  <div className="bg-blue-600 text-white p-2 rounded-xl"><Smartphone size={24} /></div>
                  Shipping Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="name" value={formData.name} placeholder="Full Name *" onChange={handleChange} className="p-4 bg-white border border-gray-100 rounded-2xl outline-none" />
                  <input name="phone" value={formData.phone} placeholder="WhatsApp Number *" onChange={handleChange} className="p-4 bg-white border border-gray-100 rounded-2xl outline-none" />
                  <input name="houseNo" value={formData.houseNo} placeholder="House / Flat No *" onChange={handleChange} className="sm:col-span-2 p-4 bg-white border border-gray-100 rounded-2xl outline-none" />
                  <input name="area" value={formData.area} placeholder="Area / Road Name *" onChange={handleChange} className="sm:col-span-2 p-4 bg-white border border-gray-100 rounded-2xl outline-none" />
                  <input name="city" value={formData.city} placeholder="City" onChange={handleChange} className="p-4 bg-white border border-gray-100 rounded-2xl outline-none" />
                  <input name="pincode" value={formData.pincode} placeholder="Pincode *" onChange={handleChange} className="p-4 bg-white border border-gray-100 rounded-2xl outline-none" />
                </div>

                {/* WHATSAPP CONFIRM BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (!isValid) return alert("Sahi address bhariye.");
                    
                    const message = `*🚀 NEW ORDER ALERT!*
------------------------------
*Customer:* ${formData.name}
*Phone:* ${formData.phone}
*Address:* ${formData.houseNo}, ${formData.area}, ${formData.city} - ${formData.pincode}

*Product Details:*
- *Item:* ${product.name}
- *Size:* ${selectedSize}
- *Price:* ₹${product.price}
- *Qty:* 1

*Payment:* COD (WhatsApp Order)`;

                    // Open WhatsApp first for better UX
                    window.open(`https://wa.me/${myWhatsApp}?text=${encodeURIComponent(message)}`, "_blank");

                    // Save to DB in background
                    await saveOrder("WHATSAPP");
                    setOrderStatus("success");
                  }}
                  className="w-full mt-8 bg-[#25d366] text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-lg"
                >
                  <MessageCircle size={24} /> Confirm on WhatsApp
                </motion.button>

                {/* ONLINE PAYMENT BUTTON */}
                <button
                  onClick={() => {
                    if (!isValid) return alert("Pehle address bhariye.");
                    const options = {
                      key: "rzp_live_S5jkUVvVI8UcY2",
                      amount: product.price * 100,
                      currency: "INR",
                      name: "BOOTY BLOOM",
                      handler: async (res) => {
                        await saveOrder("ONLINE", res.razorpay_payment_id);
                        setOrderStatus("success");
                      },
                      prefill: { name: formData.name, contact: formData.phone }
                    };
                    new window.Razorpay(options).open();
                  }}
                  className="w-full mt-4 bg-blue-600 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg"
                >
                  <CreditCard size={24} /> Pay Securely Online
                </button>
              </div>

              {/* TRUST CARD */}
              <div className="bg-white border-2 border-blue-50 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Award size={80} className="text-blue-900" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-orange-400">
                    <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                  </div>
                  <span className="text-sm font-bold text-gray-500">(15,400+ Happy Customers)</span>
                </div>
                <h3 className="text-xl font-black text-[#041f41] mb-4 italic uppercase">Why Trust Us?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-blue-700" />
                    <p className="text-sm font-bold text-gray-700">Medical-Grade Fabric: <span className="font-normal">Soft & Skin friendly.</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Sparkles size={18} className="text-pink-600" />
                    <p className="text-sm font-bold text-gray-700">Instant BBL Effect: <span className="font-normal">Get perfect curves in seconds.</span></p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}