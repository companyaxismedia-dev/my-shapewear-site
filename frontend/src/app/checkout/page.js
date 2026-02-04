"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { 
  QrCode, ShieldCheck, MessageCircle, ArrowLeft, 
  Loader2, ShoppingBag, Truck, CreditCard 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("COD"); // Default COD
  
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    address: "", 
    city: "", 
    pincode: "",
    email: "" 
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData({ ...formData, [name]: value.replace(/\D/g, "").slice(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePlaceOrder = async () => {
    // 1. Validation
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      return alert("Kripya saari details bhariye!");
    }
    if (formData.phone.length !== 10) {
      return alert("Sahi WhatsApp number daalein!");
    }

    setLoading(true);

    try {
      const totalAmount = cartTotal();
      
      // 2. Prepare Data for Backend
      const orderPayload = {
        email: formData.email || `${formData.phone}@bootybloom.com`,
        customerData: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city
        },
        items: cart,
        amount: totalAmount,
        paymentType: paymentMode
      };

      // 3. API Call to Save Order (OTP bypass for direct checkout)
      // Note: Hum direct save kar rahe hain kyunki ye final checkout step hai
      const response = await fetch("http://localhost:5000/api/orders/verify-and-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderPayload, otp: "DIRECT" }) // Backend pe 'DIRECT' bypass logic add kar sakte hain
      });

      const result = await response.json();

      if (result.success) {
        // 4. Create WhatsApp Message
        const itemsText = cart.map(i => `• ${i.name} (${i.size}) x ${i.qty}`).join("%0A");
        const msg = `*🚀 NEW ORDER - BOOTY BLOOM*%0A` +
                    `--------------------------%0A` +
                    `*Order ID:* ${result.orderId.slice(-6).toUpperCase()}%0A` +
                    `*Customer:* ${formData.name}%0A` +
                    `*Method:* ${paymentMode}%0A%0A` +
                    `*Items:*%0A${itemsText}%0A%0A` +
                    `*Total:* ₹${totalAmount.toFixed(2)}%0A` +
                    `*Address:* ${formData.address}, ${formData.city}%0A` +
                    `--------------------------%0A` +
                    `_Please confirm my order._`;

        // 5. Final Step: WhatsApp redirect & Success page
        window.open(`https://wa.me/919217521109?text=${msg}`, "_blank");
        clearCart();
        router.push(`/success?id=${result.orderId}`);
      } else {
        alert("Order save nahi ho paya. Dobara koshish karein.");
      }
    } catch (error) {
      console.error("Order Error:", error);
      alert("Server error! Backend check karein.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#ed4e7e] text-white p-6 text-center">
        <ShoppingBag size={80} className="mb-6 opacity-30" />
        <h2 className="text-3xl font-black uppercase italic">Bag is Empty!</h2>
        <Link href="/" className="mt-8 bg-white text-[#ed4e7e] px-10 py-4 rounded-full font-black uppercase">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#ed4e7e] min-h-screen pb-20 text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link href="/cart" className="inline-flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] mb-10 border-b-2 border-white/20 pb-1">
          <ArrowLeft size={14} /> Back to Cart
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT: FORM */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="bg-white p-8 md:p-12 rounded-[3rem] text-gray-900 shadow-2xl">
              <h2 className="text-3xl font-black uppercase italic mb-8">Delivery Details</h2>
              
              <div className="space-y-4">
                <input name="name" placeholder="FULL NAME" onChange={handleInput} className="w-full p-4 border-b-2 border-gray-100 focus:border-[#ed4e7e] outline-none font-bold uppercase" />
                <input name="phone" placeholder="WHATSAPP NUMBER" onChange={handleInput} maxLength="10" className="w-full p-4 border-b-2 border-gray-100 focus:border-[#ed4e7e] outline-none font-bold" />
                <input name="email" placeholder="EMAIL ADDRESS (OPTIONAL)" onChange={handleInput} className="w-full p-4 border-b-2 border-gray-100 focus:border-[#ed4e7e] outline-none font-bold" />
                <textarea name="address" placeholder="COMPLETE ADDRESS" onChange={handleInput} className="w-full p-4 border-b-2 border-gray-100 focus:border-[#ed4e7e] outline-none font-bold h-24 resize-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="city" placeholder="CITY" onChange={handleInput} className="w-full p-4 border-b-2 border-gray-100 focus:border-[#ed4e7e] outline-none font-bold uppercase" />
                  <input name="pincode" placeholder="PINCODE" onChange={handleInput} maxLength="6" className="w-full p-4 border-b-2 border-gray-100 focus:border-[#ed4e7e] outline-none font-bold" />
                </div>
              </div>

              {/* Payment Selection */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button onClick={() => setPaymentMode("COD")} className={`p-4 rounded-2xl border-2 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all ${paymentMode === "COD" ? "border-[#ed4e7e] bg-[#ed4e7e]/5 text-[#ed4e7e]" : "border-gray-100 text-gray-400"}`}>
                  <Truck size={18} /> Cash On Delivery
                </button>
                <button onClick={() => setPaymentMode("Online")} className={`p-4 rounded-2xl border-2 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all ${paymentMode === "Online" ? "border-[#ed4e7e] bg-[#ed4e7e]/5 text-[#ed4e7e]" : "border-gray-100 text-gray-400"}`}>
                  <CreditCard size={18} /> Pay Online
                </button>
              </div>

              <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-[#25D366] text-white py-6 rounded-full font-black uppercase mt-10 shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" /> : <><MessageCircle size={20} /> Place Order via WhatsApp</>}
              </button>
            </div>
          </motion.div>

          {/* RIGHT: SUMMARY */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-[3rem]">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-60">Total Amount</p>
              <h3 className="text-6xl font-black italic tracking-tighter">₹{cartTotal().toFixed(2)}</h3>
              <p className="text-xs font-bold mt-4 text-green-300">✓ FREE SHIPPING APPLIED</p>
            </div>

            <div className="bg-white p-8 rounded-[3rem] text-gray-900 shadow-xl">
              <h4 className="font-black uppercase text-[#ed4e7e] text-[10px] tracking-widest mb-6">Order Summary</h4>
              <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar">
                {cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-4">
                      <img src={item.img} className="w-12 h-16 object-cover rounded-lg" alt={item.name} />
                      <div>
                        <p className="font-black text-xs uppercase">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400">Qty: {item.qty} | Size: {item.size}</p>
                      </div>
                    </div>
                    <p className="font-black italic">₹{item.offerPrice}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                <ShieldCheck className="text-green-500" />
                <p className="text-[10px] font-black uppercase text-gray-500">Secure Checkout & 100% Original Products</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}