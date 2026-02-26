"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";
const FALLBACK_COLORS = [
  { name: "Black", code: "#000000", count: 13526 },
  { name: "Pink", code: "#f687b3", count: 10182 },
  { name: "Blue", code: "#3182ce", count: 8934 },
  { name: "White", code: "#ffffff", count: 7821 },
  { name: "Red", code: "#e53e3e", count: 6453 },
  { name: "Green", code: "#48bb78", count: 4312 },
  { name: "Beige", code: "#d6c9a8", count: 3987 },
  { name: "Grey", code: "#a0aec0", count: 3654 },
  { name: "Maroon", code: "#822727", count: 3210 },
  { name: "Navy Blue", code: "#2c5282", count: 2876 },
  { name: "Purple", code: "#805ad5", count: 2543 },
  { name: "Brown", code: "#8b5a2b", count: 2198 },
  { name: "Yellow", code: "#ecc94b", count: 1876 },
  { name: "Orange", code: "#ed8936", count: 1654 },
  { name: "Cream", code: "#f5f0dc", count: 1432 },
  { name: "Olive", code: "#708238", count: 987 },
  { name: "Nude", code: "#e8c4a8", count: 876 },
  { name: "Coral", code: "#ff6f61", count: 765 },
  { name: "Peach", code: "#ffb899", count: 654 },
  { name: "Lavender", code: "#b794f4", count: 543 },
  { name: "Magenta", code: "#d53f8c", count: 432 },
  { name: "Teal", code: "#319795", count: 321 },
  { name: "Rose Gold", code: "#b76e79", count: 198 },
  { name: "Violet", code: "#7c3aed", count: 117 },
  { name: "Tan", code: "#d2b48c", count: 99 },
  { name: "Camel Brown", code: "#c19a6b", count: 64 },
  { name: "Taupe", code: "#483c32", count: 51 },
  { name: "Silver", code: "#c0c0c0", count: 49 },
  { name: "Skin", code: "#f5c7a1", count: 36 },
  { name: "Khaki", code: "#8b6b42", count: 25 },
  { name: "Champagne", code: "#f7e7ce", count: 23 },
  { name: "Fluorescent Green", code: "#39ff14", count: 21 },
  { name: "Copper", code: "#b87333", count: 21 },
  { name: "Bronze", code: "#cd7f32", count: 19 },
  { name: "Steel", code: "#71797e", count: 3 },
  { name: "Metallic", code: "#d4af37", count: 2 },
  { name: "Transparent", code: "transparent", count: 1 },
];
const FALLBACK_SIZES = [
  "3XS", "XXS", "XXS/XS", "XS", "XS/S", "S", "M", "26", "S/M", "L", "M/L", "XL", "L/XL", "XXL", "XL/XXL", "3XL", "3XL/4XL", "4XL", "4XL/5XL", "5XL", "6XL", "7XL", "8XL", "9XL", "10XL", "S/L", "UK1", "UK2", "UK3", "UK3.5", "UK4", "UK5", "UK6", "UK7", "UK8",
  "UK9", "UK9.5", "UK10", "UK11", "UK12", "UK13", "A", "B", "C", "D", "22", "23", "24", "25", "27", "27.5", "28", "28.5", "29", "30", "31", "31.5", "32", "33", "33.5", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "48", "49", "50", "51", "52", "54", "56", "58", "60", "28A", "28AA", "28B", "28C", "28D", "28E", "30A", "30AA", "30B", "30C", "30D", "30DD", "30E", "30F", "32A", "32AA", "32B", "32C", "32D", "32DD", "32DDD", "32E",
  "32F", "32G", "32H", "32HH", "32Z", "34A", "34B", "34C", "34D", "34DD", "34DDD", "34E", "34F", "34G", "34H", "34HH", "34J", "34Z", "36A", "36B", "36C", "36D", "36DD", "36DDD", "36E", "36F", "36G", "36H", "36HH", "36J", "36Z", "38A", "38B", "38C", "38D", "38DD", "38DDD", "38E", "38F", "38G", "38GG", "38H", "38HH", "38J", "38Z", "39B", "40A", "40B", "40C", "40D",
];
const COLOR_CODE_MAP = {};
FALLBACK_COLORS.forEach((c) => {
  COLOR_CODE_MAP[c.name.toLowerCase()] = c.code;
});
const DISCOUNTS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

