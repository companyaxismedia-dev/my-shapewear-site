"use client";
import React, { useState } from 'react';
import { Mail, MapPin, Phone, Clock, MessageSquare, Send } from 'lucide-react';

export default function ContactUs() {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    // Form logic can be added here to connect with your backend
    setTimeout(() => setStatus('Message sent successfully!'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Contact Us</h1>
          <div className="h-1 w-20 bg-pink-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Humein aapki madad karke khushi hogi. Kisi bhi query ya order help ke liye niche diye gaye details par sampark karein.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Card 1: Email */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-105">
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="text-pink-600" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Email Us</h3>
            <a href="mailto:inboxdwarka@gmail.com" className="text-pink-600 font-semibold hover:underline">
              inboxdwarka@gmail.com
            </a>
          </div>

          {/* Card 2: WhatsApp */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-105">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
            <a href="https://wa.me/919811180043" className="text-gray-900 font-semibold hover:text-pink-600">
              +91 9811180043
            </a>
          </div>

          {/* Card 3: Support Hours */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center transition-transform hover:scale-105">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Support Hours</h3>
            <p className="text-gray-600 text-sm">Mon - Sat: 10AM - 7PM</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Registered Office Details */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center mb-6">
              <MapPin className="text-pink-600 mr-3" size={24} />
              <h3 className="text-2xl font-bold">Registered Office</h3>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase text-gray-400 font-semibold mb-1">Legal Business Name</p>
                <p className="text-lg font-medium text-gray-800">BOOTY BLOOM (Owned by Axis Media Digital)</p>
              </div>
              <div>
                <p className="text-sm uppercase text-gray-400 font-semibold mb-1">Official Address</p>
                <p className="text-gray-700 leading-relaxed">
                  Shop No-21, DDA CSC Market, Sector-10, Dwarka,<br />
                  New Delhi - 110075, India
                </p>
              </div>
            </div>
          </div>

          {/* Right: Functional Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              Send a Message <Send size={20} className="text-pink-600" />
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Your Name" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
              />
              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
              />
              <textarea 
                placeholder="How can we help you?" 
                rows="4" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
              ></textarea>
              <button 
                type="submit" 
                className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition shadow-md shadow-pink-100"
              >
                Submit Message
              </button>
              {status && <p className="text-center text-sm font-medium text-green-600 mt-2">{status}</p>}
            </form>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Aapki query ka jawab hum 24-48 ghanton ke andar dene ki koshish karte hain.</p>
        </div>
      </div>
    </div>
  );
}