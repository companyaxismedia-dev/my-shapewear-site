import { useState } from "react";
import { X } from "lucide-react";

export default function ChangePhoneNumberModal({
    showChangePhone,
    setShowChangePhone,
    currentPhone,
    currentName,
    onPhoneChange,
}) {

    const [name, setName] = useState(currentName || "")
    const [phone, setPhone] = useState(currentPhone || "")
    const [alternatePhone, setAlternatePhone] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const validatePhone = (number) => {
        return /^[6-9]\d{9}$/.test(number)
    }

    const handleUpdate = async () => {

        setError("")

        if (!validatePhone(phone)) {
            setError("Enter a valid phone number")
            return
        }

        if (alternatePhone && !validatePhone(alternatePhone)) {
            setError("Enter a valid alternate phone")
            return
        }

        try {

            setLoading(true)

            if (onPhoneChange) {
                await onPhoneChange({
                    name,
                    primary: phone,
                    alternate: alternatePhone
                })
            }

            setLoading(false)
            setShowChangePhone(false)

        } catch (err) {

            setLoading(false)
            setError("Failed to update phone number")

        }
    }

    if (!showChangePhone) return null

    return (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-lg w-full max-w-md shadow-lg">

                {/* HEADER */}

                <div className="border-b border-gray-200 p-4 flex justify-between items-center">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Change or Add Number
                    </h2>

                    <button
                        onClick={() => setShowChangePhone(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* FORM */}

                <div className="p-6 space-y-4">

                    {/* NAME */}

                    <div>

                        <label className="text-sm text-gray-600 mb-1 block">
                            Receiver's name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />

                    </div>


                    {/* PHONE */}

                    <div>

                        <label className="text-sm text-gray-600 mb-1 block">
                            Receiver's phone number
                        </label>

                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="10-digit mobile number"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />

                    </div>


                    {/* ALTERNATE */}

                    <div>

                        <label className="text-sm text-gray-600 mb-1 block">
                            Alternate Phone Number
                        </label>

                        <input
                            type="tel"
                            value={alternatePhone}
                            onChange={(e) => setAlternatePhone(e.target.value)}
                            placeholder="Optional"
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />

                    </div>


                    {/* ERROR */}

                    {error && (
                        <p className="text-red-500 text-sm">
                            {error}
                        </p>
                    )}


                    {/* INFO */}

                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">

                        Delivery communications will be sent to these numbers

                    </div>


                    {/* BUTTON */}

                    <button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >

                        {loading ? "Please wait..." : "Update"}

                    </button>

                </div>

            </div>

        </div>

    )
}