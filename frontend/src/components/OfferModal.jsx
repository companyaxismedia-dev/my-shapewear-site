"use client";
import React from "react";
import { X, Gift, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function OfferModal({
  onClose = () => {},
  onProceed = () => {},
  cartItems = [],
}) {
  // SAFE CALCULATIONS
  const currentCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const targetCount = 3;
  const itemsNeeded = Math.max(targetCount - currentCount, 0);
  const progressPercent = Math.min((currentCount / targetCount) * 100, 100);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative text-center text-black"
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black"
        >
          <X size={22} />
        </button>

        <div className="p-10 pt-14">
          {/* ICON */}
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 bg-gradient-to-tr from-[#ed4e7e] to-pink-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Gift className="text-white" size={46} />
          </motion.div>

          {/* TEXT */}
          <h2 className="text-4xl font-black uppercase italic leading-none mb-2">
            Wait! Don’t Miss Out
          </h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-8">
            Special Boutique Reward
          </p>

          {/* OFFER BOX */}
          <div className="bg-gray-50 border p-8 rounded-[2.5rem] mb-8 relative overflow-hidden">
            <p className="text-gray-700 font-bold text-xl leading-tight mb-4">
              Add{" "}
              <span className="text-[#ed4e7e] text-3xl font-black">
                {itemsNeeded}
              </span>{" "}
              more item{itemsNeeded !== 1 && "s"} to unlock
              <span className="block text-[#ed4e7e] uppercase tracking-widest text-sm mt-2 font-black">
                Buy 2 Get 1 Free!
              </span>
            </p>

            {/* PROGRESS */}
            <div className="w-full h-3 bg-gray-200 rounded-full mt-6 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-[#ed4e7e]"
              />
            </div>

            <Sparkles
              className="absolute -bottom-2 -right-2 text-pink-100"
              size={80}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-4">
            <button
              onClick={onClose}
              className="w-full bg-[#ed4e7e] text-white py-5 rounded-3xl font-black uppercase shadow-xl hover:scale-[1.02] transition"
            >
              Continue Shopping
            </button>

            <button
              onClick={onProceed}
              className="w-full py-4 text-gray-400 font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 hover:text-pink-500"
            >
              Skip Offer & Checkout <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
