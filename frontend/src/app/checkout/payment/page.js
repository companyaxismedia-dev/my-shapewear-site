"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { API_BASE } from "@/lib/api";

import { BankOfferSection } from "@/components/payment/BankOfferSection";
import { PaymentMethodsList } from "@/components/payment/PaymentMethodsList";
import { PaymentDetailsPanel } from "@/components/payment/PaymentDetailsPanel";
import { PriceDetailsSection } from "@/components/payment/PriceDetailsSection";
import CheckoutStepper from "../components/CheckoutStepper";

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="bg-[var(--color-bg)] p-10 text-center text-sm text-[#8d727b]">Loading payments.......</div>}>
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
        <div className="min-h-screen bg-[var(--color-bg-alt)] text-[#4a2e35]">
            <CheckoutStepper currentStep="payment" />

            <main className="container-imkaa px-4 py-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    <div className="space-y-6 lg:col-span-2">

                        <BankOfferSection />

                        <h2 className="text-2xl font-semibold text-[#4a2e35]">
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
