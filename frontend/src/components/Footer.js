"use client";
import React from "react";
import {
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  Phone,
  Mail,
  Heart,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  Star
} from "lucide-react";

export default function Footer() {
  const policyLinks = [
    { name: 'About Us', url: '#' },
    { name: 'Contact Us', url: '/contact' },
    { name: 'Shipping Policy', url: 'https://merchant.razorpay.com/policy/S6bduSXSlYoh32/shipping' },
    { name: 'Privacy Policy', url: 'https://merchant.razorpay.com/policy/S6bduSXSlYoh32/privacy' },
    { name: 'Terms & Conditions', url: 'https://merchant.razorpay.com/policy/S6bduSXSlYoh32/terms' },
    { name: 'Return & Exchange Policy', url: 'https://merchant.razorpay.com/policy/S6bduSXSlYoh32/refund' },
  ];

  const features = [
    { icon: <Truck size={24} />, title: "Free Shipping", desc: "On all prepaid orders" },
    { icon: <RotateCcw size={24} />, title: "Easy Returns", desc: "7 days exchange policy" },
    { icon: <ShieldCheck size={24} />, title: "Premium Quality", desc: "Skin friendly fabrics" },
    { icon: <Lock size={24} />, title: "Secure Payment", desc: "100% Razorpay safe" },
  ];

  return (
    <footer className="bg-[#fffafa] text-[#333] border-t-4 border-pink-500 pt-16 pb-8 font-sans">
      {/* <div className="max-w-7xl mx-auto px-4 md:px-8"> */}
      <div className="w-full px-4 md:px-10 lg:px-16">


        {/* MAIN LINKS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Category Section */}
          <div className="space-y-6">
            <h4 className="text-pink-600 font-black text-sm uppercase tracking-widest border-b-2 border-pink-200 pb-2 inline-block">Category</h4>
            <ul className="space-y-4 text-sm text-gray-700 font-bold">
              {['Saree Shapewear', 'Bodysuits', 'Waist Trainers', 'New Arrivals'].map((item) => (
                <li key={item} className="flex items-center gap-2 hover:text-pink-600 cursor-pointer transition-all group">
                  <ArrowRight size={14} className="text-pink-400 group-hover:translate-x-1 transition-transform" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-6">
            <h4 className="text-pink-600 font-black text-sm uppercase tracking-widest border-b-2 border-pink-200 pb-2 inline-block">Quick Help</h4>
            <ul className="space-y-4 text-sm text-gray-700 font-bold">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.url} className="flex items-center gap-2 hover:text-pink-600 transition-all group">
                    <ArrowRight size={14} className="text-pink-400 group-hover:translate-x-1 transition-transform" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Socials */}
          <div className="lg:col-span-2 bg-[#fff5f6] p-8 rounded-3xl shadow-sm border border-pink-100">
            <h4 className="text-pink-600 font-black text-sm uppercase mb-6 tracking-widest">Stay Connected</h4>
            <p className="text-xs text-gray-500 mb-4 font-bold">Naye offers aur updates ke liye subscribe karein!</p>
            <div className="flex flex-col sm:flex-row gap-2 mb-8">
              <input
                type="email"
                placeholder="Email Address"
                className="flex-1 px-4 py-3 bg-white border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
              />
              <button className="bg-pink-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-pink-700 transition-all shadow-lg shadow-pink-200">
                Join Now
              </button>
            </div>

            <div className="flex gap-4">
              {[
                { icon: <Facebook size={20} />, url: "https://www.facebook.com/profile.php?id=61586560657621" },
                { icon: <Twitter size={20} />, url: "#" },
                { icon: <Youtube size={20} />, url: "#" },
                { icon: <Instagram size={20} />, url: "https://www.instagram.com/bootybloom84/" }
              ].map((soc, i) => (
                <a key={i} href={soc.url} className="w-10 h-10 flex items-center justify-center bg-white text-pink-600 rounded-full hover:bg-pink-600 hover:text-white transition-all border border-pink-100 shadow-sm">
                  {soc.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* WHY CHOOSE US SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-[#fff5f6]/80 border border-pink-100 p-6 rounded-2xl flex flex-col items-center text-center group hover:bg-pink-600 transition-all duration-300">
              <div className="text-pink-600 group-hover:text-white mb-3 transition-colors">
                {feature.icon}
              </div>
              <h5 className="font-black text-[11px] uppercase tracking-tighter text-gray-800 group-hover:text-white">{feature.title}</h5>
              <p className="text-[10px] font-medium text-gray-500 group-hover:text-pink-100 leading-tight">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION: Razorpay Approval Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-[#fffafa] p-8 md:p-12 rounded-[3rem] shadow-xl shadow-pink-100/30 border border-pink-100">

          {/* Account Details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 text-pink-600 mb-2">
              <ShieldCheck size={28} />
              <h5 className="font-black text-lg uppercase tracking-tighter">Registered Business Information</h5>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-gray-900 leading-tight">
                BOOTY BLOOM <span className="text-pink-500 font-medium text-lg block md:inline md:ml-2">(Owned by Axis Media Digital)</span>
              </p>
              <div className="flex items-start gap-2 text-gray-600 font-bold text-sm md:text-base italic">
                <span>Shop No-21, DDA CSC Market, Sector-10, Dwarka, New Delhi - 110075, India</span>
              </div>
            </div>
          </div>

          {/* Contact & Payments */}
          <div className="flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-pink-100 pt-6 lg:pt-0 lg:pl-10">
            <div className="space-y-3">
              <a href="tel:919811180043" className="flex items-center gap-3 text-md font-black text-gray-800 hover:text-pink-600 transition">
                <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center shadow-md">
                  <Phone size={14} />
                </div>
                <span>+91 9811180043</span>
              </a>
              <a href="mailto:inboxdwarka@gmail.com" className="flex items-center gap-3 text-md font-black text-gray-800 hover:text-pink-600 transition">
                <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center shadow-md">
                  <Mail size={14} />
                </div>
                <span className="break-all">inboxdwarka@gmail.com</span>
              </a>
            </div>

            {/* Trusted Payment Icons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-pink-50">
              {['visa', 'mastercard', 'rupay', 'google-pay-india'].map((img) => (
                <img
                  key={img}
                  src={`https://img.icons8.com/color/48/000000/${img}.png`}
                  alt={img}
                  className="h-10 bg-white rounded-lg p-1 border border-pink-100"
                />
              ))}
            </div>
          </div> 
        </div>

        {/* Final Branding Line */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-pink-400 font-black uppercase tracking-[0.5em] mb-2">
            Confidence aur Comfort ka naya naam
          </p>
          <div className="text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            © 2026 Booty Bloom | Made with <Heart size={12} className="fill-pink-600 text-pink-600 animate-pulse" /> in Bharat
          </div>
        </div>
      </div>
    </footer>
  );
}