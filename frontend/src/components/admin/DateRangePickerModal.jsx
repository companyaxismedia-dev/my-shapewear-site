"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function DateRangePickerModal({ open, onClose, onApply, initialRange = { start: null, end: null } }) {
  const [start, setStart] = useState(initialRange.start || "");
  const [end, setEnd] = useState(initialRange.end || "");

  useEffect(() => {
    setStart(initialRange.start || "");
    setEnd(initialRange.end || "");
  }, [initialRange, open]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter') {
        onApply({ start: start || null, end: end || null });
      }
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, start, end, onApply]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-[420px] z-10" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Date Range</h3>
          <button onClick={onClose} className="text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label className="text-xs text-gray-700">Start date</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200" />
          <label className="text-xs text-gray-700">End date</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full px-3 py-2 rounded-md border border-slate-200" />

          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="text-xs text-gray-600">Select a start and end date to filter the page</div>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={onClose} className="px-3 py-2 rounded-md bg-gray-100 text-sm cursor-pointer">Cancel</button>
              <button
                type="button"
                onClick={() => {
                  onApply({ start: start || null, end: end || null });
                }}
                className="px-4 py-2 rounded-md bg-accent-brand text-black text-sm cursor-pointer"
                aria-label="Apply selected date range"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
