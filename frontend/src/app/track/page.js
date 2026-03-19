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
    <div className="min-h-screen pb-20" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <div className="px-4 py-10 text-center" style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid var(--color-border)" }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="heading-section"
          style={{ fontSize: "clamp(28px, 3vw, 40px)" }}
        >
          Track Your Order
        </motion.h1>
        <p className="text-muted-sm" style={{ fontSize: 14, marginTop: 10 }}>
          Discreet packaging • Fast updates • Easy tracking
        </p>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-10">
        {/* Modern Search Box */}
        <form onSubmit={handleTrack} className="relative mb-12">
          <div className="card-imkaa relative flex items-center overflow-hidden" style={{ padding: 0 }}>
            <div className="pl-6" style={{ color: "var(--color-muted)" }}><Phone size={20} /></div>
            <input
              type="tel"
              placeholder="Enter Registered Mobile Number..."
              className="w-full p-5 pl-4 outline-none"
              style={{ fontSize: 16, fontWeight: 600, color: "var(--color-heading)", background: "transparent" }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary-imkaa"
              style={{ height: 50, borderRadius: 0 }}
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-4 p-3 rounded-xl border"
              style={{
                color: "var(--color-primary)",
                background: "rgba(252,239,234,0.9)",
                borderColor: "var(--color-border)",
                fontWeight: 600,
              }}
            >
              {error}
            </motion.div>
          )}

          {orderData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Status & Timeline Card */}
              <div className="card-imkaa" style={{ padding: 24 }}>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <p className="text-muted-sm" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Current Status</p>
                    <h2 className="heading-section" style={{ textAlign: "left", fontSize: "clamp(22px, 2.2vw, 28px)" }}>
                      {orderData.status || "Order Received"}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-xs uppercase" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                      <CreditCard size={14} /> {orderData.paymentType === "Online Paid" ? "Paid Online" : "COD / Pending"}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-sm" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Order ID</p>
                    <p style={{ fontWeight: 700, color: "var(--color-primary)" }}>
                      #{orderData._id?.slice(-8).toUpperCase() || "NEW"}
                    </p>
                  </div>
                </div>

                {/* Tracking Timeline Visual */}
                <div className="relative flex justify-between px-2">
                  {/* Confirmed */}
                  <div className="flex flex-col items-center z-10">
                    <div className="w-10 h-10 rounded-full text-white flex items-center justify-center border-4 shadow-md" style={{ background: "var(--color-primary)", borderColor: "var(--color-card)" }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="text-muted-sm" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 8 }}>Confirmed</span>
                  </div>
                  
                  {/* Shipped */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-4 shadow-md ${orderData.trackingId || orderData.status === "Shipped" || orderData.status === "Delivered" ? 'text-white' : ''}`}
                      style={{
                        background: orderData.trackingId || orderData.status === "Shipped" || orderData.status === "Delivered" ? "var(--color-primary)" : "var(--color-bg-alt)",
                        color: orderData.trackingId || orderData.status === "Shipped" || orderData.status === "Delivered" ? "#FFF9FA" : "var(--color-muted)",
                        borderColor: "var(--color-card)",
                      }}
                    >
                      <Truck size={20} />
                    </div>
                    <span className="text-muted-sm" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 8 }}>Shipped</span>
                  </div>

                  {/* Delivered */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-4 shadow-md ${orderData.status === "Delivered" ? 'text-white' : ''}`}
                      style={{
                        background: orderData.status === "Delivered" ? "var(--color-primary)" : "var(--color-bg-alt)",
                        color: orderData.status === "Delivered" ? "#FFF9FA" : "var(--color-muted)",
                        borderColor: "var(--color-card)",
                      }}
                    >
                      <Package size={20} />
                    </div>
                    <span className="text-muted-sm" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", marginTop: 8 }}>Delivered</span>
                  </div>

                  {/* Progress Line */}
                  <div className="absolute top-5 left-0 w-full h-1 -z-0" style={{ background: "rgba(234,215,221,0.75)" }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: orderData.status === "Delivered" ? "100%" : (orderData.trackingId || orderData.status === "Shipped") ? "50%" : "5%" }}
                      className="h-full"
                      style={{ background: "var(--color-primary)" }}
                    />
                  </div>
                </div>

                {orderData.trackingId && (
                  <div className="mt-8 p-4 rounded-2xl flex items-center justify-between border" style={{ background: "var(--color-bg-alt)", borderColor: "var(--color-border)" }}>
                    <div>
                      <span className="text-muted-sm" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Courier Tracking ID</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-heading)", letterSpacing: "0.08em" }}>{orderData.trackingId}</span>
                    </div>
                    <a 
                      href={`https://www.delhivery.com/track/package/${orderData.trackingId}`} 
                      target="_blank" 
                      className="btn-secondary-imkaa"
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
                    <Package size={14} style={{ color: "var(--color-primary)" }} /> Items Ordered
                  </h3>
                  {orderData.items?.map((item, i) => (
                    <div key={i} className="flex gap-4 mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-0 border-gray-50">
                      <div className="w-16 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Package size={24} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="title-product" style={{ fontSize: 14 }}>{item.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Size: {item.size} | Qty: {item.quantity || 1}</p>
                        <p className="price-text" style={{ fontSize: 14, marginTop: 6 }}>₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* User Info */}
                <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-50">
                  <h3 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                    <MapPin size={14} style={{ color: "var(--color-primary)" }} /> Shipping Details
                  </h3>
                  <p className="title-product" style={{ fontSize: 14 }}>{orderData.customerData?.name || orderData.userInfo?.name}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-2 italic">
                    {orderData.customerData?.address || orderData.userInfo?.address}
                  </p>
                  <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                    <Phone size={14} /> {orderData.customerData?.phone || orderData.userInfo?.phone}
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Link href="/" className="inline-flex items-center gap-2 text-muted-sm" style={{ fontWeight: 700, textTransform: "uppercase" }}>
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