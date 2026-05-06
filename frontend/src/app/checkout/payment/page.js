"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_BASE } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { BankOfferSection } from "@/components/payment/BankOfferSection";
import { PaymentMethodsList } from "@/components/payment/PaymentMethodsList";
import { PaymentDetailsPanel } from "@/components/payment/PaymentDetailsPanel";
import { PriceDetailsSection } from "@/components/payment/PriceDetailsSection";
import CheckoutStepper from "../components/CheckoutStepper";
import { OrderSummarySkeleton, SkeletonBlock } from "@/components/loaders/Loaders";

function PaymentPageSkeleton() {
  return (
    <div className="min-h-screen bg-white text-[#4a2e35]">
      <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
        <Navbar />
      </div>

      <div className="pt-[52px] lg:pt-0">
        <div className="hidden pt-20 lg:block">
          <CheckoutStepper currentStep="payment" />
          <div className="mx-auto w-full max-w-[1140px] px-5 py-8 lg:px-7">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-9">
              <div className="space-y-6">
                <SkeletonBlock className="h-28 rounded-[4px]" />
                <SkeletonBlock className="h-10 w-64 rounded-full" />
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <SkeletonBlock className="h-[560px] rounded-[4px]" />
                  <SkeletonBlock className="h-[560px] rounded-[4px]" />
                </div>
              </div>
              <OrderSummarySkeleton lines={7} />
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-[#f9f5f6] px-0 pb-[120px] lg:hidden">
          <SkeletonBlock className="h-16 rounded-none" />
          <div className="space-y-3 px-4">
            <SkeletonBlock className="h-28 rounded-[4px]" />
            <SkeletonBlock className="h-[300px] rounded-[4px]" />
            <SkeletonBlock className="h-[420px] rounded-[4px]" />
            <OrderSummarySkeleton lines={7} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentPageSkeleton />}>
      <PaymentPageContent />
    </Suspense>
  );
}

