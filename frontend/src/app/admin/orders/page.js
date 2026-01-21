"use client";
import React, { useEffect, useState } from "react";
import { ExternalLink, Truck, MapPin, Phone, Search, Package, X, Printer, Eye } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [trackingInput, setTrackingInput] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ⭐ API Base URL (Localhost fix)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    fetch(`${API_BASE}/api/orders`)
      .then(res => res.json())
      .then(data => {
        // Handle both array and object responses
        const finalOrders = Array.isArray(data) ? data : (data.orders || []);
        setOrders(finalOrders);
      })
      .catch(err => console.error("Error fetching orders:", err));
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    // Case-insensitive search for phone or ID
    const found = orders.find(o => 
      (o.customerData?.phone === searchTerm || o.userInfo?.phone === searchTerm) || 
      o._id === searchTerm
    );
    
    if (found) {
      setSearchResult(found);
    } else {
      alert("No order found with this Number/ID");
    }
  };

  const updateTracking = async (orderId) => {
    const trackingId = trackingInput[orderId];
    if (!trackingId) return alert("Please enter a tracking ID");

    try {
      // Backend controller ke updateOrderTracking function ko call karega
      const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          trackingId: trackingId, 
          status: "Shipped" // Jaise hi tracking ID dalegi, status 'Shipped' ho jayega
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("🚀 Order Marked as Shipped!");
        fetchOrders(); // List refresh karein
        setSearchResult(null); // Search result clear karein
        // Input field clear karein
        setTrackingInput(prev => {
          const newState = {...prev};
          delete newState[orderId];
          return newState;
        });
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Backend connection failed!");
    }
  };

  // ⭐ Helper function to format address correctly
  const formatAddress = (order) => {
    const data = order.customerData || order.userInfo;
    if (typeof data?.address === 'string' && data.address !== "N/A") return data.address;
    return `${data?.houseNo || ''} ${data?.area || ''} ${data?.city || ''} ${data?.pincode || ''}`.trim();
  };

  const handlePrint = (order) => {
    const cust = order.customerData || order.userInfo;
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Shipping Label</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; }
            .label-card { border: 2px solid #000; padding: 20px; width: 380px; margin: auto; }
            .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
            .from { font-size: 10px; color: #555; margin-bottom: 15px; }
            .to-title { font-weight: bold; text-transform: uppercase; font-size: 14px; background: #000; color: #fff; padding: 4px 8px; display: inline-block; }
            .customer-name { font-size: 22px; font-weight: 900; margin: 10px 0 5px 0; }
            .address { font-size: 14px; line-height: 1.4; margin-bottom: 10px; }
            .phone { font-size: 18px; font-weight: bold; border-top: 1px dashed #ccc; padding-top: 10px; }
            .product-tag { font-size: 11px; margin-top: 15px; font-style: italic; color: #444; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">
               <span style="font-weight:900; font-style:italic;">BOOTY BLOOM</span>
               <span style="font-size:10px;">${order.paymentType || 'PREPAID'}</span>
            </div>
            <div class="from">SENDER: Booty Bloom Online Store, India</div>
            <div class="to-title">SHIP TO:</div>
            <div class="customer-name">${cust?.name || 'N/A'}</div>
            <div class="address">${formatAddress(order)}</div>
            <div class="phone">📞 ${cust?.phone || 'N/A'}</div>
            <div class="product-tag">Item: ${order.items?.[0]?.name || order.products?.[0]?.name}</div>
            <div style="margin-top:20px; text-align:center; font-size:10px; border-top:1px solid #eee; padding-top:10px;">
               Order ID: #${order._id.toString().slice(-8).toUpperCase()}
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen text-black">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-xl sm:text-2xl font-black uppercase italic text-[#041f41]">
          Store Management / Orders
        </h1>
        <form onSubmit={handleQuickSearch} className="relative w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search by Phone Number..." 
            className="w-full md:w-80 p-3 pl-10 rounded-xl border-2 border-white shadow-sm focus:border-blue-500 outline-none text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        </form>
      </div>

      {/* SEARCH RESULT SECTION */}
      {searchResult && (
        <div className="mb-10 bg-[#041f41] rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
          <button onClick={() => setSearchResult(null)} className="absolute right-4 top-4 bg-white/20 p-2 rounded-full hover:bg-white/40">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-4">
            <Package size={24} className="text-pink-500" />
            <h2 className="font-black uppercase italic tracking-wider text-lg">Quick View Result</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase mb-1">Customer</p>
              <p className="font-bold text-xl">{(searchResult.customerData || searchResult.userInfo)?.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase mb-1">Product</p>
              <p className="font-bold">{(searchResult.items || searchResult.products)?.[0]?.name}</p>
            </div>
            <div>
              <button onClick={() => handlePrint(searchResult)} className="flex items-center gap-2 bg-pink-600 px-4 py-2 rounded-lg font-black text-xs uppercase hover:bg-pink-700">
                <Printer size={16} /> Print Label
              </button>
            </div>
            <div className="flex items-center">
              {!searchResult.trackingId ? (
                <div className="flex gap-2 w-full">
                  <input 
                    placeholder="Enter Tracking" 
                    className="flex-1 p-2 rounded-lg text-black text-sm outline-none font-bold"
                    value={trackingInput[searchResult._id] || ""}
                    onChange={(e) => setTrackingInput({...trackingInput, [searchResult._id]: e.target.value})}
                  />
                  <button onClick={() => updateTracking(searchResult._id)} className="bg-white text-blue-900 px-4 py-2 rounded-lg font-black text-xs uppercase hover:bg-gray-200">Ship</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-400 font-bold italic">
                  <Truck size={20} /> Shipped: {searchResult.trackingId}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-[#041f41] text-white uppercase text-[10px] tracking-widest">
            <tr>
              <th className="p-5">Customer & Contact</th>
              <th className="p-5">Address</th>
              <th className="p-5">Product Info</th>
              <th className="p-5">Payment</th>
              <th className="p-5">Logistics</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {orders.length === 0 ? (
              <tr><td colSpan="6" className="p-10 text-center font-bold text-gray-400">No orders found.</td></tr>
            ) : orders.map((order, i) => {
              const cust = order.customerData || order.userInfo;
              const prod = (order.items || order.products)?.[0];
              return (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5">
                    <p className="font-black text-gray-800 text-base">{cust?.name || 'N/A'}</p>
                    <div className="flex items-center gap-1 text-blue-600 font-bold mt-1 text-xs">
                      <Phone size={12} />
                      <a href={`https://wa.me/${cust?.phone}`} target="_blank" className="hover:underline">
                        {cust?.phone}
                      </a>
                    </div>
                  </td>
                  <td className="p-5 max-w-[220px]">
                    <p className="text-gray-500 text-xs leading-relaxed font-medium">
                      {formatAddress(order)}
                    </p>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-gray-700 leading-tight">{prod?.name}</p>
                    <span className="inline-block mt-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-black text-gray-600 uppercase">
                      SIZE: {prod?.size || 'Free'}
                    </span>
                  </td>
                  <td className="p-5">
                    <p className="font-black text-blue-700 text-base">₹{order.amount || order.totalAmount}</p>
                    <p className="text-[9px] font-bold text-orange-500 uppercase tracking-tighter">● {order.paymentType || 'Online'}</p>
                  </td>
                  <td className="p-5">
                    {order.trackingId ? (
                      <div className="flex items-center gap-2 text-green-700 font-bold bg-green-50 px-3 py-2 rounded-xl border border-green-100 text-[11px]">
                        <Truck size={14} /> {order.trackingId}
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <input
                          placeholder="Tracking ID"
                          className="border bg-gray-50 p-2 rounded-lg text-[11px] w-28 focus:ring-1 focus:ring-blue-400 outline-none"
                          value={trackingInput[order._id] || ""}
                          onChange={(e) => setTrackingInput({...trackingInput, [order._id]: e.target.value})}
                        />
                        <button onClick={() => updateTracking(order._id)} className="bg-black text-white px-3 py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-pink-600">Ship</button>
                      </div>
                    )}
                  </td>
                  <td className="p-5 text-center">
                     <button 
                       onClick={() => handlePrint(order)}
                       className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-pink-100 hover:text-pink-600 transition-all"
                     >
                       <Printer size={18} />
                     </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {orders.map((order, i) => {
          const cust = order.customerData || order.userInfo;
          return (
            <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-lg text-[#041f41]">{cust?.name || 'N/A'}</p>
                    <p className="text-xs text-blue-600 font-bold">{cust?.phone}</p>
                  </div>
                  <button onClick={() => handlePrint(order)} className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                    <Printer size={20} />
                  </button>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl text-xs text-gray-600 italic">
                  {formatAddress(order)}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-dashed">
                   <p className="font-black text-blue-700">₹{order.amount || order.totalAmount}</p>
                   <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded">PREPAID</span>
                </div>
                {!order.trackingId ? (
                  <div className="flex gap-2 pt-2">
                    <input 
                      placeholder="Tracking ID" 
                      className="flex-1 bg-gray-50 border p-3 rounded-xl text-xs outline-none"
                      value={trackingInput[order._id] || ""}
                      onChange={(e) => setTrackingInput({...trackingInput, [order._id]: e.target.value})}
                    />
                    <button onClick={() => updateTracking(order._id)} className="bg-[#041f41] text-white px-5 py-3 rounded-xl font-black text-xs uppercase">Ship</button>
                  </div>
                ) : (
                  <div className="bg-green-600 text-white p-3 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase">
                    <Truck size={16} /> {order.trackingId}
                  </div>
                )}
            </div>
          )
        })}
      </div>
    </div>
  );
}