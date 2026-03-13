"use client";

import axios from "axios";
import { useState } from "react";
import { X, MapPin } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function ChangeAddressModal({
  showChangeAddress,
  setShowChangeAddress,
  setShowAddressList,
  order,
  refreshOrder,
  isAddressEditable
}) {

  const [loading, setLoading] = useState(false);

  if (!showChangeAddress) return null;

  const handleChangeAddress = () => {
    setShowChangeAddress(false);
    setShowAddressList(true);
  };

  const handleUseCurrent = async () => {

    if (loading) return;

    setLoading(true);
    try {

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;

      await axios.put(
        `${API_BASE}/api/orders/update-address/${order.id}`,
        {
          name: order.userInfo?.name,
          phone: order.userInfo?.phone,
          address: order.userInfo?.address,
          city: order.userInfo?.city,
          pincode: order.userInfo?.pincode
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (refreshOrder) {
        await refreshOrder();
      }

      setShowChangeAddress(false);

    } catch (err) {

      console.error("Address update error", err.response?.data || err.message);

    } finally {

      setLoading(false);

    }

  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">

      <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl">

        {/* HEADER */}
        <div className="border-b border-gray-200 px-6 py-5 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Change delivery address
          </h2>

          <button
            onClick={() => setShowChangeAddress(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          {!isAddressEditable && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm">
              ⚠ Address cannot be changed for this order
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-1">Deliver to</p>
            <p className="font-semibold text-gray-900 text-lg">
              {order?.recipientName}
            </p>
          </div>

          {/* ADDRESS CARD */}
          <div className="flex gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4">

            <MapPin className="text-gray-400 mt-1" size={20} />

            <div className="text-sm text-gray-700 leading-relaxed">

              <p className="font-medium text-gray-900">
                {order?.deliveryAddress?.address}
              </p>

              <p className="text-gray-600 mt-1">
                {order?.deliveryAddress?.city},{" "}
                {order?.deliveryAddress?.state} -{" "}
                {order?.deliveryAddress?.pincode}
              </p>

              <p className="text-gray-700 mt-2 font-medium">
                {order?.recipientPhone}
              </p>

            </div>

          </div>

          {/* BUTTONS */}

          <div className="flex gap-3">

            <button
              onClick={handleUseCurrent}
              disabled={loading || !isAddressEditable}
              className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
            >
              {loading ? "Updating..." : "Use this address"}
            </button>

            <button
              onClick={handleChangeAddress}
              disabled={!isAddressEditable}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Select another
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}