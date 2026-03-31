"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow, ArrowUpDown, ArrowUpNarrowWide, BadgePercent, Check,
  ChevronDown, Clock3, Flame, SlidersHorizontal, Star, X,
} from "lucide-react";
import FilterBar from "@/components/FilterBar";
import TopFilters, { FILTER_OPTIONS, TOP_FILTERS } from "@/components/TopFilters";
import Footer from "@/components/Footer";
import { ProductCard } from "@/components/category/ProductCard";
import CategoryBreadcrumb from "@/components/category/CategoryBreadcrumb";
import { ProductGridSkeleton, SkeletonBlock } from "@/components/loaders/Loaders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SORT_OPTIONS = [
  "Recommended",
  "What's New",
  "Popularity",
  "Better Discount",
  "Price: High to Low",
  "Price: Low to High",
  "Customer Rating",
];

const SORT_ICON_MAP = {
  Recommended: Check,
  Popularity: Flame,
  "What's New": Clock3,
  "Better Discount": BadgePercent,
  "Price: High to Low": ArrowDownWideNarrow,
  "Price: Low to High": ArrowUpNarrowWide,
  "Customer Rating": Star,
};

const MOBILE_PRIMARY_FILTERS = [
  "Gender",
  "Subcategory",
  "Price",
  "Color",
  "Size",
  "Customer Rating",
  "Discount Range",
];

const toTopFilterKey = (categoryName) => {
  const map = { Size: "size", Rating: "rating" };
  if (map[categoryName]) return map[categoryName];
  return categoryName.toLowerCase().replace(/\s+/g, "_");
};

