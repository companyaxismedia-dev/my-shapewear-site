"use client";

import { Save, RotateCcw } from "lucide-react";
import { API_BASE } from "@/lib/api";

export default function InventoryGridViewModal({
  inventory,
  changes,
  onUpdateField,
  onSaveRow,
  onResetRow,
}) {
  return (
    <div className="grid grid-cols-6 gap-4 mb-6">
      {inventory.map((item) => {
        const rowChanges = changes[item._id] || {};
        const hasRowChanges = Object.keys(rowChanges).length > 0;

        return (
          <div
            key={item._id}
            className={`group bg-white border-2 rounded-lg overflow-hidden transition-all duration-300 ${
              hasRowChanges 
                ? "border-blue-500 bg-blue-50 shadow-lg -translate-y-2" 
                : "border-slate-200 hover:shadow-lg hover:-translate-y-2"
            }`}
          >
            {/* Product Image */}
            <div className="relative w-full h-40 bg-slate-100 overflow-hidden group">
              <img
                src={item.image?.startsWith("http") ? item.image : `${API_BASE}${item.image}`}
                alt={item.productName}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h4 className="font-semibold text-sm truncate mb-1">
                {item.productName}
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                {item.color || "N/A"} / {item.size || "N/A"}
              </p>

              {/* SKU */}
              <div className="mb-2">
                <label className="text-xs text-gray-600 block mb-1">SKU</label>
                <input
                  type="text"
                  value={rowChanges.sku !== undefined ? rowChanges.sku : (item.sku || "")}
                  onChange={(e) =>
                    onUpdateField(item._id, "sku", e.target.value)
                  }
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                  placeholder="SKU"
                />
              </div>

              {/* Price */}
              <div className="mb-2">
                <label className="text-xs text-gray-600 block mb-1">Price</label>
                <input
                  type="number"
                  value={rowChanges.price !== undefined ? rowChanges.price : (item.price || 0)}
                  onChange={(e) =>
                    onUpdateField(item._id, "price", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                />
              </div>

              {/* MRP */}
              <div className="mb-2">
                <label className="text-xs text-gray-600 block mb-1">MRP</label>
                <input
                  type="number"
                  value={rowChanges.mrp !== undefined ? rowChanges.mrp : (item.mrp || 0)}
                  onChange={(e) =>
                    onUpdateField(item._id, "mrp", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                />
              </div>

              {/* Stock */}
              <div className="mb-3">
                <label className="text-xs text-gray-600 block mb-1">Stock</label>
                <input
                  type="number"
                  value={rowChanges.stock !== undefined ? rowChanges.stock : (item.stock || 0)}
                  onChange={(e) =>
                    onUpdateField(item._id, "stock", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition"
                />
              </div>

              {/* Save & Reset Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => onSaveRow(item._id)}
                  disabled={!hasRowChanges}
                  className={`flex-1 px-2 py-1 text-xs whitespace-nowrap flex items-center justify-center gap-1 rounded transition ${
                    hasRowChanges
                      ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md cursor-pointer"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Save size={12} /> Save
                </button>
                {hasRowChanges && (
                  <button
                    onClick={() => onResetRow(item._id)}
                    className="flex-1 px-2 py-1 text-xs whitespace-nowrap flex items-center justify-center gap-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md cursor-pointer transition"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
