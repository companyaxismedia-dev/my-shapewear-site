"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowUpLeft, Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { SearchSuggestionSkeleton } from "@/components/loaders/Loaders";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveProductImage = (item) => {
  const primaryVariantImage =
    item?.variants?.[0]?.images?.find?.((img) => img?.isPrimary)?.url ||
    item?.variants?.[0]?.images?.[0]?.url ||
    item?.variants?.[0]?.images?.[0];

  const imagePath = item?.thumbnail || item?.image || primaryVariantImage || "";

  if (!imagePath || typeof imagePath !== "string") {
    return "/placeholder.jpg";
  }

  if (
    imagePath.startsWith("http") ||
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  return `${API_BASE}${imagePath}`;
};

const SearchSection = ({
  onToggleMobileSearch,
  mobileMode = "icon",
  mobileFixed = false,
  mobileClassName = "",
  mobilePlaceholder = "Search for brands & products",
  mobileOpen,
  setMobileOpen,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [internalMobileSearchVisible, setInternalMobileSearchVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isMobileSearchVisible =
    typeof mobileOpen === "boolean" ? mobileOpen : internalMobileSearchVisible;

  const router = useRouter();

  const fetchResults = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/products?keyword=${encodeURIComponent(searchTerm)}&limit=6`
      );

      const data = await response.json();

      if (data.success) {
        setResults(data.products || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) fetchResults(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, fetchResults]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      if (setMobileOpen) {
        setMobileOpen(false);
      } else {
        setInternalMobileSearchVisible(false);
      }
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleToggleMobile = (visible) => {
    if (setMobileOpen) {
      setMobileOpen(visible);
    } else {
      setInternalMobileSearchVisible(visible);
    }
    if (onToggleMobileSearch) onToggleMobileSearch(visible);
  };

  const renderResultsList = () => (
    <ul className="absolute top-full left-0 z-[110] max-h-80 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-xl">
      {isLoading ? <SearchSuggestionSkeleton rows={4} /> : null}

      {!isLoading && results.length === 0 && query && (
        <li className="px-4 py-3 text-sm text-gray-500">No products found for "{query}"</li>
      )}

      {results.map((item) => (
        <li
          key={item._id}
            onClick={() => {
              router.push(`/product/${item.slug}`);
              setIsOpen(false);
              handleToggleMobile(false);
            }}
          className="flex cursor-pointer items-center gap-3 border-b border-gray-50 px-4 py-3 text-sm hover:bg-pink-50 last:border-none"
        >
          <img
            src={resolveProductImage(item)}
            className="h-12 w-10 rounded object-cover"
            alt={item.name}
          />
          <div>
            <p className="font-medium text-gray-800">{item.name}</p>
            <p className="text-xs text-gray-400">Rs. {item.minPrice ?? item.price ?? ""}</p>
          </div>
        </li>
      ))}
    </ul>
  );

  const renderMobileResultsList = () => {
    const mobileSuggestions = Array.from(
      new Set(
        results.flatMap((item) =>
          [item?.name, item?.category, item?.subCategory]
            .map((value) => String(value || "").trim())
            .filter(
              (value) =>
                value &&
                value.toLowerCase().includes(query.toLowerCase())
            )
        )
      )
    ).slice(0, 8);

    if (isLoading) {
      return (
        <div className="px-4 py-4">
          <div className="overflow-hidden rounded-xl border border-[#f0e7ea] bg-white">
            <SearchSuggestionSkeleton rows={4} />
          </div>
        </div>
      );
    }

    if (!query) {
      return null;
    }

    if (mobileSuggestions.length === 0) {
      return (
        <div className="px-4 py-4 text-sm text-gray-500">
          No products found for "{query}"
        </div>
      );
    }

    return (
      <ul className="divide-y divide-gray-100">
        {mobileSuggestions.map((suggestion) => (
          <li
            key={suggestion}
            onClick={() => {
              setQuery(suggestion);
              setIsOpen(false);
              handleToggleMobile(false);
              router.push(`/search?q=${encodeURIComponent(suggestion)}`);
            }}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-pink-50"
          >
            <Search size={16} className="shrink-0 text-[#c4b4ba]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] text-[#4a2e35]">{suggestion}</p>
            </div>
            <ArrowUpLeft size={16} className="shrink-0 text-[#c4b4ba]" />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="relative">
      <div className="hidden w-72 md:block lg:w-60">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search for bras, panties..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full rounded-full border border-gray-300 py-1 pl-4 pr-12 text-sm transition-all focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
          />

          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-4 text-gray-400 transition-colors hover:text-pink-600"
          >
            <Search size={18} />
          </button>
        </form>

        {isOpen && query && renderResultsList()}
      </div>

      <div className={`md:hidden ${mobileClassName}`}>
        {mobileMode === "bar" ? (
          <button
            type="button"
            onClick={() => handleToggleMobile(true)}
            className={`flex w-full items-center gap-3 rounded-full border border-[#eadfe3] bg-white px-4 text-left text-sm text-[#9d8b91] shadow-sm ${
              mobileFixed ? "py-3" : "py-2.5"
            }`}
          >
            <Search size={18} className="text-[#9d8b91]" />
            <span>{mobilePlaceholder}</span>
          </button>
        ) : (
          <button
            onClick={() => handleToggleMobile(true)}
            className="rounded-full p-2 text-gray-700 hover:bg-gray-100"
          >
            <Search size={24} />
          </button>
        )}
      </div>

      {isMounted && isMobileSearchVisible
        ? createPortal(
        <div className="fixed inset-0 z-[999] flex flex-col bg-white md:hidden">
          <div className="flex items-center gap-3 border-b border-[#f0e7ea] px-4 py-3">
            <button onClick={() => handleToggleMobile(false)} type="button">
              <ArrowLeft size={22} className="text-[#4a2e35]" />
            </button>

            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                autoFocus
                type="text"
                placeholder={mobilePlaceholder}
                className="w-full py-2 pl-1 pr-20 text-base outline-none placeholder:text-[#b4a4aa]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-[#7f6a72]"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              ) : null}

              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2"
                aria-label="Search products"
              >
                <Search size={20} className="text-pink-600" />
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">{renderMobileResultsList()}</div>
        </div>,
        document.body
      )
        : null}
    </div>
  );
};

export default SearchSection;
