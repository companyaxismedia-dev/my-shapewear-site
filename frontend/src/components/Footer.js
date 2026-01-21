"use client";
import {
  Facebook,
  Instagram,
  Youtube,
  ShieldCheck,
  Phone,
  Mail,
  Truck,
  RotateCcw,
  Lock,
  Heart,
  ArrowRight
} from "lucide-react";

export default function Footer() {
  // Razorpay dwara generate ki gayi policies ke links
  const policyLinks = [
    { name: 'Terms & Conditions', url: 'https://merchant.razorpay.com/policy/S6bduSXSlYoh32/terms' },
    { name: 'Privacy Policy', url: 'https://merchant.razorpay.com/policy/S6bduSXSlYoh32/privacy' },
    { name: 'Refund & Cancellation', url: 'https://merchant.razorpay.com/policy/S6bduSXSlYoh32/refund' },
    { name: 'Shipping Policy', url: 'https://merchant.razorpay.com/policy/S6bduSXSlYoh32/shipping' },
    { name: 'Size Chart', url: '#' },
  ];

  return (
    <footer className="bg-[#041f41] text-white pt-24 pb-10 px-6 md:px-12 mt-20 rounded-t-[4rem] md:rounded-t-[7rem] relative overflow-hidden border-t-8 border-pink-600">
      
      {/* Import Cursive Font for Brand Consistency */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        .brand-logo-font {
          font-family: 'Great Vibes', cursive;
        }
      `}</style>

      {/* Decorative Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-600/20 blur-[150px] rounded-full"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">

        {/* TOP SECTION: LOGO & FEATURES */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12 mb-20">
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-block">
              <h2 className="brand-logo-font text-6xl md:text-8xl text-white leading-none drop-shadow-lg">
                Booty Bloom<span className="text-pink-600 text-2xl md:text-3xl font-sans font-black italic lowercase tracking-tighter ml-1">.online</span>
              </h2>
            </div>
            <p className="text-pink-100/60 font-medium text-lg max-w-md italic tracking-wide">
              Confidence aur comfort ka naya naam...
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full lg:w-auto">
            {[
                { icon: <Truck size={24} />, label: "Express Shipping" },
                { icon: <RotateCcw size={24} />, label: "7 Day Exchange" },
                { icon: <ShieldCheck size={24} />, label: "Premium Quality" },
                { icon: <Lock size={24} />, label: "Discreet Pack" },
            ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group">
                    <div className="p-4 bg-white/5 rounded-[2.5rem] group-hover:bg-pink-600 group-hover:scale-110 transition-all duration-500 text-pink-500 group-hover:text-white border border-white/10 shadow-xl">
                        {item.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-pink-400 transition-colors">{item.label}</span>
                </div>
            ))}
          </div>
        </div>

        {/* MAIN LINKS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 border-y border-white/5 py-16">
          
          {/* Brand Philosophy */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-pink-500">Hamari Pehchan</h4>
            <p className="text-sm font-bold text-gray-400 leading-relaxed">
              Hum banate hain premium shapewear jo aapki body ko de perfect shape aur aapko de nayi umeed. confidence ka naya ehsas.
            </p>
            <div className="flex gap-4">
                {[
                  { icon: <Instagram size={20} />, url: "https://www.instagram.com/bootybloom84/" },
                  { icon: <Facebook size={20} />, url: "https://www.facebook.com/profile.php?id=61586560657621" },
                  { icon: <Youtube size={20} />, url: "#" }
                ].map((social, idx) => (
                    <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-pink-600 border border-white/5 hover:border-pink-500 transition-all duration-300">
                        {social.icon}
                    </a>
                ))}
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-pink-500">Collections</h4>
            <ul className="space-y-4">
              {['Saree Shapewear', 'New Arrivals', 'Best Sellers', 'Waist Trainers'].map((link) => (
                <li key={link} className="flex items-center gap-2 group cursor-pointer text-sm font-bold text-gray-300 hover:text-pink-500 transition-all">
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-pink-500" />
                    {link}
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Help - Yahan Razorpay Links add kiye gaye hain */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-pink-500">Quick Help</h4>
            <ul className="space-y-4">
              {policyLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 group text-sm font-bold text-gray-300 hover:text-pink-500 transition-all"
                  >
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-pink-500" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-pink-500">Get In Touch</h4>
            <div className="space-y-5 font-bold text-sm">
                <a href="tel:919217521109" className="flex items-center gap-4 group text-gray-300 hover:text-white transition-colors">
                    <div className="p-2 bg-pink-600/10 rounded-lg group-hover:bg-pink-600 transition-all">
                      <Phone size={16} className="text-pink-500 group-hover:text-white" />
                    </div>
                    <span>+91 92175 21109, +91 98715 84001</span>
                </a>
                <a href="mailto:bootybloom8@gmail.com" className="flex items-center gap-4 group text-gray-300 hover:text-white transition-colors">
                    <div className="p-2 bg-pink-600/10 rounded-lg group-hover:bg-pink-600 transition-all">
                      <Mail size={16} className="text-pink-500 group-hover:text-white" />
                    </div>
                    <span className="break-all">bootybloom8@gmail.com</span>
                </a>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-br from-white/10 to-transparent rounded-[2rem] border border-white/10">
                <div className="flex items-center gap-3 text-pink-500 mb-1">
                    <ShieldCheck size={20} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">100% Secure Checkout</span>
                </div>
                <p className="text-[9px] text-gray-500 font-bold uppercase pl-8 leading-tight">Razorpay Secured • SSL Encrypted</p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">
              © 2026 Booty Bloom Online
            </p>
            <p className="text-[9px] font-bold text-pink-600/60 uppercase tracking-widest flex items-center gap-2">
                Made with <Heart size={10} className="fill-pink-600 text-pink-600 animate-pulse" /> in Bharat
            </p>
          </div>
          
          <div className="flex items-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 cursor-pointer">
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-4" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
          </div>
        </div>

      </div>
    </footer>
  );
}
