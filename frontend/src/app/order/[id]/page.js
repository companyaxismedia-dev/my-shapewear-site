"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Check,
  ChevronRight,
  MapPin,
  MessageCircle,
  User,
  X,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useOrders } from "@/context/OrderContext";
import { API_BASE } from "@/lib/api";
import ManageAccessModal from "@/components/orders/ManageAccessModal";
import ChangeAddressModal from "@/components/orders/ChangeAddressModal";
import AddressListModal from "@/components/orders/AddressListModal";
import AddEditAddressModal from "@/components/orders/AddEditAddressModal";
import ChangePhoneNumberModal from "@/components/orders/ChangePhoneNumberModal";
import ChangePaymentModal from "@/components/orders/cancel/ChangePaymentModal";
import PriceDetails from "@/components/orders/PriceDetails";
import { toast } from "sonner";

const TRACK_STAGES = [
  "Order Placed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const STATUS_INDEX = {
  "order placed": 0,
  processing: 1,
  packed: 1,
  shipped: 2,
  "out for delivery": 3,
  delivered: 4,
};

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getItemStatusStyles(status) {
  const normalized = String(status || "").toLowerCase();

  if (normalized.includes("cancel")) {
    return {
      badge: { background: "#FDECEC", color: "#C64640" },
      dot: "#D9534F",
    };
  }

  if (normalized.includes("deliver")) {
    return {
      badge: { background: "#EEF7D8", color: "#7A9A31" },
      dot: "#88A93E",
    };
  }

  if (normalized.includes("return")) {
    return {
      badge: { background: "#FFF1E6", color: "#D96D10" },
      dot: "#E67E22",
    };
  }

  return {
    badge: { background: "#FFF4E6", color: "#D98A12" },
    dot: "#E5A33A",
  };
}

