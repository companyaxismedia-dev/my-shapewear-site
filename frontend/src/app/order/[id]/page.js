"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import axios from "axios";

import {
    ChevronRight,
    ChevronDown,
    MapPin,
    User,
    MessageCircle,
    X,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { useOrders } from "@/context/OrderContext";
import { API_BASE } from "@/lib/api";

export default function OrderDetail() {
    const { id } = useParams();
    const { fetchOrderById } = useOrders();

    const [order, setOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelledOrder, setCancelledOrder] = useState(false);

    const [showFeeDetails, setShowFeeDetails] = useState(false);
    const [showDiscountDetails, setShowDiscountDetails] = useState(false);
    const [showOffersDetails, setShowOffersDetails] = useState(false);

    const [showAccess, setShowAccess] = useState(false);

    /* ================= FETCH ORDER ================= */

    useEffect(() => {
        const loadOrder = async () => {
            const o = await fetchOrderById(id);
            if (!o) return;

            setOrder({
                ...o,
                fees: 16,
                canBeCancelled: true,
            });
        };

        loadOrder();
    }, [id, fetchOrderById]);



    /* ================= CANCEL ORDER ================= */

    const handleCancelOrder = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
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
                <Navbar />
                <div className="text-center py-20">Loading order...</div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        if (status === "cancelled" || status === "Cancelled") return "text-red-600 bg-red-50";
        if (status === "delivered" || status === "Delivered") return "text-green-600 bg-green-50";
        return "text-blue-600 bg-blue-50";
    };

    const getStatusLabel = (status) =>
        status?.charAt(0).toUpperCase() + status?.slice(1);

    /* ================= TRACKING STAGES ================= */

    const stages = [
        "Order Placed",
        "Order Packed",
        "Order Shipped",
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

    const currentIndex = statusMap[order.status?.toLowerCase()] ?? 0;

    /* ================= CANCELLED ORDER UI ================= */

    if (order.status === "cancelled") {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />

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

            <Navbar />

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

            <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">



                <div className="lg:col-span-2 space-y-6">

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

                    <div className="bg-white rounded p-6">
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

                            <button className="px-4 py-2 border rounded flex gap-2 items-center">
                                <MessageCircle size={16} />
                                Chat with us
                            </button>

                            {order.canBeCancelled && !cancelledOrder && (
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

                    <div className="bg-white rounded p-6">
                        <h2 className="font-bold text-lg mb-6">Product Details</h2>

                        {order?.items?.map((item, i) => (
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
                                                            {order.trackingEvents?.[index]?.date}
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
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h2 className="text-base font-bold text-gray-900 mb-6">Delivery details</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 leading-relaxed">{order.deliveryAddress?.address}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {order.deliveryAddress?.address}
                                    </p>

                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">
                                            {order.recipientName || "Customer"}
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {order.recipientPhone}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price Details */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <h2 className="text-base font-bold text-gray-900 mb-6">Price details</h2>
                        <div className="space-y-4">
                            {/* Listing Price */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Listing price</span>
                                <span className="text-sm text-gray-900">₹{order.subtotal + Math.abs(order.discount)}</span>
                            </div>

                            {/* Selling Price */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-gray-600">Special price</span>
                                </div>
                                <span className="text-sm text-gray-900">₹{order.subtotal}</span>
                            </div>

                            {/* Total Fees - Expandable */}
                            {order.fees > 0 && (
                                <>
                                    <button
                                        onClick={() => setShowFeeDetails(!showFeeDetails)}
                                        className="w-full flex justify-between items-center py-2 hover:bg-gray-50 transition rounded"
                                    >
                                        <span className="text-sm text-gray-600">Total fees</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-900">₹{order.fees}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-600 transition-transform ${showFeeDetails ? "rotate-180" : ""}`}
                                            />
                                        </div>
                                    </button>

                                    {/* Fee Details */}
                                    {showFeeDetails && (
                                        <div className="space-y-2 bg-gray-50 p-3 rounded text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Payment Handling Fee</span>
                                                <span>₹{Math.floor(order.fees * 0.6)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600 border-t border-dotted border-gray-300 pt-2">
                                                <span>Platform fee</span>
                                                <span>₹{Math.floor(order.fees * 0.4)}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Other Discount - Expandable */}
                            {Number(order.discount) > 0 && (
                                <>
                                    <button
                                        onClick={() => setShowDiscountDetails(!showDiscountDetails)}
                                        className="w-full flex justify-between items-center py-2 hover:bg-gray-50 rounded transition"
                                    >
                                        <span className="text-sm text-gray-600">Other discount</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-green-600 font-medium">-₹{Number(order.discount)}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-600 transition-transform ${showDiscountDetails ? "rotate-180" : ""}`}
                                            />
                                        </div>
                                    </button>

                                    {/* Discount Details */}
                                    {showDiscountDetails && (
                                        <div className="space-y-2 bg-green-50 p-3 rounded text-sm">
                                            <p className="text-gray-700 leading-relaxed">
                                                Get extra 10% off upto ₹100 on 20 item(s) (price inclusive of cashback/coupon)
                                            </p>
                                            <div className="flex justify-between text-gray-600 border-t border-dotted border-green-200 pt-2">
                                                <span>−</span>
                                                <span className="text-green-600 font-medium">₹{order.discount}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Separator */}
                            <div className="border-t border-dashed border-gray-300 my-2" />

                            {/* Total Amount */}
                            <div className="flex justify-between items-center bg-gray-50 -mx-6 -mb-6 px-6 py-3 rounded-b-lg">
                                <span className="text-sm font-bold text-gray-900">Total amount</span>
                                <span className="text-base font-bold text-gray-900">₹{order.totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Payment method</span>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center text-xs font-bold">
                                    ₹
                                </div>
                                <span className="text-sm text-gray-900 font-medium">{order.paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    {/* Offers Earned */}
                    {order.offersEarned && order.offersEarned.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setShowOffersDetails(!showOffersDetails)}
                                className="w-full flex items-center justify-between cursor-pointer hover:bg-gray-50 p-6 transition"
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path
                                            fillRule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <h2 className="text-base font-bold text-gray-900">Offers earned</h2>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-gray-600 transition-transform ${showOffersDetails ? "rotate-180" : ""}`}
                                />
                            </button>

                            {/* Offers Details */}
                            {showOffersDetails && (
                                <div className="space-y-3 border-t border-gray-200 p-6">
                                    {order.offersEarned.map((offer, index) => (
                                        <div key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                            <span className="text-primary mt-1">›</span>
                                            <p className="leading-relaxed">{offer}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div >

            {/* Manage Access Modal */}

            {showAccess && (

                <div
                    onClick={() => setShowAccess(false)}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                >

                    <div className="bg-white rounded-lg p-6 w-[420px]">

                        <div className="flex justify-between items-center mb-4">

                            <h2 className="font-semibold text-gray-800">
                                Order details shared with
                            </h2>

                            <button
                                onClick={() => setShowAccess(false)}
                                className="text-gray-500 hover:text-black"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <p className="text-lg text-gray-700">
                            {order.recipientPhone}
                        </p>

                    </div>

                </div>

            )}


            {/* Cancel Modal */}
            {
                showCancelModal && (
                    <div
                        onClick={() => setShowAccess(false)}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <div className="bg-white rounded-lg max-w-md w-full p-6 mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-lg">Cancel Order</h2>
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-lg mb-4 text-gray-700"
                            >
                                <option value="">Select reason</option>
                                <option value="changed-mind">Changed my mind</option>
                                <option value="found-elsewhere">Found elsewhere</option>
                                <option value="not-needed">Not needed anymore</option>
                                <option value="other">Other</option>
                            </select>

                            <button
                                disabled={!cancelReason}
                                onClick={handleCancelOrder}
                                className="w-full bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel Order
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
