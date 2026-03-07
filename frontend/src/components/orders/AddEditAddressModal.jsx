"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function AddEditAddressModal({
    showAddAddress,
    setShowAddAddress,
    editAddress,
    setEditAddress,
    refreshAddresses,
    onAddressSaved
}) {

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        phone: "",
        landmark: "",
        addressType: "HOME"

    });

    const [loading, setLoading] = useState(false)

    /* ================= EDIT ADDRESS LOAD ================= */

    useEffect(() => {

        if (editAddress) {

            setFormData({
                name: editAddress.name || "",
                address: editAddress.address || "",
                area: editAddress.area || "",
                city: editAddress.city || "",
                state: editAddress.state || "",
                pincode: editAddress.pincode || "",
                phone: editAddress.phone || "",
                landmark: editAddress.landmark || "",
                addressType: editAddress.addressType || "HOME",

            })

        } else {

            setFormData({
                name: "",
                address: "",
                area: "",
                city: "",
                state: "",
                pincode: "",
                phone: "",
                landmark: "",
                addressType: "HOME"

            })

        }

    }, [editAddress, showAddAddress])


    /* ================= INPUT CHANGE ================= */

    const handleChange = (e) => {

        const { name, value } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

    }


    /* ================= SAVE ADDRESS ================= */

    const handleSave = async () => {

        const user = JSON.parse(localStorage.getItem("user"))
        const token = user?.token

        if (!token) {
            alert("Please login first")
            return
        }

        if (
            !formData.name ||
            !formData.phone ||
            !formData.address ||
            !formData.city ||
            !formData.state ||
            !formData.pincode
        ) {
            alert("Please fill all required fields")
            return
        }

        setLoading(true)

        try {

            let res;

            if (!editAddress) {

                res = await axios.post(
                    `${API_BASE}/api/users/address`,
                    {
                        fullName: formData.name,
                        phone: formData.phone,
                        pincode: formData.pincode,
                        city: formData.city,
                        state: formData.state,
                        addressLine: formData.address,
                        landmark: formData.landmark,
                        addressType: formData.addressType
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

            } else {

                res = await axios.put(
                    `${API_BASE}/api/users/address/${editAddress._id}`,
                    {
                        fullName: formData.name,
                        phone: formData.phone,
                        pincode: formData.pincode,
                        city: formData.city,
                        state: formData.state,
                        addressLine: formData.address,
                        landmark: formData.landmark,
                        addressType: formData.addressType
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

            }

            if (refreshAddresses) {
                refreshAddresses()
            }

            if (onAddressSaved) {

                const savedAddress = res.data.address || res.data

                onAddressSaved(savedAddress)

            }

            alert("Address saved successfully")

            setShowAddAddress(false)
            setEditAddress(null)

        } catch (err) {

            console.error("Address save error", err.response?.data || err.message)
            alert(err.response?.data?.message || "Failed to save address")

        } finally {

            setLoading(false)

        }

    }


    if (!showAddAddress) return null


    return (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">

            <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl">

                {/* HEADER */}

                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">

                    <h2 className="text-lg font-semibold text-gray-900">
                        {editAddress ? "Edit Address" : "Add New Address"}
                    </h2>

                    <button
                        onClick={() => {
                            setShowAddAddress(false)
                            setEditAddress(null)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* FORM */}

                <div className="p-8 max-h-[70vh] overflow-y-auto">

                    {/* NAME */}

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Name *
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>


                    {/* PHONE */}

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Phone *
                        </label>

                        <input
                            type="tel"
                            name="phone"
                            maxLength={10}
                            pattern="[0-9]{10}"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10 digit mobile number"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>


                    {/* CITY */}

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            City *
                        </label>

                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Enter city"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>


                    {/* ADDRESS */}

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Address *
                        </label>

                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="House No., Building Name"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>


                    {/* AREA */}

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Area
                        </label>

                        <input
                            type="text"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            placeholder="Road name, Area, Colony"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>


                    {/* STATE + PINCODE */}

                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                State *
                            </label>

                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Pincode *
                            </label>

                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="Pincode"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                    </div>


                    {/* LANDMARK */}

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Landmark
                        </label>

                        <input
                            type="text"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleChange}
                            placeholder="Near temple, school etc"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* ADDRESS TYPE */}

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Address Type
                        </label>

                        <div className="flex gap-3">

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, addressType: "HOME" })}
                                className={`px-4 py-2 rounded border text-sm ${formData.addressType === "HOME"
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-gray-300 text-gray-600"
                                    }`}
                            >
                                Home
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, addressType: "WORK" })}
                                className={`px-4 py-2 rounded border text-sm ${formData.addressType === "WORK"
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-gray-300 text-gray-600"
                                    }`}
                            >
                                Work
                            </button>

                        </div>
                    </div>


                    {/* SAVE BUTTON */}

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition mt-6 disabled:opacity-50"
                    >
                        {loading ? "Saving Address..." : "SAVE ADDRESS"}
                    </button>

                </div>

            </div>

        </div>

    )

}