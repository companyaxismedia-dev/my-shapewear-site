"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddressForm from "@/components/checkout/AddressForm";
import CheckoutStepper from "../components/CheckoutStepper";

const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export default function CheckoutAddressPage() {
  const router = useRouter();
  const { cartItems, cartSummary } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAllDeliveryItems, setShowAllDeliveryItems] = useState(false);

  const summaryRef = useRef(null);
  const selectedAddress =
    addresses.find((address) => (address._id || address.id) === selectedAddressId) || addresses[0] || null;
  const visibleDeliveryItems = showAllDeliveryItems ? cartItems : cartItems.slice(0, 2);

  const getToken = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      return stored?.token;
    } catch {
      return null;
    }
  };

  const closeModal = () => {
    window.history.replaceState(null, "", window.location.pathname);
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  useEffect(() => {
    const checkHash = () => {
      setShowAddressModal(window.location.hash === "#modal");
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const response = await fetch(`${API_BASE}/api/users/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      const list = Array.isArray(data?.addresses) ? data.addresses : [];
      setAddresses(list);

      const remembered = localStorage.getItem("selectedAddressId");
      const defaultAddress = list.find((address) => address.isDefault);
      const selected =
        list.find((address) => address._id === remembered)?._id ||
        defaultAddress?._id ||
        list[0]?._id ||
        "";

      setSelectedAddressId(selected);

      if (selected) {
        localStorage.setItem("selectedAddressId", selected);
      }
    } catch (error) {
      console.error("Address fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = () => {
    setEditingAddress(null);
    window.location.hash = "modal";
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    window.location.hash = "modal";
  };

  const handleRemoveAddress = async (id) => {
    try {
      const token = getToken();
      if (!token) return;

      await fetch(`${API_BASE}/api/users/address/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedAddresses = addresses.filter((address) => address._id !== id);
      setAddresses(updatedAddresses);

      if (selectedAddressId === id) {
        const nextId = updatedAddresses.find((address) => address.isDefault)?._id || updatedAddresses[0]?._id || "";
        setSelectedAddressId(nextId);
        if (nextId) {
          localStorage.setItem("selectedAddressId", nextId);
        } else {
          localStorage.removeItem("selectedAddressId");
        }
      }
    } catch (error) {
      console.error("Remove address error:", error);
    }
  };

  const handleSelectAddress = async (id) => {
    setSelectedAddressId(id);
    localStorage.setItem("selectedAddressId", id);

    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);

    try {
      const token = getToken();
      if (!token) return;

      await fetch(`${API_BASE}/api/users/address/default/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Set default address error:", error);
    }
  };

  const handleContinue = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address");
      return;
    }

    if (!cartItems.length) {
      alert("Your cart is empty");
      return;
    }

    try {
      setPlacingOrder(true);
      const token = getToken();

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          paymentType: "COD",
          offerCode: "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.orderId) {
        alert(data?.message || "Order creation failed");
        return;
      }

      router.push(`/checkout/payment?order=${data.orderId}&address=${selectedAddressId}`);
    } catch (error) {
      console.error("Create order error:", error);
      alert("Order create error");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="fixed left-0 right-0 top-0 z-50 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.06)]">
          <Navbar />
        </div>
        <div className="flex min-h-screen items-center justify-center px-4 pt-28 lg:pt-20 text-sm text-[#8d727b]">
          Loading address details...
        </div>
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

            <p className="text-[15px] font-semibold uppercase tracking-[0.02em] text-[#2f2428]">
              Address
            </p>

            <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6d5f65]">
              Step 2/3
            </span>
          </div>
        </div>

        <div className="space-y-3 bg-[#f9f5f6] px-0 pb-[110px]">
          {selectedAddress ? (
            <div className="bg-white px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[#2f2428]">
                      {selectedAddress.fullName || selectedAddress.name}
                    </h2>
                    {selectedAddress.isDefault ? (
                      <span className="text-[12px] text-[#8d8086]">(Default)</span>
                    ) : null}
                    <span className="rounded-full border border-[#95d9ca] px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.04em] text-[#03a685]">
                      {(selectedAddress.addressType || selectedAddress.type || "HOME") === "WORK"
                        ? "Home"
                        : selectedAddress.addressType || selectedAddress.type || "HOME"}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-[13px] leading-5 text-[#4f4349]">
                    <p>
                      {selectedAddress.addressLine || selectedAddress.address}
                      {selectedAddress.locality ? `, ${selectedAddress.locality}` : ""}
                    </p>
                    <p>
                      {selectedAddress.landmark ? `${selectedAddress.landmark}, ` : ""}
                      {selectedAddress.city} {selectedAddress.pincode}
                    </p>
                    <p>{selectedAddress.state}</p>
                    <p className="pt-1 font-medium text-[#2f2428]">
                      Mobile: {selectedAddress.phone || selectedAddress.mobile}
                    </p>
                  </div>
                </div>

              </div>

              <div className="mt-4 flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleEditAddress(selectedAddress)}
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-[3px] border border-[#d9c7cd] px-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-[#4a3c42]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-[3px] border border-[#d9c7cd] px-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-[#b27b86]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add New
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white px-4 py-6 text-center">
              <p className="text-[14px] font-medium text-[#2f2428]">No address added yet</p>
              <button
                onClick={handleAddAddress}
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-[3px] bg-[#b27b86] px-4 text-[12px] font-semibold uppercase tracking-[0.03em] text-white"
              >
                <Plus className="h-4 w-4" />
                Add Address
              </button>
            </div>
          )}

          {addresses.length > 1 ? (
            <div className="bg-white px-4 py-3">
              <div className="space-y-2">
                {addresses
                  .filter((address) => (address._id || address.id) !== (selectedAddress?._id || selectedAddress?.id))
                  .map((address) => {
                    const id = address._id || address.id;
                    return (
                      <button
                        key={`address-option-${id}`}
                        type="button"
                        onClick={() => handleSelectAddress(id)}
                        className="flex w-full items-center justify-between rounded-[3px] border border-[#ece5e8] px-3 py-3 text-left"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-[#2f2428]">
                            {address.fullName || address.name}
                          </p>
                          <p className="mt-1 text-[12px] text-[#6f6167]">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        <span className="text-[12px] font-semibold text-[#ff3f78]">Use</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : null}

          <div className="bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[13px] font-semibold uppercase text-[#6c5f65]">
                Delivery Estimates
              </h3>
              {cartItems.length > 2 ? (
                <button
                  type="button"
                  onClick={() => setShowAllDeliveryItems((prev) => !prev)}
                  className="text-[13px] font-medium text-[#b27b86]"
                >
                  {showAllDeliveryItems ? "View less" : "View more"}
                </button>
              ) : null}
            </div>
            <div className="mt-3 space-y-3">
              {visibleDeliveryItems.map((item) => (
                <div key={`mobile-delivery-${item.id}`} className="flex items-center gap-3">
                  <img
                    src={`${API_BASE}${item.image}`}
                    alt={item.name}
                    className="h-12 w-10 rounded-[3px] object-cover"
                  />
                  <p className="text-[14px] text-[#4f4349]">
                    Estimated delivery by{" "}
                    <span className="font-semibold text-[#2f2428]">
                      {item.deliveryDate || "5-7 Business Days"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white px-4 py-4">
            <h3 className="text-[13px] font-semibold uppercase text-[#4a3c42]">
              Price Details ({cartItems.length} Item{cartItems.length > 1 ? "s" : ""})
            </h3>

            <div className="mt-4 space-y-3 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-[#3f3036]">Total MRP</span>
                <span className="font-medium text-[#2f2428]">{formatPrice(cartSummary?.total)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#3f3036]">Discount on MRP</span>
                <span className="font-medium text-[#14a44d]">-{formatPrice(cartSummary?.discount)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#3f3036]">Platform Fee</span>
                  <button type="button" className="font-semibold text-[#ff3f78]">
                    Know More
                  </button>
                </div>
                <span className="font-medium text-[#2f2428]">
                  {formatPrice(cartSummary?.platformFee)}
                </span>
              </div>

              <div className="border-t border-[#f0e6e8] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-semibold text-[#2f2428]">Total Amount</span>
                  <span className="text-[16px] font-semibold text-[#2f2428]">
                    {formatPrice(cartSummary?.youPay)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#eadde2] bg-white">
          <div className="px-4 py-3">
            <button
              className="flex h-12 w-full items-center justify-center rounded-[2px] bg-[#b27b86] text-[15px] font-semibold uppercase tracking-[0.04em] text-white disabled:cursor-not-allowed disabled:opacity-70"
              onClick={handleContinue}
              disabled={!selectedAddressId || placingOrder}
            >
              {placingOrder ? "Processing..." : "Continue To Payment"}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden pt-20 lg:block">
        <CheckoutStepper currentStep="address" />

        <div className="mx-auto w-full max-w-[1140px] px-5 py-8 lg:px-7">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-9">
            <div className="space-y-6">
              <div className="rounded-[4px] border border-[#ece5e8] bg-white px-6 py-5 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#2f2428]">
                      Select Delivery Address
                    </h2>
                    <p className="mt-1 text-[13px] text-[#6f6167]">
                      Choose the address where you want your order delivered.
                    </p>
                  </div>

                  <button
                    onClick={handleAddAddress}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-[#d9c7cd] px-4 text-[13px] font-semibold uppercase tracking-[0.03em] text-[#b27b86] transition hover:border-[#b27b86] hover:bg-[#fff8fa]"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Address
                  </button>
                </div>
              </div>

              {!addresses.length ? (
                <div className="rounded-[4px] border border-dashed border-[#d9c7cd] bg-white px-6 py-10 text-center shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                  <p className="text-[15px] font-medium text-[#2f2428]">No address added yet</p>
                  <p className="mt-1 text-[13px] text-[#7b6d73]">
                    Add an address to continue with checkout.
                  </p>
                  <button
                    onClick={handleAddAddress}
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-[#b27b86] px-5 text-[13px] font-semibold uppercase tracking-[0.03em] text-white transition hover:bg-[#9f6571]"
                  >
                    <Plus className="h-4 w-4" />
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => {
                    const id = address._id || address.id;
                    const selected = selectedAddressId === id;
                    const type = address.addressType || address.type || "HOME";

                    return (
                      <div
                        key={id}
                        onClick={() => handleSelectAddress(id)}
                        className={`cursor-pointer rounded-[4px] border bg-white p-5 shadow-[0_6px_18px_rgba(45,28,35,0.05)] transition ${
                          selected
                            ? "border-[#b27b86] ring-1 ring-[#ead8de]"
                            : "border-[#ece5e8] hover:border-[#d9c7cd]"
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className="pt-0.5">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-[#b27b86] bg-[#b27b86]"
                                  : "border-[#d4c7cc] bg-white"
                              }`}
                            >
                              {selected ? <Check className="h-3 w-3 text-white" /> : null}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-[16px] font-semibold text-[#2f2428]">
                                {address.fullName || address.name}
                              </h3>

                              <span className="rounded-full border border-[#cfe7df] px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.04em] text-[#03a685]">
                                {type === "WORK" ? "Office" : type}
                              </span>

                              {address.isDefault ? (
                                <span className="rounded-full bg-[#fff2f6] px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.04em] text-[#ff4f7d]">
                                  Default
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-3 flex items-start gap-2 text-[13px] leading-6 text-[#5f4b52]">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b27b86]" />
                              <p>
                                {address.addressLine || address.address}
                                {address.locality ? `, ${address.locality}` : ""}
                                {address.landmark ? `, ${address.landmark}` : ""}
                                {`, ${address.city}, ${address.state} - ${address.pincode}`}
                              </p>
                            </div>

                            <p className="mt-2 text-[13px] font-medium text-[#2f2428]">
                              Mobile: {address.phone || address.mobile}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleEditAddress(address);
                                }}
                                className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-[#d9c7cd] px-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-[#4a3c42] transition hover:border-[#b27b86] hover:text-[#b27b86]"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleRemoveAddress(id);
                                }}
                                className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-[#d9c7cd] px-3 text-[12px] font-semibold uppercase tracking-[0.03em] text-[#4a3c42] transition hover:border-[#b27b86] hover:text-[#b27b86]"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div ref={summaryRef} className="self-start lg:sticky lg:top-[132px]">
              <div className="space-y-5">
                <button
                  className="flex h-14 w-full items-center justify-center rounded-[4px] bg-[#b27b86] text-[15px] font-semibold uppercase tracking-[0.03em] text-white shadow-[0_10px_20px_rgba(178,123,134,0.18)] transition hover:bg-[#9f6571] disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={handleContinue}
                  disabled={!selectedAddressId || placingOrder}
                >
                  {placingOrder ? "Processing..." : "Continue To Payment"}
                </button>

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
                      <span className="font-medium text-[#b27b86]">Apply Coupon</span>
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

                <div className="rounded-[4px] border border-[#ece5e8] bg-white p-5 shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                  <h3 className="mb-4 text-[14px] font-semibold text-[#2f2428]">Delivery Estimates</h3>
                  <div className="space-y-3">
                    {visibleDeliveryItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={`${API_BASE}${item.image}`}
                          alt={item.name}
                          className="h-14 w-11 rounded-[4px] object-cover"
                        />
                        <p className="text-[13px] leading-5 text-[#5f4b52]">
                          Estimated delivery by{" "}
                          <span className="font-semibold text-[#2f2428]">
                            {item.deliveryDate || "5-7 Business Days"}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>

                  {cartItems.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => setShowAllDeliveryItems((prev) => !prev)}
                      className="mt-3 text-[13px] font-medium text-[#b27b86] transition hover:text-[#9f6571]"
                    >
                      {showAllDeliveryItems ? "View less" : "View more"}
                    </button>
                  ) : null}
                </div>

                <div className="rounded-[4px] border border-[#ece5e8] bg-[#fffafb] p-4 text-[12px] leading-5 text-[#6f6167] shadow-[0_6px_18px_rgba(45,28,35,0.05)]">
                  By continuing, you confirm this address for delivery and agree to our{" "}
                  <Link
                    href="/TermsAndConditions"
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

      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[520px] overflow-hidden rounded-[20px] border border-[#ecd9de] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
            <div className="border-b border-[#f0e4e8] px-5 py-4 text-[14px] font-semibold uppercase tracking-[0.03em] text-[#4a2e35]">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </div>

            <AddressForm
              editingAddress={editingAddress}
              onCancel={closeModal}
              onSaved={(newAddresses) => {
                const list = Array.isArray(newAddresses) ? newAddresses : [];
                setAddresses(list);
                const selected =
                  list.find((address) => address.isDefault)?._id || list[0]?._id || "";
                setSelectedAddressId(selected);
                if (selected) {
                  localStorage.setItem("selectedAddressId", selected);
                }
                closeModal();
              }}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
