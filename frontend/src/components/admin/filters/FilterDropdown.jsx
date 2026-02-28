"use client";

import { useState } from "react";

export default function FilterDropdown({
  title,
  options,
  selected,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((x) => x !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-muted px-3 py-2"
      >
        {title}
      </button>

      {open && (
        <div className="absolute top-full mt-2 bg-white border rounded-lg shadow p-2 z-50 w-48">
          {options.map((o) => (
            <label key={o} className="flex gap-2 p-1 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(o)}
                onChange={() => toggle(o)}
              />
              {o}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}