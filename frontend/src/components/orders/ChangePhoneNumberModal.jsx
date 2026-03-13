import { useState, useEffect } from "react";
import { X } from "lucide-react";


export default function ChangePhoneNumberModal({
    showChangePhone,
    setShowChangePhone,
    currentPhone,
    currentName,
    onPhoneChange,
    isPhoneEditable
}) {
    const [name, setName] = useState(currentName || "")
    const [phone, setPhone] = useState(currentPhone || "")
    const [alternatePhone, setAlternatePhone] = useState("")

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {

        if (showChangePhone) {

            setName(currentName || "")
            setPhone(currentPhone || "")
            setAlternatePhone("")
            setError("")

        }

    }, [showChangePhone, currentName, currentPhone])

    const validatePhone = (number) => {
    return /^[6-9]\d{9}$/.test(number)
}

useEffect(() => {

    const handleEsc = (e) => {
        if (e.key === "Escape") {
            setShowChangePhone(false)
        }
    }

    window.addEventListener("keydown", handleEsc)

    return () => {
        window.removeEventListener("keydown", handleEsc)
    }

}, [])

    const handleUpdate = async () => {

        if (loading) return
        setError("")

        if (!name || name.trim().length < 2) {
            setError("Enter receiver name")
            return
        }

        if (!validatePhone(phone)) {
            setError("Enter a valid phone number")
            return
        }

        if (alternatePhone && !validatePhone(alternatePhone)) {
            setError("Enter a valid alternate phone")
            return
        }

        if (alternatePhone && phone === alternatePhone) {
            setError("Alternate phone cannot be same as primary")
            return
        }

        try {

            setLoading(true)

            if (onPhoneChange) {
                await onPhoneChange({
                    name: name.trim(),
                    primary: phone,
                    alternate: alternatePhone
                })
            }

            setLoading(false)
            setError("")
            setShowChangePhone(false)

        } catch (err) {

            setLoading(false)
            setError("Failed to update phone number")

        }
    }

    if (!showChangePhone) return null

    return (

        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowChangePhone(false)}
        >

            <div
                className="bg-white rounded-lg w-full max-w-md shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >

                {/* HEADER */}

                <div className="border-b border-gray-200 p-4 flex justify-between items-center">

                    <h2 className="text-lg font-semibold text-gray-900">
                        Change or Add Number
                    </h2>

                    <button
                        onClick={() => {
                            setShowChangePhone(false)
                            setLoading(false)
                            setError("")
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* FORM */}



                <div className="p-6 space-y-4">
                    {!isPhoneEditable && (
                        <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 p-3 rounded-lg text-sm flex items-center gap-2">
                            ⚠ Phone number cannot be changed for this order
                        </div>
                    )}


                    {/* NAME */}

                    <div>

                        <label className="text-sm text-gray-600 mb-1 block">
                            Receiver's name
                        </label>

                        <input
                            disabled={!isPhoneEditable}
                            type="text"
                            value={name}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^a-zA-Z\s]/g, "")
                                setName(value)
                            }}
                            className="w-full border rounded-lg px-3 py-2 text-sm"
                        />

                    </div>


                    {/* PHONE */}

                    <div>

                        <label className="text-sm text-gray-600 mb-1 block">
                            Receiver's phone number
                        </label>

                        <input
                            disabled={!isPhoneEditable}
                            type="tel"
                            value={phone}
                            onChange={(e) => {

                                const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                                setPhone(value)

                            }}
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
                            disabled={!isPhoneEditable}
                            type="tel"
                            value={alternatePhone}
                            onChange={(e) => {

                                const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                                setAlternatePhone(value)

                            }}
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
                        disabled={loading || !isPhoneEditable}
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >

                        {loading ? "Please wait..." : "Update"}

                    </button>

                </div>


            </div>

        </div>

    )
}