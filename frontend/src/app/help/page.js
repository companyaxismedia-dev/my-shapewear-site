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
  AlertCircle,
  Truck,
  RotateCcw,
  CheckCircle2,
  Lock,
  ThumbsUp,
  Info,
  Heart
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
    { id: "size", title: "Size & Fitting Guide", icon: <CheckCircle2 size={20} /> },
    { id: "product", title: "Fabric & Quality", icon: <ShieldCheck size={20} /> },
    { id: "returns", title: "Returns & Exchange", icon: <RefreshCcw size={20} /> },
    { id: "payment", title: "Payments & Safety", icon: <CreditCard size={20} /> },
  ];

  const faqs = {
    shipping: [
      { q: "Delivery mein kitna time lagta hai?", a: "Metro cities (Delhi, Mumbai, etc.) mein 2-3 din aur rest of India mein 4-7 working days lagte hain." },
      { q: "Kya main apna order track kar sakti hoon?", a: "Ji haan! Order dispatch hote hi aapko WhatsApp aur Email par Tracking Link bhej diya jata hai." },
      { q: "Kya aap COD (Cash on Delivery) accept karte hain?", a: "Ji haan, pure India mein COD available hai. Aap order milne par cash de sakte hain." },
      { q: "Packaging kaisi hogi?", a: "Hum 100% Discreet Packaging use karte hain. Packet ke upar product ka naam (Shapewear) nahi likha hota." }
    ],
    size: [
      { q: "Mujhe apna size kaise pata chalega?", a: "Aap apna normal waist size (inches mein) check karein aur hamare Size Chart se match karein. Confusion hone par WhatsApp par humein batayein." },
      { q: "Kya yeh bahut zyada tight mehsoos hoga?", a: "Shapewear shuru mein thoda tight lagta hai kyunki yeh compression fabric hai, par 5-10 minute pehenne ke baad yeh body shape le leta hai." },
      { q: "Agar size galat ho gaya toh?", a: "Fikar na karein! Hum easy exchange dete hain. Aap apna packet wapas bhej kar sahi size mangwa sakti hain." },
      { q: "Kya yeh niche se roll hota hai?", a: "Nahi! Hamare saare models mein 'Anti-Roll Silicone Strips' lagi hain jo ise apni jagah par fix rakhti hain." }
    ],
    product: [
      { q: "Fabric kaisa hai? Chubhan toh nahi hogi?", a: "Hum Premium Nylon-Spandex blend use karte hain jo super soft aur breathable hai. Yeh skin-friendly hai." },
      { q: "Kya main ise rozana 8-10 ghante pehen sakti hoon?", a: "Haan, yeh daily wear ke liye design kiya gaya hai. Iska material paseena sokh leta hai aur skin ko breath karne deta hai." },
      { q: "Isko wash kaise karna chahiye?", a: "Isse hamesha normal paani mein hand-wash karein. Garam paani aur machine wash se iski elastic kharab ho sakti hai." },
      { q: "Kya yeh saree/tight dress ke andar dikhta hai?", a: "Bilkul nahi! Hamara shapewear 'Seamless' (bina silai wala) hai, jo sabse tight dress ke andar bhi invisible rehta hai." }
    ],
    returns: [
      { q: "Refund policy kya hai?", a: "Agar product mein koi defect hai, toh hum 100% refund dete hain. Exchange ke liye aap 7 din ke andar request kar sakte hain." },
      { q: "Privacy ka dhyan rakha jayega?", a: "Bilkul! Hum aapki personal details kisi ke saath share nahi karte. Aapka order 100% private hai." },
      { q: "Kya hygiene ka issue hota hai?", a: "Hum hamesha fresh products bhejte hain. Exchange ke waqt bhi hum check karte hain ki product worn (pehna hua) na ho." }
    ],
    payment: [
      { q: "Online payment safe hai?", a: "Ji haan, hum Razorpay use karte hain jo India ka sabse secure payment gateway hai. Aapki banking details hamare paas save nahi hoti." },
      { q: "Payment fail hone par kya karein?", a: "Aap humein WhatsApp par screenshot bhej dein. Hum check karke aapka order manually confirm kar denge." },
      { q: "Refund kitne din mein credit hota hai?", a: "Refund confirm hone ke baad 5-7 working days mein aapke original payment mode mein wapas aa jata hai." }
    ]
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] font-sans text-gray-800">
      
      {/* TOP BAR */}
      <div className="bg-white border-b border-pink-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-full hover:bg-pink-50 text-pink-600 transition">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-black text-lg tracking-tighter uppercase italic text-gray-900">
              Booty Bloom <span className="text-pink-600">Care</span>
            </h1>
          </div>
          <button onClick={() => openWhatsApp()} className="bg-pink-600 text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all">
            <MessageCircle size={18} /> Support Online
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* HERO - Pink Theme */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-[3rem] p-10 mb-12 text-white relative overflow-hidden shadow-2xl border-b-[10px] border-pink-800">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4 bg-white/20 w-fit px-4 py-1 rounded-full backdrop-blur-md">
                <Heart size={14} className="fill-white" />
                <span className="text-[10px] font-black uppercase tracking-widest">For Confident Women</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 italic tracking-tighter">HUM AAPKE SAATH HAIN!</h2>
            <p className="text-pink-100 mb-8 font-medium text-lg leading-relaxed">
              Sahi fitting aur quality hamari zimmedari hai. Koi bhi doubt ho, niche search karein ya humein chat karein.
            </p>
            <div className="relative">
              <input
                placeholder="Search (e.g. Size Guide, Refund...)"
                className="w-full py-5 pl-14 pr-6 rounded-[2rem] text-gray-800 focus:outline-none shadow-2xl text-base font-medium border-2 border-transparent focus:border-pink-300"
              />
              <Search className="absolute left-5 top-5 text-pink-400" size={24} />
            </div>
          </div>
          <HelpCircle className="absolute -right-16 -top-16 text-white/10 w-80 h-80 rotate-12" />
        </div>

        {/* QUICK SOLVE GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
                { label: "Track Order", icon: <Truck />, msg: "Hi, I want to track my order." },
                { label: "Size Chart", icon: <Info />, msg: "Hi, help me with the size chart." },
                { label: "Exchange", icon: <RotateCcw />, msg: "Hi, I want to exchange my product." },
                { label: "Free Gift?", icon: <ThumbsUp />, msg: "Hi, I want to know about current offers." }
            ].map((item, i) => (
                <button key={i} onClick={() => openWhatsApp(item.msg)} className="bg-white p-6 rounded-3xl border border-pink-50 shadow-sm flex flex-col items-center gap-3 hover:bg-pink-600 hover:text-white transition-all group">
                    <div className="p-3 bg-pink-50 text-pink-600 rounded-2xl group-hover:bg-white/20 group-hover:text-white transition-colors">
                        {item.icon}
                    </div>
                    <span className="font-black uppercase italic text-[11px] tracking-widest">{item.label}</span>
                </button>
            ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR */}
          <div className="md:w-1/3 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-pink-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b bg-pink-50/30">
                <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">Help Categories</p>
              </div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveTab(cat.id); setOpenFaq(null); }}
                  className={`w-full flex items-center justify-between px-6 py-5 transition-all ${
                    activeTab === cat.id
                      ? "bg-pink-600 text-white font-black"
                      : "hover:bg-pink-50 text-gray-600 font-bold"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={activeTab === cat.id ? "text-white" : "text-pink-500"}>{cat.icon}</div>
                    <span className="text-sm">{cat.title}</span>
                  </div>
                  <ChevronRight size={16} className={activeTab === cat.id ? "opacity-100" : "opacity-30"} />
                </button>
              ))}
            </div>

            {/* PRIVACY BOX - Pink Gradient */}
            <div className="bg-gradient-to-br from-[#8b1030] to-pink-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden border-b-8 border-pink-950">
                <Lock className="mb-4 text-pink-300" size={32} />
                <h4 className="text-xl font-black italic uppercase mb-2">100% Privacy</h4>
                <p className="text-sm text-pink-100 leading-relaxed font-medium">
                    Hamari packaging bilkul plain hoti hai. Box par kahin bhi product ka naam nahi hoga.
                </p>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* FAQ LIST */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-[3rem] border border-pink-100 shadow-sm overflow-hidden min-h-[500px]">
              <div className="p-8 border-b bg-white flex justify-between items-end">
                <div>
                    <p className="text-pink-500 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Top Questions</p>
                    <h2 className="font-black uppercase italic text-3xl text-gray-900">
                    {categories.find(c => c.id === activeTab)?.title}
                    </h2>
                </div>
              </div>

              <div className="divide-y divide-pink-50">
                {faqs[activeTab].map((faq, i) => (
                  <div key={i} className={`transition-all ${openFaq === i ? "bg-pink-50/20" : ""}`}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex justify-between items-center px-8 py-7 text-left group"
                    >
                      <span className={`font-bold text-base transition-colors ${openFaq === i ? "text-pink-600" : "text-gray-800"}`}>
                        {faq.q}
                      </span>
                      <div className={`p-2 rounded-xl transition-all ${openFaq === i ? "bg-pink-600 text-white rotate-180" : "bg-pink-50 text-pink-400 group-hover:bg-pink-100"}`}>
                        <ChevronDown size={20} />
                      </div>
                    </button>

                    {openFaq === i && (
                      <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="p-6 bg-white rounded-3xl text-gray-600 leading-relaxed border border-pink-100 shadow-sm relative">
                          <p className="text-base font-medium">{faq.a}</p>
                          <div className="mt-6 pt-4 border-t border-pink-50 flex items-center justify-between">
                             <div className="flex items-center gap-2 text-pink-600 font-bold text-xs uppercase">
                                <CheckCircle2 size={14} /> Solved your doubt?
                             </div>
                             <button onClick={() => openWhatsApp(`Product: ${faq.q}`)} className="text-pink-600 font-black text-[11px] uppercase border-b-2 border-pink-600 pb-0.5">Still Confused? Ask us</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PINK WHATSAPP BOX */}
            <div className="mt-10 p-1 bg-white rounded-[3rem] shadow-xl border border-pink-100 overflow-hidden">
                <div className="bg-[#25d366] rounded-[2.8rem] p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                    <div className="bg-white p-4 rounded-full shadow-lg animate-bounce">
                        <MessageCircle className="text-[#25d366]" size={40} />
                    </div>
                    <div className="text-center md:text-left flex-grow">
                        <h3 className="text-white text-2xl font-black italic uppercase tracking-tighter">Direct Support?</h3>
                        <p className="text-white/90 font-bold">Hamari team har sawal ka jawab dene ke liye taiyar hai.</p>
                    </div>
                    <button onClick={() => openWhatsApp()} className="bg-white text-[#25d366] px-10 py-5 rounded-2xl font-black uppercase text-lg hover:scale-105 transition-transform shadow-2xl">
                        WhatsApp Us
                    </button>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-12 text-[10px] font-black text-pink-300 uppercase tracking-[0.4em]">
        © 2026 Booty Bloom • Made for Your Confidence
      </div>
    </div>
  );
}