"use client";

import { useAccount } from "@/hooks/useAccount";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function MyAddressBook() {
  const { addresses, addAddress, deleteAddress } = useAccount();

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    label: "Home",
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= SAVE TO BACKEND ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.name &&
      formData.phone &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.pincode
    ) {
      await addAddress(formData); // backend call

      setFormData({
        label: "Home",
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });

      setIsAdding(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          My Address Book
        </h2>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
        >
          <Plus size={18} /> Add Address
        </button>
      </div>

      {/* FORM */}
      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="text-sm text-gray-600 font-medium mb-2 block">
                Address Label
              </label>

              <select
                name="label"
                value={formData.label}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option>Home</option>
                <option>Office</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />

              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-pink-600 text-white py-2 rounded-lg font-semibold"
              >
                Save Address
              </button>

              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-gray-300 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADDRESS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses?.map((addr) => (
          <div
            key={addr._id}   // 🔥 backend id
            className="bg-gray-50 rounded-lg p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800">
                  {addr.label || "Address"} - {addr.fullName}
                </h3>
                <p className="text-sm text-gray-600">{addr.phone}</p>
              </div>

              <button
                onClick={() => deleteAddress(addr._id)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <p className="text-sm text-gray-700 mb-2">
              {addr.addressLine}
            </p>

            <p className="text-sm text-gray-600">
              {addr.city}, {addr.state} {addr.pincode}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}