"use client";

import React, { useEffect, useState } from "react";
import { X, Tag, Gift, Bookmark, ChevronRight, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import LoginModal from "../../authPage/LoginModal";
import { API_BASE } from "@/lib/api";

export default function CartPage() {
  const { cartItems, updateQty, removeItem, updateSize } = useCart();
  const { toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const [showMoreOffers, setShowMoreOffers] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isDonationChecked, setIsDonationChecked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openLogin, setOpenLogin] = useState(false);

  useEffect(() => {
    const initialSelection = {};
    cartItems.forEach((item) => {
      initialSelection[item.id] = true;
    });
    setSelectedItems(initialSelection);
  }, [cartItems]);

  const categories = [
    "All",
    "Lip Balm",
    "Bedsheets",
    "Handbags",
    "Doormats",
    "Shampoo",
    "Day Cream",
    "Hair Accessory",
    "Jewellery Set",
  ];

  const toggleItemSelection = (id) => {
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllSelection = () => {
    const allSelected = cartItems.every((item) => selectedItems[item.id]);
    const newSelection = {};
    cartItems.forEach((item) => {
      newSelection[item.id] = !allSelected;
    });
    setSelectedItems(newSelection);
  };

  const removeSelectedItems = async () => {
    for (const item of cartItems) {
      if (selectedItems[item.id]) {
        await removeItem(item.id);
      }
    }
  };

  const moveToWishlist = async () => {
    if (!user) {
      setOpenLogin(true);
      return;
    }

    for (const item of cartItems) {
      if (selectedItems[item.id]) {
        const productId =
          typeof item.productId === "object" ? item.productId._id : item.productId;

        await toggleWishlist({
          _id: productId,
          name: item.name,
          brand: item.brand,
          thumbnail: item.image,
          minPrice: item.price,
          mrp: item.mrp,
          discount: item.discount,
        });

        await removeItem(item.id);
      }
    }
  };

  const handleRemoveSingleItem = async () => {
    if (!selectedProduct) return;
    await removeItem(selectedProduct.id);
    setShowMoveModal(false);
    setSelectedProduct(null);
  };

  const handleMoveSingleToWishlist = async () => {
    if (!selectedProduct) return;

    if (!user) {
      setOpenLogin(true);
      return;
    }

    const productId =
      typeof selectedProduct.productId === "object"
        ? selectedProduct.productId._id
        : selectedProduct.productId;

    await toggleWishlist({
      _id: productId,
      name: selectedProduct.name,
      brand: selectedProduct.brand,
      thumbnail: selectedProduct.image,
      minPrice: selectedProduct.price,
      mrp: selectedProduct.mrp,
      discount: selectedProduct.discount,
    });

    await removeItem(selectedProduct.id);
    setShowMoveModal(false);
    setSelectedProduct(null);
  };

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty >= 1 && newQty <= 10) {
      await updateQty(itemId, newQty);
    }
  };

  const selectedCount = cartItems.filter((item) => selectedItems[item.id]).length;
  const totalMRP = cartItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = totalMRP - totalPrice;
  const donationAmount = isDonationChecked && selectedDonation ? selectedDonation : 0;
  const finalAmount = totalPrice + donationAmount;

  const getSizeOptions = (item) => {
    const base = Array.isArray(item.availableSizes) ? item.availableSizes.filter(Boolean) : [];
    if (item.size && !base.includes(item.size)) {
      return [item.size, ...base];
    }
    return base;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="mb-3 text-2xl font-semibold text-[#4a2e35]">Your cart is empty</h2>
          <p className="text-sm text-[#8d727b]">Add some products to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-alt)] text-[#4a2e35]">
      <div className="sticky top-0 z-40 border-b border-[#f0e4e8] bg-[rgba(255,253,252,0.96)] backdrop-blur">
        <div className="container-imkaa px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-[0.18em] text-[#c56f7f]">BAG</span>
                <div className="h-0.5 w-12 bg-[#c56f7f]"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-12 bg-[#cbb6bd]"></div>
                <span className="text-sm font-semibold tracking-[0.18em] text-[#8d727b]">ADDRESS</span>
                <div className="h-0.5 w-12 bg-[#cbb6bd]"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-12 bg-[#cbb6bd]"></div>
                <span className="text-sm font-semibold tracking-[0.18em] text-[#8d727b]">PAYMENT</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c56f7f]">
                <Check className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#5a3c46]">100% SECURE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-imkaa px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-[24px] border border-[#ecd9de] bg-white/95 p-5 shadow-[0_10px_30px_rgba(74,46,53,0.05)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 text-sm">
                    <span className="text-[#8d727b]">Deliver to: </span>
                    <span className="font-semibold">{user?.name || "Guest"}</span>
                    <span className="font-semibold">, {user?.pincode || "000000"}</span>
                  </div>
                  <div className="text-xs text-[#8d727b]">
                    {user?.address || "Please add delivery address"}
                  </div>
                </div>
                <button className="rounded-full border border-[#dcbfc7] px-5 py-2 text-xs font-semibold tracking-[0.12em] text-[#c56f7f]">
                  CHANGE ADDRESS
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#ecd9de] bg-white/95 p-5 shadow-[0_10px_30px_rgba(74,46,53,0.05)]">
              <div className="flex items-start gap-3">
                <Tag className="mt-0.5 h-5 w-5 text-[#8d727b]" />
                <div className="flex-1">
                  <h3 className="mb-2 text-sm font-semibold text-[#4a2e35]">Available Offers</h3>
                  <p className="text-sm text-[#8d727b]">
                    7.5% Assured Cashback* on a minimum spend of Rs.100. T&C
                  </p>
                  {showMoreOffers && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-[#8d727b]">
                        10% Instant Discount on ICICI Bank Credit Cards on a min spend of Rs.3000. TCA
                      </p>
                      <p className="text-sm text-[#8d727b]">
                        Flat Rs.200 Cashback on Paytm Wallet on a min spend of Rs.1999. Code: PAYTM200
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setShowMoreOffers(!showMoreOffers)}
                    className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#c56f7f]"
                  >
                    {showMoreOffers ? "Show Less" : "Show More"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${showMoreOffers ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[24px] border border-[#ecd9de] bg-white/90 px-5 py-4 shadow-[0_10px_30px_rgba(74,46,53,0.04)]">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={cartItems.every((item) => selectedItems[item.id])}
                  onChange={toggleAllSelection}
                  className="h-4 w-4 cursor-pointer rounded border-[#d8c1c9] text-[#c56f7f] focus:ring-[#c56f7f]"
                />
                <label htmlFor="select-all" className="cursor-pointer text-sm font-semibold text-[#4a2e35]">
                  {selectedCount}/{cartItems.length} ITEMS SELECTED
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={removeSelectedItems}
                  className="cursor-pointer text-sm font-semibold text-[#8d727b] disabled:opacity-50"
                  disabled={selectedCount === 0}
                >
                  REMOVE
                </button>
                <button
                  onClick={moveToWishlist}
                  className="cursor-pointer text-sm font-semibold text-[#8d727b] disabled:opacity-50"
                  disabled={selectedCount === 0}
                >
                  MOVE TO WISHLIST
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-[24px] border border-[#ecd9de] bg-white/95 p-5 shadow-[0_10px_30px_rgba(74,46,53,0.05)]"
                >
                  <button
                    onClick={() => {
                      setSelectedProduct(item);
                      setShowMoveModal(true);
                    }}
                    className="absolute right-4 top-4 cursor-pointer text-[#a78b94]"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex gap-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedItems[item.id] || false}
                        onChange={() => toggleItemSelection(item.id)}
                        className="absolute left-2 top-2 z-10 h-4 w-4 cursor-pointer rounded border-[#d8c1c9] bg-white text-[#c56f7f] focus:ring-[#c56f7f]"
                      />
                      <Link href={`/product/${item.slug}`}>
                        <img
                          src={`${API_BASE}${item.image}`}
                          alt={item.name}
                          className="h-36 w-28 cursor-pointer rounded-[18px] object-cover"
                        />
                      </Link>
                    </div>

                    <div className="flex-1">
                      <Link href={`/product/${item.slug}`}>
                        <h3 className="mb-1 cursor-pointer text-sm font-semibold text-[#4a2e35]">
                          {item.brand}
                        </h3>
                      </Link>

                      <Link href={`/product/${item.slug}`}>
                        <p className="mb-1 cursor-pointer text-sm text-[#8d727b]">{item.name}</p>
                      </Link>

                      <p className="mb-3 text-xs text-[#9a8189]">Sold by: {item.seller}</p>

                      <div className="mb-3 flex items-center gap-4">
                        <div className="relative w-[118px]">
                          <select
                            value={item.size}
                            onChange={(e) => updateSize(item.id, e.target.value)}
                            className="h-10 w-full rounded-full border border-[#e5d4d9] bg-white px-4 text-sm font-medium text-[#5a3c46] outline-none"
                          >
                            {getSizeOptions(item).map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex h-10 items-center rounded-full border border-[#e5d4d9] bg-white">
                          {item.quantity > 1 && (
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="flex h-full w-10 items-center justify-center border-r border-[#e5d4d9] text-[#7f646d]"
                            >
                              -
                            </button>
                          )}
                          <span className="flex h-full w-10 items-center justify-center text-sm text-[#4a2e35]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="flex h-full w-10 items-center justify-center border-l border-[#e5d4d9] text-[#7f646d]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-semibold text-[#4a2e35]">Rs.{item.price}</span>
                        {item.discount > 0 && (
                          <>
                            <span className="text-sm text-[#b49ca4] line-through">Rs.{item.mrp}</span>
                            <span className="text-sm font-semibold text-orange-500">{item.discount}% OFF</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#8d727b]">
                        <div className="flex h-4 w-4 items-center justify-center rounded-full border border-[#b49ca4]">
                          <div className="h-2 w-2 rounded-full bg-[#b49ca4]"></div>
                        </div>
                        <span>{item.returnText || "3 days return available"}</span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-sm text-[#8d727b]">
                        <Check className="h-4 w-4 text-[#c56f7f]" />
                        <span>Delivery by {item.deliveryDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/wishlist">
              <button className="flex w-full cursor-pointer items-center justify-between rounded-[24px] border border-[#ecd9de] bg-white/95 p-5 shadow-[0_10px_30px_rgba(74,46,53,0.05)]">
                <div className="flex items-center gap-3">
                  <Bookmark className="h-5 w-5 text-[#8d727b]" />
                  <span className="text-sm font-semibold text-[#4a2e35]">Add More From Wishlist</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#b49ca4]" />
              </button>
            </Link>

            <div className="border-t border-[#ecd9de] pt-8">
              <h3 className="mb-4 text-2xl font-semibold text-[#4a2e35]">You may also like</h3>

              <div className="mb-6 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      selectedCategory === category
                        ? "bg-[#c56f7f] text-white"
                        : "border border-[#e5d4d9] bg-white/90 text-[#7f646d]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-[24px] border border-[#ecd9de] bg-white/90 p-2"
                  >
                    <img
                      src={`https://images.unsplash.com/photo-${1580910051328 + i}-2569ce89d5db?w=300&h=300&fit=crop`}
                      alt="Product"
                      className="h-full w-full rounded-[18px] object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-1">
            <div className="rounded-[24px] border border-[#ecd9de] bg-white/95 p-5 shadow-[0_10px_30px_rgba(74,46,53,0.05)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-[#8d727b]" />
                  <h3 className="text-xs font-semibold tracking-[0.18em] text-[#7f646d]">COUPONS</h3>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#8d727b]">Apply Coupons</span>
                <button
                  className="rounded-full bg-[#c56f7f] px-5 py-2 text-xs font-semibold text-white"
                  onClick={() => alert("Coupon applied!")}
                >
                  APPLY
                </button>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#f0dce2] bg-[#fcf4f6] p-5 shadow-[0_10px_30px_rgba(74,46,53,0.05)]">
              <h3 className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#7f646d]">
                GIFTING & PERSONALISATION
              </h3>
              <div className="flex gap-3">
                <Gift className="h-12 w-12 flex-shrink-0 text-[#d48a99]" />
                <div className="flex-1">
                  <p className="mb-1 text-sm font-semibold text-[#4a2e35]">Buying for a loved one?</p>
                  <p className="mb-3 text-xs text-[#8d727b]">
                    Gift Packaging and personalised message on card. Only for Rs.35
                  </p>
                  <button className="w-full rounded-full bg-[#c56f7f] py-2.5 text-xs font-semibold text-white">
                    ADD GIFT PACKAGE
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#ecd9de] bg-white/95 p-5 shadow-[0_10px_30px_rgba(74,46,53,0.05)]">
              <h3 className="mb-3 text-xs font-semibold tracking-[0.18em] text-[#7f646d]">
                SUPPORT TRANSFORMATIVE SOCIAL WORK IN INDIA
              </h3>
              <div className="mb-3 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="donation"
                  checked={isDonationChecked}
                  onChange={(e) => setIsDonationChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded border-[#d8c1c9] text-[#c56f7f] focus:ring-[#c56f7f]"
                />
                <label htmlFor="donation" className="cursor-pointer text-sm text-[#5a3c46]">
                  Donate and make a difference
                </label>
              </div>

              {isDonationChecked && (
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedDonation(amount)}
                      className={`rounded-full border px-3 py-2 text-sm font-medium ${
                        selectedDonation === amount
                          ? "border-[#c56f7f] bg-[#c56f7f] text-white"
                          : "border-[#e5d4d9] bg-white text-[#7f646d]"
                      }`}
                    >
                      Rs.{amount}
                    </button>
                  ))}
                </div>
              )}

              <button className="text-xs font-semibold text-[#c56f7f]">Know More</button>
            </div>

            <div className="rounded-[24px] border border-[#ecd9de] bg-white/95 p-5 shadow-[0_10px_30px_rgba(74,46,53,0.05)]">
              <h3 className="mb-4 text-xs font-semibold tracking-[0.18em] text-[#7f646d]">
                PRICE DETAILS ({cartItems.length} Items)
              </h3>

              <div className="mb-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8d727b]">Total MRP</span>
                  <span>Rs.{totalMRP.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#8d727b]">Discount on MRP</span>
                  <span className="text-green-600">- Rs.{discount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#8d727b]">Coupon Discount</span>
                  <button className="text-xs font-semibold text-[#c56f7f]">Apply Coupon</button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8d727b]">Platform Fee</span>
                    <button className="text-xs font-semibold text-[#c56f7f]">Know More</button>
                  </div>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>

                {isDonationChecked && selectedDonation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8d727b]">Donation</span>
                    <span>Rs.{donationAmount}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#f0e4e8] pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-lg font-semibold">Rs.{finalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="sticky top-24">
              <p className="mb-3 text-xs text-[#8d727b]">
                By placing the order, you agree to Glovia Glamour&apos;s{" "}
                <a href="/terms" className="font-semibold text-[#c56f7f]">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a href="/privacy" className="font-semibold text-[#c56f7f]">
                  Privacy Policy
                </a>
              </p>
              <button
                className="w-full rounded-full bg-[#c56f7f] py-3.5 text-base font-semibold text-white shadow-[0_14px_36px_rgba(197,111,127,0.2)]"
                onClick={() => {
                  if (!user) {
                    setOpenLogin(true);
                    return;
                  }

                  window.location.href = "/checkout/address";
                }}
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMoveModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setShowMoveModal(false);
              setSelectedProduct(null);
            }}
          ></div>

          <div className="relative w-[420px] rounded-[28px] border border-[#ecd9de] bg-white shadow-[0_20px_60px_rgba(74,46,53,0.18)]">
            <div className="flex items-start justify-between border-b border-[#f0e4e8] p-5">
              <div className="flex gap-3">
                <img
                  src={`${API_BASE}${selectedProduct.image}`}
                  alt={selectedProduct.name}
                  className="h-20 w-16 rounded-[14px] object-cover"
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
                REMOVE
              </button>

              <button
                onClick={handleMoveSingleToWishlist}
                className="flex-1 py-3 text-[#c56f7f]"
              >
                MOVE TO WISHLIST
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal isOpen={openLogin} onClose={() => setOpenLogin(false)} />
    </div>
  );
}
