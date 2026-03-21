"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ShoppingBag, Ticket, User, Wallet, Banknote, MapPin, Bell } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { API_BASE } from "@/lib/api";


export default function OrderHistory() {
    const { orders, loading, fetchOrders } = useOrders();
    const [statusFilter, setStatusFilter] = useState("all");
    const [timeFilter, setTimeFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const filterRef = useRef(null);

    useEffect(() => {
        setIsClient(true);
        fetchOrders();
    }, []);

    // Close filter when clicking outside
    useEffect(() => {
        if (!isClient) return;

        const handleClickOutside = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setIsFilterOpen(false);
            }
        };

        if (isFilterOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isFilterOpen, isClient]);

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const filteredOrders = orders.filter((order) => {
        const statusMatch = statusFilter === "all" || order.status === statusFilter;
        let timeMatch = timeFilter === "all";

        if (!timeMatch && timeFilter !== "all") {
            const orderDate = new Date(order.createdAt);
            const now = new Date();
            const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
            if (timeFilter === "last-30-days" && diffDays <= 30) timeMatch = true;
            if (timeFilter === "last-6-months" && diffDays <= 180) timeMatch = true;
        }

        const searchMatch =
            searchTerm === "" ||
            order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.items || []).some((item) =>
                (item.title || "").toLowerCase().includes(searchTerm.toLowerCase())
            );

        return statusMatch && timeMatch && searchMatch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "delivered": return "#27AE60";
            case "cancelled": return "#E74C3C";
            case "on-the-way": return "#3498DB";
            case "returned": return "#E67E22";
            case "processing": return "#F39C12";
            default: return "#7F8C8D";
        }
    };

    const getStatusLabel = (status) =>
        status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");

    if (!isClient) return null;

    return (
        <div
            className="w-full overflow-visible"
            suppressHydrationWarning
        >
            {/* Main Content */}
            <div className="px-4 lg:px-6 py-6 overflow-visible">
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-heading)", fontFamily: "var(--font-display)" }}>
                    My Orders
                </h2>

                {/* Search and Filter Bar */}

                <div className="flex flex-col sm:flex-row gap-3 mb-6 overflow-visible">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <input
                            type="text"
                            placeholder="Search by order ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-imkaa flex-1"
                            style={{ fontSize: "14px" }}
                        />
                        <button
                            type="submit"
                            className="btn-primary-imkaa px-4 sm:px-6 flex items-center gap-2 flex-shrink-0"
                        >
                            <Search size={18} />
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </form>

                    {/* Filter Button with Dropdown */}
                    <div className="relative z-30 overflow-visible" ref={filterRef}>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="btn-primary-imkaa px-4 sm:px-6 flex items-center justify-center gap-2 flex-shrink-0 w-full sm:w-auto"
                        >
                            <SlidersHorizontal size={18} />
                            <span className="hidden sm:inline">Filter</span>
                        </button>

                        {/* Dropdown Filter */}
                        {isFilterOpen && (
                            <>
                                {/* Mobile Backdrop */}
                                <div
                                    className="fixed inset-0 sm:hidden z-40 bg-black/20"
                                    onClick={() => setIsFilterOpen(false)}
                                />
                                {/* Filter Panel */}
                                <div
                                    className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-[110px] sm:top-full sm:mt-2 w-auto sm:w-72 z-[70] rounded-lg shadow-2xl max-h-[calc(100vh-140px)] overflow-y-auto sm:max-h-[70vh]"
                                    style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}>

                                    <div className="p-4 space-y-4">
                                        {/* Status Filter */}
                                        <div>
                                            <p className="font-semibold mb-2" style={{ color: "var(--color-heading)", fontSize: "13px" }}>ORDER STATUS</p>
                                            <div className="space-y-2">
                                                {["all", "on-the-way", "delivered", "cancelled", "returned"].map((status) => (
                                                    <label key={status} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-body)" }}>
                                                        <input
                                                            type="radio"
                                                            name="status"
                                                            checked={statusFilter === status}
                                                            onChange={() => setStatusFilter(status)}
                                                            className="w-4 h-4 cursor-pointer"
                                                        />
                                                        {status === "all" ? "All Orders" : getStatusLabel(status)}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Time Filter */}
                                        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                                            <p className="font-semibold mb-2" style={{ color: "var(--color-heading)", fontSize: "13px" }}>TIME PERIOD</p>
                                            <div className="space-y-2">
                                                {[
                                                    { value: "all", label: "All Time" },
                                                    { value: "last-30-days", label: "Last 30 Days" },
                                                    { value: "last-6-months", label: "Last 6 Months" },
                                                ].map((time) => (
                                                    <label key={time.value} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-body)" }}>
                                                        <input
                                                            type="radio"
                                                            name="time"
                                                            checked={timeFilter === time.value}
                                                            onChange={() => setTimeFilter(time.value)}
                                                            className="w-4 h-4 cursor-pointer"
                                                        />
                                                        {time.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-2 pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
                                            <button
                                                onClick={() => {
                                                    setStatusFilter("all");
                                                    setTimeFilter("all");
                                                }}
                                                className="flex-1 py-2 rounded text-sm font-medium"
                                                style={{ background: "var(--color-bg)", color: "var(--color-body)" }}
                                            >
                                                Clear
                                            </button>
                                            <button
                                                onClick={() => setIsFilterOpen(false)}
                                                className="flex-1 py-2 rounded text-sm font-medium btn-primary-imkaa"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Orders Display */}
                {filteredOrders.length === 0 ? (
                    <div className="rounded text-center py-12 card-imkaa" style={{ padding: "32px 24px" }}>
                        <p style={{ color: "var(--color-body)", fontSize: "16px" }}>
                            {searchTerm || statusFilter !== "all" || timeFilter !== "all"
                                ? "No orders found matching your filters"
                                : "No orders yet"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="space-y-2">
                                {/* Order Header */}
                                <div className="card-imkaa p-4" style={{ background: "var(--color-card)" }}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                                                Order ID: {order.id?.slice(-6)}
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <p className="font-semibold" style={{ color: getStatusColor(order.status) }}>
                                            ● {getStatusLabel(order.status)}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                {order.items && order.items.map((item, itemIndex) => (
                                    <Link
                                        key={`${order.id}-${itemIndex}`}
                                        href={`/order/${order.id}`}
                                        className="block rounded hover:shadow-md transition card-imkaa"
                                        style={{ padding: 0, background: "var(--color-card)" }}
                                    >
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_120px_260px] gap-6 items-center">
                                            {/* Product Section */}
                                            <div className="flex gap-4">
                                                {item?.imageUrl && (
                                                    <img
                                                        src={`${API_BASE}${item.imageUrl}`}
                                                        alt={item.title}
                                                        className="w-20 h-20 object-cover rounded"
                                                        onError={(e) => {
                                                            e.target.style.display = "none";
                                                        }}
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium truncate" style={{ color: "var(--color-heading)" }}>
                                                        {item?.title || "Product"}
                                                    </h3>
                                                    <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
                                                        Color: {item?.color || "-"} | Size: {item?.size || "-"}
                                                    </p>
                                                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                                                        Qty: {item?.quantity || 1}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="hidden md:block">
                                                <p className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>
                                                    ₹{item?.price || 0}
                                                </p>
                                            </div>

                                            {/* Item Total */}
                                            <div className="flex justify-between md:block">
                                                <div>
                                                    <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                                                        Subtotal
                                                    </p>
                                                    <p className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>
                                                        ₹{(item?.price * item?.quantity) || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}