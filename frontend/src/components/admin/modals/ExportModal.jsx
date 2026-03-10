"use client";

import { useState } from "react";

export default function ExportModal({
  open,
  onClose,
  entityName = "items",
  selectedIds = [],
  fetchAll,
  fetchSelected,
  generateCSV,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);

    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      setError("");

      let list = [];

      if (type === "selected") {
        if (!selectedIds.length) {
          setError(`No ${entityName} selected`);
          setLoading(false);
          return;
        }

        list = await fetchSelected(selectedIds);
      } else {
        list = await fetchAll();
      }

      if (!list?.length) {
        setError("No data to export");
        setLoading(false);
        return;
      }

      const csv = generateCSV(list);

      downloadCSV(
        csv,
        `${entityName}-${type === "selected" ? "selected" : "all"}-${Date.now()}.csv`
      );

      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-lg shadow-lg p-6 w-[420px] z-10">

        <h3 className="text-lg font-semibold">
          Export {entityName}
        </h3>

        <p className="text-sm text-gray-600 mt-2">
          Choose export option below. "Export All" exports current page results.
        </p>

        {error && (
          <div className="text-sm text-red-600 mt-3">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4">

          <button
            onClick={() => handleExport("selected")}
            className="btn-primary px-4 py-2"
            disabled={loading}
          >
            {loading ? "Exporting..." : "Export Selected"}
          </button>

          <button
            onClick={() => handleExport("all")}
            className="btn-muted px-4 py-2"
            disabled={loading}
          >
            Export All
          </button>

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded text-sm"
          >
            Cancel
          </button>

        </div>

      </div>
    </div>
  );
}