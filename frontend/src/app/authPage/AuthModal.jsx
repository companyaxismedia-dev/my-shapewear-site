"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export default function AuthModal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(74,46,53,0.32)] p-4 backdrop-blur-md">
      <div
        className="relative w-full max-w-[460px] overflow-hidden rounded-[28px] border border-[#eddde1] bg-[linear-gradient(180deg,#fffdfd_0%,#fff8fa_100%)] p-6 shadow-[0_30px_80px_rgba(74,46,53,0.18)] sm:p-8"
        style={{
          boxShadow: "0 30px 80px rgba(74,46,53,0.18)",
        }}
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#f6dbe2]/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-[#f3cad5]/40 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#ead7dd] bg-white/90 text-[#5d444c] transition hover:border-[#c56f7f] hover:text-[#c56f7f]"
        >
          <X size={22} />
        </button>

        <div className="relative z-[1]">{children}</div>
      </div>
    </div>
  );
}