function SearchMobileFilterDrawer({
  filters,
  setFilters,
  activeSection,
  setActiveSection,
  onClose,
  onApply,
}) {
  const [meta, setMeta] = useState({
    subcategories: [],
    colors: [],
    sizes: [],
    priceRange: { min: 0, max: 6600 },
    totalMatchingProducts: 0,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.subCategory) params.set("subCategory", filters.subCategory);
    if (filters.color) params.set("color", filters.color);
    if (filters.size) params.set("size", filters.size);
    if (filters.rating) params.set("rating", filters.rating);
    if (filters.discount) params.set("discount", filters.discount);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    params.set("keyword", filters.keyword || "");

    fetch(`${API_BASE}/api/products/filters-meta?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        setMeta({
          subcategories: data.subcategories || [],
          colors: data.colors || [],
          sizes: data.sizes || [],
          priceRange: data.priceRange || { min: 0, max: 6600 },
          totalMatchingProducts: data.totalMatchingProducts || 0,
        });
      })
      .catch(() => { });
  }, [filters]);

  const rangeMin = Number(meta.priceRange?.min ?? 0);
  const rangeMax = Number(meta.priceRange?.max ?? 6600);
  const currentMin =
    filters.minPrice !== undefined && filters.minPrice !== ""
      ? Number(filters.minPrice)
      : rangeMin;
  const currentMax =
    filters.maxPrice !== undefined && filters.maxPrice !== ""
      ? Number(filters.maxPrice)
      : rangeMax;
  const rangeSpan = Math.max(rangeMax - rangeMin, 1);
  const selectedPriceLeft = ((currentMin - rangeMin) / rangeSpan) * 100;
  const selectedPriceRight = 100 - ((currentMax - rangeMin) / rangeSpan) * 100;
  const sections = [...MOBILE_PRIMARY_FILTERS, ...TOP_FILTERS.filter((name) => !["Size", "Rating"].includes(name))];

  const toggleMulti = (key, value) => {
    setFilters((prev) => {
      const current = prev[key] ? prev[key].split(",").filter(Boolean) : [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next.length ? next.join(",") : "" };
    });
  };

  const toggleSingle = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === String(value) ? "" : String(value),
    }));
  };

  const isSelected = (key, value) => (filters[key]?.split(",") || []).includes(value);

  const renderSectionContent = () => {
    if (activeSection === "Gender") {
      return ["Girls", "Women"].map((value) => (
        <MobileOptionRow
          key={value}
          label={value}
          selected={filters.gender === value}
          onClick={() => toggleSingle("gender", value)}
        />
      ));
    }

    if (activeSection === "Subcategory") {
      return meta.subcategories.map((item) => (
        <MobileOptionRow
          key={item.name}
          label={item.name}
          trailing={item.count}
          selected={isSelected("subCategory", item.name)}
          onClick={() => toggleMulti("subCategory", item.name)}
        />
      ));
    }

    if (activeSection === "Color") {
      return meta.colors.map((item) => (
        <MobileOptionRow
          key={item.name}
          label={item.name}
          trailing={item.count}
          selected={isSelected("color", item.name)}
          onClick={() => toggleMulti("color", item.name)}
        />
      ));
    }

    if (activeSection === "Size") {
      return meta.sizes.map((item) => (
        <MobileOptionRow
          key={item.name}
          label={item.name}
          trailing={item.count}
          selected={isSelected("size", item.name)}
          onClick={() => toggleMulti("size", item.name)}
        />
      ));
    }

    if (activeSection === "Customer Rating") {
      return [4.5, 4, 3.5, 3].map((value) => (
        <MobileOptionRow
          key={value}
          label={`${value} & Above`}
          selected={filters.rating === String(value)}
          onClick={() => toggleSingle("rating", value)}
        />
      ));
    }

    if (activeSection === "Discount Range") {
      return [10, 20, 30, 40, 50, 60, 70, 80, 90].map((value) => (
        <MobileOptionRow
          key={value}
          label={`${value}% and above`}
          selected={filters.discount === String(value)}
          onClick={() => toggleSingle("discount", value)}
        />
      ));
    }

    if (activeSection === "Price") {
      return (
        <div className="category-mobile-price-panel">
          <div className="category-mobile-price-summary">
            <div className="category-mobile-price-title">Selected price range</div>
            <div className="category-mobile-price-values">
              {`Rs.${currentMin.toLocaleString()} - Rs.${currentMax >= rangeMax ? `${rangeMax.toLocaleString()}+` : currentMax.toLocaleString()}`}
            </div>
            <div className="category-mobile-price-count">
              {meta.totalMatchingProducts.toLocaleString()} products found
            </div>
          </div>
          <div className="category-mobile-price-slider">
            <div className="category-mobile-price-track" />
            <div
              className="category-mobile-price-track-active"
              style={{
                left: `${selectedPriceLeft}%`,
                right: `${selectedPriceRight}%`,
              }}
            />
            <input
              type="range"
              min={rangeMin}
              max={rangeMax}
              step={50}
              value={currentMin}
              onChange={(e) => {
                const value = Math.min(Number(e.target.value), currentMax - 50);
                setFilters((prev) => ({ ...prev, minPrice: String(value) }));
              }}
            />
            <input
              type="range"
              min={rangeMin}
              max={rangeMax}
              step={50}
              value={currentMax}
              onChange={(e) => {
                const value = Math.max(Number(e.target.value), currentMin + 50);
                setFilters((prev) => ({ ...prev, maxPrice: String(value) }));
              }}
            />
          </div>
        </div>
      );
    }

    const topFilterOptions = FILTER_OPTIONS[activeSection] || [];
    const key = toTopFilterKey(activeSection);

    return topFilterOptions.map((value) => (
      <MobileOptionRow
        key={value}
        label={value}
        selected={activeSection === "Rating" ? filters[key] === value.replace(/[^0-9.]/g, "") : isSelected(key, value)}
        onClick={() => {
          if (activeSection === "Rating") {
            toggleSingle(key, value.replace(/[^0-9.]/g, ""));
            return;
          }
          toggleMulti(key, value);
        }}
      />
    ));
  };

  return (
    <div className="category-mobile-overlay z-[140]">
      <div className="category-mobile-filter-drawer">
        <div className="category-mobile-filter-header">
          <h3>Filters</h3>
          <button
            type="button"
            className="category-mobile-clear-btn"
            onClick={() => setFilters({})}
          >
            Clear All
          </button>
        </div>
        <div className="category-mobile-filter-body">
          <div className="category-mobile-filter-tabs">
            {sections.map((section) => (
              <button
                key={section}
                type="button"
                className={`category-mobile-filter-tab ${activeSection === section ? "is-active" : ""}`}
                onClick={() => setActiveSection(section)}
              >
                {section}
              </button>
            ))}
          </div>
          <div className="category-mobile-filter-content">
            {renderSectionContent()}
          </div>
        </div>
        <div className="category-mobile-filter-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className="is-apply" onClick={onApply}>Apply</button>
        </div>
      </div>
    </div>
  );
}

function MobileOptionRow({ label, selected, onClick, trailing }) {
  return (
    <button type="button" className={`category-mobile-option-row ${selected ? "is-active" : ""}`} onClick={onClick}>
      <span className="category-mobile-option-check">{selected ? <Check size={14} /> : null}</span>
      <span className="category-mobile-option-label">{label}</span>
      {trailing ? <span className="category-mobile-option-trailing">{trailing}</span> : null}
    </button>
  );
}

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState("Recommended");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileFilterSection, setMobileFilterSection] = useState(MOBILE_PRIMARY_FILTERS[0]);

  useEffect(() => {
    setPage(1);
    setFilters({});
    setSort("Recommended");
  }, [query]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-sort-dropdown]")) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!mobileFilterOpen) {
      setMobileFilterSection(MOBILE_PRIMARY_FILTERS[0]);
    }
  }, [mobileFilterOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setTotalItems(0);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== "")
        );

        const params = new URLSearchParams({
          ...cleanFilters,
          keyword: query,
          page: String(page),
          limit: "20",
          ...(sort === "Price: Low to High" && { sort: "price_asc" }),
          ...(sort === "Price: High to Low" && { sort: "price_desc" }),
          ...(sort === "Better Discount" && { sort: "discount_desc" }),
          ...(sort === "Customer Rating" && { sort: "rating" }),
          ...(sort === "What's New" && { sort: "newest" }),
          ...(sort === "Popularity" && { sort: "popularity" }),
        });

        const res = await fetch(`${API_BASE}/api/products?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (data.success) {
          setProducts(data.products || []);
          setTotalItems(data.total || data.products?.length || 0);
        } else {
          setProducts([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
        setProducts([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query, filters, page, sort]);

  if (!query.trim()) {
    return (
      <div className="section-padding" style={{ background: "var(--color-bg)" }}>
        <div className="container-imkaa">
          <div className="py-16 text-center">
            <h1 className="heading-section" style={{ fontSize: "clamp(24px, 2.6vw, 34px)" }}>
              Search products
            </h1>
            <p className="mt-3 text-sm text-[#94969f]">Type a keyword to find matching products.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#282c3f] font-sans relative">
      <div className="category-page-header-shell">
        <div className="hidden md:block">
          <CategoryBreadcrumb currentLabel="Search" totalItems={totalItems} />
        </div>
        <div className="md:hidden">
          <CategoryBreadcrumb currentLabel={`Search: ${query}`} totalItems={totalItems} mobile />
        </div>
      </div>

      <div className="category-page-layout">
        <aside className="hidden md:block category-filter-aside">
          <div className="category-filter-sticky">
            <FilterBar filters={filters} setFilters={setFilters} setPage={setPage} />
          </div>
        </aside>

        <div className="category-page-content">
          <div className="hidden md:flex items-start justify-between border-b border-[#e8e8e8] px-4 min-h-[48px] gap-2">
            <TopFilters filters={filters} setFilters={setFilters} setPage={setPage} />

            <div className="relative shrink-0 pt-2" data-sort-dropdown>
              <button
                onClick={() => setSortOpen((prev) => !prev)}
                className="flex items-center justify-between border border-[#e8e8e8] px-3.5 py-2 text-[13px] w-[240px] bg-white cursor-pointer text-[#282c3f]"
              >
                <span>
                  Sort by : <strong>{sort}</strong>
                </span>
                <ChevronDown size={14} />
              </button>

              {sortOpen ? (
                <div className="absolute right-0 top-full bg-white border border-[#e8e8e8] shadow-lg w-[240px] z-[100]">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSort(option);
                        setSortOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-[14px] transition-colors ${sort === option
                          ? "text-[#ff3f6c] font-bold"
                          : "text-[#282c3f] font-normal hover:bg-gray-50"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <main className="category-page-main">
            <div className="mb-4 px-1 md:px-0">
              {/* <h1 className="text-[clamp(24px,2.6vw,34px)] font-semibold text-[#5b3c46]">
                Search results
              </h1> */}
              <p className="mt-1 font-semibold text-[#94969f]">Showing results for "{query}"</p>
            </div>

            {loading ? (
              <div className="space-y-5 py-4">
                <div className="space-y-3">
                  <SkeletonBlock className="h-4 w-64 rounded-full" />
                  <SkeletonBlock className="h-4 w-40 rounded-full" />
                </div>
                <ProductGridSkeleton count={10} />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <h2 className="text-lg font-bold text-[#282c3f]">No products found</h2>
                <p className="text-sm text-[#94969f] mt-2">Try changing or clearing your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-[18px] sm:gap-x-4 sm:gap-y-[22px] lg:grid-cols-3 lg:gap-x-5 lg:gap-y-[26px] xl:grid-cols-4 xl:gap-y-7 2xl:grid-cols-5 2xl:gap-x-[22px] 2xl:gap-y-[30px]">
                {products.map((item) => (
                  <ProductCard
                    key={item._id}
                    item={item}
                    onOpenDetails={() => router.push(`/product/${item.slug}`)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {isMobile ? (
        <>
          <div className="category-mobile-toolbar">
            <button
              type="button"
              className="category-mobile-toolbar-btn"
              onClick={() => setMobileSortOpen(true)}
            >
              <ArrowUpDown size={16} />
              <span>Sort</span>
            </button>
            <button
              type="button"
              className="category-mobile-toolbar-btn"
              onClick={() => setMobileFilterOpen(true)}
            >
              <SlidersHorizontal size={16} />
              <span>Filter</span>
            </button>
          </div>

          {mobileSortOpen ? (
            <div className="category-mobile-overlay z-[140]" onClick={() => setMobileSortOpen(false)}>
              <div className="category-mobile-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="category-mobile-sheet-header">
                  <h3>Sort By</h3>
                </div>
                <div className="category-mobile-sort-list">
                  {SORT_OPTIONS.map((option) => {
                    const SortIcon = SORT_ICON_MAP[option] || Check;
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`category-mobile-sort-item ${sort === option ? "is-active" : ""}`}
                        onClick={() => {
                          setSort(option);
                          setMobileSortOpen(false);
                        }}
                      >
                        <span className="category-mobile-sort-label">
                          <SortIcon size={16} />
                          <span>{option}</span>
                        </span>
                        {sort === option ? <Check size={16} /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {mobileFilterOpen ? (
            <SearchMobileFilterDrawer
              filters={filters}
              setFilters={setFilters}
              activeSection={mobileFilterSection}
              setActiveSection={setMobileFilterSection}
              onClose={() => setMobileFilterOpen(false)}
              onApply={() => {
                setPage(1);
                setMobileFilterOpen(false);
              }}
            />
          ) : null}
        </>
      ) : null}
      <Footer />
    </div>
  );
}
