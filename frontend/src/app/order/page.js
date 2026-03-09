"use client";
import { useState, useEffect } from "react";
import Link from "next/link"; 
import { ChevronRight, Search } from "lucide-react";



import { useOrders } from "@/context/OrderContext";
import { API_BASE } from "@/lib/api";

/* ================= TYPES REMOVED (JS VERSION) ================= */

export default function MyOrders() {

const { orders, loading, fetchOrders } = useOrders();

const [statusFilters, setStatusFilters] = useState(["all"]);
const [timeFilters, setTimeFilters] = useState(["all"]);
const [searchTerm, setSearchTerm] = useState("");

    
    
    /* ================= BACKEND CONNECT ================= */

    
    const statusOptions = [
        { label: "All", value: "all" },
        { label: "On the way", value: "on-the-way" },
        { label: "Delivered", value: "delivered" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Returned", value: "returned" },
    ];

    const timeOptions = [
        { label: "All", value: "all" },
        { label: "Last 30 days", value: "last-30-days" },
        { label: "2026", value: "2026" },
        { label: "2025", value: "2025" }, // FIXED
        { label: "2024", value: "2024" },
        { label: "2023", value: "2023" },
        { label: "Older", value: "older" },
    ];

    const toggleStatusFilter = (status) => {
        setStatusFilters((prev) => {
            if (status === "all") return ["all"];
            const filtered = prev.filter((s) => s !== "all");
            if (filtered.includes(status)) {
                const updated = filtered.filter((s) => s !== status);
                return updated.length === 0 ? ["all"] : updated;
            }
            return [...filtered, status];
        });


    };

    const toggleTimeFilter = (time) => {
        setTimeFilters((prev) => {
            if (time === "all") return ["all"];
            const filtered = prev.filter((t) => t !== "all");
            if (filtered.includes(time)) {
                const updated = filtered.filter((t) => t !== time);
                return updated.length === 0 ? ["all"] : updated;
            }
            return [...filtered, time];
        });
    };

    const clearAllFilters = () => {
        setStatusFilters(["all"]);
        setTimeFilters(["all"]);
    };

    const isStatusFilterActive = (status) =>
  statusFilters.includes(status) || statusFilters.includes("all");

    const isTimeFilterActive = (time) =>
        timeFilters.includes(time);

    const handleSearch = () => {
        fetchOrders();
    };
    useEffect(() => {
  fetchOrders();
}, []);

    const filteredOrders = orders.filter((order) => {

        const statusMatch =
            statusFilters.includes("all") ||
            statusFilters.includes(order.status);

        let timeMatch = timeFilters.includes("all");

        if (!timeMatch) {
            const orderDate = new Date(order.createdAt);
            const now = new Date();

            for (const t of timeFilters) {

                if (t === "last-30-days") {
                    const diff =
                        (now - orderDate) / (1000 * 60 * 60 * 24);
                    if (diff <= 30) timeMatch = true;
                }

                if (t === "2026" && orderDate.getFullYear() === 2026)
                    timeMatch = true;

                if (t === "2025" && orderDate.getFullYear() === 2025)
                    timeMatch = true;

                if (t === "2024" && orderDate.getFullYear() === 2024)
                    timeMatch = true;

                if (t === "2023" && orderDate.getFullYear() === 2023)
                    timeMatch = true;

                if (t === "older" && orderDate.getFullYear() < 2023)
                    timeMatch = true;
            }
        }

        return statusMatch && timeMatch;
    });
    const getStatusColor = (status) => {
        switch (status) {
            case "delivered":
                return "text-green-600";
            case "cancelled":
                return "text-red-600";
            case "on-the-way":
                return "text-blue-600";
            case "returned":
                return "text-orange-600";
            case "processing":
                return "text-yellow-600";
            default:
                return "text-gray-600";
        }
    };

    const getStatusLabel = (status) =>
        status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");

    return (
        <div className="min-h-screen bg-[#f1f3f6]">
            {loading && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                    <div className="bg-white px-6 py-4 rounded shadow-md flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#2874f0] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-gray-700">
                            Loading your orders...
                        </p>
                    </div>
                </div>
            )}
           
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm">
                    <Link href="/" className="text-primary hover:opacity-70">
                        Home
                    </Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">My Orders</span>
                </div>
            </div>

            {/* SAME UI (NO CHANGE) */}
            <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">

                    {/* LEFT FILTER */}
                    <div>
                        <div className="bg-white border border-gray-200 rounded-sm p-6 sticky top-20">
                            <h2 className="text-lg font-bold mb-6">Filters</h2>
                            {/* SELECTED FILTER CHIPS */}
                            {(
                                !statusFilters.includes("all") ||
                                !timeFilters.includes("all")
                            ) && (
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-semibold text-gray-700">
                                                Applied Filters
                                            </span>

                                            <button
                                                onClick={clearAllFilters}
                                                className="text-[#2874f0] text-sm font-medium hover:underline"
                                            >
                                                Clear all
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {statusFilters
                                                .filter((s) => s !== "all")
                                                .map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => toggleStatusFilter(s)}
                                                        className="px-3 py-1 bg-gray-100 border rounded text-sm flex items-center gap-2"
                                                    >
                                                        ✕ {statusOptions.find(o => o.value === s)?.label}
                                                    </button>
                                                ))}

                                            {timeFilters
                                                .filter((t) => t !== "all")
                                                .map((t) => (
                                                    <button
                                                        key={t}
                                                        onClick={() => toggleTimeFilter(t)}
                                                        className="px-3 py-1 bg-gray-100 border rounded text-sm flex items-center gap-2"
                                                    >
                                                        ✕ {timeOptions.find(o => o.value === t)?.label}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}

                            {/* ORDER STATUS */}
                            <div className="border-t border-[#e0e0e0] pt-5 mt-5">
                                <h3 className="text-[14px] font-semibold mb-3 text-gray-900">ORDER STATUS</h3>

                                <div className="space-y-3">
                                    {statusOptions
                                        .filter((o) => o.value !== "all")
                                        .map((option) => (
                                            <label key={option.value} className="flex items-center gap-3 text-[14px] text-gray-900">
                                                <input
                                                    type="checkbox"
                                                    checked={isStatusFilterActive(option.value)}
                                                    onChange={() => toggleStatusFilter(option.value)}
                                                    className="w-4 h-4"
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                </div>
                            </div>

                            {/* ORDER TIME */}
                            {/* ORDER STATUS */}
                            <div className="border-t border-gray-200 pt-5 mt-5">
                                <h3 className="text-[14px] font-semibold mb-3 text-gray-900">ORDER TIME</h3>

                                <div className="space-y-3">
                                    {timeOptions
                                        .filter((o) => o.value !== "all")
                                        .map((option) => (
                                            <label key={option.value} className="flex items-center gap-3 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={isTimeFilterActive(option.value)}
                                                    onChange={() => toggleTimeFilter(option.value)}
                                                    className="w-4 h-4"
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CARDS */}
                    <div className="min-w-0">


                        {/* SEARCH BAR TOP (FLIPKART STYLE) */}
                        <div className="bg-white border border-gray-200 mb-4 flex items-center h-[56px]">

                            <input
                                type="text"
                                placeholder="Search your orders here"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch();
                                }}
                                className="flex-1 h-full px-4 text-[14px] text-gray-700 outline-none"
                            />

                            <button
                                onClick={handleSearch}
                                className="h-full px-8 bg-[#2874f0] text-white text-[14px] font-semibold flex items-center gap-2"
                            >
                                <Search size={18} />
                                Search Orders
                            </button>

                        </div>

                        {filteredOrders.length === 0 ? (

                            <div className="bg-white rounded p-8 text-center">
                                No orders found
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/order/${order.id}`}
                                        className="block bg-white border border-gray-200 rounded hover:shadow-sm transition"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_260px] items-center p-4 gap-6">

                                            {/* PRODUCT SECTION */}
                                            <div className="flex gap-4 min-w-0">
                                                <img
                                                    src={`${API_BASE}${order.items[0]?.imageUrl}`}
                                                    alt=""
                                                    className="w-20 h-20 object-cover rounded"
                                                />

                                                <div className="min-w-0">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {order.items[0]?.title}
                                                    </h3>

                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Color: {order.items[0]?.color || "-"} &nbsp;
                                                        Size: {order.items[0]?.size || "-"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* PRICE */}
                                            <div>
                                                <p className="text-lg font-semibold text-gray-900">
                                                    ₹{order.items[0]?.price}
                                                </p>
                                            </div>

                                            {/* DELIVERY */}
                                            <div>
                                                <p className={`font-semibold ${getStatusColor(order.status)}`}>
                                                    ● {order.status === "delivered"
                                                        ? "Delivered"
                                                        : order.status === "cancelled"
                                                            ? "Cancelled"
                                                            : `Delivery expected by ${order.deliveryDate
                                                                ? new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })
                                                                : ""
                                                            }`}
                                                </p>

                                                <p className="text-sm text-gray-600 mt-1">
                                                    {order.status === "cancelled"
                                                        ? "Your order has been cancelled."
                                                        : order.status === "delivered"
                                                            ? "Your item has been delivered"
                                                            : "Your order has been placed."}
                                                </p>
                                            </div>

                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}