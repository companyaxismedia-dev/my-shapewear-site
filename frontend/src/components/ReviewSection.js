"use client";
import React, { useState } from "react";
import { Star, CheckCircle, Play, Camera, X, Sparkles, Quote } from "lucide-react";

// --- 20 DETAILED REVIEWS (10 IMAGE + 10 VIDEO) ---
const allReviews = [
  { 
    id: 1, 
    name: "Sneha Mehra", 
    location: "Mumbai", 
    rating: 5, 
    text: "Saree ke liye best purchase hai! Mera C-section ke baad belly fat bahut zyada tha, but ye pehenne ke baad tummy ekdum smooth ho jata hai aur saree ki plate bahut achi aati hai. Material bhi chubhta nahi hai.", 
    image: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09 (1).jpeg" 
  },
  { 
    id: 3, 
    name: "Komal Gupta", 
    location: "Bangalore", 
    rating: 5, 
    text: "Fabric bahut zyada breathable hai. Maine ise apni friend ki wedding mein lagatar 8-9 ghante pehna tha aur bilkul bhi uncomfortable feel nahi hua. Best part ye hai ki ye niche se roll up nahi hota.", 
    image: "/image/Reviews/71HgoP91WoL._AC_FMavif_UC231,231_CACC,231,231_QL54_.avif" 
  },
  { 
    id: 5, 
    name: "Ritu M.", 
    location: "Jaipur", 
    rating: 5, 
    text: "Product quality sach mein heavy hai, sasta wala material nahi hai. Packaging bhi bahut premium thi aur delivery Jaipur mein sirf 2 din mein mil gayi. Highly impressed with Booty Bloom!", 
    image: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09.jpeg" 
  },
  { 
    id: 7, 
    name: "Anita D.", 
    location: "Delhi", 
    rating: 5, 
    text: "Perfect fitting! Maine XL order kiya tha aur size chart ke hisaab se bilkul sahi aaya. Saree shapewear ke liye ye market mein sabse best option hai. Pure cotton jaisa feel deta hai skin par.", 
    image: "/image/Reviews/71r7AhhPQHL._AC_FMavif_UC231,231_CACC,231,231_QL54_.avif" 
  },
  { 
    id: 8, 
    name: "Priya K.", 
    location: "Pune", 
    rating: 5, 
    text: "Best for jeans and leggings. Gives a very natural curve and lift. Bahut saare shapewear try kiye par ye wala meri body par best fit baithta hai. Confidence sach mein badh jata hai ise pehen kar.", 
    image: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.10.jpeg" 
  },
  { 
    id: 13, 
    name: "Sonia V.", 
    location: "Kolkata", 
    rating: 5, 
    text: "Invisible lines! Maine ise ek bodycon dress ke niche pehna tha aur kisi ko pata bhi nahi chala ki andar shapewear hai. Panty lines bilkul nahi dikhti. Kolkata ki garmi mein bhi comfortable hai.", 
    image: "/image/Reviews/714SO54B1EL.jpg" 
  },
  { 
    id: 14, 
    name: "Meera R.", 
    location: "Chennai", 
    rating: 5, 
    text: "Postpartum belly shape ke liye doctor ne recommend kiya tha light support, aur ye perfect kaam kar raha hai. Support acha hai aur tight bhi nahi lagta. Daily wear ke liye amazing product hai.", 
    image: "/image/Reviews/81ydmdF1UVL.jpg" 
  },
  { 
    id: 15, 
    name: "Rekha S.", 
    location: "Bhopal", 
    rating: 5, 
    text: "Material is very soft and stretchable. Great value for money. Maine 2 pairs mangwaye hain aur washing machine mein dhone ke baad bhi quality waisi hi hai. Bilkul kharab nahi hua.", 
    image: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09 (1).jpeg" 
  },
  { 
    id: 16, 
    name: "Tanya P.", 
    location: "Gurgaon", 
    rating: 5, 
    text: "Instant confidence booster! Office wear dresses ke liye must have hai. Pehle mujhe tight kapde pehenne mein sharam aati thi par ab mein comfortably carry karti hoon. Thanks Booty Bloom!", 
    image: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09.jpeg" 
  },
  { 
    id: 17, 
    name: "Ishani G.", 
    location: "Ahmedabad", 
    rating: 5, 
    text: "Customer service bahut achi hai. Mujhe size exchange karwana tha aur unhone turant kar diya. Product toh 10/10 hai hi, service bhi top notch hai. Ahmedabad ki heat mein bhi sweat-proof hai.", 
    image: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.10.jpeg" 
  },

  // --- VIDEO REVIEWS ---
  { 
    id: 2, 
    name: "Pooja Singh", 
    location: "Delhi", 
    rating: 5, 
    text: "Mera real transformation dekhiye! Video mein aap dekh sakte hain ki kaise mera side fat ekdum chhip gaya hai. Fabric amazing hai aur stretch bilkul perfect hai. Paisa wasool product!", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09.jpeg", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 4, 
    name: "Anjali R.", 
    location: "Pune", 
    rating: 5, 
    text: "Fitting kitni perfect aayi hai video mein dekhiye. Maine ise workout ke waqt bhi pehna hai aur ye apni jagah se hilta nahi. High-waist design tummy ko pura cover karta hai.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/71r7AhhPQHL._AC_FMavif_UC231,231_CACC,231,231_QL54_.avif", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 6, 
    name: "Megha S.", 
    location: "Surat", 
    rating: 5, 
    text: "Instant slim look deta hai. Maine video mein comparison dikhaya hai. Kurti ho ya saree, ye har outfit par fit baithta hai. Material bilkul bhi transparent nahi hai aur support heavy hai.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.10.jpeg", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 10, 
    name: "Kavita L.", 
    location: "Lucknow", 
    rating: 5, 
    text: "Truly invisible under tight clothes. Maine video mein ek silk saree ke saath iska look share kiya hai. No rolling down issues at all. Lucknow ki garmi mein best choice hai!", 
    isVideo: true, 
    thumbnail: "/image/Reviews/714SO54B1EL.jpg", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 11, 
    name: "Deepika W.", 
    location: "Indore", 
    rating: 5, 
    text: "Wash karne ke baad bhi iski elastic bilkul loose nahi hui. Maine 3-4 baar wash kar liya hai, color aur shape dono same hain. High quality material hai, saste chinese product jaisa nahi hai.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09 (1).jpeg", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 12, 
    name: "Rashmi H.", 
    location: "Kolkata", 
    rating: 5, 
    text: "Soft and comfortable product. 10/10 rating meri taraf se. Video mein dekhiye ki kaise ye thighs aur waist ko ek saath tone karta hai. Best body shaper in India for sure.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/81ydmdF1UVL.jpg", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 18, 
    name: "Payal T.", 
    location: "Patna", 
    rating: 5, 
    text: "Video review of the hip-pad quality. Fabric bahut heavy aur premium hai. Padding natural lagti hai aur bilkul bhi fake nahi dikhti. Party wear ke liye best investment hai.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09.jpeg", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 19, 
    name: "Nisha Z.", 
    location: "Hyderabad", 
    rating: 5, 
    text: "Saree look complete! Best shapewear ever for heavy embroidery sarees. Ye weight ko achi tarah distribute kar deta hai aur back pain mein bhi thodi relief milti hai side support se.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09 (1).jpeg", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 20, 
    name: "Barkha C.", 
    location: "Nagpur", 
    rating: 5, 
    text: "Leggings ke saath result bahut mast aata hai. Video mein dekh sakte hain curves kitne smooth hain. Koi awkward bulging nahi hoti side se. Har ladki ke wardrobe mein ye hona chahiye.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.10.jpeg", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 21, 
    name: "Sapna G.", 
    location: "Ranchi", 
    rating: 5, 
    text: "Don't think, just buy! Maine video mein dikhaya hai ki ye kitna stretchable hai. Material skin friendly hai aur koi rashes nahi hote. 100% genuine product from Booty Bloom.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09.jpeg", 
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  }
];

