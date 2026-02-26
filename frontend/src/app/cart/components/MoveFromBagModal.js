"use client";

import { X } from "lucide-react";

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
      <div className="relative bg-white w-[420px] rounded-md shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b">
          <div className="flex gap-3">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-20 object-cover rounded"
            />
            <div>
              <h2 className="font-semibold text-sm">Move from Bag</h2>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to move this item from bag?
              </p>
            </div>
          </div>

          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="flex text-sm font-semibold">
          <button
            onClick={onRemove}
            className="flex-1 py-3 border-r hover:bg-gray-50"
          >
            REMOVE
          </button>

          <button
            onClick={onMoveToWishlist}
            className="flex-1 py-3 text-pink-500 hover:bg-pink-50"
          >
            MOVE TO WISHLIST
          </button>
        </div>
      </div>
    </div>
  );
}