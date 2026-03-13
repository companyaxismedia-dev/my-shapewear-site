"use client";

import axios from "axios";
import { API_BASE } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useOrders } from "@/context/OrderContext";
import CancelReasonSelect from "@/components/orders/cancel/CancelReasonSelect";
import AddressListModal from "@/components/orders/AddressListModal";
import AddEditAddressModal from "@/components/orders/AddEditAddressModal";
import ChangePhoneNumberModal from "@/components/orders/ChangePhoneNumberModal";




export default function CancelPage() {

    const { id } = useParams();
    const { fetchOrderById } = useOrders();
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [reason, setReason] = useState("");
    const [comment, setComment] = useState("");
    const [showAddressList, setShowAddressList] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [editAddress, setEditAddress] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [showChangePhone, setShowChangePhone] = useState(false);

    const handleCancel = async () => {

        try {

            const user = JSON.parse(localStorage.getItem("user"));
            const token = user?.token;

            await axios.put(
                `${API_BASE}/api/orders/cancel/${id}`,
                {
                    cancelReason: reason,
                    cancelComment: comment
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Order cancelled successfully");

        } catch (err) {
            console.error("Cancel error", err);
        }

    };
    const [step, setStep] = useState(1)

    useEffect(() => {
        fetchOrderById(id).then(setOrder);
    }, [id]);

    useEffect(() => {

        const fetchAddresses = async () => {

            try {

                const user = JSON.parse(localStorage.getItem("user"))
                const token = user?.token

                if (!token) return

                const res = await axios.get(
                    `${API_BASE}/api/users/address`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                setAddresses(res.data.addresses)

            } catch (err) {

                console.error("Address fetch error", err)

            }

        }

        fetchAddresses()

    }, [])

    if (!order) return null;

    return (

        <>

            <div className="min-h-screen bg-gray-50 py-10">

                <div className="max-w-6xl mx-auto grid grid-cols-[1fr_320px] gap-8">

                    {/* LEFT SECTION */}

                    <div className="bg-white border border-gray-200 rounded">

                        <div className="bg-pink-600 text-white px-6 py-3 font-semibold rounded-t">
                            1 EASY CANCELLATION
                        </div>

                        <div className="p-6 space-y-6">


                            {step === 1 && (

                                <CancelReasonSelect
                                    reason={reason}
                                    setReason={setReason}
                                />

                            )}
                            {/* SUGGESTED ACTION */}

                            {reason === "I want to change the delivery address" && (
                                <div className="bg-blue-50 border border-blue-200 p-5 rounded">
                                    <p className="font-medium text-gray-800 mb-2">
                                        You can change the address
                                    </p>

                                    <button
                                        onClick={() => setShowAddressList(true)}
                                        className="bg-white border px-6 py-3 rounded hover:bg-gray-50"
                                    >
                                        Yes, change my address
                                    </button>
                                </div>
                            )}

                            {reason === "I want to change the contact details" && (
                                <div className="bg-blue-50 border border-blue-200 p-5 rounded">
                                    <p className="font-medium text-gray-800 mb-2">
                                        You can change the phone number
                                    </p>

                                    <button
                                        onClick={() => setShowChangePhone(true)}
                                        className="bg-white border px-6 py-3 rounded hover:bg-gray-50"
                                    >
                                        Yes, change my phone number
                                    </button>
                                </div>
                            )}

                            {reason === "I want to change the payment option" && (
                                <div className="bg-blue-50 border border-blue-200 p-5 rounded">
                                    <p className="font-medium text-gray-800 mb-2">
                                        You can change the payment method
                                    </p>

                                    <button
                                        onClick={() => router.push(`/payment?order=${id}`)}
                                        className="bg-white border px-6 py-3 rounded hover:bg-gray-50"
                                    >
                                        Yes, change payment mode
                                    </button>
                                </div>
                            )}

                            {/* Comment */}

                            <div>

                                <p className="text-sm mb-2 font-medium">
                                    Comments *
                                </p>

                                {step === 1 && (

                                    <>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="border border-gray-300 w-full px-4 py-3 rounded h-32 outline-none focus:border-pink-500"
                                            placeholder="eg: Item not required anymore."
                                        />

                                        <button
                                            disabled={!reason || !comment}
                                            onClick={() => {

                                                if (reason === "I want to change the delivery address") {
                                                    setShowAddressList(true)
                                                    return
                                                }

                                                if (reason === "I want to change the contact details") {
                                                    setShowChangePhone(true)
                                                    return
                                                }

                                                if (reason === "I want to change the payment option") {
                                                    router.push(`/payment?order=${id}`)
                                                    return
                                                }

                                                setStep(2)

                                            }}
                                            className={`px-8 py-3 rounded font-medium
                                                 ${!reason || !comment
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-pink-600 text-white hover:bg-pink-700"}
                                          `}
                                        >
                                            CONTINUE
                                        </button>

                                    </>

                                )}

                                {step === 2 && (

                                    <div className="border rounded p-6">

                                        <h2 className="font-semibold mb-4">
                                            Select a Mode of Refund
                                        </h2>

                                        <label className="flex items-center gap-3 mb-4">
                                            <input type="radio" defaultChecked />
                                            Original Payment Mode
                                        </label>

                                        <button
                                            onClick={handleCancel}
                                            className="bg-orange-500 text-white px-6 py-3 rounded"
                                        >
                                            REQUEST CANCELLATION
                                        </button>

                                    </div>

                                )}

                            </div>



                        </div>

                    </div>


                    {/* RIGHT ITEM BOX */}

                    <div className="bg-white border border-gray-200 rounded p-5 h-fit">

                        <p className="text-gray-600 text-sm font-medium mb-4">
                            ITEM DETAILS
                        </p>

                        <div className="flex gap-4">

                            <img
                                src={order.items[0].img}
                                className="w-20 h-20 object-cover rounded"
                            />

                            <div className="flex flex-col">

                                <p className="text-sm font-medium leading-snug">
                                    {order.items[0].name}
                                </p>

                                <p className="text-gray-500 text-sm mt-1">
                                    Qty: {order.items[0].quantity}
                                </p>

                                <p className="text-lg font-semibold mt-2">
                                    ₹{order.items[0].price}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <AddressListModal
                showAddressList={showAddressList}
                setShowAddressList={setShowAddressList}
                addresses={addresses}
                setShowAddAddress={setShowAddAddress}
                setEditAddress={setEditAddress}
            />
            <ChangePhoneNumberModal
                showChangePhone={showChangePhone}
                setShowChangePhone={setShowChangePhone}
            />
            <AddEditAddressModal
                showAddAddress={showAddAddress}
                setShowAddAddress={setShowAddAddress}
                editAddress={editAddress}
                setEditAddress={setEditAddress}
            />



        </>

    );

}