"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, MessageCircle, QrCode } from "lucide-react";

export default function Checkout() {
  /* ---------------- SAFE CART CONTEXT ---------------- */
  const { cartItems = [] } = useCart();

  /* ---------------- MOUNT FIX ---------------- */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------------- PRODUCT & CONTACT ---------------- */
  const product = cartItems.length > 0 ? cartItems[0] : { name: "Butt Lifter Shaper", price: 1179 };
  const totalPayable = product.price;
  
  // ⭐ BUSINESS WHATSAPP NUMBER
  const myWhatsApp = "919217521109"; 

  /* ---------------- FORM STATE ---------------- */
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    houseNo: "",
    area: "",
    city: "",
    pincode: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const isValid = formData.name && formData.phone && formData.houseNo && formData.area && formData.pincode;

  /* ---------------- LOAD RAZORPAY SCRIPT ---------------- */
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  /* ---------------- WHATSAPP MESSAGE LOGIC ---------------- */
  const triggerWhatsAppMessage = (statusType = "SCAN & PAY", orderId = "NEW") => {
    const msg = `*🚀 NEW ORDER - BOOTY BLOOM*%0A%0A*Order ID:* #${orderId}%0A*Status:* ${statusType}%0A*Product:* ${product.name}%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A%0A*Address:*%0A${formData.houseNo}, ${formData.area}%0A${formData.city} - ${formData.pincode}%0A%0A*Total Amount:* ₹${totalPayable}`;
    
    window.open(`https://wa.me/${myWhatsApp}?text=${msg}`, "_blank");
  };

  const handleWhatsAppOrder = () => {
    if (!isValid) return alert("Please fill complete address details first!");
    triggerWhatsAppMessage("RECEIPT ATTACHED (QR)");
  };

  /* ---------------- RAZORPAY PAYMENT ---------------- */
  const handlePayment = async () => {
    if (!isValid) return alert("Please fill complete address details!");

    try {
      // 1. Order ID create karein backend se
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPayable }),
      });

      const orderData = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: totalPayable * 100,
        currency: "INR",
        name: "BOOTY BLOOM",
        order_id: orderData.order.id,
        handler: async (response) => {
          // 2. Success ke baad database mein save karein
          const saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify-and-save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerData: formData,  // Yeh backend ke customerData key se match hona chahiye
              paymentId: response.razorpay_payment_id,
              amount: totalPayable,
              items: [product],
              paymentType: "Online Paid" 
            }),
          });

          const savedData = await saveRes.json();
          // Database ki _id ya Razorpay ID nikalna
          const shortId = savedData.order?._id || response.razorpay_payment_id;

          // 3. Auto WhatsApp Alert
          triggerWhatsAppMessage("PAID ONLINE (RAZORPAY)", shortId.toString().slice(-6).toUpperCase());
          
          // ⭐ REDIRECT TO SUCCESS PAGE
          window.location.href = `/success?id=${shortId}`;
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: { color: "#041f41" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Payment Error: Make sure your backend server is running!");
    }
  };

  if (!mounted) return null;

  return (
    <section className="min-h-screen bg-[#f1f3f6] py-6 sm:py-10 px-3 sm:px-4 font-sans text-black">
      <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row gap-6">

        {/* LEFT SECTION - FORM */}
        <div className="lg:w-2/3 space-y-5">
          <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
            <h2 className="text-gray-600 font-black uppercase text-sm mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="name" value={formData.name} placeholder="Full Name *" onChange={handleChange} className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              <input name="phone" value={formData.phone} placeholder="WhatsApp Number *" onChange={handleChange} className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              <input name="houseNo" value={formData.houseNo} placeholder="House / Flat No *" onChange={handleChange} className="border p-3 rounded-lg sm:col-span-2 outline-none focus:ring-2 focus:ring-blue-500" required />
              <input name="area" value={formData.area} placeholder="Area / Landmark *" onChange={handleChange} className="border p-3 rounded-lg sm:col-span-2 outline-none focus:ring-2 focus:ring-blue-500" required />
              <input name="city" value={formData.city} placeholder="City" onChange={handleChange} className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              <input name="pincode" value={formData.pincode} placeholder="Pincode *" onChange={handleChange} className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          {/* SCAN & PAY OPTION */}
          <div className="bg-[#041f41] text-white p-5 rounded-xl border-l-4 border-yellow-400">
            <h3 className="font-bold uppercase text-sm flex items-center gap-2 mb-4">
              <QrCode size={18} className="text-yellow-400" /> Direct Scan & Pay
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="bg-white p-2 rounded-lg">
                <img src="/image/page_1.png" alt="QR Code" className="w-28 h-28" />
              </div>
              <div className="text-sm space-y-2 text-center sm:text-left">
                <p className="font-bold text-lg text-white">AXIS MEDIA</p>
                <p>UPI ID: <span className="text-yellow-400 font-mono font-bold">AXISMEDIA465@iob</span></p>
                <button
                  onClick={handleWhatsAppOrder}
                  className="bg-[#25D366] px-4 py-3 rounded-lg font-bold flex items-center gap-2 w-full justify-center hover:bg-green-600 transition-all text-white"
                >
                  <MessageCircle size={18} /> Send Receipt on WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* MAIN RAZORPAY BUTTON */}
          <button
            onClick={handlePayment}
            className="w-full bg-[#fb641b] text-white py-4 rounded-xl font-black uppercase shadow-lg hover:bg-orange-600 transition-transform active:scale-95"
          >
            Pay Online (Secure Razorpay)
          </button>
        </div>

        {/* RIGHT SECTION - PRICE DETAILS */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm p-5 lg:sticky lg:top-24">
            <h3 className="font-black uppercase text-sm border-b pb-2 text-gray-500">Price Details</h3>
            <div className="py-4 space-y-3">
              <div className="flex justify-between font-medium">
                <span>Price (1 Item)</span>
                <span>₹{totalPayable}</span>
              </div>
              <div className="flex justify-between text-green-600 font-medium">
                <span>Delivery Charges</span>
                <span className="uppercase font-bold">Free</span>
              </div>
              <div className="flex justify-between text-xl font-black border-t pt-3">
                <span>Total Amount</span>
                <span className="text-blue-600">₹{totalPayable}</span>
              </div>
            </div>
            <div className="text-[11px] bg-blue-50 text-blue-700 p-2 rounded font-bold mb-4">
              ✨ Only Online Payments accepted for faster delivery!
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-500" /> 100% Secure Transaction
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}