export default function ReviewSection() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const photoReviews = allReviews.filter(r => !r.isVideo);
  const videoReviews = allReviews.filter(r => r.isVideo);

  return (
    <section className="bg-slate-50 py-24 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 blur-[120px] rounded-full -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-100/40 blur-[120px] rounded-full -ml-48 -mb-48"></div>

      <div className="max-w-[1440px] mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-20 px-4">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm border border-slate-200 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">50,000+ Verified Customers</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-[#041f41] italic tracking-tighter uppercase leading-[0.9]">
            THEY TRIED, <br/> <span className="text-pink-600">THEY LOVED IT.</span>
          </h2>
          <p className="mt-6 text-slate-500 font-bold max-w-xl mx-auto uppercase text-xs tracking-[0.2em]">
            Real Results from real women across India
          </p>
        </div>

        {/* --- PHOTO REVIEWS --- */}
        <div className="mb-20">
          <div className="flex items-center justify-between px-6 md:px-12 mb-8">
            <h3 className="text-2xl font-black text-[#041f41] uppercase italic flex items-center gap-3">
              <Camera className="text-pink-600" /> Customer Gallery
            </h3>
            <div className="hidden md:flex gap-2">
               <span className="h-1 w-12 bg-pink-600 rounded-full"></span>
               <span className="h-1 w-4 bg-slate-200 rounded-full"></span>
               <span className="h-1 w-4 bg-slate-200 rounded-full"></span>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto px-6 md:px-12 pb-10 no-scrollbar scroll-smooth">
            {photoReviews.map((rev) => (
              <div key={rev.id} className="w-[300px] md:w-[380px] flex-shrink-0 bg-white p-6 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white hover:border-pink-200 transition-all duration-500 group">
                <ReviewCardContent rev={rev} />
              </div>
            ))}
          </div>
        </div>

        {/* --- VIDEO REVIEWS --- */}
        <div className="mb-24">
          <div className="flex items-center justify-between px-6 md:px-12 mb-8">
            <h3 className="text-2xl font-black text-[#041f41] uppercase italic flex items-center gap-3">
              <Play className="text-pink-600 fill-pink-600" /> Honest Video Reviews
            </h3>
          </div>
          <div className="flex gap-6 overflow-x-auto px-6 md:px-12 pb-10 no-scrollbar scroll-smooth">
            {videoReviews.map((rev) => (
              <div 
                key={rev.id} 
                onClick={() => setSelectedVideo(rev.videoUrl)}
                className="w-[300px] md:w-[380px] flex-shrink-0 bg-[#041f41] p-6 rounded-[3rem] shadow-2xl flex flex-col cursor-pointer group hover:scale-[1.02] transition-all duration-500 border border-white/5"
              >
                <ReviewCardContent rev={rev} isDark={true} />
              </div>
            ))}
          </div>
        </div>

        {/* --- WHATSAPP CTA --- */}
        <div className="px-6 md:px-12">
           <div className="bg-gradient-to-br from-[#041f41] to-[#0a2e5c] rounded-[4rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl border-t-4 border-pink-600">
              <div className="relative z-10 flex flex-col items-center">
                 <div className="w-20 h-20 bg-pink-600 rounded-3xl flex items-center justify-center rotate-12 mb-8 shadow-2xl group hover:rotate-0 transition-all">
                    <Camera size={36} className="text-white" />
                 </div>
                 <h3 className="text-3xl md:text-6xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none">
                    Share Your Look & <br/> <span className="text-pink-500 underline">Get 10% OFF</span>
                 </h3>
                 <p className="text-blue-100/60 mb-10 font-bold uppercase tracking-widest text-sm">WhatsApp your review and get an instant reward code!</p>
                 <a 
                   href="https://wa.me/919871147666" 
                   target="_blank"
                   className="bg-white text-[#041f41] px-12 py-6 rounded-2xl font-black text-xl hover:bg-pink-600 hover:text-white transition-all shadow-2xl uppercase tracking-tighter"
                 >
                    Send Review On WhatsApp
                 </a>
              </div>
              {/* Decorative elements inside CTA */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-pink-600/10 blur-[100px]"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px]"></div>
           </div>
        </div>

      </div>

      {/* Video Popup Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-[#041f41]/95 z-[999] flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => setSelectedVideo(null)}>
          <div className="relative w-full max-w-md aspect-[9/16] bg-black rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-[0_0_100px_rgba(219,39,119,0.3)]" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 z-[1000] bg-white text-black p-3 rounded-full hover:bg-pink-600 hover:text-white transition-colors shadow-2xl" onClick={() => setSelectedVideo(null)}>
              <X size={24} strokeWidth={3} />
            </button>
            <iframe src={selectedVideo} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

function ReviewCardContent({ rev, isDark = false }) {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex text-yellow-400 gap-0.5">
          {[...Array(rev.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
        </div>
        <div className={`flex items-center gap-1.5 text-[10px] font-black px-4 py-2 rounded-full border uppercase tracking-widest ${
          isDark ? 'bg-white/10 text-green-400 border-white/10' : 'bg-green-50 text-green-700 border-green-100'
        }`}>
          <CheckCircle size={12} strokeWidth={3} /> Verified Buyer
        </div>
      </div>

      <div className={`relative h-80 mb-8 rounded-[2.5rem] overflow-hidden border-4 ${isDark ? 'border-white/5' : 'border-slate-50'} bg-slate-100 group`}>
        <img 
          src={rev.isVideo ? rev.thumbnail : rev.image} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
          alt="Booty Bloom Customer" 
        />
        {rev.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#041f41]/20 group-hover:bg-[#041f41]/40 transition-all">
            <div className="bg-white p-6 rounded-full shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <Play size={28} fill="#041f41" className="ml-1 text-[#041f41]" />
            </div>
          </div>
        )}
        {/* Quote Icon Overlay */}
        <div className="absolute top-4 left-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
            <Quote size={20} className="text-white fill-white opacity-50" />
        </div>
      </div>

      <div className="flex-grow mb-8">
        <p className={`font-bold text-base leading-[1.4] italic ${isDark ? 'text-white/90' : 'text-[#041f41]/80'}`}>
          "{rev.text}"
        </p>
      </div>

      <div className={`flex items-center gap-4 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg ${
          isDark ? 'bg-pink-600 text-white' : 'bg-[#041f41] text-white'
        }`}>
          {rev.name[0]}
        </div>
        <div className="text-left">
          <h4 className={`font-black text-base leading-none mb-1 ${isDark ? 'text-white' : 'text-[#041f41]'}`}>
            {rev.name}
          </h4>
          <p className="text-[10px] text-pink-500 font-black uppercase tracking-widest leading-none">
            {rev.location}
          </p>
        </div>
      </div>
    </>
  );
}