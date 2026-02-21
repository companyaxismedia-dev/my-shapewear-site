"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function ModalWrapper({ title, onClose, children }) {

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl relative">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
}
