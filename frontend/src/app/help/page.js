"use client";
import { useState } from "react";
import {
  MessageCircle,
  ChevronRight,
  RefreshCcw,
  ShieldCheck,
  ChevronDown,
  Search,
  Headphones,
  CreditCard,
  Package,
  HelpCircle,
  ArrowLeft,
  Settings,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function HelpCenterPage() {
  const [activeTab, setActiveTab] = useState("shipping");
  const [openFaq, setOpenFaq] = useState(null);
  const myWhatsApp = "919871147666";

  const openWhatsApp = (msg = "") => {
    const text = msg
      ? encodeURIComponent(msg)
      : "Hi, mujhe Booty Bloom support se help chahiye.";
    window.open(`https://wa.me/${myWhatsApp}?text=${text}`, "_blank");
  };

  const categories = [
    { id: "shipping", title: "Orders & Delivery", icon: <Package size={20} /> },
    { id: "payment", title: "Payments", icon: <CreditCard size={20} /> },
    { id: "returns", title: "Returns", icon: <RefreshCcw size={20} /> },
    { id: "account", title: "Account", icon: <Settings size={20} /> },
    { id: "offers", title: "Offers", icon: <AlertCircle size={20} /> }
  ];

  const faqs = {
    shipping: [
      { q: "Mera order kab deliver hoga?", a: "Order 3–5 working days mein deliver hota hai." },
      { q: "Delivery late ho rahi hai?", a: "Kabhi-kabhi logistics issue hota hai. WhatsApp par Order ID bhejein." }
    ],
    payment: [
      { q: "Payment options kya hain?", a: "UPI, Debit/Credit Card, Bank Transfer available hai." },
      { q: "Payment confirm nahi hua?", a: "Screenshot WhatsApp par bhej dein, hum check kar lenge." }
    ],
    returns: [
      { q: "Exchange possible hai?", a: "Haan, agar size issue hai to exchange possible hai." }
    ],
    account: [
      { q: "Login issue ho raha hai?", a: "Forgot password try karein ya WhatsApp karein." }
    ],
    offers: [
      { q: "Coupon apply nahi ho raha?", a: "Coupon expiry aur minimum order value check karein." }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] font-sans text-gray-800">

      {/* TOP BAR */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-full hover:bg-gray-100">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="font-black text-sm sm:text-base">
              Booty Bloom Help Center
            </h1>
          </div>

          <button
            onClick={() => openWhatsApp()}
            className="text-blue-600 font-bold text-xs sm:text-sm flex items-center gap-1"
          >
            <Headphones size={16} /> Support
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">

        {/* SEARCH */}
        <div className="bg-[#2874f0] rounded-xl p-5 sm:p-8 mb-6 text-white">
          <h2 className="text-xl sm:text-2xl font-black mb-2">
            Aapki kya madad kar sakte hain?
          </h2>
          <p className="text-blue-100 text-sm mb-4">
            Orders, Payments aur Returns se jude sawal.
          </p>

          <div className="relative max-w-md">
            <input
              placeholder="Search your issue..."
              className="w-full py-3 pl-10 pr-4 rounded-lg text-gray-800 focus:outline-none"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
        </div>

        {/* MOBILE CATEGORY SCROLLER */}
        <div className="md:hidden flex gap-3 overflow-x-auto mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveTab(cat.id); setOpenFaq(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap ${
                activeTab === cat.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600"
              }`}
            >
              {cat.icon}
              {cat.title}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* DESKTOP SIDEBAR */}
          <div className="hidden md:block md:w-1/3 space-y-4">
            <div className="bg-white rounded-xl border overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveTab(cat.id); setOpenFaq(null); }}
                  className={`w-full flex items-center justify-between px-5 py-4 ${
                    activeTab === cat.id
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {cat.icon}
                    {cat.title}
                  </div>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>

            <div className="bg-white p-5 rounded-xl border text-center">
              <MessageCircle size={36} className="text-green-500 mx-auto mb-2" />
              <p className="font-bold text-sm mb-3">
                Direct WhatsApp Support
              </p>
              <button
                onClick={() => openWhatsApp()}
                className="w-full bg-[#25d366] text-white py-3 rounded-lg font-black"
              >
                CHAT NOW
              </button>
            </div>
          </div>

          {/* FAQ */}
          <div className="md:w-2/3 bg-white rounded-xl border">
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="font-black uppercase italic text-lg">
                {categories.find(c => c.id === activeTab)?.title}
              </h2>
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full font-bold">
                {faqs[activeTab].length} FAQs
              </span>
            </div>

            {faqs[activeTab].map((faq, i) => (
              <div key={i} className="border-b">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center px-5 py-4 text-left"
                >
                  <span className="font-bold text-sm">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${
                      openFaq === i ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center py-8 text-xs font-bold text-gray-400">
        © 2026 Booty Bloom Enterprises
      </div>
    </div>
  );
}
