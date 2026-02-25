"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";

/* ===== ALL 27 FILTER CATEGORIES (Myntra Bra Page) ===== */
const TOP_FILTERS = [
  "Back",
  "Bundles",
  "Closure",
  "Country of Origin",
  "Coverage",
  "Fabrics",
  "Features",
  "Knit or Woven",
  "Multipack Set",
  "Net Quantity Unit",
  "Number of Items",
  "Padding",
  "Patterns",
  "Personalization",
  "Print or Pattern Types",
  "Rating",
  "Seam",
  "Size",
  "Sport",
  "Straps",
  "Style",
  "Sustainable",
  "Technology",
  "Theme",
  "Type",
  "Wash Care",
  "Wiring",
];

/* ===== FILTER OPTIONS FOR EACH CATEGORY ===== */
const FILTER_OPTIONS = {
  Back: ["Full Back", "Racerback", "U-Back", "Cross Back", "Backless", "Criss Cross Back", "T Back", "Transparent Back"],
  Bundles: ["Single", "Pack of 2", "Pack of 3", "Pack of 4", "Pack of 5", "Pack of 6"],
  Closure: ["Hook and Eye", "Slip-On", "Front Open", "Back Open", "Zipper", "Front Closure", "Back Closure"],
  "Country of Origin": ["India", "China", "Bangladesh", "Vietnam", "Sri Lanka", "Thailand", "Indonesia"],
  Coverage: ["Full Coverage", "Half Coverage", "Medium Coverage", "3/4th Coverage", "Demi Coverage"],
  Fabrics: [
    "Bamboo", "Cotton", "Elastane", "Lycra", "Microfiber", "Microfibre",
    "Modal", "Nylon", "Organic Cotton", "Polyamide", "Polyester",
    "Polyester PU", "Satin", "Silicone", "Silk", "Synthetic", "Tencel",
    "Lace", "Spandex", "Net",
  ],
  Features: ["Antimicrobial", "Breathable", "Moisture Wicking", "Quick Dry", "Seamless", "Stretchable"],
  "Knit or Woven": ["Knit", "Woven"],
  "Multipack Set": ["Single", "Set of 2", "Set of 3", "Set of 4+"],
  "Net Quantity Unit": ["N", "Gram", "Piece"],
  "Number of Items": ["1", "2", "3", "4", "5", "6+"],
  Padding: ["Padded", "Non-Padded", "Lightly Padded", "Heavily Padded", "Removable Padding"],
  Patterns: ["Solid", "Printed", "Striped", "Colourblocked", "Self Design", "Polka Dots", "Lace", "Checked", "Floral", "Abstract", "Embroidered"],
  Personalization: ["Personalisable", "Non-Personalisable"],
  "Print or Pattern Types": [
    "Abstract", "Animal", "Botanical", "Camouflage", "Checked",
    "Ethnic", "Floral", "Geometric", "Graphic", "Polka Dots",
    "Self Design", "Solid", "Striped", "Tie and Dye", "Tropical",
  ],
  Rating: ["4.5 & Above", "4.0 & Above", "3.5 & Above", "3.0 & Above"],
  Seam: ["Seamed", "Seamless"],
  Size: [
    /* Bra sizes: 28 band */
    "28A","28AA","28B","28C","28D","28E",
    /* Bra sizes: 30 band */
    "30A","30AA","30B","30C","30D","30DD","30E","30F",
    /* Bra sizes: 32 band */
    "32A","32AA","32B","32C","32D","32DD","32DDD","32E","32F","32G","32H","32HH","32Z",
    /* Bra sizes: 34 band */
    "34A","34B","34C","34D","34DD","34DDD","34E","34F","34G","34H","34HH","34J","34Z",
    /* Bra sizes: 36 band */
    "36A","36B","36C","36D","36DD","36DDD","36E","36F","36G","36H","36HH","36J","36Z",
    /* Bra sizes: 38 band */
    "38A","38B","38C","38D","38DD","38DDD","38E","38F","38G","38GG","38H","38HH","38J","38Z",
    /* 39/40 band */
    "39B","40A","40B","40C","40D",
    /* Letter sizes */
    "XS","S","M","L","XL","XXL","3XL","4XL","5XL","Free Size",
  ],
  Sport: ["Running", "Training", "Yoga", "Gym", "Walking"],
  Straps: ["Regular Straps", "Strapless", "Multiway", "Detachable", "Transparent", "Halter Neck", "Cross Back Straps", "Racerback"],
  Style: [
    "Everyday", "T-Shirt Bra", "Sports Bra", "Bralette",
    "Minimizer", "Push-Up", "Balconette", "Nursing", "Maternity",
    "Bandeau", "Longline", "Cage", "Strapless",
  ],
  Sustainable: ["Sustainable", "Non-Sustainable"],
  Technology: ["Dri-FIT", "Climalite", "Speedwick", "HeatGear"],
  Theme: ["Casual", "Sports", "Formal", "Lounge"],
  Type: ["Regular", "Longline", "Bandeau", "Plunge", "Strapless"],
  "Wash Care": ["Machine Wash", "Hand Wash", "Dry Clean"],
  Wiring: ["Wired", "Non-Wired", "Semi-Wired"],
};

