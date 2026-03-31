"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";
import { ButtonLoaderLabel, InlineSpinner } from "@/components/loaders/Loaders";
import { toast } from "sonner";

export default function AddressForm({
  editingAddress = null,
  onCancel,
  onSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const [city, setCity] = useState(editingAddress?.city || "");
  const [state, setState] = useState(editingAddress?.state || "");
  const [pincodeError, setPincodeError] = useState("");

  useEffect(() => {
    if (editingAddress) {
      setCity(editingAddress.city || "");
      setState(editingAddress.state || "");
    }
  }, [editingAddress]);
  /* ================= TOKEN ================= */
  const getToken = () => {
    const stored = JSON.parse(localStorage.getItem("user"));
    return stored?.token;
  };

  /* =====================================================
     AUTO PINCODE → CITY/STATE (INDIA POST API STYLE)
  ===================================================== */
  const handlePincodeChange = async (value) => {
    if (value.length !== 6) {
      setPincodeError("");
      return;
    }

    try {
      setPinLoading(true);
      setPincodeError("");

      const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);

      const data = await res.json();

      if (data?.[0]?.Status === "Success" && data?.[0]?.PostOffice?.length) {
        const office = data[0].PostOffice[0];
        setCity(office.District || "");
        setState(office.State || "");
      } else {
        setCity("");
        setState("");
        setPincodeError("Invalid pincode");
      }
    } catch {
      setPincodeError("Pincode check failed");
    } finally {
      setPinLoading(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      toast.error("Login required");
      return;
    }

    const formData = new FormData(e.target);

    const body = {
      fullName: formData.get("name"),
      phone: formData.get("mobile"),
      altPhone: formData.get("altPhone") || "",
      pincode: formData.get("pincode"),
      city,
      state,
      addressLine: formData.get("address"),
      landmark: formData.get("landmark") || "",
      addressType: formData.get("type"),
      isDefault: formData.get("isDefault") === "on",
    };

    try {
      setLoading(true);

      const url = editingAddress
        ? `${API_BASE}/api/users/address/${editingAddress._id}`
        : `${API_BASE}/api/users/address`;

      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Address save failed");
        return;
      }

      /* 🔥 MYNTRA FLOW */
      onSaved && onSaved(data.addresses || []);

      // smooth close feeling
      setTimeout(() => {
        onCancel && onCancel();
      }, 150);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* BODY */}
      <div className="max-h-[65vh] flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {/* CONTACT */}
        <div className="space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6f6167]">
            Contact Details
          </p>

          <input
            name="name"
            placeholder="Name*"
            defaultValue={editingAddress?.fullName}
            required
            className="h-[46px] w-full rounded-[4px] border border-[#ded4d8] bg-white px-3 text-sm text-[#2f2428] outline-none transition focus:border-[#b27b86]"
          />

          <input
            name="mobile"
            placeholder="Mobile No*"
            defaultValue={editingAddress?.phone}
            required
            className="h-[46px] w-full rounded-[4px] border border-[#ded4d8] bg-white px-3 text-sm text-[#2f2428] outline-none transition focus:border-[#b27b86]"
          />
        </div>

        {/* ADDRESS */}
        <div className="space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6f6167]">
            Address
          </p>

          <div>
            <input
              name="pincode"
              placeholder="Pin Code*"
              defaultValue={editingAddress?.pincode}
              required
              maxLength={6}
              onChange={(e) => handlePincodeChange(e.target.value)}
              className="h-[46px] w-full rounded-[4px] border border-[#ded4d8] bg-white px-3 text-sm text-[#2f2428] outline-none transition focus:border-[#b27b86]"
            />

            {pinLoading && (
              <p className="mt-1 inline-flex items-center gap-2 text-[11px] text-[#8d727b]">
                <InlineSpinner className="h-3.5 w-3.5" />
                Checking pincode...
              </p>
            )}

            {pincodeError && (
              <p className="mt-1 text-[11px] text-[#c45c75]">{pincodeError}</p>
            )}
          </div>

          <input
            name="address"
            placeholder="House Number/Tower/Block*"
            defaultValue={editingAddress?.addressLine}
            required
            className="h-[46px] w-full rounded-[4px] border border-[#ded4d8] bg-white px-3 text-sm text-[#2f2428] outline-none transition focus:border-[#b27b86]"
          />

          <input
            name="landmark"
            placeholder="Landmark (optional)"
            defaultValue={editingAddress?.landmark}
            className="h-[46px] w-full rounded-[4px] border border-[#ded4d8] bg-white px-3 text-sm text-[#2f2428] outline-none transition focus:border-[#b27b86]"
          />

          <input
            name="altPhone"
            placeholder="Alternate Phone (optional)"
            defaultValue={editingAddress?.altPhone}
            className="h-[46px] w-full rounded-[4px] border border-[#ded4d8] bg-white px-3 text-sm text-[#2f2428] outline-none transition focus:border-[#b27b86]"
          />

          <div className="flex gap-3">
            <input
              value={city}
              readOnly
              placeholder="City"
              className="h-[46px] w-full rounded-[4px] border border-[#e4dde0] bg-[#faf7f8] px-3 text-sm text-[#6f6167] outline-none"
            />

            <input
              value={state}
              readOnly
              placeholder="State"
              className="h-[46px] w-full rounded-[4px] border border-[#e4dde0] bg-[#faf7f8] px-3 text-sm text-[#6f6167] outline-none"
            />
          </div>
        </div>

        {/* TYPE */}
        <div className="space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6f6167]">
            Save Address As
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-[#4a3c42]">

            {/* HOME */}
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#ddd4d8] px-3 py-2">
              <input
                type="radio"
                name="type"
                value="HOME"
                defaultChecked={
                  !editingAddress ||
                  editingAddress?.addressType === "HOME"
                }
              />
              Home
            </label>

            {/* OFFICE */}
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#ddd4d8] px-3 py-2">
              <input
                type="radio"
                name="type"
                value="OFFICE"
                defaultChecked={
                  editingAddress?.addressType === "OFFICE"
                }
              />
              Office
            </label>

            {/* OTHER */}
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-[#ddd4d8] px-3 py-2">
              <input
                type="radio"
                name="type"
                value="OTHER"
                defaultChecked={
                  editingAddress?.addressType === "OTHER"
                }
              />
              Other
            </label>

          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#4a3c42]">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={editingAddress?.isDefault}
            />
            Make default address
          </label>
        </div>
      </div>

      {/* FOOTER */}
      <div className="sticky bottom-0 flex gap-3 border-t border-[#f0e4e8] bg-white p-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-12 flex-1 rounded-[4px] border border-[#d8cbd0] text-sm font-semibold uppercase tracking-[0.03em] text-[#4a3c42] transition hover:border-[#b27b86] hover:text-[#b27b86]"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`flex-1 h-12 rounded-sm text-sm font-bold uppercase transition ${loading
              ? "cursor-not-allowed bg-[#d8b9c1] text-white"
              : "bg-[#b27b86] text-white hover:bg-[#9f6571]"
            }`}
        >
          {loading ? <ButtonLoaderLabel label="Saving..." /> : "Save"}
        </button>
      </div>
    </form>
  );
}
