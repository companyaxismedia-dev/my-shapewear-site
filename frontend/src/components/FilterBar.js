"use client";

import { Filter } from "lucide-react";

export default function FilterBar() {
  return (
    <div className="px-4 py-3 border-b border-pink-100 flex justify-between items-center bg-white sticky top-[64px] z-40">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-[#ed4e7e] uppercase tracking-widest">
          Sort By:
        </span>

        <select className="text-[10px] font-bold uppercase outline-none bg-transparent cursor-pointer text-[#ed4e7e]">
          <option>Low to High</option>
          <option>High to Low</option>
          <option>Newest</option>
        </select>
      </div>

      <button className="flex items-center gap-2 text-[10px] font-bold text-[#ed4e7e] uppercase border border-[#ed4e7e] px-3 py-1 rounded-sm">
        <Filter size={12} /> Show Filters
      </button>
    </div>
  );
}
