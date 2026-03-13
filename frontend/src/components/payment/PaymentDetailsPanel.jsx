    "use client";

    import { useState } from "react";
    import { useRouter } from "next/navigation";
    import { ChevronDown, Eye, EyeOff } from "lucide-react";
    import { API_BASE } from "@/lib/api";

    /* ================= RAZORPAY LOADER ================= */
    const loadRazorpay = () => {
        return new Promise((resolve) => {

            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";

            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    const UPI_APPS = ["Google Pay", "PhonePe", "Paytm"];
    const BANKS = ["Axis Bank", "HDFC Bank", "ICICI Bank", "Kotak", "SBI"];

    export function PaymentDetailsPanel({
        selectedMethod,
        selectedAddressId,
        cartTotal,
        orderId
    }) {
        /* ================= COMMON STATES ================= */
        const [isProcessing, setIsProcessing] = useState(false);
        const [processingMessage, setProcessingMessage] = useState("");

        const [paymentSuccess, setPaymentSuccess] = useState(false);
        const [paymentFailed, setPaymentFailed] = useState(false);


        const router = useRouter();   // ⭐ ADD THIS

        /* ================= UPI ================= */
        const [upiMode, setUpiMode] = useState("scan");
        const [upiIdSelected, setUpiIdSelected] = useState(false);
        const [upiId, setUpiId] = useState("");

        /* ================= CARD ================= */
        const [cardNumber, setCardNumber] = useState("");
        const [cardName, setCardName] = useState("");
        const [cardExpiry, setCardExpiry] = useState("");
        const [cardCvv, setCardCvv] = useState("");
        const [cardError, setCardError] = useState("");
        const [showCvv, setShowCvv] = useState(false);

        /* ================= EMI ================= */
        const [selectedEmi, setSelectedEmi] = useState("");

        /* ================= NETBANK ================= */
        const [selectedBank, setSelectedBank] = useState("");

        /* ================= WALLET ================= */
        const [selectedWallet, setSelectedWallet] = useState("");

        /* ================= TOKEN ================= */
        const getToken = () => {
            const stored = JSON.parse(localStorage.getItem("user"));
            return stored?.token;
        };



        /* ================= RAZORPAY PAYMENT ================= */
        const handleRazorpayPayment = async (type) => {
            if (!cartTotal || cartTotal.sellingPrice <= 0) {
                alert("Invalid order amount");
                return;
            }

            const addressId =
                selectedAddressId || localStorage.getItem("selectedAddressId");

            const loaded = await loadRazorpay();

            if (!loaded) {
                alert("Razorpay SDK failed to load");
                return;
            }

            const token = getToken();

            /* create razorpay order */
            const orderRes = await fetch(`${API_BASE}/api/payment/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    amount: cartTotal.sellingPrice
                }),
            });

            const orderData = await orderRes.json();

            if (!orderData.success) {
                setPaymentFailed(true);
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.order.amount,
                currency: "INR",
                name: "Myntra Clone",
                description: `${type} Payment`,
                order_id: orderData.order.id,

                handler: async function (response) {
                    setProcessingMessage(`Processing ${type} Payment`);
                    setIsProcessing(true);

                    const verifyRes = await fetch(
                        `${API_BASE}/api/payment/verify`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(response),
                        }
                    );

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {

                        await fetch(`${API_BASE}/api/orders/update-payment/${currentOrderId}`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${getToken()}`
                            },
                            body: JSON.stringify({
                                paymentMethod: type,
                                paymentStatus: "Paid"
                            })
                        });



                        setIsProcessing(false);
                        router.push(`/order-success/${currentOrderId}`);

                    } else {
                        setIsProcessing(false);
                        setPaymentFailed(true);
                    }
                },

                theme: {
                    color: "#ff3f6c",
                },
            };

            const razor = new window.Razorpay(options);
            razor.open();
        };

        /* ================= PROCESSING ================= */
        const handlePaymentProcess = async (type) => {

            let currentOrderId = orderId;

    if (!currentOrderId) {

        const res = await fetch(`${API_BASE}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                addressId: selectedAddressId
            })
        });

        const data = await res.json();

        if (!data?.order) {
            alert("Order create failed");
            setIsProcessing(false);
            return;
        }

        currentOrderId = data.order._id;
    }

            const addressId =
                selectedAddressId || localStorage.getItem("selectedAddressId");

            setProcessingMessage(`Processing ${type} Payment`);
            setIsProcessing(true);

            await fetch(`${API_BASE}/api/orders/update-payment/${currentOrderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    paymentMethod: type,
                    paymentStatus: type === "COD" ? "Pending" : "Paid"
                })
            });

            setIsProcessing(false);
            router.push(`/order-success/${currentOrderId}`);
        };
        /* ================= CARD VALIDATION ================= */
        const validateCard = () => {
            if (!cardNumber || cardNumber.length < 13) {
                setCardError("Invalid Card Number");
                return false;
            }
            if (!cardName) {
                setCardError("Enter name on card");
                return false;
            }
            if (!cardExpiry || cardExpiry.length < 5) {
                setCardError("Invalid expiry");
                return false;
            }
            if (!cardCvv || cardCvv.length < 3) {
                setCardError("Invalid CVV");
                return false;
            }
            setCardError("");
            return true;
        };

        const formatCardNumber = (value) => {
            const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
            const parts = v.match(/.{1,4}/g);
            return parts ? parts.join(" ") : "";
        };

        /* ================= PROCESSING SCREEN ================= */
        if (isProcessing) {
            return (
                <div className="bg-white rounded-lg border p-8 min-h-[560px] flex flex-col items-center justify-center">
                    <div className="text-6xl mb-4">🅼</div>
                    <p className="text-xl font-bold text-[#282c3f]">
                        {processingMessage}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Please Wait...</p>
                </div>
            );
        }

        /* ================= SUCCESS SCREEN ================= */
        if (paymentSuccess) {
            return (
                <div className="bg-white rounded-lg border p-8 min-h-[560px] flex flex-col items-center justify-center">

                    <div className="text-6xl mb-3">✅</div>

                    <h2 className="text-2xl font-bold text-green-600">
                        Order Confirmed
                    </h2>

                    <p className="text-sm text-gray-500 mt-2 mb-6">
                        Your order has been placed successfully
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push("/")}
                            className="border px-6 py-3 rounded font-bold"
                        >
                            Continue Shopping
                        </button>

                        <button
                            onClick={() => router.push("/orders")}
                            className="bg-pink-500 text-white px-6 py-3 rounded font-bold"
                        >
                            View Order
                        </button>
                    </div>

                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg border p-4 sm:p-6 lg:p-8">
                {paymentFailed && (
                    <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded">
                        <p className="text-sm text-red-600 font-semibold">
                            Payment failed. Please try again.
                        </p>

                        <button
                            onClick={() => setPaymentFailed(false)}
                            className="mt-2 text-sm text-pink-500 font-bold"
                        >
                            Retry Payment
                        </button>
                    </div>
                )}

                {/* ================= COD ================= */}
                {selectedMethod === "cod" && (
                    <>
                        <h2 className="text-xl font-bold mb-6">
                            Cash On Delivery (Cash/UPI)
                        </h2>

                        <p className="text-sm text-gray-500 mb-6">
                            COD fee ₹10. Pay online to avoid this.
                        </p>

                        <button
                            onClick={() => handlePaymentProcess("COD")}
                            disabled={isProcessing}
                            className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold"
                        >
                            Place Order
                        </button>
                    </>
                )}

                {/* ================= UPI ================= */}
                {selectedMethod === "upi" && (
                    <>
                        <h2 className="text-xl font-bold mb-6">Pay using UPI</h2>

                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => {
                                    setUpiMode("scan");
                                    setUpiIdSelected(false);
                                }}
                                className={`flex-1 border rounded-lg py-3 ${upiMode === "scan"
                                    ? "border-pink-500 text-pink-500"
                                    : "border-gray-300"
                                    }`}
                            >
                                Scan & Pay
                            </button>

                            <button
                                onClick={() => setUpiMode("id")}
                                className={`flex-1 border rounded-lg py-3 ${upiMode === "id"
                                    ? "border-pink-500 text-pink-500"
                                    : "border-gray-300"
                                    }`}
                            >
                                Enter UPI ID
                            </button>
                        </div>

                        {upiMode === "scan" && (
                            <>
                                <div
                                    onClick={() => setUpiIdSelected(true)}
                                    className="border rounded-lg p-4 cursor-pointer mb-4 flex gap-3"
                                >
                                    <input type="radio" checked={upiIdSelected} readOnly />
                                    <span className="font-semibold">Scan & Pay</span>
                                </div>

                                {upiIdSelected && (
                                    <>
                                        <div className="border-2 border-dashed rounded-lg p-8 text-center mb-4">
                                            <img
                                                src="/cleaned_qr.png"
                                                alt="UPI QR"
                                                className="mx-auto w-44 h-44 object-contain"
                                            />
                                            <p className="text-sm mt-2">Scan QR using any UPI app</p>
                                        </div>

                                        <button
                                            onClick={() => handleRazorpayPayment("UPI")}
                                            className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold"
                                        >
                                            Pay Now
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        {upiMode === "id" && (
                            <>
                                <div className="space-y-2 mb-4">
                                    {UPI_APPS.map((app) => (
                                        <div key={app} className="border rounded-lg p-3">
                                            {app}
                                        </div>
                                    ))}
                                </div>

                                <input
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="example@upi"
                                    className="w-full border rounded-lg px-4 py-3 mb-4"
                                />

                                <button
                                    onClick={() => handleRazorpayPayment("UPI")}
                                    className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold"
                                >
                                    Pay Now
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* ================= CARD ================= */}
                {selectedMethod === "card" && (
                    <>
                        <h2 className="text-xl font-bold mb-6">Credit/Debit Card</h2>

                        {cardError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
                                {cardError}
                            </div>
                        )}

                        <input
                            value={cardNumber}
                            onChange={(e) =>
                                setCardNumber(formatCardNumber(e.target.value))
                            }
                            placeholder="Card Number"
                            className="w-full border rounded-lg px-4 py-3 mb-3"
                        />

                        <input
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="Name on card"
                            className="w-full border rounded-lg px-4 py-3 mb-3"
                        />

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <input
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="MM/YY"
                                className="border rounded-lg px-4 py-3"
                            />

                            <div className="relative">
                                <input
                                    type={showCvv ? "text" : "password"}
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                    placeholder="CVV"
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                                <button
                                    onClick={() => setShowCvv(!showCvv)}
                                    className="absolute right-3 top-3"
                                >
                                    {showCvv ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (validateCard()) handleRazorpayPayment("CARD");
                            }}
                            className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold"
                        >
                            Pay Now
                        </button>
                    </>
                )}

                {/* ================= WALLET ================= */}
                {selectedMethod === "wallet" && (
                    <>
                        <h2 className="text-xl font-bold mb-6">Select Wallet</h2>

                        {["Paytm", "Amazon Pay", "PhonePe Wallet"].map((w) => (
                            <button
                                key={w}
                                onClick={() => setSelectedWallet(w)}
                                className={`w-full border rounded-lg p-4 mb-3 text-left ${selectedWallet === w ? "border-pink-500" : ""
                                    }`}
                            >
                                {w}
                            </button>
                        ))}

                        {selectedWallet && (
                            <button
                                onClick={() => handlePaymentProcess("Wallet")}
                                className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold mt-4"
                            >
                                Pay Now
                            </button>
                        )}
                    </>
                )}

                {/* ================= EMI ================= */}
                {selectedMethod === "emi" && (
                    <>
                        <h2 className="text-xl font-bold mb-6">Select EMI Plan</h2>

                        {["3 Months", "6 Months", "9 Months", "12 Months"].map((emi) => (
                            <label key={emi} className="block border rounded-lg p-3 mb-2">
                                <input
                                    type="radio"
                                    checked={selectedEmi === emi}
                                    onChange={() => setSelectedEmi(emi)}
                                    className="mr-2"
                                />
                                {emi}
                            </label>
                        ))}

                        {selectedEmi && (
                            <button
                                onClick={() => handlePaymentProcess("EMI")}
                                className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold mt-4"
                            >
                                Pay Now
                            </button>
                        )}
                    </>
                )}

                {/* ================= NETBANK ================= */}
                {selectedMethod === "netbank" && (
                    <>
                        <h2 className="text-xl font-bold mb-6">Select Bank</h2>

                        {BANKS.map((bank) => (
                            <label key={bank} className="flex gap-3 border-b py-3">
                                <input
                                    type="radio"
                                    checked={selectedBank === bank}
                                    onChange={() => setSelectedBank(bank)}
                                />
                                {bank}
                            </label>
                        ))}

                        {selectedBank && (
                            <button
                                onClick={() => handlePaymentProcess("Net Banking")}
                                className="w-full bg-pink-500 text-white py-3 rounded-lg font-bold mt-4"
                            >
                                Pay Now
                            </button>
                        )}
                    </>
                )}

                {/* ================= FOOTER ================= */}
                <div className="mt-8 pt-6 border-t">
                    <p className="font-semibold text-sm">100% Secure</p>
                    <p className="text-xs text-gray-500">
                        We do not store/share your card details with any merchant
                    </p>
                </div>
            </div>
        );
    }