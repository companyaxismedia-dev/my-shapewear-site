"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api";

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
      alert("Login required");
      return;
    }

    const formData = new FormData(e.target);

    const body = {
      fullName: formData.get("name"),
      phone: formData.get("mobile"),
      pincode: formData.get("pincode"),
      addressLine: formData.get("address"),
      locality: formData.get("locality"),
      city,
      state,
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
        alert(data.message || "Address save failed");
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
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 max-h-[65vh]">
        {/* CONTACT */}
        <div className="space-y-3">
          <p className="text-[12px] font-bold uppercase text-[#535766]">
            Contact Details
          </p>

          <input
            name="name"
            placeholder="Name*"
            defaultValue={editingAddress?.fullName}
            required
            className="w-full h-[44px] border px-3 text-sm rounded-sm"
          />

          <input
            name="mobile"
            placeholder="Mobile No*"
            defaultValue={editingAddress?.phone}
            required
            className="w-full h-[44px] border px-3 text-sm rounded-sm"
          />
        </div>

        {/* ADDRESS */}
        <div className="space-y-3">
          <p className="text-[12px] font-bold uppercase text-[#535766]">
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
              className="w-full h-[44px] border px-3 text-sm rounded-sm"
            />

            {pinLoading && (
              <p className="text-[11px] text-gray-500 mt-1">
                Checking pincode...
              </p>
            )}

            {pincodeError && (
              <p className="text-[11px] text-red-500 mt-1">{pincodeError}</p>
            )}
          </div>

          <input
            name="address"
            placeholder="House Number/Tower/Block*"
            defaultValue={editingAddress?.addressLine}
            required
            className="w-full h-[44px] border px-3 text-sm rounded-sm"
          />

          <input
            name="locality"
            placeholder="Locality / Building / Street*"
            defaultValue={editingAddress?.locality}
            required
            className="w-full h-[44px] border px-3 text-sm rounded-sm"
          />

          <div className="flex gap-3">
            <input
              value={city}
              readOnly
              placeholder="City"
              className="w-full h-[44px] border px-3 text-sm rounded-sm bg-gray-50"
            />

            <input
              value={state}
              readOnly
              placeholder="State"
              className="w-full h-[44px] border px-3 text-sm rounded-sm bg-gray-50"
            />
          </div>
        </div>

        {/* TYPE */}
        <div className="space-y-3">
          <p className="text-[12px] font-bold uppercase text-[#535766]">
            Save Address As
          </p>

          <div className="flex gap-6 text-sm">

            {/* HOME */}
            <label className="flex items-center gap-2 cursor-pointer">
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
            <label className="flex items-center gap-2 cursor-pointer">
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
            <label className="flex items-center gap-2 cursor-pointer">
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

          <label className="text-sm flex items-center gap-2 cursor-pointer">
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
      <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 border rounded-sm text-sm font-bold uppercase"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`flex-1 h-12 rounded-sm text-sm font-bold uppercase transition ${loading
              ? "bg-[#ff9bb3] cursor-not-allowed"
              : "bg-[#ff3f6c] hover:bg-[#ff527b] text-white"
            }`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
