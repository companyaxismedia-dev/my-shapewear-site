"use client";

import { useEffect, useState, useRef } from "react";
import { ShieldCheck, Plus } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useRouter } from "next/navigation";

import AddressList from "@/components/checkout/AddressList";
import AddressForm from "@/components/checkout/AddressForm";
import PriceDetails from "@/components/checkout/PriceDetails";
import DeliveryEstimates from "@/components/checkout/DeliveryEstimates";


export default function CheckoutPage() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const hasSelectedAddress = !!selectedAddressId;
  const [highlightContinue, setHighlightContinue] = useState(false);
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const priceSectionRef = useRef(null);

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const closeModal = () => {
    window.history.replaceState(null, "", window.location.pathname);
    setIsAddressModalOpen(false);
  };

  /* ================= URL MODAL ================= */
  useEffect(() => {
    const checkHash = () => {
      setIsAddressModalOpen(window.location.hash === "#modal");
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);

    return () =>
      window.removeEventListener("hashchange", checkHash);
  }, []);

  /* ================= TOKEN ================= */
  const getToken = () => {
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  return stored?.token;
};

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      setLoading(true);

      const [addrRes, cartRes] = await Promise.all([
        fetch(`${API_BASE}/api/users/address`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const addrData = await addrRes.json();
      const cartData = await cartRes.json();

      const list = addrData?.addresses || [];
      setAddresses(list);

      // ⭐ THIS WAS MISSING
      const defaultAddr = list.find((a) => a.isDefault);

      const selected =
        defaultAddr?._id || list?.[0]?._id || "";

      setSelectedAddressId(selected);
      localStorage.setItem("selectedAddressId", selected);
      closeModal();

      setCartItems(cartData?.items || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= ADDRESS ACTIONS ================= */
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

      await fetch(`${API_BASE}/api/users/address/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddresses((prev) => {
        const updated = prev.filter((a) => a._id !== id);
        if (selectedAddressId === id) {
          setSelectedAddressId(updated?.[0]?._id || "");
        }
        return updated;
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSelectAddress = async (id) => {
    setSelectedAddressId(id);

    localStorage.setItem("selectedAddressId", id);

    setHighlightContinue(true);
    setTimeout(() => setHighlightContinue(false), 1200);

    setTimeout(() => {
      priceSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 200);

    try {
      const token = getToken();

      await fetch(`${API_BASE}/api/users/address/default/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= SAVE ADDRESS ================= */
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    const token = getToken();
    const formData = new FormData(e.currentTarget);

    const body = {
      fullName: formData.get("name"),
      phone: formData.get("mobile"),
      altPhone: formData.get("altPhone") || "",
      pincode: formData.get("pincode"),
      city: formData.get("city"),
      state: formData.get("state"),
      addressLine: formData.get("address"),
      landmark: formData.get("landmark") || "",
      addressType: formData.get("type"),
      isDefault: formData.get("isDefault") === "on",
    };

    try {
      const url = editingAddress
        ? `${API_BASE}/api/users/address/${editingAddress._id}`
        : `${API_BASE}/api/users/address`;

      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("ORDER API RESPONSE:", data);
      setAddresses(data.addresses || []);
      closeModal();
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= CART ================= */
  const totalMrp = cartItems.reduce(
  (sum, i) => sum + (i.product?.mrp || i.product?.minPrice || 0) * i.qty,
  0
);

const sellingPrice = cartItems.reduce(
  (sum, i) => sum + (i.product?.minPrice || i.product?.price || 0) * i.qty,
  0
);

  const discount = totalMrp - sellingPrice;

  const cartSummary = {
    itemCount: cartItems.length,
    totalMrp,
    discount,
    platformFee: 23,
    codFee: 0,
  };

  /* ================= CONTINUE ================= */
  // Add state for paymentType and couponCode
  const [paymentType, setPaymentType] = useState("cod");
  const [couponCode, setCouponCode] = useState("");

  const goToPayment = async () => {
    if (!selectedAddressId) {
      alert("Please select delivery address");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty. Please add items to cart.");
      return;
    }

    try {
      const token = getToken();
      // Build products array for order schema
      const products = cartItems.map((item) => {
        const price = item.product.minPrice || item.product.price;
        const quantity = item.qty;
        return {
          productId: item.product._id,
          name: item.product.name,
          img: item.product.img,
          size: item.size,
          color: item.color,
          price,
          quantity,
          lineTotal: price * quantity,
        };
      });

      const orderPayload = {
        addressId: selectedAddressId,
        products,
        paymentType,
        offerCode: couponCode,
      };
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.message || "Order create failed");
        return;
      }

      const data = await res.json();
      console.log("ORDER RESPONSE:", data);
      if (!data || !data.orderId) {
        alert("Order creation failed");
        return;
      }
      const orderId = data.orderId;
      console.log("ORDER API RESPONSE:", data);
      if (!orderId) {
        alert("Order ID missing");
        return;
      }
      window.location.href = `/payment?order=${orderId}&address=${selectedAddressId}`;
    } catch (err) {
      console.log(err);
      alert("Order create error");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Loading checkout...
      </div>
    );

  return (
    <div className="min-h-screen bg-white">

      {/* HEADER */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto h-[78px] px-4 flex items-center relative">

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <span className="text-[13px] tracking-[3px] font-semibold uppercase text-[#03a685]">
              BAG
            </span>
            <span className="mx-4 text-[#94969f] text-[11px]">------------</span>
            <span className="text-[13px] tracking-[3px] font-semibold uppercase text-[#03a685]">
              ADDRESS
            </span>
            <span className="mx-4 text-[#94969f] text-[11px]">------------</span>
            <span className="text-[13px] tracking-[3px] font-semibold uppercase text-[#696b79]">
              PAYMENT
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2 text-[12px] font-bold tracking-[2px] text-[#282c3f] uppercase">
            <ShieldCheck className="w-4 h-4 text-[#03a685]" />
            100% Secure
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-[1100px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">

        <div className="flex-1">
          <div className="flex justify-between mb-6">
            <h2 className="text-lg font-bold">Select Delivery Address</h2>

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
            onSelect={handleSelectAddress}
            onEdit={handleEditAddress}
            onRemove={handleRemoveAddress}
            onRefresh={fetchData}
          />

          <button
            onClick={handleAddAddress}
            className="w-full mt-4 border-2 border-dashed p-4 rounded flex items-center justify-center gap-2 text-pink-500 font-bold"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        </div>

        <div ref={priceSectionRef} className="w-full md:w-[320px] space-y-4">
          <DeliveryEstimates cartItems={cartItems} />

          {/* Payment Type and Coupon UI */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Payment Type</label>
            <select
              value={paymentType}
              onChange={e => setPaymentType(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="cod">Cash on Delivery</option>
              <option value="prepaid">Prepaid</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Coupon Code</label>
            <input
              type="text"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Enter coupon code (optional)"
            />
          </div>
          <PriceDetails
            {...cartSummary}
            showContinue={true}
            onContinue={goToPayment}
            highlightContinue={highlightContinue}
            hasSelectedAddress={hasSelectedAddress}
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
              onCancel={closeModal}
              onSaved={(newAddresses) => {
                setAddresses(newAddresses);
                const selected =
                  newAddresses.find((a) => a.isDefault)?._id ||
                  newAddresses?.[0]?._id ||
                  "";
                setSelectedAddressId(selected);
                closeModal();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}