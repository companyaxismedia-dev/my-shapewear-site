"use client";
import React, { useState } from "react";
import { Search, Package, Truck, MapPin, Phone, ArrowLeft, CheckCircle2, Clock, ShieldCheck, CreditCard } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function TrackOrder() {
  const [phone, setPhone] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update this to your live domain
  const API_BASE_URL = "https://www.bootybloom.online/api/orders";

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError("");
    setOrderData(null);

    try {
      // Live server se phone number ke basis par order fetch karna
      const res = await fetch(`${API_BASE_URL}/track?phone=${phone}`);
      const data = await res.json();

      if (data.success && data.order) {
        setOrderData(data.order);
      } else {
        setError("Order nahi mila! Kripya registered mobile number check karein.");
      }
    } catch (err) {
      console.error("Tracking error:", err);
      setError("Server connection fail ho gaya. Kripya baad mein koshish karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 font-sans">
      {/* Header */}
      <div className="bg-white border-b px-4 py-10 text-center shadow-sm">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-black uppercase italic text-[#041f41] tracking-tighter"
        >
          Track Your Happiness
        </motion.h1>
        <p className="text-gray-400 text-sm mt-2 font-bold uppercase tracking-[0.2em]">Booty Bloom Premium Delivery</p>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-10">
        {/* Modern Search Box */}
        <form onSubmit={handleTrack} className="relative mb-12 group">
          <div className="relative flex items-center bg-white rounded-2xl shadow-xl border-2 border-white overflow-hidden">
            <div className="pl-6 text-gray-400"><Phone size={22} /></div>
            <input
              type="tel"
              placeholder="Enter Registered Mobile Number..."
              className="w-full p-5 pl-4 outline-none text-lg font-bold text-[#041f41]"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#041f41] text-white px-8 py-5 font-black uppercase text-sm hover:bg-pink-600 transition-all flex items-center gap-2 disabled:bg-gray-400"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-red-500 font-bold mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
              {error}
            </motion.div>
          )}

          {orderData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Status & Timeline Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-50">
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Status</p>
                    <h2 className="text-2xl font-black text-[#041f41] uppercase italic">
                      {orderData.status || "Order Received"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-green-600 font-bold text-xs uppercase">
                      <CreditCard size={14} /> {orderData.paymentType === "Online Paid" ? "Paid Online" : "COD / Pending"}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase">Order ID</p>
                    <p className="font-bold text-blue-600 uppercase">
                      #{orderData._id?.slice(-8).toUpperCase() || "NEW"}
                    </p>
                  </div>
                </div>

                {/* Tracking Timeline Visual */}
                <div className="relative flex justify-between px-2">
                  {/* Confirmed */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center border-4 border-white shadow-md">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-[9px] font-black mt-2 uppercase">Confirmed</span>
                  </div>
                  
                  {/* Shipped */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md ${orderData.trackingId || orderData.status === "Shipped" || orderData.status === "Delivered" ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Truck size={20} />
                    </div>
                    <span className="text-[9px] font-black mt-2 uppercase">Shipped</span>
                  </div>

                  {/* Delivered */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md ${orderData.status === "Delivered" ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Package size={20} />
                    </div>
                    <span className="text-[9px] font-black mt-2 uppercase">Delivered</span>
                  </div>

                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: orderData.status === "Delivered" ? "100%" : (orderData.trackingId || orderData.status === "Shipped") ? "50%" : "5%" }}
                      className="h-full bg-green-500" 
                    />
                  </div>
                </div>

                {orderData.trackingId && (
                  <div className="mt-8 bg-blue-50 p-4 rounded-2xl flex items-center justify-between border border-blue-100">
                    <div>
                      <span className="text-[10px] font-black text-blue-400 uppercase block">Courier Tracking ID</span>
                      <span className="text-sm font-black text-blue-900 uppercase tracking-wider">{orderData.trackingId}</span>
                    </div>
                    <a 
                      href={`https://www.delhivery.com/track/package/${orderData.trackingId}`} 
                      target="_blank" 
                      className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase shadow-md"
                    >
                      Track Live
                    </a>
                  </div>
                )}
              </div>

              {/* Products & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Items */}
                <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-50">
                  <h3 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                    <Package size={14} className="text-pink-500" /> Items Ordered
                  </h3>
                  {orderData.items?.map((item, i) => (
                    <div key={i} className="flex gap-4 mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-0 border-gray-50">
                      <div className="w-16 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Package size={24} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="font-bold text-[#041f41] text-sm leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Size: {item.size} | Qty: {item.quantity || 1}</p>
                        <p className="text-pink-600 font-black mt-1">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* User Info */}
                <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-50">
                  <h3 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                    <MapPin size={14} className="text-red-500" /> Shipping Details
                  </h3>
                  <p className="font-black text-[#041f41] text-sm uppercase">{orderData.customerData?.name || orderData.userInfo?.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-2 italic">
                    {orderData.customerData?.address || orderData.userInfo?.address}
                  </p>
                  <div className="mt-4 pt-4 border-t flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <Phone size={14} /> {orderData.customerData?.phone || orderData.userInfo?.phone}
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 font-bold text-xs uppercase hover:text-pink-500 transition">
                  <ArrowLeft size={14} /> Back to Store
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}