const RATINGS = [4.5, 4, 3.5, 3];
const getRatingColor = (rating) => {
  if (rating >= 4.5) return "#14958f"; // best rating (green)
  if (rating >= 4) return "#1aa260";   // green
  if (rating >= 3.5) return "#f5a623"; // orange
  return "#ff6f61";                    // red
};
const getApiBase = () => {
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5000";
  }
  return "https://my-shapewear-site.onrender.com";
};
export default function FilterBar({
  filters = {},
  setFilters = () => { },
  setPage = () => { },
  category,
}) {
  const [backendColors, setBackendColors] = useState([]);
  const [backendSizes, setBackendSizes] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  useEffect(() => {
    const API_BASE = getApiBase();
    fetch(`${API_BASE}/api/products/filters`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.colors?.length) {
            const mapped = data.colors.map((colorName) => {
              const existing = FALLBACK_COLORS.find(
                (fc) => fc.name.toLowerCase() === colorName.toLowerCase()
              );
              return {
                name: colorName,
                code: existing?.code || COLOR_CODE_MAP[colorName.toLowerCase()] || "#ccc",
                count: existing?.count || 0,
              };
            });
            setBackendColors(mapped);
          }
          if (data.sizes?.length) {
            setBackendSizes(data.sizes);
          }
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const API_BASE = getApiBase();

    if (!category) return;

    fetch(`${API_BASE}/api/products/subcategories?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSubCategories(data.subcategories);
        }
      });
  }, [category]);
  const COLORS = backendColors.length > 0 ? backendColors : FALLBACK_COLORS;
  const SIZES = backendSizes.length > 0 ? backendSizes : FALLBACK_SIZES;

  const [collapsed, setCollapsed] = useState({});
  const toggleCollapse = (key) =>
    setCollapsed((p) => ({ ...p, [key]: !p[key] }));
  const [showAllSubCat, setShowAllSubCat] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [subCatSearch, setSubCatSearch] = useState("");
  const [colorSearch, setColorSearch] = useState("");
  const [sizeSearch, setSizeSearch] = useState("");
  const [subCatSearchOpen, setSubCatSearchOpen] = useState(false);
  const [colorSearchOpen, setColorSearchOpen] = useState(false);
  const [sizeSearchOpen, setSizeSearchOpen] = useState(false);
  const priceMin = parseInt(filters.minPrice || "0", 10);
  const priceMax = parseInt(filters.maxPrice || "6600", 10);
  const filteredSubCats = useMemo(
    () => subCategories.filter((sc) =>
      sc.name.toLowerCase().includes(subCatSearch.toLowerCase())
    ),
    [subCatSearch, subCategories]
  );
  const filteredColors = useMemo(
    () => COLORS.filter((c) =>
      c.name.toLowerCase().includes(colorSearch.toLowerCase())
    ),
    [colorSearch, COLORS]
  );
  const filteredSizes = useMemo(
    () => SIZES.filter((s) =>
      s.toLowerCase().includes(sizeSearch.toLowerCase())
    ),
    [sizeSearch, SIZES]
  );

  const INITIAL_SUBCAT = 8;
  const INITIAL_COLORS = 10;
  const INITIAL_SIZES = 12;

  const visibleSubCats = showAllSubCat
    ? filteredSubCats
    : filteredSubCats.slice(0, INITIAL_SUBCAT);
  const visibleColors = showAllColors
    ? filteredColors
    : filteredColors.slice(0, INITIAL_COLORS);
  const visibleSizes = showAllSizes
    ? filteredSizes
    : filteredSizes.slice(0, INITIAL_SIZES);
  const handleSubCatToggle = (scName) => {
    setPage(1);
    setFilters((prev) => {
      const existing = prev.subCategory
        ? prev.subCategory.split(",").filter(Boolean)
        : [];
      const updated = existing.includes(scName)
        ? existing.filter((v) => v !== scName)
        : [...existing, scName];
      return { ...prev, subCategory: updated.length ? updated.join(",") : "" };
    });
  };
  const handleColorToggle = (colorName) => {
    setPage(1);
    setFilters((prev) => {
      const existing = prev.color
        ? prev.color.split(",").filter(Boolean)
        : [];
      const updated = existing.includes(colorName)
        ? existing.filter((v) => v !== colorName)
        : [...existing, colorName];
      return { ...prev, color: updated.length ? updated.join(",") : "" };
    });
  };
  const handleSizeToggle = (sizeVal) => {
    setPage(1);
    setFilters((prev) => {
      const existing = prev.size
        ? prev.size.split(",").filter(Boolean)
        : [];
      const updated = existing.includes(sizeVal)
        ? existing.filter((v) => v !== sizeVal)
        : [...existing, sizeVal];
      return { ...prev, size: updated.length ? updated.join(",") : "" };
    });
  };
  const handleGender = (value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      gender: prev.gender === value ? "" : value,
    }));
  };
  const handleRating = (value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === String(value) ? "" : String(value),
    }));
  };
  const handleDiscount = (value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      discount: prev.discount === String(value) ? "" : String(value),
    }));
  };
  const clearAll = () => {
    setPage(1);
    setFilters({});
  };
  const isSubCatChecked = (name) =>
    (filters.subCategory?.split(",") || []).includes(name);

  const isColorChecked = (name) =>
    (filters.color?.split(",") || []).includes(name);

  const isSizeChecked = (val) =>
    (filters.size?.split(",") || []).includes(val);

  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== ""
  ).length;
  return (
    <div
      style={{
        width: 252,
        minWidth: 252,
        backgroundColor: "#fff",
        borderRight: "1px solid #e8e8e8",

        position: "relative",
        top: 0,
        zIndex: 1,
        
maxHeight: "calc(100vh - 56px)",
overflowY: "auto",
        overflowX: "hidden",
        fontFamily: "'Assistant', Arial, sans-serif",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          zIndex: 20,
          padding: "16px 16px 12px",
          borderBottom: "1px solid #e8e8e8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#282c3f",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          FILTERS
        </h2>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#ff3f6c",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              letterSpacing: "0.3px",
            }}
          >
            CLEAR ALL
          </button>
        )}
      </div>
      <FilterSection
        title=""
        collapsed={collapsed.gender}
        onToggle={() => toggleCollapse("gender")}
        hideBorder
      >
        <div style={{ padding: "12px 16px" }}>
          {["Women", "Girls"].map((g) => (
            <label
              key={g}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "7px 0",
                cursor: "pointer",
                fontSize: 14,
                color: "#282c3f",
                fontWeight: filters.gender === g ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name="gender"
                checked={filters.gender === g}
                onChange={() => handleGender(g)}
                style={{
                  width: 18,
                  height: 18,
                  accentColor: "#ff3f6c",
                  cursor: "pointer",
                  margin: 0,
                }}
              />
              {g}
            </label>
          ))}
        </div>
      </FilterSection>
      {subCategories.length >= 2 && (
        <FilterSection
          title="SUBCATEGORY"
          collapsed={collapsed.subCategory}
          onToggle={() => toggleCollapse("subCategory")}
          searchOpen={subCatSearchOpen}
          onSearchToggle={() => {
            setSubCatSearchOpen(!subCatSearchOpen);
            setSubCatSearch("");
          }}
          showSearch
        >
          {subCatSearchOpen && (
            <div style={{ padding: "0 16px 8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #d4d5d9",
                  borderRadius: 2,
                  padding: "5px 8px",
                  gap: 6,
                }}
              >
                <Search size={14} style={{ color: "#94969f", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search Subcategory"
                  value={subCatSearch}
                  onChange={(e) => setSubCatSearch(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: 13,
                    color: "#282c3f",
                    width: "100%",
                    backgroundColor: "transparent",
                  }}
                  autoFocus
                />
                {subCatSearch && (
                  <X
                    size={14}
                    style={{ color: "#94969f", cursor: "pointer", flexShrink: 0 }}
                    onClick={() => setSubCatSearch("")}
                  />
                )}
              </div>
            </div>
          )}

          <div style={{ padding: "0 16px 12px" }}>
            {visibleSubCats.map((sc) => {
              const checked = isSubCatChecked(sc.name);
              return (
                <label
                  key={sc.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "5px 0",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#282c3f",
                    fontWeight: checked ? 600 : 400,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSubCatToggle(sc.name)}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#ff3f6c",
                      cursor: "pointer",
                      flexShrink: 0,
                      margin: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sc.name}
                  </span>
                  <span style={{ fontSize: 12, color: "#94969f", flexShrink: 0 }}>
                    ({sc.count})
                  </span>
                </label>
              );
            })}
            {filteredSubCats.length > INITIAL_SUBCAT && (
              <button
                onClick={() => setShowAllSubCat(!showAllSubCat)}
                style={{
                  color: "#ff3f6c",
                  fontSize: 13,
                  fontWeight: 700,
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px 0 0",
                  display: "block",
                }}
              >
                {showAllSubCat
                  ? "- Show less"
                  : `+ ${filteredSubCats.length - INITIAL_SUBCAT} more`}
              </button>
            )}
          </div>
        </FilterSection>
      )}
      <FilterSection
        title="PRICE"
        collapsed={collapsed.price}
        onToggle={() => toggleCollapse("price")}
      >
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ position: "relative", height: 36, marginBottom: 4 }}>
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: "#e8e8e8",
                borderRadius: 2,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 16,
                left: `${(priceMin / 6600) * 100}%`,
                right: `${100 - (priceMax / 6600) * 100}%`,
                height: 3,
                backgroundColor: "#ff3f6c",
                borderRadius: 2,
              }}
            />
            <input
              type="range"
              min={0}
              max={6600}
              step={100}
              value={priceMin}
              onChange={(e) => {
                const val = Math.min(parseInt(e.target.value), priceMax - 100);
                setPage(1);
                setFilters((p) => ({ ...p, minPrice: String(val) }));
              }}
              style={{
                position: "absolute",
                top: 6,
                left: 0,
                width: "100%",
                height: 20,
                opacity: 0,
                cursor: "pointer",
                zIndex: 3,
                margin: 0,
              }}
            />
            <input
              type="range"
              min={0}
              max={6600}
              step={100}
              value={priceMax}
              onChange={(e) => {
                const val = Math.max(parseInt(e.target.value), priceMin + 100);
                setPage(1);
                setFilters((p) => ({ ...p, maxPrice: String(val) }));
              }}
              style={{
                position: "absolute",
                top: 6,
                left: 0,
                width: "100%",
                height: 20,
                opacity: 0,
                cursor: "pointer",
                zIndex: 4,
                margin: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                left: `${(priceMin / 6600) * 100}%`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#ff3f6c",
                border: "2px solid #fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                transform: "translateX(-50%)",
                zIndex: 5,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                left: `${(priceMax / 6600) * 100}%`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                backgroundColor: "#ff3f6c",
                border: "2px solid #fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                transform: "translateX(-50%)",
                zIndex: 5,
                pointerEvents: "none",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              color: "#282c3f",
              fontWeight: 600,
            }}
          >
            <span>{"Rs."}{priceMin}</span>
            <span>{"Rs."}{priceMax}+</span>
          </div>
        </div>
      </FilterSection>
      <FilterSection
        title="COLOR"
        collapsed={collapsed.color}
        onToggle={() => toggleCollapse("color")}
        searchOpen={colorSearchOpen}
        onSearchToggle={() => {
          setColorSearchOpen(!colorSearchOpen);
          setColorSearch("");
        }}
        showSearch
      >
        {colorSearchOpen && (
          <div style={{ padding: "0 16px 8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d4d5d9",
                borderRadius: 2,
                padding: "5px 8px",
                gap: 6,
              }}
            >
              <Search size={14} style={{ color: "#94969f", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search Color"
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "#282c3f",
                  width: "100%",
                  backgroundColor: "transparent",
                }}
                autoFocus
              />
              {colorSearch && (
                <X
                  size={14}
                  style={{ color: "#94969f", cursor: "pointer", flexShrink: 0 }}
                  onClick={() => setColorSearch("")}
                />
              )}
            </div>
          </div>
        )}

        <div style={{ padding: "0 16px 12px" }}>
          {visibleColors.map((color) => {
            const checked = isColorChecked(color.name);
            return (
              <label
                key={color.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "5px 0",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "#282c3f",
                  fontWeight: checked ? 600 : 400,
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleColorToggle(color.name)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: "#ff3f6c",
                    cursor: "pointer",
                    flexShrink: 0,
                    margin: 0,
                  }}
                />
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    backgroundColor:
                      color.code === "transparent" ? "#f5f5f5" : color.code,
                    border:
                      color.code === "#ffffff" || color.code === "transparent"
                        ? "1.5px solid #d4d5d9"
                        : color.code === "#f5f0dc" || color.code === "#f5f5dc"
                          ? "1px solid #d4d5d9"
                          : "1px solid transparent",
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {color.name}
                </span>
                {color.count > 0 && (
                  <span style={{ fontSize: 12, color: "#94969f", flexShrink: 0 }}>
                    ({color.count})
                  </span>
                )}
              </label>
            );
          })}

          {filteredColors.length > INITIAL_COLORS && (
            <button
              onClick={() => setShowAllColors(!showAllColors)}
              style={{
                color: "#ff3f6c",
                fontSize: 13,
                fontWeight: 700,
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 0 0",
                display: "block",
              }}
            >
              {showAllColors
                ? "- Show less"
                : `+ ${filteredColors.length - INITIAL_COLORS} more`}
            </button>
          )}
        </div>
      </FilterSection>
      <FilterSection
        title="SIZE"
        collapsed={collapsed.size}
        onToggle={() => toggleCollapse("size")}
        searchOpen={sizeSearchOpen}
        onSearchToggle={() => {
          setSizeSearchOpen(!sizeSearchOpen);
          setSizeSearch("");
        }}
        showSearch
      >
        {sizeSearchOpen && (
          <div style={{ padding: "0 16px 8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #d4d5d9",
                borderRadius: 2,
                padding: "5px 8px",
                gap: 6,
              }}
            >
              <Search size={14} style={{ color: "#94969f", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search Size"
                value={sizeSearch}
                onChange={(e) => setSizeSearch(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "#282c3f",
                  width: "100%",
                  backgroundColor: "transparent",
                }}
                autoFocus
              />
              {sizeSearch && (
                <X
                  size={14}
                  style={{ color: "#94969f", cursor: "pointer", flexShrink: 0 }}
                  onClick={() => setSizeSearch("")}
                />
              )}
            </div>
          </div>
        )}

        <div style={{ padding: "0 16px 12px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2px 0",
            }}
          >
            {visibleSizes.map((size) => {
              const checked = isSizeChecked(size);
              return (
                <label
                  key={size}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "5px 0", cursor: "pointer", fontSize: 14, color: "#282c3f",
                    fontWeight: checked ? 600 : 400,
                  }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleSizeToggle(size)}
                    style={{
                      width: 16,
                      height: 16,
                      accentColor: "#ff3f6c",
                      cursor: "pointer",
                      flexShrink: 0,
                      margin: 0,
                    }}
                  />
                  {size}
                </label>
              );
            })}
          </div>

          {filteredSizes.length > INITIAL_SIZES && (
            <button
              onClick={() => setShowAllSizes(!showAllSizes)}
              style={{
                color: "#ff3f6c", fontSize: 13, fontWeight: 700, backgroundColor: "transparent", border: "none", cursor: "pointer",
                padding: "8px 0 0", display: "block",
              }}>
              {showAllSizes
                ? "- Show less"
                : `+ ${filteredSizes.length - INITIAL_SIZES} more`}
            </button>
          )}
        </div>
      </FilterSection>
      <FilterSection
        title="CUSTOMER RATING"
        collapsed={collapsed.rating}
        onToggle={() => toggleCollapse("rating")}
      >
        <div style={{ padding: "0 16px 16px" }}>
          {RATINGS.map((r) => {
            const selected = filters.rating === String(r);
            return (
              <label
                key={r}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "6px 0", cursor: "pointer", fontSize: 14, color: "#282c3f",
                  fontWeight: selected ? 600 : 400,
                }}
              >
                <input
                  type="radio" name="rating"
                  checked={selected}
                  onChange={() => handleRating(r)}
                  style={{ width: 18, height: 18, accentColor: "#ff3f6c", cursor: "pointer", margin: 0, }} />
                <span
                  style={{ display: "flex", alignItems: "center", gap: 4, lineHeight: 1, }}>
                  {r}
                  <span
                    style={{ color: getRatingColor(r), fontSize: 14, fontWeight: 700, }}
                  >
                    ★
                  </span>
                  & above
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>
      <FilterSection
        title="DISCOUNT RANGE"
        collapsed={collapsed.discount}
        onToggle={() => toggleCollapse("discount")}
      >
        <div style={{ padding: "0 16px 16px" }}>
          {DISCOUNTS.map((d) => {
            const selected = filters.discount === String(d);
            return (
              <label
                key={d}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "6px 0", cursor: "pointer", fontSize: 14, color: "#282c3f",
                  fontWeight: selected ? 600 : 400,
                }}
              >
                <input
                  type="radio"
                  name="discount"
                  checked={selected}
                  onChange={() => handleDiscount(d)}
                  style={{ width: 18, height: 18, accentColor: "#ff3f6c", cursor: "pointer", margin: 0, }} />
                {d}% and above
              </label>
            );
          })}
        </div>
      </FilterSection>
      <div style={{ height: 60 }} />
      <style>{`div::-webkit-scrollbar {width: 5px;}
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: #d4d5d9;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #94969f;
        }
      `}</style>
    </div>
  );
}
function FilterSection({ title, collapsed, onToggle, children, showSearch, searchOpen, onSearchToggle, hideBorder, }) {
  if (!title && collapsed) return null;

  return (
    <div
      style={{
        borderBottom: hideBorder ? "none" : "1px solid #e8e8e8",
      }}
    >
      {/* Section Header */}
      {title && (
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 8px", cursor: "pointer",
          }}
        >
          <h3
            onClick={onToggle}
            style={{
              fontSize: 13, fontWeight: 700, color: "#282c3f", letterSpacing: "0.5px", textTransform: "uppercase", margin: 0,
              flex: 1, cursor: "pointer",
            }}
          >
            {title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {showSearch && (
              <Search
                size={16}
                style={{ color: searchOpen ? "#282c3f" : "#94969f", cursor: "pointer", flexShrink: 0, }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSearchToggle) onSearchToggle();
                }}
              />
            )}
            <div onClick={onToggle} style={{ cursor: "pointer", flexShrink: 0 }}>
              {collapsed ? (
                <ChevronDown size={16} style={{ color: "#94969f" }} />
              ) : (
                <ChevronUp size={16} style={{ color: "#94969f" }} />
              )}
            </div>
          </div>
        </div>
      )}
      {!collapsed && children}
    </div>
  );
}
