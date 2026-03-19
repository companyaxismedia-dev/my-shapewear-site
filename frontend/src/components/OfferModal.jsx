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
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center backdrop-blur-md"
      style={{ background: "rgba(74,46,53,0.45)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="card-imkaa w-full max-w-lg relative text-center"
        style={{ borderRadius: 28 }}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2"
          style={{ color: "var(--color-muted)" }}
        >
          <X size={22} />
        </button>

        <div className="p-10 pt-14">
          {/* ICON */}
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              boxShadow: "0 12px 30px rgba(74,46,53,0.16)",
            }}
          >
            <Gift className="text-white" size={46} />
          </motion.div>

          {/* TEXT */}
          <h2 className="heading-section" style={{ textAlign: "center", fontSize: "clamp(26px, 3vw, 40px)", marginBottom: 8 }}>
            Wait! Don’t Miss Out
          </h2>
          <p className="text-muted-sm" style={{ fontSize: 13, marginBottom: 22, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
            Special Boutique Reward
          </p>

          {/* OFFER BOX */}
          <div className="card-imkaa mb-8 relative overflow-hidden" style={{ padding: 22, background: "var(--color-bg-alt)" }}>
            <p className="text-body" style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: "var(--color-body)" }}>
              Add{" "}
              <span style={{ color: "var(--color-primary)", fontSize: 32, fontWeight: 700 }}>
                {itemsNeeded}
              </span>{" "}
              more item{itemsNeeded !== 1 && "s"} to unlock
              <span className="block" style={{ color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 13, marginTop: 10, fontWeight: 700 }}>
                Buy 2 Get 1 Free!
              </span>
            </p>

            {/* PROGRESS */}
            <div className="w-full h-3 rounded-full mt-6 overflow-hidden" style={{ background: "rgba(234,215,221,0.65)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
                className="h-full"
                style={{ background: "var(--color-primary)" }}
              />
            </div>

            <Sparkles
              className="absolute -bottom-2 -right-2"
              style={{ color: "rgba(234,215,221,0.8)" }}
              size={80}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col gap-4">
            <button
              onClick={onClose}
              className="btn-primary-imkaa w-full"
              style={{ height: 50 }}
            >
              Discover More
            </button>

            <button
              onClick={onProceed}
              className="btn-secondary-imkaa w-full"
              style={{ height: 48 }}
            >
              View Products <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
