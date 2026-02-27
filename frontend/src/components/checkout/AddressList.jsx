"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/api";

export default function AddressList({
  addresses = [],
  selectedAddressId,
  onSelect,
  onEdit,
  onRemove,
  onRefresh,
}) {
  const [loadingId, setLoadingId] = useState(null);

  /* ================= TOKEN ================= */
  const getToken = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("user"));
      return stored?.token;
    } catch {
      return null;
    }
  };

  /* ================= SET DEFAULT ================= */
  const handleSetDefault = async (id, e) => {
    e.stopPropagation();

    try {
      setLoadingId(id);

      const token = getToken();

      await fetch(`${API_BASE}/api/users/address/default/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onRefresh && onRefresh();
    } catch (err) {
      console.error("Default update error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= EMPTY ================= */
  if (!addresses.length) {
    return (
      <div className="border border-dashed border-[#d4d5d9] p-6 text-center text-sm text-[#535766]">
        No address added yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((addr) => {
        const id = addr._id || addr.id;
        const selected = selectedAddressId === id;

        return (
          <div
            key={id}
            onClick={() => !selected && onSelect(id)}
            className={`border bg-white cursor-pointer rounded-[4px] transition-all duration-200 ${
              selected
                ? "border-[#d4d5d9]"
                : "border-[#eaeaec] hover:border-[#d4d5d9]"
            }`}
          >
            <div className="p-5">
              <div className="flex items-start gap-3">

                {/* RADIO */}
                <input
                  type="radio"
                  name="address"
                  checked={selected}
                  onChange={() => onSelect(id)}
                  className="w-4 h-4 mt-[3px] accent-[#ff3f6c]"
                />

                {/* CONTENT */}
                <div className="flex-1">

                  {/* NAME + TAG */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-[30px] text-[#282c3f] leading-[30px] md:text-[22px]">
                      {addr.fullName || addr.name}
                    </h3>

                    {(addr.addressType || addr.type) && (
                      <span className="text-[11px] font-bold text-[#03a685] border border-[#03a685] px-2 py-[1px] rounded-full uppercase">
                        {(addr.addressType || addr.type) === "WORK"
                          ? "OFFICE"
                          : (addr.addressType || addr.type)}
                      </span>
                    )}

                    {addr.isDefault && (
                      <span className="text-[10px] font-bold bg-[#fff1f4] text-[#ff3f6c] px-2 py-[2px] rounded-[10px] uppercase">
                        Default
                      </span>
                    )}
                  </div>

                  {/* ADDRESS */}
                  <p className="text-[13px] text-[#535766] leading-6">
                    {addr.addressLine || addr.address},{" "}
                    {addr.locality ? `${addr.locality}, ` : ""}
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>

                  {/* MOBILE */}
                  <p className="mt-2 text-[13px] font-semibold text-[#282c3f]">
                    Mobile: {addr.phone || addr.mobile}
                  </p>

                  {/* ONLY SELECTED ADDRESS */}
                  {selected && (
                    <>
                      <p className="mt-2 text-[12px] text-[#535766]">
                        • Cash on Delivery available
                      </p>

                      <div className="mt-3 flex gap-2 flex-wrap">

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(addr);
                          }}
                          className="h-9 px-4 rounded-md border border-[#282c3f] text-[#282c3f] text-[11px] font-bold uppercase hover:bg-[#282c3f] hover:text-white transition-all duration-200"
                        >
                          Edit
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemove?.(id);
                          }}
                          className="h-9 px-4 rounded-md border border-[#282c3f] text-[#282c3f] text-[11px] font-bold uppercase hover:bg-[#282c3f] hover:text-white transition-all duration-200"
                        >
                          Remove
                        </button>

                      </div>
                    </>
                  )}

                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}