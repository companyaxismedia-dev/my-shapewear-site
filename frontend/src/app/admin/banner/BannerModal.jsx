"use client";

import BannerForm from "./BannerForm";
import { toast } from "sonner";

export default function BannerModal({ open, onClose, onSubmit, initialData, loading, sections }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
      <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-[420px] sm:max-w-[520px] mx-2 md:mx-auto">
        <h2 className="text-lg font-semibold mb-2">{initialData ? "Edit Banner" : "Add Banner"}</h2>
        <BannerForm
          onSubmit={async (data) => {
            try {
              await onSubmit(data);
              toast.success(initialData ? "Banner updated!" : "Banner added!");
              onClose();
            } catch (err) {
              toast.error(err.message || "Failed to save banner");
            }
          }}
          initialData={initialData}
          loading={loading}
          sections={sections}
        />
        <button className="btn-muted mt-4 w-full" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
