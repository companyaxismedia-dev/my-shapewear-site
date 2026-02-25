"use client";

import { useState } from "react";

export default function AddressForm({
  editingAddress = null,
  onCancel,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const body = {
      fullName: formData.get("name"),
      phone: formData.get("mobile"),
      pincode: formData.get("pincode"),
      addressLine: formData.get("address"),
      locality: formData.get("locality"),
      city: formData.get("city"),
      state: formData.get("state"),
      type: formData.get("type"),
      isDefault: formData.get("isDefault") === "on",
    };

    try {
      setLoading(true);
      console.log(body);

      onSaved && onSaved();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">

      {/* ======================
          SCROLLABLE BODY
      ====================== */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 max-h-[65vh]">

        {/* CONTACT */}
        <div className="space-y-3">
          <p className="text-[12px] font-bold uppercase text-[#535766] tracking-wide">
            Contact Details
          </p>

          <input
            name="name"
            placeholder="Name*"
            defaultValue={editingAddress?.fullName}
            required
            className="w-full h-[44px] border border-[#d4d5d9] px-3 text-sm rounded-sm focus:outline-none focus:border-[#282c3f]"
          />

          <input
            name="mobile"
            placeholder="Mobile No*"
            defaultValue={editingAddress?.phone}
            required
            className="w-full h-[44px] border border-[#d4d5d9] px-3 text-sm rounded-sm focus:outline-none focus:border-[#282c3f]"
          />
        </div>

        {/* ADDRESS */}
        <div className="space-y-3">
          <p className="text-[12px] font-bold uppercase text-[#535766] tracking-wide">
            Address
          </p>

          <input
            name="pincode"
            placeholder="Pin Code*"
            defaultValue={editingAddress?.pincode}
            required
            className="w-full h-[44px] border border-[#d4d5d9] px-3 text-sm rounded-sm"
          />

          <input
            name="address"
            placeholder="House Number/Tower/Block*"
            defaultValue={editingAddress?.addressLine}
            required
            className="w-full h-[44px] border border-[#d4d5d9] px-3 text-sm rounded-sm"
          />

          <p className="text-[11px] font-semibold text-orange-500">
            *House Number will allow a doorstep delivery
          </p>

          <input
            name="locality"
            placeholder="Address (Locality, Building, Street)*"
            defaultValue={editingAddress?.locality}
            required
            className="w-full h-[44px] border border-[#d4d5d9] px-3 text-sm rounded-sm"
          />

          <p className="text-[11px] font-semibold text-orange-500">
            *Please update society/apartment details
          </p>

          <div className="flex gap-3">
            <input
              name="city"
              placeholder="City*"
              defaultValue={editingAddress?.city}
              required
              className="w-full h-[44px] border border-[#d4d5d9] px-3 text-sm rounded-sm"
            />

            <input
              name="state"
              placeholder="State*"
              defaultValue={editingAddress?.state}
              required
              className="w-full h-[44px] border border-[#d4d5d9] px-3 text-sm rounded-sm"
            />
          </div>
        </div>

        {/* TYPE */}
        <div className="space-y-3">
          <p className="text-[12px] font-bold uppercase text-[#535766] tracking-wide">
            Save Address As
          </p>

          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="type" value="HOME" defaultChecked />
              Home
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="type" value="WORK" />
              Work
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="isDefault" />
            Make this default address
          </label>
        </div>
      </div>

      {/* ======================
          FIXED FOOTER (MYNTRA STYLE)
      ====================== */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">

        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 border border-[#d4d5d9] rounded-sm text-sm font-bold uppercase text-[#282c3f]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-12 bg-[#ff3f6c] hover:bg-[#ff527b] text-white rounded-sm text-sm font-bold uppercase"
        >
          {loading ? "Saving..." : "Save"}
        </button>

      </div>
    </form>
  );
}