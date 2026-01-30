"use client";
import React, { useEffect, useState } from "react";
import { ExternalLink, Truck, MapPin, Phone, Search, Package, X, Printer, Eye, Loader2 } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [trackingInput, setTrackingInput] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐ API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`);
      const data = await res.json();
      const finalOrders = Array.isArray(data) ? data : (data.orders || []);
      setOrders(finalOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const cleanSearch = searchTerm.trim();
    const found = orders.find(o => 
      (o.userInfo?.phone === cleanSearch) || 
      (o.customerData?.phone === cleanSearch) || 
      o._id === cleanSearch ||
      o._id.toString().slice(-6) === cleanSearch // Last 6 digits search
    );
    
    if (found) {
      setSearchResult(found);
    } else {
      alert("Order nahi mila. Kripya sahi ID ya Phone number dalein.");
    }
  };

  const updateTracking = async (orderId) => {
    const trackingId = trackingInput[orderId];
    if (!trackingId) return alert("Tracking ID bharna zaroori hai");

    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingId, status: "Shipped" }),
      });

      const data = await res.json();
      if (data.success) {
        alert("🚀 Order Shipped Mark Ho Gaya!");
        fetchOrders(); 
        setSearchResult(null);
        setTrackingInput(prev => {
          const newState = {...prev};
          delete newState[orderId];
          return newState;
        });
      }
    } catch (err) {
      alert("Backend connection failed!");
    }
  };

  const formatAddress = (order) => {
    const data = order.userInfo || order.customerData;
    if (typeof data?.address === 'string' && data.address !== "N/A") return data.address;
    return `${data?.address || ''} ${data?.city || ''} ${data?.pincode || ''}`.trim();
  };

  const handlePrint = (order) => {
    const cust = order.userInfo || order.customerData;
    const prod = (order.products || order.items)?.[0];
    const printWindow = window.open('', '_blank', 'width=500,height=700');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label - Booty Bloom</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 10px; }
            .label { border: 3px solid #000; padding: 20px; max-width: 400px; margin: auto; }
            .header { border-bottom: 2px solid #000; display: flex; justify-content: space-between; padding-bottom: 10px; }
            .brand { font-size: 24px; font-weight: 900; font-style: italic; color: #ed4e7e; }
            .to-box { margin-top: 20px; }
            .to-label { background: #000; color: #fff; padding: 2px 10px; font-size: 12px; font-weight: bold; }
            .name { font-size: 20px; font-weight: bold; margin: 10px 0; text-transform: uppercase; }
            .address { font-size: 15px; line-height: 1.4; margin-bottom: 15px; }
            .phone { font-size: 18px; font-weight: 900; border: 2px dashed #000; padding: 10px; text-align: center; }
            .footer { margin-top: 20px; font-size: 10px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">
              <div class="brand">BOOTY BLOOM</div>
              <div style="text-align:right font-weight:bold;">${order.paymentType?.toUpperCase() || 'PREPAID'}</div>
            </div>
            <div class="to-box">
              <span class="to-label">SHIP TO:</span>
              <div class="name">${cust?.name || 'Customer'}</div>
              <div class="address">${formatAddress(order)}</div>
              <div class="phone">📞 PHONE: ${cust?.phone || 'N/A'}</div>
            </div>
            <div style="margin-top:15px; font-size:12px;"><b>ITEM:</b> ${prod?.name || 'Lingerie Set'} (${prod?.size || 'Free'})</div>
            <div class="footer">Order ID: #${order._id.toString().slice(-10)} <br/> Thank you for shopping!</div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen text-gray-900 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-[#041f41] tracking-tighter">Orders Dashboard</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Manage Shipping & Logistics</p>
        </div>

        <form onSubmit={handleQuickSearch} className="relative w-full md:w-96 group">
          <input 
            type="text" 
            placeholder="Search Phone or Order ID..." 
            className="w-full p-4 pl-12 rounded-2xl border-2 border-transparent bg-white shadow-xl focus:border-[#ed4e7e] outline-none transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-4 top-4 text-gray-300 group-focus-within:text-[#ed4e7e] transition-colors" size={20} />
          <button type="submit" className="absolute right-2 top-2 bg-[#041f41] text-white px-4 py-2 rounded-xl text-xs font-black uppercase">Find</button>
        </form>
      </div>

      {/* SEARCH RESULT OVERLAY */}
      {searchResult && (
        <div className="mb-10 bg-[#041f41] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border-4 border-[#ed4e7e]/20">
          <button onClick={() => setSearchResult(null)} className="absolute right-6 top-6 bg-white/10 p-2 rounded-full hover:bg-[#ed4e7e] transition-colors">
            <X size={24} />
          </button>
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#ed4e7e] p-3 rounded-2xl shadow-lg shadow-pink-500/40">
              <Package size={28} />
            </div>
            <h2 className="font-black uppercase italic text-2xl tracking-tight">Found Order</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-[#ed4e7e] text-[10px] font-black uppercase mb-2">Customer Details</p>
              <p className="font-bold text-xl uppercase">{(searchResult.userInfo || searchResult.customerData)?.name}</p>
              <p className="text-gray-400 font-bold">{(searchResult.userInfo || searchResult.customerData)?.phone}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl">
              <p className="text-[#ed4e7e] text-[10px] font-black uppercase mb-2">Product Info</p>
              <p className="font-bold">{(searchResult.products || searchResult.items)?.[0]?.name}</p>
              <p className="text-gray-400 font-bold text-sm italic">Size: {(searchResult.products || searchResult.items)?.[0]?.size || 'Free'}</p>
            </div>
            <div className="flex flex-col justify-center gap-3">
               <button onClick={() => handlePrint(searchResult)} className="w-full flex items-center justify-center gap-3 bg-white text-[#041f41] py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform">
                 <Printer size={20} /> Print Shipping Label
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS LIST (TABLE) */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#041f41] text-white">
                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Order Details</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Delivery Address</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Status & Payment</th>
                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Logistics</th>
                <th className="p-6 text-center font-black uppercase text-[10px] tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#ed4e7e]" size={40} />
                    <p className="mt-4 font-black text-gray-400 uppercase text-xs">Loading Orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center font-black text-gray-300 uppercase">No orders placed yet.</td></tr>
              ) : orders.map((order) => {
                const cust = order.userInfo || order.customerData;
                const prod = (order.products || order.items)?.[0];
                return (
                  <tr key={order._id} className="hover:bg-pink-50/30 transition-colors group">
                    <td className="p-6">
                      <p className="font-black text-gray-900 uppercase text-sm">{cust?.name || 'Guest'}</p>
                      <a href={`https://wa.me/91${cust?.phone}`} target="_blank" className="flex items-center gap-1 text-green-600 font-bold mt-1 text-xs hover:underline">
                        <Phone size={12} /> {cust?.phone}
                      </a>
                    </td>
                    <td className="p-6 max-w-[250px]">
                      <p className="text-gray-500 text-xs font-bold leading-relaxed line-clamp-2">
                        {formatAddress(order)}
                      </p>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-[#041f41] text-lg">₹{order.totalAmount || order.amount}</p>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${order.paymentType === 'Online' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                        {order.paymentType || 'COD'}
                      </span>
                    </td>
                    <td className="p-6">
                      {order.trackingId ? (
                        <div className="inline-flex items-center gap-2 text-white bg-green-500 px-4 py-2 rounded-full font-black text-[10px] uppercase">
                          <Truck size={14} /> {order.trackingId}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            placeholder="Awb Number"
                            className="bg-gray-100 p-2 rounded-xl text-[11px] font-bold w-28 outline-none focus:bg-white border-2 border-transparent focus:border-[#ed4e7e]"
                            value={trackingInput[order._id] || ""}
                            onChange={(e) => setTrackingInput({...trackingInput, [order._id]: e.target.value})}
                          />
                          <button onClick={() => updateTracking(order._id)} className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#ed4e7e]">Ship</button>
                        </div>
                      )}
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => handlePrint(order)}
                        className="p-3 bg-gray-100 text-gray-400 rounded-2xl hover:bg-[#ed4e7e] hover:text-white transition-all shadow-sm"
                      >
                        <Printer size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}