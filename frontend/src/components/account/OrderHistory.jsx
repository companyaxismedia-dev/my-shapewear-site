"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Search, X, ChevronRight, ChevronDown } from "lucide-react";
import { useOrders } from "@/context/OrderContext";
import { API_BASE } from "@/lib/api";
import { getOrderStatusGroup, getOrderStatusLabel } from "@/lib/orderStatus";

export default function OrderHistory() {
  const { orders, loading } = useOrders();

  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const filterRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return undefined;

    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isClient]);

  const handleSearch = (event) => {
    event.preventDefault();
  };

  const statusTabs = [
    { value: "all", label: "All" },
    { value: "processing", label: "In Progress" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getTimeLabel = (value) => {
    if (value === "last-30-days") return "Last 30 days";
    if (value === "last-6-months") return "Last 6 months";
    return "Select date range";
  };

  const getStatusText = (status) => {
    const group = getOrderStatusGroup(status);

    if (group === "delivered") return "Delivered";
    if (group === "cancelled") return "Cancelled";
    if (group === "returned") return "Returned";
    if (group === "on-the-way") return "In Progress";
    return getOrderStatusLabel(status) || "In Progress";
  };

  const getStatusChipStyles = (status) => {
    const group = getOrderStatusGroup(status);

    if (group === "delivered") {
      return {
        bg: "#EEF7D8",
        dot: "#88A93E",
        text: "#7A9A31",
      };
    }

    if (group === "cancelled") {
      return {
        bg: "#FDECEC",
        dot: "#D9534F",
        text: "#C64640",
      };
    }

    if (group === "returned") {
      return {
        bg: "#FFF1E6",
        dot: "#E67E22",
        text: "#D96D10",
      };
    }

    return {
      bg: "#FFF4E6",
      dot: "#E5A33A",
      text: "#D98A12",
    };
  };

  const getStatusFilterBucket = (status) => {
    const group = getOrderStatusGroup(status);

    if (group === "delivered") return "delivered";
    if (group === "cancelled") return "cancelled";
    return "processing";
  };

  const filteredOrderItems = useMemo(() => {
    return orders
      .flatMap((order) =>
        (order.items || []).map((item, itemIndex) => ({
          order,
          item,
          itemIndex,
        }))
      )
      .filter(({ order, item }) => {
        const itemStatus = item?.itemStatus || order?.status || "processing";
        const itemBucket = getStatusFilterBucket(itemStatus);

        const statusMatch =
          statusFilter === "all" || itemBucket === statusFilter;

        let timeMatch = timeFilter === "all";

        if (!timeMatch && timeFilter !== "all") {
          const orderDate = new Date(order.createdAt);
          const now = new Date();
          const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);

          if (timeFilter === "last-30-days" && diffDays <= 30) timeMatch = true;
          if (timeFilter === "last-6-months" && diffDays <= 180) timeMatch = true;
        }

        const searchBase = `${order.id || ""} ${order.orderNumber || ""} ${
          item?.title || ""
        }`.toLowerCase();

        const searchMatch =
          searchTerm.trim() === "" ||
          searchBase.includes(searchTerm.trim().toLowerCase());

        return statusMatch && timeMatch && searchMatch;
      })
      .sort((a, b) => new Date(b.order.createdAt) - new Date(a.order.createdAt));
  }, [orders, statusFilter, timeFilter, searchTerm]);

  if (!isClient) return null;

  return (
    <div className="w-full" suppressHydrationWarning>
      <div className="px-4 lg:px-6 py-6">
        <h2
          className="text-2xl font-bold mb-6"
          style={{
            color: "var(--color-heading)",
            fontFamily: "var(--font-display)",
          }}
        >
          My Orders
        </h2>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {statusTabs.map((tab) => {
              const active = statusFilter === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setStatusFilter(tab.value)}
                  className="px-4 h-10 rounded-full text-sm font-medium transition"
                  style={{
                    border: active
                      ? "1px solid #A35C5C"
                      : "1px solid #D8D2CD",
                    background: active ? "#FFF" : "#FAF8F6",
                    color: active ? "#9B4F4F" : "#6F6964",
                    boxShadow: active
                      ? "0 0 0 1px rgba(163,92,92,0.06)"
                      : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}

            <div className="relative ml-auto" ref={searchRef}>
              <button
                type="button"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                className="h-10 px-4 rounded-full flex items-center gap-2 transition"
                style={{
                  border: "1px solid #D8D2CD",
                  background: "#FAF8F6",
                  color: "#6F6964",
                }}
              >
                {isSearchOpen ? <X size={16} /> : <Search size={16} />}
                <span className="text-sm font-medium hidden sm:inline">
                  Search
                </span>
              </button>

              {isSearchOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-[280px] sm:w-[340px] z-50 rounded-2xl p-3 shadow-xl"
                  style={{
                    background: "#FFF",
                    border: "1px solid #E7E0DA",
                  }}
                >
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <div
                      className="flex-1 h-11 rounded-full flex items-center px-4"
                      style={{
                        background: "#FAF8F6",
                        border: "1px solid #E3DDD8",
                      }}
                    >
                      <Search size={16} style={{ color: "#8D857F" }} />
                      <input
                        type="text"
                        placeholder="Search by order ID or product..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full bg-transparent outline-none px-3 text-sm"
                        style={{ color: "var(--color-heading)" }}
                        autoFocus
                      />
                    </div>

                    {searchTerm ? (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="h-11 w-11 rounded-full flex items-center justify-center"
                        style={{
                          border: "1px solid #E3DDD8",
                          background: "#FAF8F6",
                          color: "#8D857F",
                        }}
                      >
                        <X size={16} />
                      </button>
                    ) : null}
                  </form>
                </div>
              )}
            </div>

            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="h-10 px-4 rounded-full flex items-center gap-2 transition"
                style={{
                  border: "1px solid #D8D2CD",
                  background: "#FAF8F6",
                  color: "#6F6964",
                }}
              >
                <span className="text-sm font-medium">{getTimeLabel(timeFilter)}</span>
                <ChevronDown size={16} />
              </button>

              {isFilterOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-[280px] z-50 rounded-2xl p-4 shadow-xl"
                  style={{
                    background: "#FFF",
                    border: "1px solid #E7E0DA",
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <p
                        className="text-xs font-semibold mb-3 uppercase tracking-wide"
                        style={{ color: "#8D857F" }}
                      >
                        Date Range
                      </p>

                      <div className="space-y-2">
                        {[
                          { value: "all", label: "All Time" },
                          { value: "last-30-days", label: "Last 30 Days" },
                          { value: "last-6-months", label: "Last 6 Months" },
                        ].map((item) => (
                          <label
                            key={item.value}
                            className="flex items-center gap-3 text-sm cursor-pointer"
                            style={{ color: "var(--color-body)" }}
                          >
                            <input
                              type="radio"
                              name="time"
                              checked={timeFilter === item.value}
                              onChange={() => setTimeFilter(item.value)}
                              className="w-4 h-4"
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div
                      className="pt-3 flex gap-2"
                      style={{ borderTop: "1px solid #EEE7E2" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setTimeFilter("all");
                          setIsFilterOpen(false);
                        }}
                        className="flex-1 h-10 rounded-full text-sm font-medium"
                        style={{
                          background: "#FAF8F6",
                          border: "1px solid #E3DDD8",
                          color: "#6F6964",
                        }}
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="flex-1 h-10 rounded-full text-sm font-medium"
                        style={{
                          background: "#9B4F4F",
                          color: "#FFF",
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-[22px] p-5"
                style={{
                  background: "#FFF",
                  border: "1px solid #EAE3DD",
                }}
              >
                <div className="animate-pulse space-y-4">
                  <div
                    className="h-6 w-40 rounded-full"
                    style={{ background: "#F4EFEB" }}
                  />
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl"
                      style={{ background: "#F4EFEB" }}
                    />
                    <div className="flex-1 space-y-2">
                      <div
                        className="h-4 w-48 rounded"
                        style={{ background: "#F4EFEB" }}
                      />
                      <div
                        className="h-4 w-72 rounded"
                        style={{ background: "#F4EFEB" }}
                      />
                      <div
                        className="h-4 w-24 rounded"
                        style={{ background: "#F4EFEB" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrderItems.length === 0 ? (
          <div
            className="rounded-[22px] text-center py-14 px-6"
            style={{
              background: "#FFF",
              border: "1px solid #EAE3DD",
            }}
          >
            <p style={{ color: "var(--color-body)", fontSize: "16px" }}>
              {searchTerm || statusFilter !== "all" || timeFilter !== "all"
                ? "No orders found matching your filters."
                : "No orders yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrderItems.map(({ order, item, itemIndex }) => {
                const displayStatus =
                  item?.itemStatus || order?.status || "processing";
                const chip = getStatusChipStyles(displayStatus);
                const displayImage = item?.imageUrl
                  ? `${API_BASE}${item.imageUrl}`
                  : null;
                const itemPrice = (item?.price || 0) * (item?.quantity || 1);
                const dateText = new Date(order.createdAt).toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                );

                return (
                  <Link
                    key={`${order._id || order.id || order.orderNumber}-${itemIndex}`}
                    href={`/order/${order.id || order._id}?item=${itemIndex}`}
                    className="block rounded-[22px] transition"
                    style={{
                      background: "#FFF",
                      border: "1px solid #EAE3DD",
                      boxShadow: "0 1px 2px rgba(31, 20, 16, 0.03)",
                    }}
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div
                          className="inline-flex items-center gap-2 px-3 h-9 rounded-full"
                          style={{
                            background: chip.bg,
                            color: chip.text,
                          }}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: chip.dot }}
                          />
                          <span className="text-sm font-semibold">
                            {getStatusText(displayStatus)}
                          </span>
                        </div>

                        <span className="text-sm" style={{ color: "#B7AEA7" }}>
                          |
                        </span>

                        <span
                          className="text-sm font-medium"
                          style={{ color: "#6F6964" }}
                        >
                          {dateText}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className="shrink-0">
                          <div
                            className="w-[62px] h-[62px] sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden"
                            style={{
                              background: "#F7F3F0",
                              border: "1px solid #ECE5DF",
                            }}
                          >
                            {displayImage ? (
                              <img
                                src={displayImage}
                                alt={item?.title || "Product"}
                                className="w-full h-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : null}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[15px] sm:text-base font-semibold mb-1"
                            style={{ color: "#9B4F4F" }}
                          >
                            Order ID: {order.orderNumber || order.id || order._id}
                          </p>

                          <p
                            className="text-sm sm:text-[15px] leading-6"
                            style={{ color: "#4C413B" }}
                          >
                            {item?.title || "Order item"}
                          </p>

                          <p
                            className="text-sm mt-1"
                            style={{ color: "#7B6D67" }}
                          >
                            Size: {item?.size || "-"} | Qty: {item?.quantity || 1}
                          </p>

                          <p
                            className="text-lg font-semibold mt-2"
                            style={{ color: "#1F1A17" }}
                          >
                            Rs. {Number(itemPrice || 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="shrink-0 flex items-center justify-center">
                          <ChevronRight size={24} style={{ color: "#9B4F4F" }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
