"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {Plus,Trash2,Search,MoreVertical,Pencil,Check,} from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function DraftProductsPage() {
    const router = useRouter();

    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [rows, setRows] = useState(10);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [publishingId, setPublishingId] = useState(null);

    /* ================= FETCH DRAFTS ================= */
    const fetchDrafts = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("adminToken");

            const params = new URLSearchParams({
                page,
                limit: rows,
                keyword: search,
            });

            const res = await fetch(
                `${API_BASE}/api/admin/products/drafts?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await res.json();

            if (!data.success) throw new Error();

            setDrafts(data.drafts || []);
            setPages(data.pages || 1);
        } catch {
            toast.error("Failed loading drafts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, [page, rows, search]);

    /* ================= PUBLISH DRAFT ================= */
    const publishDraft = async (id) => {
        try {
            setPublishingId(id);
            const token = localStorage.getItem("adminToken");

            const response = await fetch(
                `${API_BASE}/api/admin/products/${id}/publish`,
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to publish");
            }

            toast.success("Product published successfully!");
            await fetchDrafts();
        } catch (error) {
            toast.error(error.message || "Failed to publish product");
        } finally {
            setPublishingId(null);
        }
    };

    /* ================= DELETE DRAFT ================= */
    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            let response;

            if (deleteTarget) {
                // SINGLE DELETE
                response = await fetch(
                    `${API_BASE}/api/admin/products/drafts/${deleteTarget}`,
                    {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            } else {
                // BULK DELETE
                response = await fetch(
                    `${API_BASE}/api/admin/products/drafts/delete-many`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ ids: selectedIds }),
                    }
                );
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Delete failed");
            }

            const successMessage = deleteTarget
                ? "Draft deleted successfully!"
                : `${data.deletedCount || selectedIds.length} draft${data.deletedCount > 1 || selectedIds.length > 1 ? "s" : ""
                } deleted successfully!`;

            toast.success(successMessage);

            setDeleteOpen(false);
            setDeleteTarget(null);
            setSelectedIds([]);

            await fetchDrafts();
        } catch (error) {
            toast.error(error.message || "Failed to delete draft");
        }
    };

    /* ================= UI ================= */
    return (
        <>
            {/* <div className="w-full min-h-screen bg-background p-3 md:p-5 overflow-x-hidden"> */}
                        <AdminBreadcrumbs
                            items={[
                                { label: "Home", href: "/admin" },
                                { label: "MyShop", href: "" },
                                { label: "Draft Products", href: "/admin/products/drafts" },
                            ]}
                            mode={null}
                        />
            
            <h1 className="text-2xl font-bold mb-5">Draft Products</h1>

            {/* TOP NAV */}
            <div className="admin-card p-4 mb-4 flex justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push("/admin/products/add")}
                        className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
                    >
                        <Plus size={15} /> New Draft
                    </button>

                    {/* {selectedIds.length > 0 && (
                        <button
                            onClick={() => {
                                setDeleteTarget(null);
                                setDeleteOpen(true);
                            }}
                            className="btn-destructive px-4 py-2 flex items-center gap-2 text-sm whitespace-nowrap"
                        >
                            <Trash2 size={15} /> Delete 
                            ({selectedIds.length})
                        </button>
                    )} */}
                    
                    <button
                        onClick={() => {
                            if (!selectedIds.length) {
                                toast.error("Select products first");
                                return;
                            }
                            setDeleteTarget(null);
                            setDeleteOpen(true);
                        }}
                        className="btn-destructive px-4 py-2 flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                        <Trash2 size={15} /> Delete Product
                    </button>

                </div>

                <div className="flex gap-2 items-center ">
                    <select
                        className="px-3 py-2 border rounded-lg text-sm"
                        value={rows}
                        onChange={(e) => setRows(Number(e.target.value))}
                    >
                        <option value={10}>Show 10</option>
                        <option value={20}>Show 20</option>
                        <option value={50}>Show 50</option>
                    </select>

                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2 top-2.5 w-4 h-4" />
                        <input
                            className="w-full sm:w-auto pl-8 pr-3 py-2 border rounded-lg text-sm"
                            placeholder="Search drafts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* TABLE - RESPONSIVE WRAPPER */}
            <div className="admin-card overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Loading drafts...
                    </div>
                ) : drafts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No draft products yet
                    </div>
                ) : (
                    <table className="w-full text-xs md:text-sm min-w-max">
                        <colgroup>
                            <col style={{ minWidth: "40px" }} />
                            <col style={{ minWidth: "280px" }} />
                            <col style={{ minWidth: "100px" }} />
                            <col style={{ minWidth: "80px" }} />
                            <col style={{ minWidth: "100px" }} />
                            <col style={{ minWidth: "110px" }} />
                            <col style={{ minWidth: "100px" }} />
                            <col style={{ minWidth: "150px" }} />
                        </colgroup>

                        <thead className="border-b bg-muted/40 sticky top-0">
                            <tr>
                                <th className="p-2 md:p-3 text-left"></th>
                                <th className="p-2 md:p-3 text-left font-semibold">Product</th>
                                <th className="p-2 md:p-3 text-left font-semibold">Price</th>
                                <th className="p-2 md:p-3 text-left font-semibold">Stock</th>
                                <th className="p-2 md:p-3 text-left font-semibold">Category</th>
                                <th className="p-2 md:p-3 text-left font-semibold">Drafted At</th>
                                <th className="p-2 md:p-3 text-left font-semibold">Drafted By</th>
                                <th className="p-2 md:p-3 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {drafts.map((p) => (
                                <tr key={p._id} className="border-b hover:bg-muted/30 transition-colors">
                                    <td className="p-2 md:p-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(p._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedIds((prev) => [...prev, p._id]);
                                                } else {
                                                    setSelectedIds((prev) =>
                                                        prev.filter((id) => id !== p._id)
                                                    );
                                                }
                                            }}
                                            className="cursor-pointer"
                                        />
                                    </td>

                                    <td className="p-2 md:p-3 flex items-center gap-2 md:gap-3">
                                        {p.thumbnail && (
                                            <img
                                                src={p.thumbnail.startsWith("http") ? p.thumbnail : `${API_BASE}${p.thumbnail}`}
                                                className="w-10 h-10 md:w-12 md:h-12 rounded border object-cover flex-shrink-0"
                                                alt={p.name}
                                            />
                                        )}
                                        <span className="truncate text-xs md:text-sm">{p.name}</span>
                                    </td>

                                    <td className="p-2 md:p-3 text-xs md:text-sm">₹{p.minPrice || "—"}</td>
                                    <td className="p-2 md:p-3 text-xs md:text-sm text-center">{p.totalStock || 0}</td>
                                    <td className="p-2 md:p-3 capitalize text-xs md:text-sm">{p.category}</td>
                                    <td className="p-2 md:p-3 text-xs">
                                        {new Date(p.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-2 md:p-3 text-xs">
                                        {p.createdBy?.name || p.createdBy?.email || "Unknown"}
                                    </td>

                                    <td className="p-2 md:p-3">
                                        <div className="flex gap-1 md:gap-2 flex-wrap">
                                            <button
                                                onClick={() => publishDraft(p._id)}
                                                disabled={publishingId === p._id}
                                                className="px-2 md:px-3 py-1 flex gap-1 text-xs items-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
                                            >
                                                <Check size={12} className="hidden md:inline" /> Publish
                                            </button>

                                            <button
                                                onClick={() => {
                                                    router.push(`/admin/products/edit/${p._id}`);
                                                }}
                                                className="btn-muted px-2 md:px-3 py-1 flex gap-1 text-xs items-center whitespace-nowrap"
                                            >
                                                <Pencil size={12} className="hidden md:inline" /> Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedIds([]);
                                                    setDeleteTarget(p._id);
                                                    setDeleteOpen(true);
                                                }}
                                                className="btn-destructive px-2 md:px-3 py-1 text-xs whitespace-nowrap"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* PAGINATION */}
            {pages > 1 && (
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                    {Array.from({ length: pages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-2 md:px-3 py-1 text-xs rounded transition-colors ${page === i + 1 ? "bg-primary text-black font-semibold" : "bg-muted hover:bg-muted/80"
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            <DeleteConfirmModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
            />
            {/* </div> */}
        </>
    );
}
