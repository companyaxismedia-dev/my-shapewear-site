import axios from "axios";
import { useState } from "react";
import { X, Search } from "lucide-react";
import { useEffect } from "react";
import { API_BASE } from "@/lib/api";

export default function AddressListModal({
    showAddressList,
    setShowAddressList,
    addresses,
    setShowAddAddress,
    setEditAddress,
    onSelectAddress,
})
{
    const [searchTerm, setSearchTerm] = useState("");

    

    

    const filteredAddresses = addresses.filter(
        (addr) =>
            addr.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            addr.addressLine?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddNew = () => {
        setEditAddress(null);
        setShowAddAddress(true);
        setShowAddressList(false);
    };

    const handleEdit = (address) => {
        setEditAddress(address);
        setShowAddAddress(true);
        setShowAddressList(false);
    };

    const handleSelectAddress = (address) => {
        if (onSelectAddress) {
            onSelectAddress(address);
        }
        setShowAddressList(false);
    };

    if (!showAddressList) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl shadow-lg max-h-[90vh] overflow-y-auto">
                {/* HEADER */}
                <div className="border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 bg-white">
                    <h2 className="text-lg font-semibold text-gray-900">Delivery address</h2>
                    <button
                        onClick={() => setShowAddressList(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* SEARCH */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by area, street name, PIN code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>



                {/* SAVED ADDRESSES SECTION */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Saved Addresses</h3>
                        <button
                            onClick={handleAddNew}
                            className="text-blue-600 text-sm font-medium hover:text-blue-700"
                        >
                            + Add new
                        </button>
                    </div>

                    {/* ADDRESS LIST */}
                    <div className="space-y-3">
                        {filteredAddresses && filteredAddresses.length > 0 ? (
                            filteredAddresses.map((addr) => (
                                <div
                                    key={addr._id}
                                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleSelectAddress(addr)}
                                >
                                    <p className="font-medium text-gray-900">{addr.fullName}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {addr.addressLine}, {addr.area && `${addr.area},`} {addr.city},{" "}
                                        {addr.state} - {addr.pincode}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">{addr.phone}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(addr);
                                        }}
                                        className="text-blue-600 text-sm font-medium hover:text-blue-700 mt-2"
                                    >
                                        Edit
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                                No addresses found
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
