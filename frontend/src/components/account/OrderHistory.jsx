"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ShoppingBag, Ticket, User, Wallet, Banknote, MapPin, Bell } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { API_BASE } from "@/lib/api";

const menuItems = [
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "personal-info", label: "Profile", icon: User },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "bank-details", label: "Bank", icon: Banknote },
    { id: "address-book", label: "Address", icon: MapPin },
    { id: "notifications", label: "Alerts", icon: Bell },
];

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
            order.items?.some((item) =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="w-full" style={{ background: "var(--color-bg)" }} suppressHydrationWarning>
            {/* {loading && (
                <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                    <div className="px-6 py-4 rounded shadow-md flex items-center gap-3" style={{ background: "var(--color-card)" }}>
                        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}></div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-body)" }}>Loading orders...</p>
                    </div>
                </div>
            )} */}

            {/* Mobile Navigation Section - Horizontal Scroll */}
            <div className="md:hidden mb-6 px-4 lg:px-6" style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid var(--color-border)", marginLeft: "-16px", marginRight: "-16px", marginTop: "-32px", paddingLeft: "16px", paddingRight: "16px", paddingTop: "16px", paddingBottom: "16px" }}>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.id === "orders";
                        return (
                            <Link
                                key={item.id}
                                href={`/account?tab=${item.id}`}
                                className="flex items-center gap-1 px-3 py-2 rounded-full flex-shrink-0 text-sm font-medium whitespace-nowrap transition"
                                style={{
                                    background: isActive ? "var(--color-primary)" : "var(--color-card)",
                                    color: isActive ? "white" : "var(--color-body)",
                                    border: `1px solid ${isActive ? "var(--color-primary)" : "var(--color-border)"}`,
                                }}
                            >
                                <Icon size={16} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="px-4 lg:px-6 py-6">
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--color-heading)", fontFamily: "var(--font-display)" }}>My Orders</h2>

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
                    <div className="relative z-50" ref={filterRef}>
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
                                    className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-1/2 sm:top-full sm:mt-2 w-auto sm:w-72 z-50 rounded-lg shadow-2xl max-h-[70vh] overflow-y-auto -translate-y-1/2 sm:translate-y-0"
                                    style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                                >
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
                            <Link
                                key={order.id}
                                href={`/order/${order.id}`}
                                className="block rounded hover:shadow-md transition card-imkaa"
                                style={{ padding: 0, background: "var(--color-card)" }}
                            >
                                <div className="p-4 grid grid-cols-1 md:grid-cols-[1fr_120px_260px] gap-6 items-center">
                                    {/* Product Section */}
                                    <div className="flex gap-4">
                                        {order.items?.[0]?.imageUrl && (
                                            <img
                                                src={`${API_BASE}${order.items[0].imageUrl}`}
                                                alt={order.items[0].title}
                                                className="w-20 h-20 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate" style={{ color: "var(--color-heading)" }}>
                                                {order.items?.[0]?.title || "Order"}
                                            </h3>
                                            <p className="text-sm mt-2" style={{ color: "var(--color-muted)" }}>
                                                Color: {order.items?.[0]?.color || "-"} | Size: {order.items?.[0]?.size || "-"}
                                            </p>
                                            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                                                Qty: {order.items?.[0]?.quantity || 1}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="hidden md:block">
                                        <p className="text-lg font-semibold" style={{ color: "var(--color-heading)" }}>
                                            ₹{order.items?.[0]?.price || order.totalAmount}
                                        </p>
                                    </div>

                                    {/* Order Status */}
                                    <div className="flex justify-between md:block">
                                        <div>
                                            <p className="font-semibold text-sm md:text-base" style={{ color: getStatusColor(order.status) }}>
                                                ● {getStatusLabel(order.status)}
                                            </p>
                                            <p className="text-xs md:text-sm mt-2" style={{ color: "var(--color-body)" }}>
                                                {order.status === "delivered"
                                                    ? `Delivered`
                                                    : order.status === "cancelled"
                                                        ? "Cancelled"
                                                        : `ID: ${order.id?.slice(-6)}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}