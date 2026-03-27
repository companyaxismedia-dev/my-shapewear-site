"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

const SearchSection = ({ onToggleMobileSearch }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

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
    const timeoutId = setTimeout(() => {
      if (query) fetchResults(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, fetchResults]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      setIsMobileSearchVisible(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleToggleMobile = (visible) => {
    setIsMobileSearchVisible(visible);
    if (onToggleMobileSearch) onToggleMobileSearch(visible);
  };

  const renderResultsList = () => (
    <ul className="absolute top-full left-0 z-[110] max-h-80 w-full overflow-y-auto rounded-md border border-gray-200 bg-white shadow-xl">
      {isLoading && (
        <li className="flex items-center justify-center p-4">
          <Loader2 className="animate-spin text-pink-600" size={20} />
        </li>
      )}

      {!isLoading && results.length === 0 && query && (
        <li className="px-4 py-3 text-sm text-gray-500">No products found for "{query}"</li>
      )}

      {results.map((item) => (
        <li
          key={item._id}
          onClick={() => {
            router.push(`/product/${item.slug}`);
            setIsOpen(false);
            setIsMobileSearchVisible(false);
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

      <div className="md:hidden">
        <button
          onClick={() => handleToggleMobile(true)}
          className="rounded-full p-2 text-gray-700 hover:bg-gray-100"
        >
          <Search size={24} />
        </button>
      </div>

      {isMobileSearchVisible && (
        <div className="fixed inset-0 z-[999] flex flex-col bg-white p-4 md:hidden">
          <div className="mb-4 flex items-center gap-3">
            <button onClick={() => handleToggleMobile(false)}>
              <X size={24} />
            </button>

            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className="w-full border-b-2 border-pink-500 py-2 text-lg outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />

              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2"
              >
                <Search size={20} className="text-pink-600" />
              </button>
            </form>
          </div>

          <div className="relative flex-1">{query && renderResultsList()}</div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
