"use client";
import { Loader2 } from "lucide-react";

export default function CheckoutSection({ address, setAddress, handleFinalPayment, isLoading, finalPayable, mobileNumber }) {
  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white border border-gray-100 shadow-sm rounded-lg">
      <h2 className="text-3xl font-[900] mb-10 text-black tracking-tighter uppercase border-b-4 border-black pb-4">
        Where should we deliver?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
        <div className="group">
          <label className="text-[12px] font-black text-black uppercase tracking-widest block mb-2">Full Name *</label>
          <input 
            type="text"
            placeholder="ENTER YOUR FULL NAME"
            className="w-full border-b-2 border-black py-3 outline-none focus:border-[#ec4899] transition-all text-black font-black text-lg placeholder-gray-300 bg-transparent"
            onChange={(e) => setAddress({ ...address, name: e.target.value })}
          />
        </div>

        <div className="group">
          <label className="text-[12px] font-black text-black uppercase tracking-widest block mb-2">Pincode *</label>
          <input 
            type="text"
            placeholder="6-DIGIT PIN"
            maxLength={6}
            className="w-full border-b-2 border-black py-3 outline-none focus:border-[#ec4899] transition-all text-black font-black text-lg placeholder-gray-300 bg-transparent"
            onChange={(e) => setAddress({ ...address, zip: e.target.value })}
          />
        </div>

        <div className="group">
          <label className="text-[12px] font-black text-black uppercase tracking-widest block mb-2">Mobile Number *</label>
          <input 
            value={`+91 ${mobileNumber}`} 
            readOnly 
            className="w-full border-b-2 border-gray-200 py-3 outline-none text-black font-black text-lg bg-gray-50 cursor-not-allowed opacity-80"
          />
        </div>

        <div className="group">
          <label className="text-[12px] font-black text-black uppercase tracking-widest block mb-2">City *</label>
          <input 
            type="text"
            placeholder="CITY"
            className="w-full border-b-2 border-black py-3 outline-none focus:border-[#ec4899] transition-all text-black font-black text-lg placeholder-gray-300 bg-transparent"
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <label className="text-[12px] font-black text-black uppercase tracking-widest block mb-2">House No / Street / Area *</label>
          <textarea 
            rows={2}
            placeholder="DETAILED ADDRESS"
            className="w-full border-b-2 border-black py-3 outline-none focus:border-[#ec4899] transition-all text-black font-black text-lg placeholder-gray-300 bg-transparent resize-none"
            onChange={(e) => setAddress({ ...address, street: e.target.value })}
          />
        </div>

        <div className="col-span-2 md:col-span-1">
          <label className="text-[12px] font-black text-black uppercase tracking-widest block mb-2">State *</label>
          <select 
            defaultValue=""
            className="w-full border-b-2 border-black py-3 outline-none focus:border-[#ec4899] transition-all text-black font-black text-lg bg-transparent appearance-none"
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
          >
            <option value="" disabled className="text-gray-400">SELECT STATE</option>
            <option value="Delhi">DELHI</option>
            <option value="Maharashtra">MAHARASHTRA</option>
            <option value="Karnataka">KARNATAKA</option>
            <option value="Gujarat">GUJARAT</option>
            <option value="Uttar Pradesh">UTTAR PRADESH</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleFinalPayment}
        disabled={isLoading}
        className="mt-16 w-full bg#FFF5F7] text-white py-6 rounded-none font-black text-xl shadow-2xl hover:bg-black transition-all duration-300 uppercase tracking-[0.3em] flex justify-center items-center gap-3 disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : `PAY ₹${finalPayable.toFixed(2)}`}
      </button>
    </div>
  );
}