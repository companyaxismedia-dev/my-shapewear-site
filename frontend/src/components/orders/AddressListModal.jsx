import axios from "axios";
import { useState } from "react";
import { X, Search } from "lucide-react";


export default function AddressListModal({
    showAddressList,
    setShowAddressList,
    addresses,
    setShowAddAddress,
    setEditAddress,
    onSelectAddress,
    isAddressEditable
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);

    const filteredAddresses = (addresses || []).filter((addr) => {
        const search = searchTerm.toLowerCase();

        return (
            addr.fullName?.toLowerCase().includes(search) ||
            addr.phone?.toLowerCase().includes(search) ||
            addr.addressLine?.toLowerCase().includes(search) ||
            addr.area?.toLowerCase().includes(search) ||
            addr.city?.toLowerCase().includes(search) ||
            addr.state?.toLowerCase().includes(search) ||
            addr.pincode?.toString().includes(search)
        );
    });

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

    const handleSelectAddress = async (address) => {

        if (!isAddressEditable) return

        if (onSelectAddress) {
            await onSelectAddress(address);
        }

        setShowAddressList(false);
        setShowSuccess(true);
    };

    if (!showAddressList && !showSuccess) return null;

    return (
        <>
            {showAddressList && !showSuccess && (
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
                        <div className="p-6 space-y-6">
                            {/* ADDRESS BLOCK WHEN NOT EDITABLE */}
                            {!isAddressEditable && addresses[0] && (

                                <>

                                    {/* WARNING */}
                                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm">
                                        ⚠ Address cannot be changed for this order
                                    </div>

                                    {/* ADDRESS CARD */}
                                    <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">

                                        <div className="text-gray-500 mt-1">
                                            🏠
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-900">Home</p>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                    Currently selected
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 mt-1">
                                                {addresses[0].addressLine}, {addresses[0].city}, {addresses[0].state} - {addresses[0].pincode}
                                            </p>

                                            <p className="text-sm text-gray-600 mt-1">
                                                {addresses[0].phone}
                                            </p>
                                        </div>

                                    </div>

                                </>
                            )}

                        </div>

                        {isAddressEditable && (
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
                        )}


                        {/* SAVED ADDRESSES SECTION */}
                        {isAddressEditable && (
                            <div className="p-4 border-b border-gray-200">

                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-900">Saved Addresses</h3>
                                    <button
                                        disabled={!isAddressEditable}
                                        onClick={() => {
                                            if (isAddressEditable) handleAddNew()
                                        }}
                                        className={`text-sm font-medium 
                               ${isAddressEditable
                                                ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                                                : "text-gray-400 cursor-not-allowed"
                                            }`}
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
                                                className={`border border-gray-200 rounded-lg p-3 
                                             ${isAddressEditable ? "hover:bg-gray-50 cursor-pointer" : "opacity-70 cursor-not-allowed"}`}
                                                onClick={() => handleSelectAddress(addr)}
                                            >
                                                <p className="font-medium text-gray-900">{addr.fullName}</p>

                                                <p className="text-sm text-gray-600 mt-1">
                                                    {addr.addressLine}, {addr.area && `${addr.area},`} {addr.city},{" "}
                                                    {addr.state} - {addr.pincode}
                                                </p>

                                                <p className="text-sm text-gray-600 mt-1">
                                                    {addr.phone}
                                                </p>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(addr);
                                                    }}
                                                    className="text-blue-600 text-sm font-medium mt-2"
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
                        )}
                    </div>
                </div>
            )}



            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999]">

                    <div className="bg-white rounded-2xl w-[380px] text-center shadow-2xl">

                        <div className="pt-8">
                            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100">
                                <span className="text-green-600 text-3xl">✓</span>
                            </div>
                        </div>

                        <div className="px-8 py-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Address Saved Successfully
                            </h2>

                            <p className="text-sm text-gray-500 mt-2">
                                Your delivery address has been updated.
                            </p>
                        </div>

                        <div className="border-t">
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="w-full py-3 text-blue-600 font-semibold hover:bg-gray-50 transition"
                            >
                                CONTINUE
                            </button>
                        </div>

                    </div>

                </div>
            )}

        </>
    );
}