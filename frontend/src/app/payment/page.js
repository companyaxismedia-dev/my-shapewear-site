import { Suspense } from "react";
import PaymentPageContent from "./PaymentPageContent";

export default function PaymentPage(){
    return (
        <Suspense fallback={<div className="p-4 text-center">Loading payment details...</div>}>
            <PaymentPageContent />
        </Suspense>
    );
}