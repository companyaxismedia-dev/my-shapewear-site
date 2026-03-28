"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationComponent({
  currentPage = 1,
  totalPages = 1,
  limit = 25,
  onPageChange = () => {},
  onLimitChange = () => {},
  className = "",
}) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 3;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > maxVisible + 1) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - maxVisible) {
        pages.push("...");
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className={`flex flex-col gap-3 px-4 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${className}`}>
      {/* LEFT: ROWS PER PAGE */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">Rows per page</span>
        <select
          className="px-3 py-2 bg-white text-sm font-medium text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition hover:shadow-md cursor-pointer"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* CENTER: PAGINATION */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:flex-1">
        {/* PREVIOUS BUTTON */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-slate-700 font-medium text-sm hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
          title="Previous page"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* PAGE NUMBERS */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === "...") {
              return (
                <span key={`dots-${idx}`} className="px-2 py-2 text-slate-500 font-semibold text-sm">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                  ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-lg hover:shadow-xl"
                      : "text-slate-700 hover:shadow-md"
                  }
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* NEXT BUTTON */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-slate-700 font-medium text-sm hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
          title="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* RIGHT: PAGE INFO */}
      <div className="text-sm font-medium text-slate-700 sm:text-right">
        <span className="text-slate-500">Page</span>{" "}
        <span className="font-bold text-blue-600">{currentPage}</span>{" "}
        <span className="text-slate-500">of</span> <span className="font-bold">{totalPages}</span>
      </div>
    </div>
  );
}
