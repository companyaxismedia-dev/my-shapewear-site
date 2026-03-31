import axios from "axios"
import { API_BASE } from "@/lib/api"
import { toast } from "sonner"

export default function RefundModeSelect({
    orderId,
    reason,
    comment,
    refundMode,
    setRefundMode,
    next
}) {

    const handleCancel = async () => {

        try {

            const user = JSON.parse(localStorage.getItem("user"))
            const token = user?.token

            await axios.put(
                `${API_BASE}/api/orders/cancel/${orderId}`,
                {
                    reason,
                    comment,
                    refundMode
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            next()

        } catch (err) {

            console.log(err)
            toast.error("Cancellation failed")

        }

    }

    return (

        <div>

            <h2 className="text-lg font-semibold mb-4">
                Select Refund Mode
            </h2>

            <label className="flex gap-2 items-center">

                <input
                    type="radio"
                    value="Original"
                    checked={refundMode === "Original"}
                    onChange={(e) => setRefundMode(e.target.value)}
                />

                Original Payment Mode

            </label>

            <button
                onClick={handleCancel}
                className="mt-6 bg-orange-500 text-white px-4 py-2 rounded"
            >
                Request Cancellation
            </button>

        </div>

    )

}
