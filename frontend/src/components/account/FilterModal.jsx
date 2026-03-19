"use client";

import { X } from "lucide-react";

export default function FilterModal({
  isOpen,
  onClose,
  statusFilters,
  timeFilters,
  onStatusChange,
  onTimeChange,
  onClearFilters,
  onApplyFilters,
}) {
  if (!isOpen) return null;

  const statusOptions = [
    { label: "All", value: "all" },
    { label: "On the way", value: "on-the-way" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Returned", value: "returned" },
  ];

  const timeOptions = [
    { label: "Anytime", value: "all" },
    { label: "Last 30 days", value: "last-30-days" },
    { label: "Last 6 months", value: "last-6-months" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
        style={{
          background: "var(--color-card)",
          borderRadius: "var(--radius-card)",
          padding: "32px",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 600, color: "var(--color-heading)" }}>
            Filter Orders
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} style={{ color: "var(--color-body)" }} />
          </button>
        </div>

        {/* Status Section */}
        <div className="mb-8">
          <h3 style={{ fontFamily: "var(--font-body)", fontSize: "16px", fontWeight: 600, color: "var(--color-heading)", marginBottom: "16px" }}>
            Status
          </h3>
          <div className="space-y-3">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer"
                style={{ color: "var(--color-body)" }}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={statusFilters.includes(option.value)}
                  onChange={() => onStatusChange(option.value)}
                  className="w-5 h-5 cursor-pointer"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span style={{ fontSize: "15px" }}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Time Section */}
        <div className="mb-8">
          <h3 style={{ fontFamily: "var(--font-body)", fontSize: "16px", fontWeight: 600, color: "var(--color-heading)", marginBottom: "16px" }}>
            Time
          </h3>
          <div className="space-y-3">
            {timeOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer"
                style={{ color: "var(--color-body)" }}
              >
                <input
                  type="radio"
                  name="time"
                  value={option.value}
                  checked={timeFilters.includes(option.value)}
                  onChange={() => onTimeChange(option.value)}
                  className="w-5 h-5 cursor-pointer"
                  style={{ accentColor: "var(--color-primary)" }}
                />
                <span style={{ fontSize: "15px" }}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClearFilters}
            className="flex-1"
            style={{
              background: "var(--color-bg)",
              color: "var(--color-heading)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-btn)",
              padding: "12px 24px",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            CLEAR FILTERS
          </button>
          <button
            onClick={onApplyFilters}
            className="flex-1 btn-primary-imkaa"
          >
            APPLYsq
          </button>
        </div>
      </div>
    </>
  );
}
