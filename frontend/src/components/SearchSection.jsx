// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { Search, X, Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";

// const SearchSection = ({ onToggleMobileSearch }) => {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
//   const router = useRouter();

//   const fetchResults = useCallback(async (searchTerm) => {
//     if (!searchTerm.trim()) {
//       setResults([]);
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Replace '/api/products/search' with your actual backend endpoint
//       const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}`);
//       const data = await response.json();
//       setResults(data); // Expecting an array of objects: [{ id, name, slug }, ...]
//     } catch (error) {
//       console.error("Search fetch error:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       if (query) fetchResults(query);
//     }, 300);

//     return () => clearTimeout(timeoutId);
//   }, [query, fetchResults]);

//   const handleSearchSubmit = (e) => {
//     if (e) e.preventDefault();
//     if (query.trim()) {
//       setIsOpen(false);
//       setIsMobileSearchVisible(false);
//       // Redirects to a dedicated search results page
//       router.push(`/search?q=${encodeURIComponent(query)}`);
//     }
//   };

//   const handleToggleMobile = (visible) => {
//     setIsMobileSearchVisible(visible);
//     if (onToggleMobileSearch) onToggleMobileSearch(visible);
//   };

//   const renderResultsList = () => (
//     <ul className="absolute top-full left-0 z-[110] w-full rounded-md border border-gray-200 bg-white shadow-xl max-h-80 overflow-y-auto">
//       {isLoading && (
//         <li className="flex items-center justify-center p-4">
//           <Loader2 className="animate-spin text-pink-600" size={20} />
//         </li>
//       )}
//       {!isLoading && results.length === 0 && query && (
//         <li className="px-4 py-3 text-sm text-gray-500">No products found for "{query}"</li>
//       )}
//       {results.map((item) => (
//         <li
//           key={item.id}
//           onClick={() => {
//             router.push(`/product/${item.slug}`);
//             setIsOpen(false);
//             setIsMobileSearchVisible(false);
//           }}
//           className="cursor-pointer px-4 py-3 text-sm hover:bg-pink-50 border-b border-gray-50 last:border-none flex justify-between"
//         >
//           <span className="font-medium text-gray-800">{item.name}</span>
//           <span className="text-pink-500 text-xs">View →</span>
//         </li>
//       ))}
//     </ul>
//   );

//   return ( 
//     <div className="relative">
//       {/* DESKTOP VIEW */}
//       <div className="hidden md:block w-72 lg:w-60">
//         <form onSubmit={handleSearchSubmit} className="relative">
//           <input
//             type="text"
//             placeholder="Search for bras, panties..."
//             value={query}
//             onChange={(e) => {
//               setQuery(e.target.value);
//               setIsOpen(true);
//             }}
//             onFocus={() => setIsOpen(true)}
//             className="w-full rounded-full border border-gray-300 py-1 pl-4 pr-12 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
//           />
//           <button
//             type="submit"
//             className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-pink-600 transition-colors"
//           >
//             <Search size={18} />
//           </button>
//         </form>
//         {isOpen && query && renderResultsList()}
//       </div>

//       {/* MOBILE VIEW ICON */}
//       <div className="md:hidden">
//         <button
//           onClick={() => handleToggleMobile(true)} // Changed
//           className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
//         >
//           <Search size={24} />
//         </button>
//       </div>

//       {/* mobile view */}
//       {isMobileSearchVisible && (
//         <div className="fixed inset-0 bg-white z-[999] p-4 flex flex-col md:hidden">
//           <div className="flex items-center gap-3 mb-4">
//             <button onClick={() => handleToggleMobile(false)}> {/* Changed */}
//               <X size={24} className="text-gray-600" />
//             </button>            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
//               <input
//                 autoFocus
//                 type="text"
//                 placeholder="Search Clovia..."
//                 className="w-full border-b-2 border-pink-500 py-2 text-lg outline-none"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//               />
//               <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2">
//                 <Search size={20} className="text-pink-600" />
//               </button>
//             </form>
//           </div>
//           <div className="relative flex-1">
//             {query && renderResultsList()}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchSection;



"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const API_BASE =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "https://my-shapewear-site.onrender.com";

const SearchSection = ({ onToggleMobileSearch }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSearchVisible, setIsMobileSearchVisible] =
    useState(false);

  const router = useRouter();

  /* ================= FETCH RESULTS FROM BACKEND ================= */
  const fetchResults = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/products?keyword=${encodeURIComponent(
          searchTerm
        )}&limit=6`
      );

      const data = await response.json();

      if (data.success) {
        setResults(data.products);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ================= DEBOUNCE ================= */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) fetchResults(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, fetchResults]);

  /* ================= SUBMIT SEARCH ================= */
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
    if (onToggleMobileSearch)
      onToggleMobileSearch(visible);
  };

  /* ================= DROPDOWN RESULTS ================= */
  const renderResultsList = () => (
    <ul className="absolute top-full left-0 z-[110] w-full rounded-md border border-gray-200 bg-white shadow-xl max-h-80 overflow-y-auto">
      {isLoading && (
        <li className="flex items-center justify-center p-4">
          <Loader2
            className="animate-spin text-pink-600"
            size={20}
          />
        </li>
      )}

      {!isLoading && results.length === 0 && query && (
        <li className="px-4 py-3 text-sm text-gray-500">
          No products found for "{query}"
        </li>
      )}

      {results.map((item) => (
        <li
          key={item._id}
          onClick={() => {
            router.push(`/product/${item.slug}`);
            setIsOpen(false);
            setIsMobileSearchVisible(false);
          }}
          className="cursor-pointer px-4 py-3 text-sm hover:bg-pink-50 border-b border-gray-50 last:border-none flex gap-3 items-center"
        >
          <img
            src={item.variants?.[0]?.images?.[0] ? `${API_BASE}${item.variants[0].images[0]}`: "/placeholder.jpg"}
            className="w-10 h-12 object-cover rounded"
            alt={item.name}
          />
          <div>
            <p className="font-medium text-gray-800">
              {item.name}
            </p>
            <p className="text-xs text-gray-400">
              ₹{item.price}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative">
      {/* DESKTOP */}
      <div className="hidden md:block w-72 lg:w-60">
        <form
          onSubmit={handleSearchSubmit}
          className="relative"
        >
          <input
            type="text"
            placeholder="Search for bras, panties..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full rounded-full border border-gray-300 py-1 pl-4 pr-12 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
          />

          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-pink-600 transition-colors"
          >
            <Search size={18} />
          </button>
        </form>

        {isOpen && query && renderResultsList()}
      </div>

      {/* MOBILE ICON */}
      <div className="md:hidden">
        <button
          onClick={() => handleToggleMobile(true)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <Search size={24} />
        </button>
      </div>

      {/* MOBILE FULL SCREEN */}
      {isMobileSearchVisible && (
        <div className="fixed inset-0 bg-white z-[999] p-4 flex flex-col md:hidden">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => handleToggleMobile(false)}
            >
              <X size={24} />
            </button>

            <form
              onSubmit={handleSearchSubmit}
              className="flex-1 relative"
            >
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
                <Search
                  size={20}
                  className="text-pink-600"
                />
              </button>
            </form>
          </div>

          <div className="relative flex-1">
            {query && renderResultsList()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSection;
