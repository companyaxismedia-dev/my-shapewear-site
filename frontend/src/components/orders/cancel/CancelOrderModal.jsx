"use client"

import { useState } from "react"
import CancelReasonSelect from "./CancelReasonSelect"

import RefundModeSelect from "./RefundModeSelect"
import CancelSuccess from "./CancelSuccess"
import { useRouter } from "next/navigation";

export default function CancelOrderModal({ orderId, onClose, productImage, savedAmount }) {

    const [step, setStep] = useState(0)
    const [reason, setReason] = useState("")
    const [comment, setComment] = useState("")
    const [refundMode, setRefundMode] = useState("original")
    const router = useRouter();

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-[760px] rounded-md overflow-hidden relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-3 text-xl"
                >
                    ✕
                </button>
                {step === 0 && (

                    <div>

                        <div className="bg-[#f5f1e8] px-6 h-[96px] flex items-center justify-between">

                            <div className="flex items-center gap-4">

                                <div className="bg-blue-100 text-blue-600 w-10 h-10 flex items-center justify-center rounded-full font-bold">
                                    %
                                </div>

                                <p className="font-semibold text-[15px]">
                                    You saved ₹{savedAmount || 0} on this product!
                                </p>

                            </div>

                            <img
                                src={productImage || "/placeholder.jpg"}
                                className="w-[72px] h-[72px] object-cover rounded"
                            />

                        </div>

                        <div className="px-6 h-[84px] flex items-center text-gray-700 text-[14px] border-b">
                            If you cancel now, you may not be able to avail this deal again.
                            Do you still want to cancel?
                        </div>

                        <div className="flex text-[15px] h-[64px]">

                            <button
                                onClick={onClose}
                                className="flex-1 flex items-center justify-center border-r hover:bg-gray-50"
                            >
                                Don't cancel
                            </button>

                            <button
                                onClick={() => router.push(`/order/${orderId}/cancel`)}
                                className="flex-1 flex items-center justify-center text-blue-600 font-medium hover:bg-gray-50"
                            >
                                Cancel Order
                            </button>

                        </div>

                    </div>

                )}

                {step === 1 && (
                    <CancelReasonSelect
                        reason={reason}
                        setReason={setReason}
                        next={() => setStep(2)}
                    />
                )}

                
                

                {step === 3 && (
                    <RefundModeSelect
                        orderId={orderId}
                        reason={reason}
                        comment={comment}
                        refundMode={refundMode}
                        setRefundMode={setRefundMode}
                        next={() => setStep(4)}
                    />
                )}

                {step === 4 && (
                    <CancelSuccess />
                )}

            </div>

        </div>

    )

}