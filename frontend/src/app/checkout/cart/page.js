"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "../../authPage/LoginModal";
import { API_BASE } from "@/lib/api";
import CheckoutStepper from "../components/CheckoutStepper";
import EmptyCart from "../components/EmptyCart";
import {
  ButtonLoaderLabel,
  CartItemsSkeleton,
  OfferListSkeleton,
  OrderSummarySkeleton,
} from "@/components/loaders/Loaders";

const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export default function CartPage() {
  const {
    cartItems,
    cartSummary,
    updateQty,
    removeItem,
    updateSize,
    cartLoading,
    summaryLoading,
    pendingItemIds,
  } = useCart();
  const { toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [openLogin, setOpenLogin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [showAllOffers, setShowAllOffers] = useState(false);

  useEffect(() => {
    if (!showMoveModal) {
      setSelectedProduct(null);
    }
  }, [showMoveModal]);

  useEffect(() => {
    let ignore = false;

    const fetchOffers = async () => {
      try {
        setOffersLoading(true);
        const response = await fetch(`${API_BASE}/api/offers`);
        const data = await response.json();

        if (!ignore) {
          setOffers(Array.isArray(data.offers) ? data.offers : []);
        }
      } catch {
        if (!ignore) {
          setOffers([]);
        }
      } finally {
        if (!ignore) {
          setOffersLoading(false);
        }
      }
    };

    fetchOffers();

    return () => {
      ignore = true;
    };
  }, []);

  const getSizeOptions = (item) => {
    const base = Array.isArray(item.availableSizes) ? item.availableSizes.filter(Boolean) : [];
    if (item.size && !base.includes(item.size)) {
      return [item.size, ...base];
    }
    return base;
  };

  const handleMoveSingleToWishlist = async (item) => {
    const product = item || selectedProduct;
    if (!product) return;

    if (!user) {
      setOpenLogin(true);
      return;
    }

    const productId =
      typeof product.productId === "object" ? product.productId._id : product.productId;

    await toggleWishlist({
      _id: productId,
      name: product.name,
      brand: product.brand,
      thumbnail: product.image,
      minPrice: product.price,
      mrp: product.mrp,
      discount: product.discount,
    });

    await removeItem(product.id);
    setShowMoveModal(false);
    setSelectedProduct(null);
  };

  const handleRemoveSingleItem = async () => {
    if (!selectedProduct) return;
    await removeItem(selectedProduct.id);
    setShowMoveModal(false);
    setSelectedProduct(null);
  };

  const handleCouponCheck = () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponError("Invalid coupon");
  };

  const visibleOffers = showAllOffers ? offers : offers.slice(0, 1);
  const selectedCount = cartItems.length;

  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white text-[#4a2e35]">
        <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
          <Navbar />
        </div>
        <div className="pt-[112px] lg:pt-[88px]">
          <EmptyCart />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#4a2e35]">
      <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
        <Navbar />
      </div>

      <div className="pt-[52px] lg:pt-0">
      <div className="lg:hidden">
        <div className="sticky top-[52px] z-30 border-b border-[#ece5e8] bg-white">
          <div className="flex items-center justify-between px-4 py-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="text-[#3a2d32]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <p className="text-[15px] font-semibold uppercase tracking-[0.02em] text-[#2f2428]">
                Shopping Bag
              </p>
            </div>

            <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6d5f65]">
              Step 1/3
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-[#f0e6e8] px-4 py-3 text-[13px] font-medium">
            <span className="text-[#3f3036]">Check delivery time &amp; services</span>
            <button type="button" className="text-[#ff3f78]">
              Enter Pin Code
            </button>
          </div>
        </div>

        <div className="space-y-3 bg-[#f9f5f6] px-0 pb-[150px]">
          <div className="bg-white px-4 py-3">
            <div className="rounded-[4px] border border-[#f0dfe4] bg-white px-4 py-4">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#5a4d53]" />
                <span className="text-[14px] font-semibold text-[#2f2428]">Available Offers</span>
              </div>

              {offersLoading ? (
                <OfferListSkeleton rows={2} />
              ) : visibleOffers.length > 0 ? (
                <>
                  <div className="space-y-2 text-[13px] text-[#5f4b52]">
                    {visibleOffers.map((offer) => (
                      <div
                        key={`mobile-offer-${offer._id || offer.code || offer.title}`}
                        className="flex gap-2"
                      >
                        <span className="font-medium text-[#c28d45]">•</span>
                        <div>
                          <p className="font-medium text-[#43373c]">
                            {offer.title || offer.code || "Offer"}
                          </p>
                          {offer.description ? (
                            <p className="mt-0.5 text-[#6e5d64]">{offer.description}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {offers.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setShowAllOffers((prev) => !prev)}
                      className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[#b27b86]"
                    >
                      {showAllOffers ? "Show less" : "Show more"}
                      {showAllOffers ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  ) : null}
                </>
              ) : (
                <p className="text-[13px] text-[#6d5f65]">No offers available right now.</p>
              )}
            </div>
          </div>

          <div className="bg-white px-4 py-3">
            <div className="flex items-center justify-between text-[13px] font-semibold uppercase text-[#4a3c42]">
              <span>
                {selectedCount}/{selectedCount} Items Selected{" "}
                <span className="text-[#ff3f78]">({formatPrice(cartSummary?.youPay)})</span>
              </span>
            </div>
          </div>

          <div className="space-y-3 px-3">
            {cartLoading ? (
              <CartItemsSkeleton count={3} />
            ) : cartItems.map((item) => (
              <div
                key={`mobile-${item.id}`}
                className={`rounded-[4px] border border-[#ece5e8] bg-white p-3 shadow-[0_4px_14px_rgba(45,28,35,0.05)] ${
                  pendingItemIds[item.id] ? "opacity-70" : ""
                }`}
              >
                <div className="flex gap-3">
                  <Link href={`/product/${item.slug}`} className="block shrink-0">
                    <img
                      src={`${API_BASE}${item.image}`}
                      alt={item.name}
                      className="h-[118px] w-[88px] rounded-[3px] object-cover"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-semibold uppercase text-[#2f2428]">
                          {item.brand}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-[14px] leading-5 text-[#40353a]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-[12px] text-[#8a7880]">Sold by: {item.seller}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowMoveModal(true);
                        }}
                        className="text-[#8d727b]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#3f3036]">Size:</span>
                        <select
                          value={item.size}
                          disabled={Boolean(pendingItemIds[item.id])}
                          onChange={(e) => updateSize(item.id, e.target.value)}
                          className="h-8 min-w-[66px] rounded-[2px] border border-[#d8cdd2] bg-white px-2 text-[13px] font-medium text-[#2f2428] outline-none"
                        >
                          {getSizeOptions(item).map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#3f3036]">Qty:</span>
                        <select
                          value={item.quantity}
                          disabled={Boolean(pendingItemIds[item.id])}
                          onChange={(e) => updateQty(item.id, Number(e.target.value))}
                          className="h-8 min-w-[66px] rounded-[2px] border border-[#d8cdd2] bg-white px-2 text-[13px] font-medium text-[#2f2428] outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
                            <option key={qty} value={qty}>
                              {qty}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold text-[#2f2428]">
                        {formatPrice(item.price)}
                      </span>
                      {item.discount > 0 ? (
                        <>
                          <span className="text-[12px] text-[#9d8b94] line-through">
                            {formatPrice(item.mrp)}
                          </span>
                          <span className="text-[13px] font-semibold text-[#ff6b6b]">
                            {item.discount}% OFF
                          </span>
                        </>
                      ) : null}
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[12px] text-[#5f4b52]">
                      <Check className="h-4 w-4 text-[#6d5f65]" />
                      <span>{item.returnText || "14 days return available"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-5 border-t border-[#f1e7ea] pt-3 text-[13px] font-medium text-[#4a3c42]">
                  <button
                    type="button"
                    onClick={() => handleMoveSingleToWishlist(item)}
                    disabled={Boolean(pendingItemIds[item.id])}
                    className="transition hover:text-[#b27b86]"
                  >
                    {pendingItemIds[item.id] === "remove" ? <ButtonLoaderLabel label="Moving..." /> : "Save for later"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(item);
                      setShowMoveModal(true);
                    }}
                    disabled={Boolean(pendingItemIds[item.id])}
                    className="transition hover:text-[#b27b86]"
                  >
                    {pendingItemIds[item.id] === "remove" ? <ButtonLoaderLabel label="Removing..." /> : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white px-4 py-4">
            {summaryLoading ? (
              <OrderSummarySkeleton lines={5} />
            ) : (
              <>
            <h3 className="text-[13px] font-semibold uppercase text-[#4a3c42]">
              Price Details ({selectedCount} Item{selectedCount > 1 ? "s" : ""})
            </h3>

            <div className="mt-4 space-y-3 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-[#3f3036]">Total</span>
                <span className="font-medium text-[#2f2428]">{formatPrice(cartSummary?.total)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#3f3036]">Sub Total</span>
                <span className="font-medium text-[#2f2428]">
                  {formatPrice(cartSummary?.subTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#3f3036]">Discount</span>
                <span className="font-medium text-[#14a44d]">-{formatPrice(cartSummary?.discount)}</span>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCouponError("");
                    setShowCouponModal(true);
                  }}
                  className="text-[#3f3036]"
                >
                  Coupon Discount
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCouponError("");
                    setShowCouponModal(true);
                  }}
                  className="font-medium text-[#b27b86]"
                >
                  Apply Coupon
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#3f3036]">Shipping</span>
                <span className="font-medium text-[#2f2428]">
                  {cartSummary?.shipping ? formatPrice(cartSummary.shipping) : "FREE"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#3f3036]">Platform Fee</span>
                <span className="font-medium text-[#2f2428]">
                  {formatPrice(cartSummary?.platformFee)}
                </span>
              </div>

              <div className="border-t border-[#f0e6e8] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-semibold text-[#2f2428]">You Pay</span>
                  <span className="text-[16px] font-semibold text-[#b27b86]">
                    {formatPrice(cartSummary?.youPay)}
                  </span>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#eadde2] bg-white">
          <div className="border-b border-[#f3e8eb] px-4 py-2 text-center text-[12px] font-medium text-[#4a3c42]">
            {selectedCount} Item{selectedCount > 1 ? "s" : ""} selected for order
          </div>
          <div className="px-4 py-3">
            <button
              className="flex h-12 w-full items-center justify-center rounded-[2px] bg-[#b27b86] text-[15px] font-semibold uppercase tracking-[0.04em] text-white"
              onClick={() => {
                if (!user) {
                  setOpenLogin(true);
                  return;
                }
                window.location.href = "/checkout/address";
              }}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      <div className="hidden pt-20 lg:block">
        <CheckoutStepper currentStep="cart" />

        <div className="mx-auto w-full max-w-[1140px] px-5 py-8 lg:px-7">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-9">
            <div className="space-y-6">
              <div className="rounded-[4px] border border-[#ece5e8] bg-white px-6 py-5 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                <div className="flex items-start gap-3">
                  <Tag className="mt-0.5 h-4 w-4 text-[#c28d45]" />
                  <div>
                    <h3 className="mb-2 text-[16px] font-medium text-[#2f2428]">Save more with offers:</h3>

                    <div className="space-y-2 text-[13px] text-[#5f4b52]">
                      {offersLoading ? (
                        <OfferListSkeleton rows={2} />
                      ) : visibleOffers.length > 0 ? (
                        visibleOffers.map((offer) => (
                          <div key={offer._id || offer.code || offer.title} className="flex gap-2">
                            <span className="font-medium text-[#c28d45]">•</span>
                            <div>
                              <p className="font-medium text-[#43373c]">
                                {offer.title || offer.code || "Offer"}
                              </p>
                              {offer.description ? (
                                <p className="mt-0.5 text-[#6e5d64]">{offer.description}</p>
                              ) : null}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No offers available right now.</p>
                      )}
                    </div>

                    {!offersLoading && offers.length > 2 ? (
                      <button
                        type="button"
                        onClick={() => setShowAllOffers((prev) => !prev)}
                        className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[#b27b86] transition hover:text-[#9f6571]"
                      >
                        {showAllOffers ? "Show less" : "Show more"}
                        {showAllOffers ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <h2 className="shrink-0 text-[16px] font-medium text-[#2f2428]">
                  {cartItems.length} Item{cartItems.length > 1 ? "s" : ""} in Your Bag
                </h2>
                <div className="h-px flex-1 bg-[#eadfe3]" />
              </div>

              <div className="space-y-4">
                {cartLoading ? (
                  <CartItemsSkeleton count={3} />
                ) : cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-[4px] border border-[#ece5e8] bg-white shadow-[0_6px_18px_rgba(45,28,35,0.05)] ${
                      pendingItemIds[item.id] ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex gap-4 p-4">
                      <Link href={`/product/${item.slug}`} className="block shrink-0 self-start">
                        <img
                          src={`${API_BASE}${item.image}`}
                          alt={item.name}
                          className="h-[120px] w-[96px] rounded-[4px] object-cover"
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <Link href={`/product/${item.slug}`}>
                              <h3 className="text-[13px] font-semibold uppercase tracking-[0.03em] text-[#2f2428]">
                                {item.brand}
                              </h3>
                            </Link>

                            <Link href={`/product/${item.slug}`}>
                              <p className="mt-1.5 text-[14px] leading-6 text-[#40353a]">{item.name}</p>
                            </Link>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedProduct(item);
                              setShowMoveModal(true);
                            }}
                            className="text-[#8d727b]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-5 text-[13px] text-[#5f4b52]">
                          <div className="flex items-center gap-2">
                            <span>Qty:</span>
                            <select
                              value={item.quantity}
                              disabled={Boolean(pendingItemIds[item.id])}
                              onChange={(e) => updateQty(item.id, Number(e.target.value))}
                              className="h-9 min-w-[64px] rounded-[2px] border border-[#d8cdd2] bg-white px-2 text-[13px] font-medium text-[#2f2428] outline-none"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
                                <option key={qty} value={qty}>
                                  {qty}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <span>Size:</span>
                            <select
                              value={item.size}
                              disabled={Boolean(pendingItemIds[item.id])}
                              onChange={(e) => updateSize(item.id, e.target.value)}
                              className="h-9 min-w-[64px] rounded-[2px] border border-[#d8cdd2] bg-white px-2 text-[13px] font-medium text-[#2f2428] outline-none"
                            >
                              {getSizeOptions(item).map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-4 border-t border-[#eee3e6] pt-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-[16px] font-semibold text-[#2f2428]">
                                {formatPrice(item.price)}
                              </span>
                              {item.discount > 0 && (
                                <>
                                  <span className="text-[12px] text-[#9d8b94] line-through">
                                    {formatPrice(item.mrp)}
                                  </span>
                                  <span className="text-[13px] font-semibold text-[#b27b86]">
                                    {item.discount}% OFF
                                  </span>
                                </>
                              )}
                            </div>

                            <span className="text-[14px] font-semibold text-[#b27b86]">
                              {formatPrice(item.lineTotal)}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[#5f4b52]">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-[#b27b86]" />
                              <span>Delivery by {item.deliveryDate || "5-7 Business Days"}</span>
                            </div>
                            <span className="text-[#bfaeb5]">•</span>
                            <span>{item.returnText || "Easy Returns"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 border-t border-[#eee3e6] px-4 py-3 text-[13px] font-medium text-[#3a2d32]">
                      <button
                        onClick={() => handleMoveSingleToWishlist(item)}
                        disabled={Boolean(pendingItemIds[item.id])}
                        className="transition hover:text-[#b27b86]"
                      >
                        {pendingItemIds[item.id] === "remove" ? <ButtonLoaderLabel label="Moving..." /> : "Save for later"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(item);
                          setShowMoveModal(true);
                        }}
                        disabled={Boolean(pendingItemIds[item.id])}
                        className="flex items-center gap-2 transition hover:text-[#b27b86]"
                      >
                        {pendingItemIds[item.id] === "remove" ? (
                          <ButtonLoaderLabel label="Removing..." />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="self-start lg:sticky lg:top-[132px]">
              <div className="space-y-5">
              <button
                className="flex h-14 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[15px] font-semibold uppercase tracking-[0.03em] text-white shadow-[0_10px_20px_rgba(178,123,134,0.18)] transition hover:bg-[#9f6571]"
                onClick={() => {
                  if (!user) {
                    setOpenLogin(true);
                    return;
                  }
                  window.location.href = "/checkout/address";
                }}
              >
                Proceed To Checkout
              </button>

              {summaryLoading ? (
                <OrderSummarySkeleton lines={6} />
              ) : (
              <div className="rounded-[4px] border border-[#ece5e8] bg-white p-6 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                <h3 className="mb-5 text-[16px] font-medium text-[#2f2428]">Order Summary</h3>

                <div className="space-y-4 border-t border-[#eee3e6] pt-5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#3f3036]">Total</span>
                    <span className="font-medium text-[#2f2428]">{formatPrice(cartSummary?.total)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#3f3036]">Sub Total</span>
                    <span className="font-medium text-[#2f2428]">
                      {formatPrice(cartSummary?.subTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#3f3036]">Discount</span>
                    <span className="font-medium text-[#2f9a52]">
                      -{formatPrice(cartSummary?.discount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#3f3036]">Coupon Discount</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponError("");
                        setShowCouponModal(true);
                      }}
                      className="font-medium text-[#b27b86] transition hover:text-[#9f6571]"
                    >
                      Apply Coupon
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#3f3036]">Shipping</span>
                    <span className="font-medium text-[#2f2428]">
                      {cartSummary?.shipping ? formatPrice(cartSummary.shipping) : "FREE"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#3f3036]">Platform Fee</span>
                    <span className="font-medium text-[#2f2428]">
                      {formatPrice(cartSummary?.platformFee)}
                    </span>
                  </div>

                  <div className="border-t border-[#eee3e6] pt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-semibold text-[#2f2428]">You Pay</span>
                      <span className="text-[18px] font-semibold text-[#b27b86]">
                        {formatPrice(cartSummary?.youPay)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              )}

              <div className="rounded-[4px] border border-[#ece5e8] bg-[#fffafb] p-4 text-[12px] leading-5 text-[#6f6167] shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                By placing this order, you agree to our{" "}
                <Link
                  href="/TermsAndConditions"
                  className="font-semibold text-[#b27b86] transition hover:text-[#9f6571]"
                >
                  Terms and Conditions
                </Link>
                . Prices and benefits shown are passed to the customer.
              </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {showMoveModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowMoveModal(false);
              setSelectedProduct(null);
            }}
          />

          <div className="relative w-[420px] rounded-[20px] bg-white shadow-[0_20px_60px_rgba(74,46,53,0.18)]">
            <div className="flex items-start justify-between border-b border-[#f0e4e8] p-5">
              <div className="flex gap-3">
                <img
                  src={`${API_BASE}${selectedProduct.image}`}
                  alt={selectedProduct.name}
                  className="h-20 w-16 rounded-[10px] object-cover"
                />
                <div>
                  <h2 className="text-sm font-semibold text-[#4a2e35]">Move from Bag</h2>
                  <p className="mt-1 text-sm text-[#8d727b]">
                    Are you sure you want to move this item from bag?
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMoveModal(false);
                  setSelectedProduct(null);
                }}
              >
                <X className="h-5 w-5 text-[#8d727b]" />
              </button>
            </div>

            <div className="flex text-sm font-semibold">
              <button
                onClick={handleRemoveSingleItem}
                className="flex-1 border-r border-[#f0e4e8] py-3 text-[#5a3c46]"
              >
                Remove
              </button>

              <button
                onClick={handleMoveSingleToWishlist}
                className="flex-1 py-3 text-[#b27b86]"
              >
                Move to Wishlist
              </button>
            </div>
          </div>
        </div>
      )}

      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 lg:px-4">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => {
              setShowCouponModal(false);
              setCouponError("");
            }}
          />

          <div className="relative h-full w-full overflow-hidden bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] lg:h-auto lg:max-w-[620px] lg:rounded-[8px]">
            <div className="flex items-center justify-between border-b border-[#eee3e6] px-4 py-5 lg:px-6">
              <h2 className="text-[16px] font-semibold uppercase tracking-[0.03em] text-[#2f2428]">
                Apply Coupon
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCouponModal(false);
                  setCouponError("");
                }}
                className="text-[#2f2428]"
              >
                <X className="h-7 w-7" />
              </button>
            </div>

            <div className="border-b border-[#eee3e6] px-4 py-6 lg:px-6 lg:py-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    if (couponError) {
                      setCouponError("");
                    }
                  }}
                  placeholder="Enter coupon code"
                  className="h-14 flex-1 rounded-[4px] border border-[#ddd4d8] px-5 text-[15px] text-[#2f2428] outline-none"
                />
                <button
                  type="button"
                  onClick={handleCouponCheck}
                  className="h-14 min-w-[120px] rounded-[4px] border border-[#d8c2c8] px-5 text-[14px] font-semibold uppercase tracking-[0.03em] text-[#b27b86]"
                >
                  Check
                </button>
              </div>

              {couponError ? (
                <p className="mt-3 text-[13px] font-medium text-[#b27b86]">{couponError}</p>
              ) : null}
            </div>

            <div className="min-h-[calc(100vh-224px)] overflow-y-auto bg-[#fbfbfb] px-4 py-6 text-[15px] text-[#4d4450] lg:min-h-[360px] lg:px-6 lg:py-8">
              {offers.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-[4px] border border-[#f3d9e3] bg-white px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-4 w-4 rounded-[2px] bg-[#ff3f78]" />
                      <div className="min-w-0 flex-1">
                        <div className="inline-block border border-dashed border-[#f3b7ca] px-3 py-2 text-[14px] font-semibold uppercase tracking-[0.03em] text-[#b27b86]">
                          {offers[0]?.code || "SAVE NOW"}
                        </div>
                        <p className="mt-3 text-[15px] font-semibold text-[#2f2428]">
                          {offers[0]?.title || "Save More"}
                        </p>
                        <p className="mt-1 text-[13px] leading-5 text-[#62555b]">
                          {offers[0]?.description || "Offer available on your current bag."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {offers.length > 1 ? (
                    <div>
                      <p className="mb-3 text-[13px] font-semibold uppercase text-[#6c5f65]">
                        Unlock More Coupons
                      </p>
                      <div className="space-y-3">
                        {offers.slice(1).map((offer) => (
                          <div
                            key={offer._id || offer.code || offer.title}
                            className="rounded-[4px] border border-[#ece5e8] bg-white px-4 py-4"
                          >
                            <div className="inline-block border border-dashed border-[#d9d1d5] px-3 py-2 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#7b6d73]">
                              {offer.code || offer.title || "Offer"}
                            </div>
                            <p className="mt-3 text-[14px] font-semibold text-[#2f2428]">
                              {offer.title || "Extra Savings"}
                            </p>
                            <p className="mt-1 text-[13px] leading-5 text-[#6b5f64]">
                              {offer.description || "Offer available on applicable items."}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="py-20 text-center">No other coupons available</div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[#eee3e6] bg-white px-4 py-4 lg:px-6">
              <div>
                <p className="text-[13px] text-[#6f6167]">Maximum savings:</p>
                <p className="text-[18px] font-semibold text-[#2f2428]">
                  {offers[0]?.discountValue ? `Rs. ${offers[0].discountValue}` : "Rs. 0"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCouponCheck}
                className="h-12 min-w-[180px] rounded-[2px] bg-[#ff3f78] px-8 text-[15px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#e8346d] lg:rounded-[4px]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={openLogin} onClose={() => setOpenLogin(false)} />
      </div>
    </div>
  );
}
