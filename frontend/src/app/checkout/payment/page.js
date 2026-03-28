"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { API_BASE } from "@/lib/api";

import { BankOfferSection } from "@/components/payment/BankOfferSection";
import { PaymentMethodsList } from "@/components/payment/PaymentMethodsList";
import { PaymentDetailsPanel } from "@/components/payment/PaymentDetailsPanel";
import { PriceDetailsSection } from "@/components/payment/PriceDetailsSection";

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading payments.......</div>}>
            <PaymentPageContent />
        </Suspense>
    )
}


function PaymentPageContent() {
    const [selectedMethod, setSelectedMethod] = useState("cod");
    const [cartTotal, setCartTotal] = useState({
        totalMrp: 0,
        sellingPrice: 0,
        discount: 0,
    });
    const searchParams = useSearchParams();
    const addressId = searchParams.get("address");
    const orderId = searchParams.get("order");
    const [createdOrderId, setCreatedOrderId] = useState(null);

    const finalOrderId = orderId || createdOrderId;

    useEffect(() => {

        const fetchOrder = async () => {

            try {

                const user = JSON.parse(localStorage.getItem("user") || "{}");

                if (!user?.token || !finalOrderId) return;

                const res = await fetch(`${API_BASE}/api/orders/${finalOrderId}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                const data = await res.json();
                console.log("ORDER DATA:", data);

                if (!data?.order) return;

                setCartTotal({
                    totalMrp: data.order.listingPrice || 0,
                    sellingPrice: data.order.totalAmount || 0,
                    discount: data.order.discount || 0,
                });
            } catch (err) {
                console.log(err);
            }

        };

        fetchOrder();

    }, [finalOrderId]);
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="sticky top-0 z-40 border-b bg-white">
                <div className="mx-auto flex h-[72px] max-w-[1100px] items-center justify-between px-4">

                    {/* Logo */}
                    <div className="text-2xl font-bold text-pink-500">M</div>

                    <div className="hidden items-center gap-3 text-[13px] font-semibold tracking-[2px] uppercase sm:flex">
                        <span className="text-gray-500">Bag</span>
                        <span className="text-gray-400">----------</span>
                        <span className="text-gray-500">Address</span>
                        <span className="text-gray-400">----------</span>
                        <span className="text-emerald-600">Payment</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold tracking-[2px] uppercase">
                        <svg
                            className="h-4 w-4 text-emerald-600"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                        </svg>
                        <span className="text-gray-800">100% Secure</span>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1100px] px-4 py-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    <div className="space-y-6 lg:col-span-2">

                        <BankOfferSection />

                        <h2 className="text-xl font-bold text-gray-900">
                            Choose Payment Mode
                        </h2>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                            <PaymentMethodsList
                                selectedMethod={selectedMethod}
                                onMethodChange={setSelectedMethod}
                            />

                            <PaymentDetailsPanel
                                selectedMethod={selectedMethod}
                                selectedAddressId={addressId}
                                cartTotal={cartTotal}
                                orderId={finalOrderId}
                                setCreatedOrderId={setCreatedOrderId}
                            />

                        </div>
                    </div>

                    <div>
                        <PriceDetailsSection
                            itemCount={1}
                            totalMrp={cartTotal.totalMrp}
                            sellingPrice={cartTotal.sellingPrice}
                            discount={cartTotal.discount}
                            platformFee={23}
                            codFee={selectedMethod === "cod" ? 10 : 0}
                        />
                    </div>

                </div>
            </main>
        </div>
    );

}