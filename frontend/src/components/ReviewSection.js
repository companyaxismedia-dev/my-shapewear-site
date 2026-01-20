"use client";
import React, { useState } from "react";
import { Star, CheckCircle, Play, Camera, X } from "lucide-react";

const allReviews = [
  // --- IMAGE REVIEWS (UPAR WALI ROW) ---
  { id: 1, name: "Sneha Mehra", location: "Mumbai", rating: 5, text: "Saree ke liye best purchase hai! Tummy area ekdum smooth ho jata hai aur fitting kamaal ki aati hai.", image: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09 (1).jpeg" },
  { id: 3, name: "Komal Gupta", location: "Bangalore", rating: 5, text: "Fabric bahut breathable hai. Maine ise 8 ghante lagatar pehna aur koi discomfort nahi hua. Must buy!", image: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.10.jpeg" },
  { id: 5, name: "Ritu M.", location: "Jaipur", rating: 5, text: "Packaging premium thi aur delivery 3 din mein mil gayi. Product quality sach mein heavy hai.", image: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09.jpeg" },

  // --- VIDEO REVIEWS (NICHE WALI ROW) ---
  { 
    id: 2, name: "Pooja Singh", location: "Delhi", rating: 5, 
    text: "Mera real experience dekhiye! Fabric ki stretch aur result amazing hai. Best shapewear brand.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09.jpeg",
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 4, name: "Anjali R.", location: "Pune", rating: 5, 
    text: "Check this video! Fitting kitni perfect aayi hai aap khud dekh sakte hain. Highly recommended.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.09 (1).jpeg",
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  },
  { 
    id: 6, name: "Megha S.", location: "Surat", rating: 5, 
    text: "Watch my review! Instant slim look deta hai. Quality 10/10 hai.", 
    isVideo: true, 
    thumbnail: "/image/Reviews/WhatsApp Image 2026-01-19 at 14.22.10.jpeg",
    videoUrl: "https://www.youtube.com/embed/MQLGVImRiko?autoplay=1" 
  }
];

export default function ReviewSection() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const photoReviews = allReviews.filter(r => !r.isVideo);
  const videoReviews = allReviews.filter(r => r.isVideo);

  return (
    <section className="bg-[#f8fafc] py-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16 px-4">
          <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">10,000+ HAPPY CUSTOMERS</span>
          <h2 className="text-4xl md:text-6xl font-black text-[#041f41] italic mt-6 tracking-tighter uppercase">REAL STORIES, REAL RESULTS</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
            </div>
            <p className="font-bold text-gray-500 italic">4.9/5 Average Rating</p>
          </div>
        </div>

        {/* --- ROW 1: PHOTO REVIEWS (TOP) --- */}
        <div className="relative flex overflow-hidden mb-12">
          <div className="animate-marquee flex gap-6 py-6">
            {[...photoReviews, ...photoReviews].map((rev, index) => (
              <div key={`photo-${index}`} className="w-[300px] md:w-[350px] flex-shrink-0 bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col hover:scale-105 transition-all duration-300">
                <ReviewCardContent rev={rev} />
              </div>
            ))}
          </div>
        </div>

        {/* --- ROW 2: VIDEO REVIEWS (BOTTOM) --- */}
        <div className="relative flex overflow-hidden">
          <div className="animate-marquee flex gap-6 py-6" style={{ animationDirection: 'reverse' }}>
            {[...videoReviews, ...videoReviews].map((rev, index) => (
              <div 
                key={`video-${index}`} 
                onClick={() => setSelectedVideo(rev.videoUrl)}
                className="w-[300px] md:w-[350px] flex-shrink-0 bg-white p-6 rounded-[2.5rem] shadow-xl border border-blue-100 flex flex-col hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <ReviewCardContent rev={rev} />
              </div>
            ))}
          </div>
        </div>

        {/* --- VIDEO POPUP MODAL (YouTube Support) --- */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-[#041f41]/95 z-[999] flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setSelectedVideo(null)}>
            <div className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/20" onClick={e => e.stopPropagation()}>
              <button 
                className="absolute top-4 right-4 z-[1000] bg-white/20 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                onClick={() => setSelectedVideo(null)}
              >
                <X size={24} />
              </button>
              <iframe 
                src={selectedVideo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-16 px-4 flex justify-center">
           <div className="max-w-4xl w-full bg-[#041f41] rounded-[3rem] p-12 text-center text-white relative shadow-2xl overflow-hidden border-b-8 border-blue-600">
             <div className="relative z-10 flex flex-col items-center">
                <Camera size={35} className="text-yellow-400 mb-4 animate-pulse" />
                <h3 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">Win A 10% Discount Code!</h3>
                <p className="text-blue-100/70 mb-8 font-medium">WhatsApp your review and get an instant discount!</p>
                <button className="bg-[#ffc220] text-[#041f41] px-12 py-4 rounded-2xl font-black hover:scale-105 transition-all">
                  SEND REVIEW NOW
                </button>
             </div>
             <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-20"></div>
          </div>
        </div>

      </div>
    </section>
  );
}

function ReviewCardContent({ rev }) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex text-yellow-400">
          {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
          <CheckCircle size={10} /> VERIFIED BUYER
        </div>
      </div>
      <div className="h-64 mb-4 rounded-3xl overflow-hidden border-4 border-gray-50 bg-gray-100 relative group">
        <img src={rev.isVideo ? rev.thumbnail : rev.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Review" />
        {rev.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-all">
            <div className="bg-white/90 p-4 rounded-full shadow-2xl"><Play size={20} fill="#041f41" className="text-[#041f41] ml-0.5" /></div>
            <span className="absolute bottom-4 bg-[#041f41] text-white text-[10px] px-3 py-1 rounded-full font-black">WATCH REVIEW</span>
          </div>
        )}
      </div>
      <p className="text-gray-700 font-bold text-sm mb-6 leading-relaxed italic flex-grow">"{rev.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <div className="w-10 h-10 bg-[#041f41] rounded-2xl flex items-center justify-center text-white font-black text-sm">{rev.name[0]}</div>
        <div className="text-left">
          <h4 className="font-black text-[#041f41] text-sm">{rev.name}</h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase">{rev.location}</p>
        </div>
      </div>
    </>
  );
}