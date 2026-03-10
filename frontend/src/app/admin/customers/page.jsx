"use client"

import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Download, Trash2, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import DeleteConfirmModal from "@/components/admin/modals/DeleteConfirmModal";
import { API_BASE } from "@/lib/api";
import ExportModal from "@/components/admin/modals/ExportModal";

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [rows, setRows] = useState(10);
    const [pages, setPages] = useState(1);
    const [selectedIds, setSelectedIds] = useState([]);
    const [menuOpenFor, setMenuOpenFor] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [exportOpen, setExportOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".action-menu")) {
                setMenuOpenFor(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("adminToken");
            const params = new URLSearchParams({ page, limit: rows, search });
            const res = await fetch(`${API_BASE}/api/admin/customers?${params}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Failed");
            setCustomers(data.users || []);
            setPages(data.pages || 1);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed loading customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCustomers(); }, [page, rows, search]);

    const confirmDelete = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const id = deleteTarget;
            const res = await fetch(`${API_BASE}/api/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || "Delete failed");
            toast.success("Customer deleted");
            setDeleteOpen(false);
            setDeleteTarget(null);
            await fetchCustomers();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to delete");
        }
    };

    const generateProductsCSV = (list) => {
        const headers = [
            "Name",
            "Email",
            "Phone",
            "Orders",
            "TotalSpent",
            "Status",
            "CreatedAt",
            "LastActivity",
        ];

        const rows = list.map((c) => [
            c.name || "",
            c.email || "",
            c.phone || "",
            c.orders ?? 0,
            c.totalSpent ?? 0,
            c.status || "",
            c.createdAt || "",
            c.lastActivity || "",
        ]);

        return [headers, ...rows]
            .map((r) =>
                r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
            )
            .join("\n");
    }

    return (
        <>
            <AdminBreadcrumbs
                items={[
                    { label: "Home", href: "/admin" },
                    { label: "All Customers", href: "/admin/customers" },
                ]}
                mode={null}
            />

            <h1 className="text-2xl font-bold mb-4">Customers</h1>

            {/* Toolbar */}

            <div className="admin-card p-4 mb-4 flex justify-between flex-wrap gap-3">

                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/admin/customers/new')}
                        className="btn-primary px-4 py-2 flex items-center gap-2 text-sm"
                    >
                        <Plus size={14} /> New Customers
                    </button>

                    <button className="btn-muted px-4 py-2 text-sm whitespace-nowrap">
                        Filter
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
                        className="btn-destructive px-4 py-2 flex items-center gap-2 text-sm whitespace-nowrap"
                    >
                        <Trash2 size={15} /> Delete Product
                    </button>
                    <button
                        className="btn-muted px-4 py-2 text-sm whitespace-nowrap flex items-center gap-2"
                        onClick={() => setExportOpen(true)}
                    >
                        <UploadIcon size={14} /> Export
                    </button>

                </div>

                <div className="flex gap-2 items-center">
                    <select
                        className="px-3 py-2 border rounded-lg"
                        value={rows}
                        onChange={(e) => setRows(Number(e.target.value))}
                    >
                        <option value={10}>Show 10</option>
                        <option value={20}>Show 20</option>
                        <option value={50}>Show 50</option>
                    </select>

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

            {/* Table */}
            <div className="admin-card w-full overflow-x-auto">

                <table className="w-full min-w-[1100px] text-sm">

                    <colgroup>
                        <col className="w-[50px]" />
                        <col className="w-[260px]" />
                        <col className="w-[140px]" />
                        <col className="w-[220px]" />
                        <col className="w-[80px]" />
                        <col className="w-[120px]" />
                        <col className="w-[200px]" />
                        <col className="w-[160px]" />
                    </colgroup>

                    <thead className="border-b bg-muted/40">
                        <tr>
                            <th className="p-3"></th>
                            <th className="p-3 text-left">Customer</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Orders</th>
                            <th className="p-3 text-left">Total Spent</th>
                            <th className="p-3 text-left">Status / Last activity</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {customers.map((c) => (
                            <tr key={c._id} className="border-b">

                                <td className="p-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(c._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedIds((s) => [...s, c._id]);
                                            else setSelectedIds((s) => s.filter(id => id !== c._id));
                                        }}
                                    />
                                </td>

                                {/* Customer */}
                                <td className="p-3">
                                    <div className="flex items-center gap-3 min-w-0">

                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs shrink-0">
                                            {(c.name || '').slice(0, 1)}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="font-medium truncate">{c.name}</div>
                                            <div className="text-xs text-gray-500 truncate">
                                                Joined {new Date(c.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                    </div>
                                </td>

                                <td className="p-3 whitespace-nowrap">{c.phone || '-'}</td>

                                <td className="p-3">
                                    <div className="max-w-[220px] truncate">
                                        {c.email || '-'}
                                    </div>
                                </td>

                                <td className="p-3 whitespace-nowrap">{c.orders ?? 0}</td>

                                <td className="p-3 whitespace-nowrap">
                                    ₹{(c.totalSpent || 0).toFixed(2)}
                                </td>

                                <td className="p-3">
                                    <div className="flex items-center gap-3 flex-wrap">

                                        <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${c.status === 'deleted'
                                            ? 'bg-gray-200 text-gray-700'
                                            : c.status === 'suspended'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : c.status === 'inactive'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                            {c.status === 'deleted'
                                                ? 'Inactive'
                                                : ((c.status || 'active').charAt(0).toUpperCase() +
                                                    (c.status || 'active').slice(1))}
                                        </span>

                                        <div className="text-xs text-gray-500 whitespace-nowrap">
                                            {c.lastActivity
                                                ? new Date(c.lastActivity).toLocaleString()
                                                : 'No recent activity'}
                                        </div>

                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="p-3 text-right">

                                    <div className="flex items-center gap-2 whitespace-nowrap">

                                        <button className="btn-muted px-3 py-1 text-xs whitespace-nowrap">
                                            Invoice
                                        </button>

                                        <button className="btn-muted px-3 py-1 text-xs whitespace-nowrap">
                                            Ledger
                                        </button>

                                        <div className="relative action-menu">
                                            <button
                                                className="btn-muted p-2"
                                                onClick={() =>
                                                    setMenuOpenFor(menuOpenFor === c._id ? null : c._id)
                                                }
                                            >
                                                <MoreVertical size={14} />
                                            </button>

                                            {menuOpenFor === c._id && (
                                                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-600 rounded-md shadow-lg ring-1 ring-black/5 z-50 overflow-hidden">
                                                    <button
                                                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                        onClick={() => {
                                                            router.push(`/admin/customers/${c._id}`);
                                                            setMenuOpenFor(null);
                                                        }}
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                        onClick={() => {
                                                            router.push(`/admin/customers/edit/${c._id}`);
                                                            setMenuOpenFor(null);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                        onClick={() => {
                                                            setDeleteTarget(c._id);
                                                            setDeleteOpen(true);
                                                            setMenuOpenFor(null);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            )}

                                        </div>

                                    </div>

                                </td>

                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
                {Array.from({ length: pages }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-3 py-1 rounded text-sm ${page === i + 1 ? "bg-primary text-black" : "bg-muted"
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            <DeleteConfirmModal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
            />
            <ExportModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                entityName="customers"
                selectedIds={selectedIds}
                fetchSelected={async (ids) => {
                    return customers.filter((c) => ids.includes(c._id));
                }}
                fetchAll={async () => {
                    return customers;
                }}
                generateCSV={generateProductsCSV}
            />
        </>
    );
}