export default function OrderDetail() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fetchOrderById, cancelItem } = useOrders();

  const [order, setOrder] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [showAccess, setShowAccess] = useState(false);
  const [showChangeAddress, setShowChangeAddress] = useState(false);
  const [showAddressList, setShowAddressList] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editAddress, setEditAddress] = useState(null);
  const [showChangePhone, setShowChangePhone] = useState(false);
  const [showChangePayment, setShowChangePayment] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelComment, setCancelComment] = useState("");
  const [isCancellingItem, setIsCancellingItem] = useState(false);

  const requestedItemIndex = Number(searchParams.get("item") || 0);

  const refreshAddresses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;

      const res = await axios.get(`${API_BASE}/api/users/address`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddresses(res.data.addresses || []);
    } catch (err) {
      console.error("Address refresh error", err);
    }
  };

  useEffect(() => {
    const loadOrder = async () => {
      const data = await fetchOrderById(id);
      if (!data) return;

      const maxIndex = Math.max((data.items?.length || 1) - 1, 0);
      const safeIndex =
        Number.isNaN(requestedItemIndex) || requestedItemIndex < 0
          ? 0
          : Math.min(requestedItemIndex, maxIndex);

      setOrder({
        ...data,
        canBeCancelled: true,
      });
      setSelectedItemIndex(safeIndex);
    };

    loadOrder();
  }, [fetchOrderById, id, requestedItemIndex]);

  useEffect(() => {
    const msg = sessionStorage.getItem("orderMessage");
    if (msg) {
      setSuccessMessage(msg);
      sessionStorage.removeItem("orderMessage");
    }
  }, []);

  useEffect(() => {
    refreshAddresses();
  }, []);

  const refreshOrder = async () => {
    const updated = await fetchOrderById(id);
    if (updated) {
      setOrder(updated);
    }
  };

  const handleStartChat = () => {
    localStorage.setItem("chatOrderId", order.id);
    router.push(`/support/${order.id}`);
  };

  const updateOrderAddress = async (addr) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const token = user?.token;

      if (!token) return false;

      await axios.put(
        `${API_BASE}/api/orders/update-address/${id}`,
        {
          name: addr.fullName,
          phone: addr.phone,
          address: addr.addressLine,
          city: addr.city,
          pincode: addr.pincode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      sessionStorage.setItem("orderMessage", "Delivery address updated");
      setSuccessMessage("Delivery address updated");
      return true;
    } catch (err) {
      setSuccessMessage("Failed to update address");
      return false;
    }
  };

  if (!order) {
    return (
      <div style={{ background: "var(--color-bg)" }} className="min-h-screen">
        <Navbar />
        <div className="py-20 text-center" style={{ color: "var(--color-body)" }}>
          Loading order...
        </div>
        <Footer />
      </div>
    );
  }

  const items = order.items?.length ? order.items : order.products || [];
  const selectedItem = items[selectedItemIndex] || items[0];
  const otherItems = items
    .map((item, index) => ({ item, index }))
    .filter(({ index }) => index !== selectedItemIndex);
  const selectedStatus = String(selectedItem?.itemStatus || "Order Placed");
  const selectedStatusStyles = getItemStatusStyles(selectedStatus);
  const selectedImage = selectedItem?.img ? `${API_BASE}${selectedItem.img}` : null;
  const selectedLineTotal =
    selectedItem?.lineTotal ||
    (selectedItem?.price || 0) * (selectedItem?.quantity || 1);
  const selectedStatusHistory = [...(selectedItem?.itemStatusHistory || [])].sort(
    (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
  );
  const statusDates = Object.fromEntries(
    selectedStatusHistory.map((entry) => [String(entry.status || "").toLowerCase(), entry.date])
  );
  const currentStageIndex = STATUS_INDEX[selectedStatus.toLowerCase()] ?? 0;
  const canCancelItem = ["Order Placed", "Processing", "Packed"].includes(selectedStatus);
  const normalizedSelectedStatus = selectedStatus.toLowerCase();
  const isCancelledItem = normalizedSelectedStatus.includes("cancel");

  const trackingSteps = (() => {
    if (isCancelledItem) {
      const uniqueHistory = [];

      for (const entry of selectedStatusHistory) {
        const label = entry?.status || "";
        if (!label) continue;
        if (!uniqueHistory.some((item) => item.label === label)) {
          uniqueHistory.push({
            label,
            date: entry?.date || null,
            completed: true,
          });
        }
      }

      if (!uniqueHistory.some((item) => item.label === "Cancelled")) {
        uniqueHistory.push({
          label: "Cancelled",
          date: selectedStatusHistory[selectedStatusHistory.length - 1]?.date || null,
          completed: true,
        });
      }

      return uniqueHistory;
    }

    return TRACK_STAGES.map((stage, index) => ({
      label: stage,
      date: statusDates[stage.toLowerCase()] || null,
      completed: index <= currentStageIndex,
    }));
  })();

  const orderStatus = String(order.status || "").toLowerCase().trim();
  const orderTime = new Date(order.createdAt).getTime();
  const now = new Date().getTime();
  const canChangePayment =
    now - orderTime <= 2 * 60 * 60 * 1000 &&
    order.paymentType === "COD" &&
    !order.paymentChanged &&
    !["shipped", "out for delivery", "delivered", "cancelled"].includes(orderStatus);
  const canEditPhone = orderStatus === "order placed" || orderStatus === "processing";
  const isAddressEditable = order?.canEditAddress === true;

  const openItem = (itemIndex) => {
    setSelectedItemIndex(itemIndex);
    router.push(`/order/${id}?item=${itemIndex}`);
  };

  const handleCancelSelectedItem = async () => {
    if (!cancelReason) {
      toast.error("Please select cancellation reason");
      return;
    }

    try {
      setIsCancellingItem(true);
      await cancelItem(order.id || order._id, selectedItemIndex, cancelReason, cancelComment);
      setShowCancelModal(false);
      setCancelReason("");
      setCancelComment("");
      await refreshOrder();
      setSuccessMessage("Item cancelled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel item");
    } finally {
      setIsCancellingItem(false);
    }
  };

  return (
    <div style={{ background: "var(--color-bg)" }} className="min-h-screen flex flex-col">
      <Navbar />

      <div style={{ background: "var(--color-card)", borderBottom: "1px solid var(--color-border)" }}>
        <div className="mx-auto flex w-full max-w-[420px] flex-wrap gap-2 px-3 py-3 text-sm sm:max-w-7xl sm:px-4" style={{ color: "var(--color-body)" }}>
          <Link href="/" style={{ color: "var(--color-body)", textDecoration: "none" }}>Home</Link>
          <ChevronRight size={16} />
          <Link href="/order" style={{ color: "var(--color-body)", textDecoration: "none" }}>My Orders</Link>
          <ChevronRight size={16} />
          <span style={{ color: "var(--color-heading)" }}>Order {order.orderNumber}</span>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[420px] flex-1 gap-5 px-3 py-5 sm:max-w-[520px] sm:px-4 lg:max-w-[1360px] lg:grid-cols-[minmax(0,1.45fr)_360px] lg:px-6">
        <div className="mx-auto w-full max-w-full space-y-5 lg:mx-0 lg:max-w-none">
          <div className="card-imkaa p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Order ID: {order.orderNumber}
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--color-body)" }}>
                  Ordered on {formatDate(order.createdAt)}
                </p>
              </div>

              <button
                onClick={handleStartChat}
                className="flex items-center gap-2 rounded-full border px-4 py-2 transition"
                style={{ borderColor: "var(--color-border)", color: "var(--color-body)" }}
              >
                <MessageCircle size={16} />
                Chat with us
              </button>
            </div>
          </div>

          <div className="card-imkaa overflow-hidden p-4 sm:p-6">
            <div className="grid gap-4 md:gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-[22px] md:rounded-[26px]" style={{ background: "var(--color-bg)" }}>
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={selectedItem?.name || "Product"}
                    width={220}
                    height={260}
                    className="h-[220px] w-full object-cover md:h-[260px]"
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center text-sm md:h-[260px]" style={{ color: "var(--color-muted)" }}>
                    No image
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#9B4F4F" }}>
                      {selectedItem?.brand || "Product"}
                    </p>
                    <h1 className="mt-1 text-xl font-semibold leading-tight md:text-2xl" style={{ color: "var(--color-heading)" }}>
                      {selectedItem?.name}
                    </h1>
                    <p className="mt-2 text-sm" style={{ color: "var(--color-body)" }}>
                      1 item in this product line
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                    <div className="rounded-2xl p-3 md:p-4" style={{ background: "var(--color-bg)" }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>Size</p>
                      <p className="mt-1 font-medium" style={{ color: "var(--color-heading)" }}>{selectedItem?.size || "-"}</p>
                    </div>
                    <div className="rounded-2xl p-3 md:p-4" style={{ background: "var(--color-bg)" }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>Quantity</p>
                      <p className="mt-1 font-medium" style={{ color: "var(--color-heading)" }}>{selectedItem?.quantity || 1}</p>
                    </div>
                    <div className="rounded-2xl p-3 md:p-4" style={{ background: "var(--color-bg)" }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>Price</p>
                      <p className="mt-1 font-medium" style={{ color: "var(--color-heading)" }}>Rs. {Number(selectedLineTotal || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {canCancelItem ? (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="rounded-full px-5 py-3 text-sm font-semibold transition"
                        style={{ background: "#FFE5E5", color: "#C0392B", border: "1px solid #F5CCCC" }}
                      >
                        Cancel Item
                      </button>
                    ) : null}

                    <button
                      onClick={() => setShowTrackModal(true)}
                      className="rounded-full px-5 py-3 text-sm font-semibold transition"
                      style={{ background: "#EEF6FF", color: "#245FA7", border: "1px solid #D6E7FB" }}
                    >
                      Track
                    </button>
                  </div>
                </div>

                <div className="rounded-[24px] border p-4 md:p-5" style={{ borderColor: "var(--color-border)", background: "#fffdfb" }}>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                    Delivery Status
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold" style={selectedStatusStyles.badge}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: selectedStatusStyles.dot }} />
                    {selectedStatus}
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl p-4" style={{ background: "var(--color-bg)" }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                        Estimated Delivery
                      </p>
                      <p className="mt-1 font-medium" style={{ color: "var(--color-heading)" }}>
                        {formatDate(selectedItem?.estimatedDelivery)}
                      </p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: "var(--color-bg)" }}>
                      <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>
                        Latest Update
                      </p>
                      <p className="mt-1 font-medium" style={{ color: "var(--color-heading)" }}>
                        {formatDate(selectedStatusHistory[selectedStatusHistory.length - 1]?.date)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {otherItems.length > 0 ? (
            <div className="card-imkaa p-5 sm:p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold" style={{ color: "var(--color-heading)" }}>
                  Other items in this order
                </h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Order ID # {order.orderNumber}
                </p>
              </div>

              <div className="overflow-hidden rounded-[24px] border" style={{ borderColor: "var(--color-border)" }}>
                {otherItems.map(({ item, index }) => (
                  <button
                    key={`${order.id}-${index}`}
                    type="button"
                    onClick={() => openItem(index)}
                    className="flex w-full items-center gap-4 border-b px-4 py-4 text-left last:border-b-0 transition hover:bg-[#faf7f3] sm:px-5"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl" style={{ background: "var(--color-bg)" }}>
                      {item?.img ? (
                        <Image
                          src={`${API_BASE}${item.img}`}
                          alt={item.name || "Product"}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium" style={{ color: "#9B4F4F" }}>
                        {item.brand || "Product"}
                      </p>
                      <p className="mt-1 text-lg font-medium leading-tight" style={{ color: "var(--color-heading)" }}>
                        {item.name}
                      </p>
                      <p className="mt-2 text-sm" style={{ color: "var(--color-body)" }}>
                        Size: {item.size || "-"}
                      </p>
                    </div>

                    <ChevronRight size={22} style={{ color: "var(--color-muted)" }} />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-full space-y-5 lg:mx-0 lg:max-w-none">
          {successMessage ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-green-600">OK</span>
                <div>
                  <p className="font-semibold">{successMessage}</p>
                  <p className="text-sm text-green-700">
                    Your order details have been updated.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 w-full">
            <div
              onClick={() => setShowAddressList(true)}
              className="cursor-pointer rounded-xl bg-gray-50 p-5 transition hover:bg-gray-100"
            >
              <div className="space-y-4 rounded-xl bg-gray-50 p-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-3">
                    <MapPin className="mt-1 h-5 w-5 text-gray-400" />
                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-700">
                      {[
                        order.deliveryAddress?.address || order.userInfo?.address,
                        order.deliveryAddress?.city || order.userInfo?.city,
                      ].filter(Boolean).join(", ")} - {order.deliveryAddress?.pincode || order.userInfo?.pincode}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                <div
                  onClick={(event) => {
                    event.stopPropagation();
                    setShowChangePhone(true);
                  }}
                  className="flex cursor-pointer items-center justify-between gap-3"
                >
                  <div className="flex gap-3">
                    <User className="mt-1 h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">
                        {order.recipientName || order.userInfo?.name || "Customer"}
                      </span>{" "}
                      {order.recipientPhone || order.userInfo?.phone}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {canChangePayment ? (
            <div className="rounded-lg p-3" style={{ background: "#FEF3CD", border: "1px solid #FFC107", color: "#856404", fontSize: "14px" }}>
              You can change payment method within 2 hours of placing the order.
            </div>
          ) : null}

          {canChangePayment ? (
            <div className="card-imkaa p-4">
              <p className="mb-3 text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
                Change Payment Method
              </p>
              <button onClick={() => setShowChangePayment(true)} className="btn-primary-imkaa w-full">
                Change Payment
              </button>
            </div>
          ) : null}

          <PriceDetails order={order} />
        </div>
      </div>

      <ManageAccessModal showAccess={showAccess} setShowAccess={setShowAccess} order={order} />

      <ChangeAddressModal
        showChangeAddress={showChangeAddress}
        setShowChangeAddress={setShowChangeAddress}
        setShowAddressList={setShowAddressList}
        order={order}
        refreshOrder={() => fetchOrderById(id)}
        isAddressEditable={isAddressEditable}
      />

      <AddressListModal
        showAddressList={showAddressList}
        setShowAddressList={setShowAddressList}
        addresses={addresses}
        setEditAddress={setEditAddress}
        setShowAddAddress={setShowAddAddress}
        isAddressEditable={isAddressEditable}
        onSelectAddress={async (addr) => {
          const res = await updateOrderAddress(addr);
          if (!res) return;

          setOrder((prev) => ({
            ...prev,
            deliveryAddress: {
              address: addr.addressLine,
              city: addr.city,
              pincode: addr.pincode,
              state: addr.state,
            },
            recipientName: addr.fullName,
            recipientPhone: addr.phone,
          }));
          setShowAddressList(false);
        }}
      />

      <AddEditAddressModal
        showAddAddress={showAddAddress}
        setShowAddAddress={setShowAddAddress}
        editAddress={editAddress}
        setEditAddress={setEditAddress}
        refreshAddresses={refreshAddresses}
        onAddressSaved={async (addr) => {
          const res = await updateOrderAddress(addr);
          if (!res) return;

          setOrder((prev) => ({
            ...prev,
            deliveryAddress: {
              address: addr.addressLine,
              city: addr.city,
              pincode: addr.pincode,
              state: addr.state,
            },
            recipientName: addr.fullName,
            recipientPhone: addr.phone,
          }));
        }}
      />

      <ChangePhoneNumberModal
        showChangePhone={showChangePhone}
        setShowChangePhone={setShowChangePhone}
        currentPhone={order.userInfo?.phone}
        currentName={order.userInfo?.name}
        isPhoneEditable={canEditPhone}
        onPhoneChange={async (data) => {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          const token = user?.token;

          try {
            setShowProcessing(true);
            await axios.put(
              `${API_BASE}/api/orders/update-phone/${id}`,
              {
                name: data.name,
                primary: data.primary,
                alternate: data.alternate,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setShowProcessing(false);
            setShowSuccessPopup(true);
            setShowChangePhone(false);
            sessionStorage.setItem("orderMessage", "Phone number updated");
          } catch (err) {
            toast.error(err.response?.data?.message || "Phone update failed");
            return;
          }

          setOrder((prev) => ({
            ...prev,
            userInfo: {
              ...prev.userInfo,
              name: data.name,
              phone: data.primary,
              alternatePhone: data.alternate,
            },
          }));
        }}
      />

      <ChangePaymentModal
        show={showChangePayment}
        setShow={setShowChangePayment}
        orderId={id}
        refreshOrder={async () => {
          const updated = await fetchOrderById(id);
          setOrder(updated);
        }}
      />

      {showTrackModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(74, 46, 53, 0.35)" }}>
          <div className="w-full max-w-sm rounded-[28px] bg-white p-5 md:p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>Tracking item</p>
                <h3 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
                  {selectedItem?.name}
                </h3>
              </div>
              <button onClick={() => setShowTrackModal(false)} className="rounded-full p-2" style={{ background: "var(--color-bg)", color: "var(--color-body)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-0">
              {trackingSteps.map((step, index) => {
                const completed = step.completed;
                const isLast = index === trackingSteps.length - 1;
                return (
                  <div key={`${step.label}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold"
                        style={{
                          background: completed ? "#27AE60" : "white",
                          borderColor: completed ? "#27AE60" : "#EAD9D9",
                          color: completed ? "white" : "#DABFC0",
                        }}
                      >
                        {completed ? <Check size={18} strokeWidth={3} /> : null}
                      </div>
                      {!isLast ? (
                        <div style={{ width: "2px", minHeight: "56px", background: completed ? "#27AE60" : "#F0DCDC" }} />
                      ) : null}
                    </div>
                    <div className="pb-8 pt-1">
                      <p className="text-[15px] font-semibold" style={{ color: "var(--color-heading)" }}>
                        {step.label}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
                        {completed ? formatDate(step.date) : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {showCancelModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(74, 46, 53, 0.35)" }}>
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>Cancel item</p>
                <h3 className="text-xl font-semibold" style={{ color: "var(--color-heading)" }}>
                  {selectedItem?.name}
                </h3>
              </div>
              <button onClick={() => setShowCancelModal(false)} className="rounded-full p-2" style={{ background: "var(--color-bg)", color: "var(--color-body)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <select
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                className="input-imkaa w-full"
              >
                <option value="">Select reason for cancellation</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Item not needed anymore">Item not needed anymore</option>
                <option value="Long delivery time">Long delivery time</option>
                <option value="Other">Other</option>
              </select>

              <textarea
                value={cancelComment}
                onChange={(event) => setCancelComment(event.target.value)}
                placeholder="Additional comments (optional)"
                className="input-imkaa min-h-24 w-full"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-full px-5 py-3 font-medium"
                style={{ background: "var(--color-bg)", color: "var(--color-body)" }}
              >
                Back
              </button>
              <button onClick={handleCancelSelectedItem} disabled={isCancellingItem} className="btn-primary-imkaa flex-1">
                {isCancellingItem ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showProcessing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(74, 46, 53, 0.35)" }}>
          <div className="flex items-center gap-3 rounded-lg bg-white px-8 py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-4" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
            <div>
              <p className="font-semibold" style={{ color: "var(--color-heading)" }}>Please wait...</p>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>We are processing your request</p>
            </div>
          </div>
        </div>
      ) : null}

      {showSuccessPopup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(74, 46, 53, 0.35)" }}>
          <div className="w-[360px] rounded-lg bg-white text-center">
            <div className="p-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div className="mb-2 text-2xl" style={{ color: "#27AE60" }}>OK</div>
              <p className="font-semibold" style={{ color: "#27AE60" }}>
                Your phone number has been updated
              </p>
            </div>
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                router.refresh();
              }}
              className="w-full py-3 font-semibold"
              style={{ color: "var(--color-primary)", borderTop: "1px solid var(--color-border)" }}
            >
              OKAY
            </button>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  );
}
