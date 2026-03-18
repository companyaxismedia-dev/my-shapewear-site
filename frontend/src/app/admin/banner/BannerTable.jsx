"use client";

import { Check, X, Pencil, Trash2 } from "lucide-react";

export default function BannerTable({ banners, selectedIds, onSelect, onSelectAll, onDeselectAll, onEdit, onDelete, onToggle }) {
  return (
    <div className="admin-card">
      <table className="w-full min-w-0 text-sm">
        {/* No fixed colgroup, let table be flexible */}
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="p-3 text-center">
              <input
                type="checkbox"
                checked={selectedIds.length === banners.length && banners.length > 0}
                onChange={selectedIds.length === banners.length ? onDeselectAll : onSelectAll}
              />
            </th>
            <th className="p-3 text-center">Section</th>
            <th className="p-3 text-center">Desktop Image</th>
            <th className="p-3 text-center">Mobile Image</th>
            <th className="p-3 text-center">Link</th>
            <th className="p-3 text-center">Active</th>
            <th className="p-3 text-center">Created At</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr key={banner._id} className="border-b">
              <td className="p-3 text-center align-middle">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(banner._id)}
                  onChange={() => onSelect(banner._id)}
                />
              </td>
              <td className="p-3 text-center align-middle">{banner.sectionTitle || banner.sectionId}</td>
              <td className="p-3 text-center align-middle">
                <img
                  src={banner.desktopUrl}
                  alt={banner.altText}
                  className="mx-auto w-32 max-h-14 object-contain rounded border"
                />
              </td>
              <td className="p-3 text-center align-middle">
                <img
                  src={banner.mobileUrl}
                  alt={banner.altText}
                  className="mx-auto w-20 max-h-14 object-contain rounded border"
                />
              </td>
              <td className="p-3 text-center align-middle break-words max-w-[200px]">
                <a href={banner.link || "#"} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  {banner.link || "-"}
                </a>
              </td>
              <td className="p-3 text-center align-middle">
                <button onClick={() => onToggle(banner._id)} className="btn-muted px-2">
                  {banner.active ? <Check className="text-green-600" /> : <X className="text-gray-400" />}
                </button>
              </td>
              <td className="p-3 text-center align-middle">{new Date(banner.createdAt).toLocaleDateString()}</td>
              <td className=" text-center align-middle">
                <div className="flex justify-center gap-2">
                  <button onClick={() => onEdit(banner)} className="btn-muted px-3 flex gap-1">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => onDelete(banner._id)}
                          className="btn-destructive px-4 py-2 flex items-center gap-2 text-sm whitespace-nowrap">
                   <Trash2 size={14} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
