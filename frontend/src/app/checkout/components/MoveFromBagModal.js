"use client";

import { X } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function MoveFromBagModal({
  isOpen,
  product,
  onClose,
  onRemove,
  onMoveToWishlist,
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-[420px] rounded-[28px] border border-[#ecd9de] bg-white shadow-[0_20px_60px_rgba(74,46,53,0.18)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f0e4e8] p-5">
          <div className="flex gap-3">
            <img
              src={`${API_BASE}${product.image}`}
              alt={product.name}
              className="h-20 w-16 rounded-[14px] object-cover"
            />
            <div>
              <h2 className="text-sm font-semibold text-[#4a2e35]">Move from Bag</h2>
              <p className="mt-1 text-sm text-[#8d727b]">
                Are you sure you want to move this item from bag?
              </p>
            </div>
          </div>

          <button onClick={onClose}>
            <X className="h-5 w-5 text-[#8d727b]" />
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="flex text-sm font-semibold">
          <button
            onClick={onRemove}
            className="flex-1 border-r border-[#f0e4e8] py-3 text-[#5a3c46]"
          >
            REMOVE
          </button>

          <button
            onClick={onMoveToWishlist}
            className="flex-1 py-3 text-[#c56f7f]"
          >
            MOVE TO WISHLIST
          </button>
        </div>
      </div>
    </div>
  );
}
