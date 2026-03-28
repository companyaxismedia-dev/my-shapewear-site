"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export default function ModalWrapper({
  title,
  onClose,
  children,
  className = "",
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2f1d22]/35 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative flex h-[96vh] w-[98vw] max-w-[1240px] flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_24px_80px_rgba(74,46,53,0.18)] ${className}`}
      >
        <div className="flex min-h-[84px] items-center justify-between border-b border-[#e7d5db] px-5 sm:px-7">
          <h2 className="font-playfair text-[24px] font-semibold leading-none text-[#4A2E35] sm:text-[30px]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-12 w-12 items-center justify-center rounded-full text-[#4A2E35] transition hover:bg-[#f8edf1]"
            aria-label="Close modal"
          >
            <X size={30} strokeWidth={2.2} />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}