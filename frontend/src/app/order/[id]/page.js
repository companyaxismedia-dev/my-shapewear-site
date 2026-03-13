"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
    ChevronRight,
    ChevronDown,
    MapPin,
    User,
    MessageCircle,
    X,
} from "lucide-react";


import { useOrders } from "@/context/OrderContext";

import { API_BASE } from "@/lib/api";
import ManageAccessModal from "@/components/orders/ManageAccessModal";
import ChangeAddressModal from "@/components/orders/ChangeAddressModal";
import AddressListModal from "@/components/orders/AddressListModal";
import AddEditAddressModal from "@/components/orders/AddEditAddressModal";
import CancelOrderModal from "@/components/orders/cancel/CancelOrderModal";
import ChangePhoneNumberModal from "@/components/orders/ChangePhoneNumberModal";
import PriceDetails from "@/components/orders/PriceDetails";
import ChangePaymentModal from "@/components/orders/cancel/ChangePaymentModal";


export default function OrderDetail() {
    const { id } = useParams();
    const { fetchOrderById } = useOrders();

    const [order, setOrder] = useState(null);

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelledOrder, setCancelledOrder] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const [showFeeDetails, setShowFeeDetails] = useState(false);
    const [showDiscountDetails, setShowDiscountDetails] = useState(false);
    const [showOffersDetails, setShowOffersDetails] = useState(false);

    const [showAccess, setShowAccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState("")
    const [showProcessing, setShowProcessing] = useState(false)
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)

    const [showChangeAddress, setShowChangeAddress] = useState(false)
    const [showAddressList, setShowAddressList] = useState(false)
    const [addresses, setAddresses] = useState([])

    const [showAddAddress, setShowAddAddress] = useState(false)
    const [editAddress, setEditAddress] = useState(null)
    const [showChangePhone, setShowChangePhone] = useState(false)
    const [showChangePayment, setShowChangePayment] = useState(false)

    const router = useRouter();


    const handleStartChat = () => {

        localStorage.setItem("chatOrderId", order.id)

        router.push(`/support/${order.id}`)

    }

    const refreshAddresses = async () => {

        try {

            const user = JSON.parse(localStorage.getItem("user") || "{}")
            const token = user?.token

            const res = await axios.get(
                `${API_BASE}/api/users/address`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            setAddresses(res.data.addresses)

        }
        catch (err) {
            console.error("Address refresh error", err)
        }

    }
    /* ================= FETCH ORDER ================= */

    useEffect(() => {
        const loadOrder = async () => {
            const o = await fetchOrderById(id);
            if (!o) return;

            setOrder({
                ...o,
                canBeCancelled: true,
            });
        };

        loadOrder();
    }, [id, fetchOrderById]);

    useEffect(() => {
        const msg = sessionStorage.getItem("orderMessage")

        if (msg) {
            setSuccessMessage(msg)
            sessionStorage.removeItem("orderMessage")
        }
    }, [])


    /* ================= FETCH ADDRESSES ================= */

    useEffect(() => {

        const fetchAddresses = async () => {

            const user = JSON.parse(localStorage.getItem("user") || "{}")
            const token = user?.token;

            const res = await axios.get(
                `${API_BASE}/api/users/address`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setAddresses(res.data.addresses);

        };

        fetchAddresses();

    }, []);
    /* ================= CANCEL ORDER ================= */

    const handleCancelOrder = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = user?.token;

            await axios.put(
                `${API_BASE}/api/orders/cancel/${id}`,
                { reason: cancelReason },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setCancelledOrder(true);
            setShowCancelModal(false);

            setOrder((prev) => ({
                ...prev,
                status: "cancelled",
            }));
        } catch (err) {
            console.error(err);
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="text-center py-20">Loading order...</div>
            </div>
        );
    }

    const status = order.status?.toLowerCase().trim();
    /* ================= PAYMENT CHANGE WINDOW ================= */

    const orderTime = new Date(order.createdAt).getTime();
    const now = new Date().getTime();

    const twoHours = 2 * 60 * 60 * 1000;

    const canChangePayment =
        now - orderTime <= twoHours &&
        order.paymentType === "COD" &&
        !order.paymentChanged &&
        !["shipped", "out for delivery", "delivered", "cancelled"].includes(status);
    const canEditPhone =
        status === "order placed" ||
        status === "processing";

    const isAddressEditable = order?.canEditAddress === true;

    const getStatusColor = (status) => {
        if (status === "cancelled" || status === "Cancelled") return "text-red-600 bg-red-50";
        if (status === "delivered" || status === "Delivered") return "text-green-600 bg-green-50";
        return "text-blue-600 bg-blue-50";
    };

    const getStatusLabel = (status) =>
        status?.charAt(0).toUpperCase() + status?.slice(1);
    /* ================= CHANGE PAYMENT METHOD ================= */

    const changePaymentMethod = async (method) => {

        try {
            if (!canChangePayment) {
                alert("Payment method can only be changed within 2 hours of placing the order.");
                return;
            }

            const user = JSON.parse(localStorage.getItem("user") || "{}")
            const token = user?.token

            await axios.put(
                `${API_BASE}/api/orders/payment/${id}`,
                {
                    paymentMethod: method,
                    paymentStatus: "Paid"
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            const updated = await fetchOrderById(id)
            setOrder(updated)

            alert("Payment updated successfully")

        } catch (err) {

            setSuccessMessage(err.response?.data?.message || "Payment update failed")

        }

    }

    /* ================= UPDATE ORDER ADDRESS ================= */

    const updateOrderAddress = async (addr) => {


        try {

            const user = JSON.parse(localStorage.getItem("user") || "{}")
            const token = user?.token

            if (!token) return false

            await axios.put(
                `${API_BASE}/api/orders/update-address/${id}`,
                {
                    name: addr.fullName,
                    phone: addr.phone,
                    address: addr.addressLine,
                    city: addr.city,
                    pincode: addr.pincode
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            sessionStorage.setItem("orderMessage", "Delivery address updated")
            setSuccessMessage("Delivery address updated")

            return true

        } catch (err) {

            setSuccessMessage("Failed to update address")
            return false

        }

    }

    /* ================= TRACKING STAGES ================= */

    const stages = [
        "Order Placed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
    ];

    const statusMap = {
        "order placed": 0,
        processing: 1,
        shipped: 2,
        "out for delivery": 3,
        delivered: 4,
    };

    const currentIndex = statusMap[status] ?? 0;

    /* ================= CANCELLED ORDER UI ================= */

    if (status === "cancelled") {
        return (
            <div className="min-h-screen bg-gray-50">



                <div className="max-w-4xl mx-auto py-20 text-center">

                    <h1 className="text-2xl font-bold text-red-600 mb-4">
                        Order Cancelled
                    </h1>

                    <p className="text-gray-600">
                        Your order has been cancelled successfully.
                    </p>

                    <Link
                        href="/order"
                        className="inline-block mt-6 px-6 py-3 bg-black text-white rounded"
                    >
                        Back to Orders
                    </Link>

                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">




            {/* Breadcrumb */}

            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 text-sm">
                    <Link href="/">Home</Link>
                    <ChevronRight size={16} />
                    <Link href="/order">My Orders</Link>
                    <ChevronRight size={16} />
                    <span>Order {order.orderNumber}</span>
                </div>
            </div>

            {/* MAIN */}

            <div className="w-full max-w-[1400px] mx-auto px-6 py-6 grid lg:grid-cols-[1.7fr_1fr] gap-6">



                <div className="space-y-6">

                    {/* TRACK + ACCESS SECTION (Flipkart style) */}

                    <div className="bg-white border border-gray-200 rounded-md">

                        {/* TOP TEXT */}

                        <div className="p-4 text-sm text-gray-700">

                            <p>
                                Order can be tracked by{" "}
                                <span className="font-semibold">
                                    {order.recipientPhone || "Phone not available"}
                                </span>.
                            </p>

                            <p className="text-gray-500 mt-1">
                                Tracking link is shared via SMS.
                            </p>

                        </div>

                        {/* DIVIDER */}

                        <div className="border-t border-gray-200"></div>

                        {/* MANAGE ACCESS */}

                        <div
                            onClick={() => setShowAccess(true)}
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        >

                            <span className="text-sm font-medium text-gray-800">
                                Manage who can access
                            </span>

                            <ChevronRight size={18} className="text-gray-400" />

                        </div>

                    </div>

                    {/* ORDER HEADER */}

                    <div className="bg-white rounded p-5 border border-gray-200">
                        <div className="flex justify-between mb-6">

                            <div>
                                <p className="text-sm text-gray-500">Order Number</p>
                                <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
                            </div>

                            <div
                                className={`px-4 py-2 rounded text-sm font-semibold ${getStatusColor(
                                    order.status
                                )}`}
                            >
                                {getStatusLabel(order.status)}
                            </div>
                        </div>

                        <div className="flex gap-3">

                            <button
                                onClick={handleStartChat}
                                className="px-4 py-2 border rounded flex gap-2 items-center hover:bg-gray-50"
                            >
                                <MessageCircle size={16} />
                                Chat with us
                            </button>

                            {status !== "shipped" &&
                                status !== "delivered" &&
                                status !== "cancelled" && (
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="px-4 py-2 bg-red-50 border border-red-200 rounded text-red-600"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                        </div>
                    </div>

                    {/* PRODUCTS */}

                    <div className="bg-white rounded border border-gray-200 p-5">
                        <h2 className="font-bold text-lg mb-6">Product Details</h2>

                        {order?.products?.map((item, i) => (
                            <div
                                key={i}
                                className="flex gap-4 pb-4 border-b last:border-b-0"
                            >
                                <Image
                                    src={item.img || item.imageUrl || "/placeholder.jpg"}
                                    alt={item.name || item.title || "Product image"}
                                    width={96}
                                    height={96}
                                    className="w-24 h-24 rounded object-cover bg-gray-100"
                                />
                                <div className="flex-1">

                                    <h3 className="font-medium">{item.name || item.title}</h3>

                                    {item.color && (
                                        <p className="text-sm text-gray-600">
                                            Color: {item.color}
                                        </p>
                                    )}

                                    {item.size && (
                                        <p className="text-sm text-gray-600">
                                            Size: {item.size}
                                        </p>
                                    )}

                                    <p className="text-sm text-gray-600 mt-1">
                                        Quantity: {item.quantity}
                                    </p>

                                    <div className="flex gap-2 mt-2 items-center">
                                        <span className="text-lg font-bold">
                                            ₹{item.price}
                                        </span>

                                        {item.listingPrice > item.price && (
                                            <span className="text-sm text-gray-400 line-through">
                                                ₹{item.listingPrice}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>



                    {/* TRACKING */}

                    {(order.trackingEvents && order.trackingEvents.length > 0) ? (
                        <div className="bg-white rounded p-6">
                            <h2 className="font-semibold text-lg mb-6">
                                Delivery Status
                            </h2>
                            <div className="flex justify-between items-center mb-6">

                                <div>

                                    <p className="text-sm text-gray-600">
                                        Tracking No – {order.trackingId || "Not generated"}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        Courier – {order.courier || "ShadowFax"}
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://shiprocket.co/tracking/${order.trackingId}`,
                                            "_blank"
                                        )
                                    }
                                    className="border border-pink-500 text-pink-600 px-4 py-2 rounded text-sm hover:bg-pink-50"
                                >
                                    Open Tracking Link
                                </button>

                            </div>

                            <p className="text-sm text-gray-600 mb-6">
                                Estimated delivery by{" "}
                                <span className="font-medium">
                                    {order.deliveryDate || "3-5 working days"}
                                </span>
                            </p>
                            <button
                                onClick={() =>
                                    window.open(`${API_BASE}/api/orders/invoice/${order.id}`)
                                }
                                className="text-sm text-blue-600 underline mb-6"
                            >
                                Download Invoice
                            </button>

                            <div className="bg-white rounded p-6">


                                <div className="space-y-3">

                                    {stages.map((stage, index) => {

                                        const completed = index <= currentIndex;

                                        return (

                                            <div key={index} className="flex gap-4">

                                                <div className="flex flex-col items-center">

                                                    <div
                                                        className={`w-6 h-6 flex items-center justify-center rounded-full border-2
                                                    ${completed ? "bg-green-500 border-green-500 text-white" : "border-gray-300 bg-white"}`}
                                                    >
                                                        {completed && "✓"}
                                                    </div>

                                                    {index !== stages.length - 1 && (
                                                        <div
                                                            className={`w-[2px] h-8 ${completed ? "bg-green-500" : "bg-gray-200"}`}
                                                        ></div>
                                                    )}

                                                </div>

                                                <div>

                                                    <p className="font-medium text-gray-800">
                                                        {stage}
                                                    </p>

                                                    {completed && (
                                                        <p className="text-sm text-gray-500">
                                                            {
                                                                order.trackingEvents?.find(
                                                                    (e) => e.status?.toLowerCase() === stage.toLowerCase()
                                                                )?.date
                                                            }
                                                        </p>
                                                    )}

                                                </div>

                                            </div>

                                        );

                                    })}

                                </div>

                            </div>
                        </div>


                    ) : (

                        <div className="bg-white rounded p-6">
                            <h2 className="font-bold text-lg mb-4">Tracking</h2>
                            <p className="text-gray-500 text-sm">
                                Tracking information will appear once the order is processed.
                            </p>
                        </div>

                    )}
                </div>

                {/* Right Section - Price Details */}
                <div className="space-y-6">
                    {/* Delivery Details */}

                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-4">
                            <div className="flex items-start gap-2">
                                <span className="text-green-600 font-semibold">✔</span>
                                <div>
                                    <p className="font-semibold">{successMessage}</p>
                                    <p className="text-sm text-green-700">
                                        Your order will now be delivered using updated details.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 w-full">
                        <div
                            onClick={() => {
                                setShowAddressList(true)
                            }}
                            className="bg-gray-50 rounded-xl p-5 space-y-4 cursor-pointer hover:bg-gray-100 transition min-h-[80px]"
                        >



                            <div
                                className="bg-gray-50 rounded-xl p-5 space-y-4 transition min-h-[80px]"
                            >

                                <div className="flex justify-between items-center">

                                    <div className="flex gap-3">

                                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />

                                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                            {[
                                                order.deliveryAddress?.address || order.userInfo?.address,
                                                order.deliveryAddress?.city || order.userInfo?.city,
                                            ].filter(Boolean).join(", ")} - {order.deliveryAddress?.pincode || order.userInfo?.pincode}
                                        </p>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-gray-400" />

                                </div>


                                <div
                                    onClick={(e) => {

                                        e.stopPropagation()
                                        setShowChangePhone(true)

                                    }}
                                    className="flex justify-between items-center cursor-pointer"
                                >

                                    <div className="flex gap-3">

                                        <User className="w-5 h-5 text-gray-400 mt-1" />

                                        <p className="text-sm text-gray-700">
                                            <span className="font-medium">
                                                {order.recipientName || order.userInfo?.name || "Customer"}
                                            </span>{" "}
                                            {order.recipientPhone || order.userInfo?.phone}
                                        </p>


                                    </div>

                                    <ChevronRight className="w-4 h-4 text-gray-400" />

                                </div>

                            </div>


                        </div>
                    </div>
                    {canChangePayment && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm mb-3">
                            You can change payment method within 2 hours of placing the order.
                        </div>
                    )}

                    {canChangePayment && (
                        <div className="bg-white border rounded p-4 mt-3">

                            <p className="text-sm font-semibold mb-3">
                                Change Payment Method
                            </p>

                            <button
                                onClick={() => setShowChangePayment(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Change Payment
                            </button>

                        </div>
                    )}
                    {/* Price Details */}
                    <PriceDetails order={order} />



                </div>
            </div >

            {/* ===== ORDER MODALS ===== */}

            <ManageAccessModal
                showAccess={showAccess}
                setShowAccess={setShowAccess}
                order={order}
            />

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

                    const res = await updateOrderAddress(addr)

                    if (!res) return
                    setOrder(prev => ({
                        ...prev,
                        deliveryAddress: {
                            address: addr.addressLine,
                            city: addr.city,
                            pincode: addr.pincode,
                            state: addr.state
                        },
                        recipientName: addr.fullName,
                        recipientPhone: addr.phone
                    }))

                    setShowAddressList(false)

                }}
            />

            <AddEditAddressModal
                showAddAddress={showAddAddress}
                setShowAddAddress={setShowAddAddress}
                editAddress={editAddress}
                setEditAddress={setEditAddress}
                refreshAddresses={refreshAddresses}

                onAddressSaved={async (addr) => {

                    const res = await updateOrderAddress(addr)

                    if (!res) return

                    setOrder(prev => ({
                        ...prev,
                        deliveryAddress: {
                            address: addr.addressLine,
                            city: addr.city,
                            pincode: addr.pincode,
                            state: addr.state
                        },
                        recipientName: addr.fullName,
                        recipientPhone: addr.phone
                    }))

                }}
            />
            {showCancelModal && (
                <CancelOrderModal
                    orderId={id}
                    productImage={order.products?.[0]?.img}
                    savedAmount={order.discount}
                    onClose={() => setShowCancelModal(false)}
                    onCancel={(reason) => {
                        if (!reason) {
                            alert("Please select cancellation reason")
                            return
                        }

                        setCancelReason(reason)
                        handleCancelOrder()
                    }}
                />
            )}

            <ChangePhoneNumberModal
                showChangePhone={showChangePhone}
                setShowChangePhone={setShowChangePhone}
                currentPhone={order.userInfo?.phone}
                currentName={order.userInfo?.name}
                isPhoneEditable={canEditPhone}

                onPhoneChange={async (data) => {

                    const user = JSON.parse(localStorage.getItem("user") || "{}")
                    const token = user?.token

                    try {

                        setShowProcessing(true)

                        await axios.put(

                            `${API_BASE}/api/orders/update-phone/${id}`,
                            {
                                name: data.name,
                                primary: data.primary,
                                alternate: data.alternate
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`
                                }
                            }
                        )

                        setShowProcessing(false)
                        setShowSuccessPopup(true)
                        setShowChangePhone(false)



                        sessionStorage.setItem("orderMessage", "Phone number updated")

                    } catch (err) {

                        alert(err.response?.data?.message || "Phone update failed")
                        return

                    }

                    setOrder(prev => ({
                        ...prev,
                        userInfo: {
                            ...prev.userInfo,
                            name: data.name,
                            phone: data.primary,
                            alternatePhone: data.alternate
                        }
                    }))


                }}
            />
            <ChangePaymentModal
                show={showChangePayment}
                setShow={setShowChangePayment}
                orderId={id}
                refreshOrder={async () => {
                    const updated = await fetchOrderById(id)
                    setOrder(updated)
                }}
            />
            {showProcessing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white px-8 py-6 rounded-lg flex items-center gap-3">

                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                        <div>
                            <p className="font-semibold">Please wait...</p>
                            <p className="text-sm text-gray-500">
                                We are processing your request
                            </p>
                        </div>

                    </div>

                </div>
            )}

            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <div className="bg-white rounded-lg w-[360px] text-center">

                        <div className="p-6 border-b">

                            <div className="text-green-600 text-2xl mb-2">
                                ✔
                            </div>

                            <p className="font-semibold text-green-700">
                                Your phone number has been updated
                            </p>

                        </div>

                        <button
                            onClick={() => {
                                setShowSuccessPopup(false)
                                router.refresh()
                            }}
                            className="w-full py-3 text-blue-600 font-semibold"
                        >
                            OKAY
                        </button>

                    </div>

                </div>
            )}


        </div >

    );
}

