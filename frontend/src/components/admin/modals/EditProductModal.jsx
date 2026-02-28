"use client";

import { X } from "lucide-react";
import { AddProductForm } from "@/app/admin/products/add/page";

export default function EditProductModal({
  open,
  product,
  onClose,
  onSave,
}) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] overflow-y-auto">
      <div className="bg-white min-h-screen w-full max-w-[1500px] mx-auto">

        {/* HEADER */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-50">
          <h2 className="text-lg font-semibold">Edit Product</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* FULL ADD PRODUCT FORM */}
        <div className="p-6">
          <AddProductForm
            mode="edit"
            initialData={product}
            onClose={onClose}
            onSuccess={onSave}
          />
        </div>

      </div>
    </div>
  );
}