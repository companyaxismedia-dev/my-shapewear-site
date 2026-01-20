"use client";
import {
  Facebook,
  Instagram,
  Youtube,
  Send,
  ShieldCheck,
  CreditCard,
  Phone,
  Mail
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#041f41] text-white pt-14 pb-8 px-4 md:px-8 mt-20 rounded-t-[2.5rem] md:rounded-t-[5rem]">
      <div className="max-w-7xl mx-auto">

        {/* TOP GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14 text-center sm:text-left">

          {/* Brand */}
          <div className="space-y-5">
            <h3 className="text-2xl md:text-3xl font-black italic uppercase">
              Booty Bloom
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Confidence aur comfort ka naya naam. Premium shapewear jo aapke
              body ko de perfect shape.
            </p>

            {/* Social Icons */}
            <div className="flex justify-center sm:justify-start gap-4">
              <a
                href="https://www.instagram.com/bootybloom84/"
                className="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]"
              >
                <Instagram size={22} />
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61586560657621"
                className="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl hover:bg-[#1877F2]"
              >
                <Facebook size={22} />
              </a>

              <a
                href="#"
                className="w-11 h-11 flex items-center justify-center bg-white/10 rounded-xl hover:bg-[#FF0000]"
              >
                <Youtube size={22} />
              </a>
            </div>
          </div>

          {/* Shopping */}
          <div className="space-y-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">
              Shopping
            </h4>
            <ul className="space-y-3 text-sm font-bold text-gray-300">
              <li>New Arrivals</li>
              <li>Best Sellers</li>
              <li>Shapewear Guide</li>
              <li>Offers & Coupons</li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">
              Customer Care
            </h4>
            <ul className="space-y-3 text-sm font-bold text-gray-300">
              <li className="text-yellow-400">Help Center (FAQ)</li>
              <li>Track Your Order</li>
              <li>Shipping Policy</li>
              <li>Return & Exchange</li>
            </ul>

            {/* Contact */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <h5 className="text-xs font-black uppercase tracking-widest text-blue-400">
                Contact Us
              </h5>

              <a
                href="tel:9871147666"
                className="flex justify-center sm:justify-start items-center gap-3 text-sm font-bold text-gray-300"
              >
                <Phone size={16} className="text-green-400" />
                9871147666
              </a>

              <a
                href="tel:9811180043"
                className="flex justify-center sm:justify-start items-center gap-3 text-sm font-bold text-gray-300"
              >
                <Phone size={16} className="text-green-400" />
                9811180043
              </a>

              <a
                href="mailto:bootybloom8@gmail.com"
                className="flex justify-center sm:justify-start items-center gap-3 text-sm font-bold text-gray-300 break-all"
              >
                <Mail size={16} className="text-yellow-400" />
                bootybloom8@gmail.com
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-400">
              Stay Updated
            </h4>

            <div className="relative max-w-xs mx-auto sm:mx-0">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-sm focus:outline-none"
              />
              <button className="absolute right-2 top-2 bg-blue-600 p-2 rounded-lg">
                <Send size={16} />
              </button>
            </div>

            <div className="pt-3 flex justify-center sm:justify-start">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <ShieldCheck size={18} className="text-green-400" />
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Official Merchant
                  </p>
                  <p className="text-[10px] font-bold text-blue-300">
                    AXISMEDIA465@iob
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="pt-6 border-t border-white/10 flex flex-col gap-4 md:flex-row md:justify-between items-center text-center">
          <div className="flex items-center gap-3 opacity-60">
            <CreditCard size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              100% Secure Payments
            </span>
          </div>

          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            © 2026 Booty Bloom Enterprises
          </p>
        </div>
      </div>
    </footer>
  );
}