/* ===========================================================
   BACKEND FIELD MAPPING
   =========================================================== */
const BACKEND_KEY_MAP = {
  Size: "size",
  Rating: "rating",
};

const toFilterKey = (category) => {
  if (BACKEND_KEY_MAP[category]) return BACKEND_KEY_MAP[category];
  return category.toLowerCase().replace(/\s+/g, "_");
};

const INITIAL_VISIBLE = 7;

export default function TopFilters({ filters, setFilters, setPage }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef(null);

  /* -- Dynamic sizes from backend -- */
  const [backendSizes, setBackendSizes] = useState([]);

  useEffect(() => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    fetch(`${API_BASE}/api/products/filters`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.sizes?.length) {
          setBackendSizes(data.sizes);
        }
      })
      .catch(() => {});
  }, []);

  /* Merge backend sizes into FILTER_OPTIONS dynamically */
  const getOptions = (category) => {
    if (category === "Size" && backendSizes.length > 0) {
      return backendSizes;
    }
    return FILTER_OPTIONS[category] || [];
  };

  const moreCount = TOP_FILTERS.length - INITIAL_VISIBLE;
  const visibleFilters = expanded
    ? TOP_FILTERS
    : TOP_FILTERS.slice(0, INITIAL_VISIBLE);

  /* --- Close on outside click --- */
  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  /* --- Toggle a checkbox value --- */
  const toggleOption = useCallback(
    (category, value) => {
      setPage(1);
      const key = toFilterKey(category);

      if (category === "Rating") {
        const numVal = value.replace(/[^0-9.]/g, "");
        const current = filters[key];
        if (current === numVal) {
          const copy = { ...filters };
          delete copy[key];
          setFilters(copy);
        } else {
          setFilters({ ...filters, [key]: numVal });
        }
        return;
      }

      const current = filters[key]
        ? filters[key].split(",").filter(Boolean)
        : [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length === 0) {
        const copy = { ...filters };
        delete copy[key];
        setFilters(copy);
      } else {
        setFilters({ ...filters, [key]: next.join(",") });
      }
    },
    [filters, setFilters, setPage]
  );

  /* --- Check if option is selected --- */
  const isChecked = (category, value) => {
    const key = toFilterKey(category);
    if (category === "Rating") {
      const numVal = value.replace(/[^0-9.]/g, "");
      return filters[key] === numVal;
    }
    return filters[key]?.split(",").includes(value) || false;
  };

  /* --- Active entries for pills --- */
  const getActiveEntries = () => {
    const entries = [];
    TOP_FILTERS.forEach((f) => {
      const key = toFilterKey(f);
      const val = filters[key];
      if (!val) return;
      if (f === "Rating") {
        entries.push({ key, value: val, label: `${val} & Above`, category: f });
      } else {
        val.split(",").filter(Boolean).forEach((v) =>
          entries.push({ key, value: v, label: v, category: f })
        );
      }
    });
    return entries;
  };

  const activeEntries = getActiveEntries();

  const hasActive = (category) => {
    const key = toFilterKey(category);
    const val = filters[key];
    if (!val) return false;
    if (category === "Rating") return !!val;
    return val.split(",").filter(Boolean).length > 0;
  };

  const getActiveCount = (category) => {
    const key = toFilterKey(category);
    const val = filters[key];
    if (!val) return 0;
    if (category === "Rating") return 1;
    return val.split(",").filter(Boolean).length;
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        minWidth: 0,
        fontFamily: "'Assistant', Arial, sans-serif",
      }}
    >
      {/* ========== FILTER BUTTONS ROW ========== */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "2px 0px",
          padding: "8px 0",
        }}
      >
        {visibleFilters.map((name) => {
          const isOpen = activeDropdown === name;
          const active = hasActive(name);
          const count = getActiveCount(name);
          return (
            <div key={name} style={{ position: "relative" }}>
              <button
                onClick={() => setActiveDropdown(isOpen ? null : name)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "5px 10px",
                  fontSize: 13,
                  fontWeight: isOpen ? 700 : active ? 600 : 400,
                  color: active ? "#ff3f6c" : "#282c3f",
                  backgroundColor: isOpen ? "#f5f5f6" : "transparent",
                  border: "none",
                  borderRadius: 2,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  lineHeight: "20px",
                }}
              >
                {name}
                {count > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      backgroundColor: "#ff3f6c",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 2,
                    }}
                  >
                    {count}
                  </span>
                )}
                <ChevronDown
                  size={13}
                  style={{
                    flexShrink: 0,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    color: active ? "#ff3f6c" : "#94969f",
                  }}
                />
              </button>

              {/* Dropdown Panel */}
              {isOpen && getOptions(name).length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    backgroundColor: "#fff",
                    border: "1px solid #e8e8e8",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 100,
                    minWidth: 220,
                    maxHeight: 320,
                    overflowY: "auto",
                    padding: "8px 0",
                    animation: "topFilterSlideDown 0.15s ease-out",
                  }}
                >
                  {getOptions(name).map((opt) => {
                    const checked = isChecked(name, opt);
                    return (
                      <label
                        key={opt}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          color: checked ? "#282c3f" : "#535766",
                          fontWeight: checked ? 600 : 400,
                          lineHeight: "20px",
                          padding: "6px 16px",
                          userSelect: "none",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f6")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <input
                          type={name === "Rating" ? "radio" : "checkbox"}
                          checked={checked}
                          onChange={() => toggleOption(name, opt)}
                          name={name === "Rating" ? "topfilter-rating" : undefined}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: "#ff3f6c",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {opt}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* + N more / Show less toggle */}
        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            style={{
              padding: "5px 10px",
              fontSize: 13,
              fontWeight: 700,
              color: "#282c3f",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              lineHeight: "20px",
            }}
          >
            + {moreCount} more
          </button>
        ) : (
          <button
            onClick={() => {
              setExpanded(false);
              setActiveDropdown(null);
            }}
            style={{
              padding: "5px 10px",
              fontSize: 13,
              fontWeight: 700,
              color: "#ff3f6c",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              lineHeight: "20px",
            }}
          >
            Show less
          </button>
        )}
      </div>

      {/* ========== ACTIVE FILTER PILLS ========== */}
      {activeEntries.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 6,
            padding: "6px 0 10px",
          }}
        >
          {activeEntries.map(({ key, value, label, category }) => (
            <div
              key={key + value}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "3px 10px",
                border: "1px solid #d4d5d9",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                color: "#3e4152",
                backgroundColor: "#fff",
                cursor: "default",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#282c3f")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d4d5d9")}
            >
              {label}
              <X
                size={12}
                style={{ cursor: "pointer", color: "#94969f", transition: "color 0.15s" }}
                onClick={() => {
                  if (category) toggleOption(category, category === "Rating" ? `${value} & Above` : value);
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#282c3f")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94969f")}
              />
            </div>
          ))}

          {activeEntries.length > 1 && (
            <button
              onClick={() => {
                const cleaned = { ...filters };
                TOP_FILTERS.forEach((f) => {
                  const key = toFilterKey(f);
                  delete cleaned[key];
                });
                setFilters(cleaned);
                setPage(1);
              }}
              style={{
                padding: "3px 8px",
                fontSize: 11,
                fontWeight: 700,
                color: "#ff3f6c",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              CLEAR ALL
            </button>
          )}
        </div>
      )}

      {/* Slide-down animation */}
      <style>{`
        @keyframes topFilterSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
