"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

export default function SearchFilterComponent({
  searchValue = "",
  onSearchChange = () => {},
  filters = [],
  showExpandButton = true,
  expandDirection = "right", // "left" or "right"
  className = "",
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasFilters = filters && filters.length > 0;

  return (
    <div className={`flex items-center gap-3 flex-wrap ${className}`}>
      {/* SEARCH INPUT */}
      <div className={`relative ${expandDirection === "left" ? "flex flex-row-reverse" : ""}`}>
        {!isExpanded && showExpandButton ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="p-2.5 rounded-lg bg-white text-slate-600 transition hover:shadow-md"
            title="Search"
          >
            <Search size={18} />
          </button>
        ) : (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
            <input
              autoFocus
              type="text"
              className="pl-11 pr-10 py-2.5 rounded-lg text-sm bg-white font-medium text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition hover:shadow-md"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onBlur={() => {
                if (!searchValue && showExpandButton) {
                  setIsExpanded(false);
                }
              }}
              style={{
                width: expandDirection === "left" ? "240px" : "auto",
              }}
            />
            {searchValue && (
              <button
                onClick={() => {
                  onSearchChange("");
                  if (showExpandButton) setIsExpanded(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ADDITIONAL FILTERS */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((filter) => {
            if (filter.type === "text") {
              return (
                <div key={filter.id} className="relative">
                  <input
                    type="text"
                    placeholder={filter.placeholder}
                    value={filter.value || ""}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="px-4 py-2.5 rounded-lg text-sm bg-white font-medium text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition hover:shadow-md"
                  />
                </div>
              );
            }

            if (filter.type === "number") {
              return (
                <div key={filter.id} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {filter.label}
                  </span>
                  <input
                    type="number"
                    placeholder={filter.placeholder}
                    value={filter.value || ""}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="w-24 px-3 py-2.5 rounded-lg text-sm bg-white font-medium text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition hover:shadow-md"
                  />
                </div>
              );
            }

            if (filter.type === "select") {
              return (
                <div key={filter.id} className="relative">
                  <select
                    value={filter.value || ""}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="px-4 py-2.5 rounded-lg text-sm bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition hover:shadow-md cursor-pointer"
                  >
                    <option value="">{filter.placeholder}</option>
                    {filter.options &&
                      filter.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                  </select>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
