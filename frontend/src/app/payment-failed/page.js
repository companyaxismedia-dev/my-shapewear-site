"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Clock3, RefreshCw, ShoppingBag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const reason = searchParams.get("reason") || "failed";
  const isCancelled = reason === "cancelled";

  const title = isCancelled ? "Payment was cancelled" : "Payment could not be confirmed";
  const eyebrow = isCancelled ? "Payment not completed" : "Payment under review";
  const Icon = isCancelled ? AlertTriangle : Clock3;
  const reasonText = isCancelled
    ? "You cancelled the Razorpay payment before it was completed. Your cart is still available if you want to try again."
    : "Razorpay did not return a verified success response. If money was deducted, please do not retry immediately; we will keep this payment attempt recorded for review.";

  return (
    <div className="min-h-screen bg-white text-[#4a2e35]">
      <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
        <Navbar />
      </div>

      <main className="flex min-h-[calc(100vh-160px)] items-center px-4 pb-12 pt-[92px] sm:px-6 lg:px-8 lg:pt-28">
        <section className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[20px] border border-[#f2d3d8] bg-[#fffafa] text-center shadow-[0_18px_54px_rgba(74,46,53,0.09)]">
          <div className="border-b border-[#f2d3d8] bg-[#fff4f6] px-5 py-7 sm:px-8 sm:py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#b6465d] shadow-sm">
              <Icon className="h-8 w-8" />
            </div>
            <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#b6465d]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-[28px] font-semibold text-[#2f2428] sm:text-[38px]">
              {title}
            </h1>
          </div>

          <div className="space-y-5 px-5 py-6 sm:px-8 sm:py-8">
            <p className="mx-auto max-w-[560px] text-[15px] leading-7 text-[#62545a]">
              {reasonText}
            </p>

            <div className="mx-auto max-w-[590px] rounded-[12px] border border-[#ead8de] bg-white p-4 text-left text-[13px] leading-6 text-[#62545a]">
              {isCancelled ? (
                <p>Your order was not placed as a paid online order. No payment has been confirmed.</p>
              ) : (
                <p>
                  We saved this failed/uncertain payment record in the database. If the bank deducted money,
                  wait for Razorpay/bank confirmation or contact support with the reference below.
                </p>
              )}
            </div>

            {orderId ? (
              <div className="mx-auto max-w-[590px] rounded-[12px] border border-dashed border-[#d9c7cd] bg-[#fffdfd] p-4 text-left">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8a7a80]">
                  Reference
                </p>
                <p className="mt-1 break-all font-mono text-[14px] font-semibold text-[#2f2428]">
                  {orderId}
                </p>
              </div>
            ) : null}

            {isCancelled ? (
              <div className="mx-auto grid max-w-[590px] grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => router.push("/checkout/payment")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[6px] bg-[#b27b86] px-4 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Payment Again
                </button>
                <Link
                  href="/"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[6px] border border-[#d9c7cd] px-4 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#4a3c42] transition hover:border-[#b27b86] hover:text-[#b27b86]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={null}>
      <PaymentFailedContent />
    </Suspense>
  );
}