function PaymentPageContent() {
  const router = useRouter();
  const { cartItems, cartSummary } = useCart();
  const [selectedMethod, setSelectedMethod] = useState("cod");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [cartTotal, setCartTotal] = useState({
    totalMrp: 0,
    sellingPrice: 0,
    subTotal: 0,
    discount: 0,
    couponDiscount: 0,
    platformFee: 30,
    finalAmount: 0,
    appliedCouponCode: "",
  });
  const [createdOrderId, setCreatedOrderId] = useState(null);

  const searchParams = useSearchParams();
  const addressId = searchParams.get("address");
  const orderId = searchParams.get("order");
  const finalOrderId = orderId || createdOrderId;
  const guardEnabledRef = useRef(true);
  const leaveIntentRef = useRef(null);

  const continueNavigation = (intent) => {
    if (!intent) return;

    guardEnabledRef.current = false;
    setShowLeaveModal(false);

    if (intent.type === "back") {
      window.history.back();
      return;
    }

    if (intent.external) {
      window.location.href = intent.href;
      return;
    }

    router.push(intent.href);
  };

  const requestLeaveConfirmation = (intent) => {
    leaveIntentRef.current = intent;
    setShowLeaveModal(true);
  };

  useEffect(() => {
    if (finalOrderId) return;

    setCartTotal({
      totalMrp: cartSummary?.total || 0,
      sellingPrice: cartSummary?.youPay || 0,
      subTotal: cartSummary?.subTotal || 0,
      discount: cartSummary?.discount || 0,
      couponDiscount: cartSummary?.couponDiscount || 0,
      platformFee: cartSummary?.platformFee || 30,
      finalAmount: cartSummary?.youPay || 0,
      appliedCouponCode: cartSummary?.appliedCoupon?.code || "",
    });
  }, [finalOrderId, cartSummary]);

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
        if (!data?.order) return;

        setCartTotal({
          totalMrp: data.order.pricing?.subtotal || 0,
          sellingPrice: data.order.pricing?.totalAmount || 0,
          subTotal:
            (data.order.pricing?.subtotal || 0) - (data.order.pricing?.productDiscount || 0),
          discount: data.order.pricing?.productDiscount || 0,
          couponDiscount: data.order.pricing?.couponDiscount || 0,
          platformFee: data.order.pricing?.platformFee || 30,
          finalAmount: data.order.pricing?.totalAmount || 0,
          appliedCouponCode: data.order.coupon?.code || "",
        });
      } catch (err) {
        console.log(err);
      }
    };

    fetchOrder();
  }, [finalOrderId]);

  useEffect(() => {
    guardEnabledRef.current = true;
    window.history.pushState({ paymentGuard: true }, "", window.location.href);

    const handleBeforeUnload = (event) => {
      if (!guardEnabledRef.current) return undefined;
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    const handleDocumentClick = (event) => {
      if (!guardEnabledRef.current) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest("a[href]");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (nextUrl.href === currentUrl.href) return;
      if (nextUrl.hash && nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) return;

      event.preventDefault();
      requestLeaveConfirmation({
        type: "href",
        href:
          nextUrl.origin === currentUrl.origin
            ? `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
            : nextUrl.href,
        external: nextUrl.origin !== currentUrl.origin,
      });
    };

    const handlePopState = () => {
      if (!guardEnabledRef.current) return;
      window.history.go(1);
      requestLeaveConfirmation({ type: "back" });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  const itemCount = useMemo(() => {
    if (!finalOrderId) {
      return cartItems.length || 1;
    }
    const count = Number(searchParams.get("items"));
    return Number.isFinite(count) && count > 0 ? count : 1;
  }, [cartItems.length, finalOrderId, searchParams]);
  return (
    <div className="min-h-screen bg-white text-[#4a2e35]">
      {showLeaveModal ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 sm:px-6">
          <div
            className="absolute inset-0 bg-[rgba(74,46,53,0.36)] backdrop-blur-[2px]"
            onClick={() => {
              setShowLeaveModal(false);
              leaveIntentRef.current = null;
            }}
          />

          <div className="relative w-full max-w-[460px] overflow-hidden rounded-[18px] border border-[#ead8de] bg-white shadow-[0_24px_60px_rgba(45,28,35,0.22)]">
            <div className="border-b border-[#f0e6e8] bg-[#fffafb] px-5 py-5 sm:px-6">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#b27b86]">
                Secure Checkout
              </p>
              <h2 className="mt-2 text-[24px] font-semibold text-[#2f2428]">
                Leave payment page?
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[#6f6167]">
                Your current payment step may be interrupted. If you leave now, you can come back and continue checkout later.
              </p>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="rounded-[12px] border border-[#ece5e8] bg-[#fffdfd] px-4 py-4 text-[13px] leading-5 text-[#5f4b52]">
                Your cart items are safe until you complete the final payment action.
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#f0e6e8] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => {
                  setShowLeaveModal(false);
                  leaveIntentRef.current = null;
                }}
                className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[#d9c7cd] px-5 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#4a3c42] transition hover:border-[#b27b86] hover:text-[#b27b86]"
              >
                Stay Here
              </button>
              <button
                type="button"
                onClick={() => continueNavigation(leaveIntentRef.current)}
                className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#b27b86] px-5 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
        <Navbar />
      </div>

      <div className="pt-[52px] lg:pt-0">
        <div className="lg:hidden">
          <div className="sticky top-[52px] z-30 border-b border-[#ece5e8] bg-white">
            <div className="flex items-center justify-between px-4 py-2">
              <button
                type="button"
                onClick={() => requestLeaveConfirmation({ type: "back" })}
                className="text-[#3a2d32]"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <p className="text-[15px] font-semibold uppercase tracking-[0.02em] text-[#2f2428]">
                Payment
              </p>

              <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6d5f65]">
                Step 3/3
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-[#f0e6e8] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#4a3c42]">
              <ShieldCheck className="h-4 w-4 text-[#03a685]" />
              100% Secure Checkout
            </div>
          </div>

          <div className="space-y-3 bg-[#f9f5f6] px-0 pb-12">
            <div className="bg-white px-4 py-4">
              <BankOfferSection compact />
            </div>

            <div className="bg-white px-4 py-4">
              <div className="mb-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8a7a80]">
                  Payment Mode
                </p>
                <h1 className="mt-1 text-[21px] font-semibold text-[#2f2428]">
                  Choose how you want to pay
                </h1>
              </div>

              <div className="space-y-4">
                <PaymentMethodsList
                  selectedMethod={selectedMethod}
                  onMethodChange={(method) => {
                    setSelectedMethod(method);
                  }}
                  compact
                />

                <PaymentDetailsPanel
                  selectedMethod={selectedMethod}
                  selectedAddressId={addressId}
                  cartTotal={cartTotal}
                  orderId={finalOrderId}
                  setCreatedOrderId={setCreatedOrderId}
                  appliedCouponCode={cartTotal.appliedCouponCode}
                  compact
                />
              </div>
            </div>

            <div className="bg-white px-4 py-4">
              <PriceDetailsSection
                itemCount={itemCount}
                totalMrp={cartTotal.totalMrp}
                sellingPrice={cartTotal.subTotal}
                discount={cartTotal.discount}
                couponDiscount={cartTotal.couponDiscount}
                platformFee={cartTotal.platformFee}
                finalAmount={cartTotal.finalAmount}
                appliedCouponCode={cartTotal.appliedCouponCode}
                compact
              />
            </div>

            <div className="bg-white px-4 py-4 text-[12px] leading-5 text-[#6f6167]">
              By completing your payment, you agree to our{" "}
              <Link
                href="/TermsAndConditions"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#b27b86]"
              >
                Terms and Conditions
              </Link>
              .
            </div>
          </div>
        </div>

        <div className="hidden pt-20 lg:block">
          <CheckoutStepper currentStep="payment" />

          <div className="mx-auto w-full max-w-[1140px] px-5 py-8 lg:px-7">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-9">
              <div className="space-y-6">
                <div className="rounded-[4px] border border-[#ece5e8] bg-white px-6 py-5 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8a7a80]">
                        Secure Checkout
                      </p>
                      <h1 className="mt-1 text-[28px] font-semibold text-[#2f2428]">
                        Complete your payment
                      </h1>
                      <p className="mt-2 text-[13px] text-[#6f6167]">
                        Review your available payment methods and finish your order securely.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-[#ddefe8] bg-[#f7fcfa] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#03a685]">
                      <ShieldCheck className="h-4 w-4" />
                      Protected Payment
                    </div>
                  </div>
                </div>

                <BankOfferSection />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                  <PaymentMethodsList
                    selectedMethod={selectedMethod}
                    onMethodChange={(method) => {
                      setSelectedMethod(method);
                    }}
                  />

                  <PaymentDetailsPanel
                    selectedMethod={selectedMethod}
                    selectedAddressId={addressId}
                    cartTotal={cartTotal}
                    orderId={finalOrderId}
                    setCreatedOrderId={setCreatedOrderId}
                    appliedCouponCode={cartTotal.appliedCouponCode}
                  />
                </div>
              </div>

              <div className="self-start lg:sticky lg:top-[132px]">
                <div className="space-y-5">
                  <PriceDetailsSection
                    itemCount={itemCount}
                    totalMrp={cartTotal.totalMrp}
                    sellingPrice={cartTotal.subTotal}
                    discount={cartTotal.discount}
                    couponDiscount={cartTotal.couponDiscount}
                    platformFee={cartTotal.platformFee}
                    finalAmount={cartTotal.finalAmount}
                    appliedCouponCode={cartTotal.appliedCouponCode}
                  />

                  <div className="rounded-[4px] border border-[#ece5e8] bg-[#fffafb] p-4 text-[12px] leading-5 text-[#6f6167] shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                    Your payment is encrypted and processed securely. By continuing, you agree to our{" "}
                    <Link
                      href="/TermsAndConditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#b27b86] transition hover:text-[#9f6571]"
                    >
                      Terms and Conditions
                    </Link>
                    .
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
}
