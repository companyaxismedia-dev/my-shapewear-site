"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { API_BASE } from "@/lib/api";

import { BankOfferSection } from "@/components/payment/BankOfferSection";
import { PaymentMethodsList } from "@/components/payment/PaymentMethodsList";
import { PaymentDetailsPanel } from "@/components/payment/PaymentDetailsPanel";
import { PriceDetailsSection } from "@/components/payment/PriceDetailsSection";

export default function PaymentPage() {
    const [selectedMethod, setSelectedMethod] = useState("cod");
    const [cartTotal, setCartTotal] = useState(0);

    /* 🔥 ADDRESS ID FROM CHECKOUT */
    const searchParams = useSearchParams();
    const addressId = searchParams.get("address");
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                if (!user?.token) return;

                const res = await fetch(`${API_BASE}/api/cart`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                const data = await res.json();

                const total =
                    data?.items?.reduce(
                        (sum, item) =>
                            sum +
                            (item.product?.minPrice || 0) * item.qty,
                        0
                    ) || 0;

                setCartTotal(total);

            } catch (err) {
                console.log(err);
            }
        };

        fetchCart();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ================= HEADER ================= */}
            <header className="sticky top-0 z-40 border-b bg-white">
                <div className="mx-auto flex h-[72px] max-w-[1100px] items-center justify-between px-4">

                    {/* Logo */}
                    <div className="text-2xl font-bold text-pink-500">M</div>

                    {/* Steps */}
                    <div className="hidden items-center gap-3 text-[13px] font-semibold tracking-[2px] uppercase sm:flex">
                        <span className="text-gray-500">Bag</span>
                        <span className="text-gray-400">----------</span>
                        <span className="text-gray-500">Address</span>
                        <span className="text-gray-400">----------</span>
                        <span className="text-emerald-600">Payment</span>
                    </div>

                    {/* Security */}
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

            {/* ================= MAIN ================= */}
            <main className="mx-auto max-w-[1100px] px-4 py-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* LEFT */}
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

                            {/* 🔥 BACKEND CONNECTED */}
                            <PaymentDetailsPanel
                                selectedMethod={selectedMethod}
                                selectedAddressId={addressId}
                                cartTotal={cartTotal}
                            />

                        </div>
                    </div>

                    {/* RIGHT */}
                    <div>
                        <PriceDetailsSection />
                    </div>

                </div>
            </main>
        </div>
    );
}