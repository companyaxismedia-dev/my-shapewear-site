"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Search,
  MoreVertical,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { AdminLayout } from "@/components/admin/AdminLayout";

import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal";
// import EditProductModal from "@/components/admin/modals/EditProductModal";
import ExportProductsModal from "@/components/admin/modals/ExportProductsModal";
import { useCategories } from "@/context/CategoryContext";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProductListPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { categories, loadingCats } = useCategories();
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  console.log(categories);

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (deleteTarget) {
        // SINGLE DELETE
        await fetch(`${API_BASE}/api/admin/products/${deleteTarget}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // BULK DELETE
        await fetch(`${API_BASE}/api/admin/products/delete-many`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedIds }),
        });
      }

      toast.success("Deleted successfully");

      setDeleteOpen(false);
      setDeleteTarget(null);
      setSelectedIds([]);

      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= UI ================= */
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-5">All Categories</h1>

      {/* TOP NAV */}
      <div className="admin-card p-4 mb-4 flex justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/admin/products/add")}
            className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
          >
            <Plus size={15} /> Add Category
          </button>

          <button
            onClick={() => {
              if (!selectedIds.length) {
                toast.error("Select products first");
                return;
              }
              setDeleteTarget(null);
              setDeleteOpen(true);
            }}
            className="btn-destructive px-4 py-2 flex items-center gap-2 text-sm"
          >
            <Trash2 size={15} /> Delete Category
          </button>

          <button
            onClick={() => setExportOpen(true)}
            className="btn-muted px-4 py-2 text-sm"
          >
            Export Categories
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-4 h-4" />
            <input
              className="pl-8 pr-3 py-2 border rounded-lg"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="admin-card overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[50px]" />
            <col className="w-[50px]" />
            <col className="w-[120px]" />
            <col className="w-[320px]" />
            <col className="w-[120px]" />
            <col className="w-[150px]" />
            {/* <col className="w-[150px]" /> */}
            <col className="w-[220px]" />
          </colgroup>

          <thead className="border-b bg-muted/40">
            <tr>
              <th className="p-3"></th>
              <th className="p-3 text-left">S No.</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-left">Created At</th>

              {/* CATEGORY FILTER HERE */}
              {/* <th className="p-3 text-left relative">
                                <button
                                    onClick={() => setCatOpen(!catOpen)}
                                    className="flex items-center gap-1 font-semibold"
                                >
                                    Category <ChevronDown size={14} />
                                </button>

                                {catOpen && (
                                    <div className="absolute top-full mt-2 bg-white border rounded-lg shadow p-2 z-50 w-40">
                                        {categories.map((c) => (
                                            <label key={c} className="flex gap-2 text-sm p-1">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(c)}
                                                    onChange={() => toggleCategory(c)}
                                                />
                                                {c}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </th> */}

              <th className="p-3 ps-10 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories?.map((p, ind) => (
              <tr key={p._id} className="border-b">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds((prev) => [...prev, p._id]);
                      } else {
                        setSelectedIds((prev) =>
                          prev.filter((id) => id !== p._id),
                        );
                      }
                    }}
                  />
                </td>

                <td className="p-3">{ind + 1}</td>
                <td className="p-3 flex items-center gap-3">
                  <Image
                    src={`${API_BASE}/${p.image}`}
                    width={12}
                    height={12}
                    className="w-12 h-12 rounded border object-cover"
                    alt={p.name}
                  />
                  {p.name}
                </td>

                <td className="p-3">{p.description || "N/A"}</td>
                <td className={`p-3 ${p.isActive ? "text-green-600" : "text-red-600"} font-semibold`}>{p.isActive ? "Yes" : "No"}</td>
                <td className="p-3">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                {/* <td className="p-3 capitalize">{p.category}</td> */}

                <td className="p-3">
                  <div className="flex gap-2">
                    {/* <button className="btn-muted p-2">
                                            <MoreVertical size={14} />
                                        </button> */}

                    {/* <button
                                            onClick={() => {
                                                setEditProduct(p);
                                                setEditOpen(true);
                                            }}
                                            className="btn-muted px-3 flex gap-1"
                                        >
                                            <Pencil size={14} /> Edit
                                        </button> */}
                    <button
                      onClick={() => {
                        router.push(`/admin/products/edit/${p._id}`);
                      }}
                      className="btn-muted px-3 flex gap-1"
                    >
                      <Pencil size={14} /> Edit
                    </button>

                    <button
                      onClick={() => {
                        setSelectedIds([]);
                        setDeleteTarget(p._id);
                        setDeleteOpen(true);
                      }}
                      className="btn-destructive px-3"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {/* <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 rounded ${
              page === i + 1 ? "bg-primary text-white" : "bg-muted"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div> */}

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />

      <ExportProductsModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </AdminLayout>
  );
}
