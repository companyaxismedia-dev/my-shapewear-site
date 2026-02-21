"use client";

export default function ColorTooltip({ color, image }) {
  if (!color) return null;

  return (
    <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 shadow-lg rounded-md p-2 w-28">
      <img
        src={image}
        alt={color}
        className="w-full h-16 object-cover rounded"
      />
      <p className="text-xs text-center mt-1 font-medium text-gray-700">
        {color}
      </p>
    </div>
  );
}
