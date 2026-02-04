import { useState } from "react";
import { Search } from "lucide-react";

const SearchSection = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const products = [
    "Seamless Bra",
    "Lace Bralette",
    "Cotton Panty",
    "Sports Bra",
    "Nightwear Set",
    "Shapewear Bodysuit",
  ];

  const filteredResults = products.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-65">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className="w-full rounded-full border border-gray-300 py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-pink-500"
        />

        <Search
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && query && (
        <ul className="absolute top-11 z-50 w-full rounded-md border bg-white shadow-lg">
          {filteredResults.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-500">
              No results found
            </li>
          ) : (
            filteredResults.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-pink-50"
              >
                {item}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchSection;
