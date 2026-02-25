"use client";

import { useState } from "react";
import { ShieldCheck, Plus } from "lucide-react";

import AddressList from "@/components/checkout/AddressList";
import AddressForm from "@/components/checkout/AddressForm";
import PriceDetails from "@/components/checkout/PriceDetails";
import PaymentOptions from "@/components/checkout/PaymentOptions";

const INITIAL_ADDRESSES = [
  {
    id: "1",
    name: "Puja Shukla",
    mobile: "9334966286",
    pincode: "121006",
    address: "N block second floor Nearest by park and mandir",
    locality: "Sector 77",
    city: "Faridabad",
    state: "Haryana",
    type: "HOME",
    isDefault: true,
  },
];

export default function CheckoutPage() {
  const [step, setStep] = useState("ADDRESS");
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState("1");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  /* =========================
     ADDRESS HANDLERS
  ========================= */

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handleRemoveAddress = (id) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    if (selectedAddressId === id) setSelectedAddressId("");
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const newAddress = {
      id: editingAddress?.id || Math.random().toString(36).slice(2, 9),
      name: formData.get("name"),
      mobile: formData.get("mobile"),
      pincode: formData.get("pincode"),
      address: formData.get("address"),
      locality: formData.get("locality"),
      city: formData.get("city"),
      state: formData.get("state"),
      type: formData.get("type") || "HOME",
      isDefault: formData.get("isDefault") === "on",
    };

    if (editingAddress) {
      setAddresses(
        addresses.map((a) =>
          a.id === editingAddress.id ? newAddress : a
        )
      );
    } else {
      setAddresses([...addresses, newAddress]);
      setSelectedAddressId(newAddress.id);
    }

    setIsAddressModalOpen(false);
  };

  /* =========================
     CART SUMMARY
  ========================= */

  const cartSummary = {
    itemCount: 2,
    totalMrp: 4910,
    discount: 3562,
    platformFee: 23,
    codFee: step === "PAYMENT" ? 10 : 0,
  };

  return (
    <div className="min-h-screen bg-white">

      {/* HEADER */}
      <header className="border-b sticky top-0 bg-white z-50">
        <div className="max-w-[1100px] mx-auto px-4 h-20 flex items-center justify-between">

          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F4a32a07903ee45dfad29e5eccd6c2ca9%2F7e0f0eeeb200423181cfaae08c5b2d4a"
            alt="logo"
            className="h-10"
          />

          <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400">
            <span className={step === "BAG" ? "text-green-600" : ""}>BAG</span>
            ----------
            <span
              onClick={() => setStep("ADDRESS")}
              className={step === "ADDRESS" ? "text-green-600 cursor-pointer" : "cursor-pointer"}
            >
              ADDRESS
            </span>
            ----------
            <span className={step === "PAYMENT" ? "text-green-600" : ""}>
              PAYMENT
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            100% SECURE
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-[1100px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

        {/* LEFT SIDE */}
        <div className="flex-1">

          {step === "ADDRESS" ? (
            <>
              <div className="flex justify-between mb-6">
                <h2 className="text-lg font-bold">
                  Select Delivery Address
                </h2>

                <button
                  onClick={handleAddAddress}
                  className="border px-4 h-10 text-xs font-bold uppercase"
                >
                  Add New Address
                </button>
              </div>

              <AddressList
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onEdit={handleEditAddress}
                onRemove={handleRemoveAddress}
              />

              <button
                onClick={handleAddAddress}
                className="w-full mt-4 border-2 border-dashed p-4 rounded flex items-center justify-center gap-2 text-pink-500 font-bold"
              >
                <Plus className="w-5 h-5" />
                Add New Address
              </button>
            </>
          ) : (
            <PaymentOptions
              onPlaceOrder={() => alert("Order Placed Successfully!")}
            />
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-[320px] space-y-6">

          <PriceDetails
            {...cartSummary}
            showContinue={step === "ADDRESS"}
            onContinue={() => setStep("PAYMENT")}
          />

        </div>
      </main>

      {/* ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-lg overflow-hidden">

            <div className="p-4 border-b font-bold text-sm uppercase">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </div>

            <AddressForm
              editingAddress={editingAddress}
              onSave={handleSaveAddress}
              onCancel={() => setIsAddressModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}