"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useOrders } from "@/components/admin/hooks/useOrders";
import OrderModal from "@/components/admin/modals/OrderModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModalButton from "@/components/admin/modals/ConfirmModalButton";
import { Search } from "lucide-react";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

export default function OrdersPage() {

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filterTab, setFilterTab] = useState("All");

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);

    const statuses = ["Order Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    const [selectedStatuses, setSelectedStatuses] = useState([]);

    // compute backend status param: if Unfulfilled tab and user selected statuses, pass comma list; otherwise use defaults
    let statusParam = '';
    if (filterTab === 'All') statusParam = '';
    else if (filterTab === 'Fulfilled') statusParam = 'Delivered';
    else if (filterTab === 'Unfulfilled') {
        if (selectedStatuses.length) statusParam = selectedStatuses.join(',');
        else statusParam = 'Unfulfilled';
    }

    const { orders, analytics, loading, total, pages, refetch } = useOrders(startDate, endDate, page, limit, search, statusParam);

    const [selected, setSelected] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    useEffect(() => {
        if (selectAll) {
            const all = new Set((orders || []).map((o) => o.orderId));
            setSelected(all);
        } else {
            setSelected(new Set());
        }
    }, [selectAll, orders]);

    useEffect(() => {
        if (searchOpen && searchRef.current) searchRef.current.focus();
    }, [searchOpen]);

    useEffect(() => {
        // reset selection when orders change
        setSelectAll(false);
        setSelected(new Set());
    }, [orders]);

    const [showModal, setShowModal] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);
    const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

    const toggleRow = (orderId) => {
        const s = new Set(selected);
        if (s.has(orderId)) s.delete(orderId);
        else s.add(orderId);
        setSelected(s);
        setSelectAll(s.size === (orders || []).length && s.size > 0);
    };

    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        if (filterTab === "All") return orders;
        if (filterTab === "Unfulfilled") return orders.filter(o => o.status !== "Delivered");
        if (filterTab === "Fulfilled") return orders.filter(o => o.status === "Delivered");
        return orders;
    }, [orders, filterTab]);

    const quickRange = (range) => {
        const end = new Date();
        let start = new Date();
        if (range === "7d") start.setDate(end.getDate() - 6);
        if (range === "30d") start.setDate(end.getDate() - 29);
        if (range === "thisMonth") start = new Date(end.getFullYear(), end.getMonth(), 1);
        setStartDate(start.toISOString().slice(0, 10));
        setEndDate(end.toISOString().slice(0, 10));
    };

    const toggleStatus = (s) => {
        setPage(1);
        setSelectedStatuses(prev => {
            if (prev.includes(s)) return prev.filter(x => x !== s);
            return [...prev, s];
        });
    };

    // analytics helpers
    const formatDateKey = (d) => new Date(d).toISOString().slice(0, 10);

    const getValuesForLast14Days = (dataArr, valueKey) => {
        const map = {};
        (dataArr || []).forEach(x => { map[String(x._id)] = Number(x[valueKey] || 0); });
        const vals = [];
        for (let i = 13; i >= 0; i--) {
            const day = new Date();
            day.setDate(day.getDate() - i);
            const key = formatDateKey(day);
            vals.push(map[key] || 0);
        }
        return vals;
    };

    const computeChange = (arr14) => {
        const prev = arr14.slice(0, 7).reduce((s, n) => s + n, 0);
        const curr = arr14.slice(7).reduce((s, n) => s + n, 0);
        const percent = prev === 0 ? (curr === 0 ? 0 : 100) : Math.round(((curr - prev) / prev) * 100);
        return { prev, curr, percent };
    };

    const renderSparkline = (arr, color = '#06b6d4') => {
        const values = arr || [];
        if (!values.length) return null;

        const w = 120, h = 36, pad = 6;
        const max = Math.max(...values, 1);
        const min = Math.min(...values);

        const points = values.map((v, i) => {
            const x = pad + (i * (w - 2 * pad) / (values.length - 1 || 1));
            const y = pad + (1 - (v - min) / (max - min || 1)) * (h - 2 * pad);
            return { x, y };
        });

        const pointsAttr = points.map((p) => `${p.x},${p.y}`).join(' ');
        const areaPoints = `${pointsAttr} ${w - pad},${h - pad} ${pad},${h - pad}`;
        const gid = `spark-${Math.floor(Math.random() * 1000000)}`;

        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block ml-2 align-middle">
                <defs>
                    <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                <polygon points={areaPoints} fill={`url(#${gid})`} />

                <polyline
                    points={pointsAttr}
                    stroke={color}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="200"
                    strokeDashoffset="200"
                >
                    <animate attributeName="stroke-dashoffset" from="200" to="0" dur="700ms" fill="freeze" />
                </polyline>

                {points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={2.4} fill="#fff" stroke={color} strokeWidth="1">
                        <animate attributeName="r" values="0;2.4;0" dur={`${700 + i * 20}ms`} begin="0s" fill="freeze" />
                    </circle>
                ))}
            </svg>
        );
    };

    const router = useRouter();

    const openOrder = (order) => {
        // navigate to admin order detail page
        try {
            const id = order.orderId;
            router.push(`/admin/orders/${id}`);
        } catch (err) {
            console.error("navigation error", err);
        }
    };

    const exportSelected = () => {
        if (!selected || selected.size === 0) {
            toast.error('Select orders to export');
            return;
        }
        setExportConfirmOpen(true);
    };

    const performExport = async () => {
        try {
            const ids = Array.from(selected);
            const data = await (await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/admin/orders/details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                body: JSON.stringify({ ids }),
            })).json();
            if (!data.success) throw new Error(data.message || 'Export failed');

            const rows = data.orders || [];
            if (!rows.length) {
                toast.error('No order data returned');
                return;
            }

            const header = ['Order', 'Date', 'Customer', 'Phone', 'Email', 'Address', 'Payment', 'Total', 'Items', 'Status'];
            const csv = [header.join(',')].concat(rows.map(r => [
                `#${r._id}`,
                new Date(r.createdAt).toLocaleString(),
                `"${(r.userInfo?.name || '').replace(/"/g, '""')}"`,
                r.userInfo?.phone || '',
                r.userInfo?.email || '',
                `"${(r.userInfo?.address || '').replace(/"/g, '""')}"`,
                r.paymentStatus || '',
                r.finalAmount ?? 0,
                (r.products || []).length,
                r.status || ''
            ].join(','))).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders_export.csv`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('Exported successfully');
            setExportConfirmOpen(false);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Export failed');
            setExportConfirmOpen(false);
        }
    };

    const performBulkFulfill = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const ids = Array.from(selected);
            if (!ids.length) {
                toast.error('No orders selected');
                setBulkConfirmOpen(false);
                return;
            }

            await Promise.all(ids.map(id => fetch(process.env.NEXT_PUBLIC_API_URL + `/api/admin/orders/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ orderId: id, status: 'Delivered' }),
            })));

            toast.success('Orders marked as Delivered');
            setBulkConfirmOpen(false);
            refetch();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update orders');
            setBulkConfirmOpen(false);
        }
    };

    return (
        <>
            <AdminBreadcrumbs
                items={[
                    { label: "Home", href: "/admin" },
                    { label: "MyShop", href: "" },
                    { label: "AllProducts", href: "/admin/products" },
                ]}
                mode={null}
            />
            <h1 className="text-2xl font-bold mb-5">Orders</h1>
            <div className="admin-card p-4 mb-4 flex justify-between flex-wrap gap-3">
                <div>

                    <div className="mt-2 text-sm text-gray-500">
                        <span className="font-bold text-gray-900">Viewing: </span>
                        {startDate && endDate ? `${startDate} → ${endDate}` : "All dates"}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="btn-muted">More actions</button>
                    <button className="btn-primary">Create order</button>
                </div>
            </div>

            <div className="admin-card p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-2">
                        <button onClick={() => quickRange('7d')} className="btn-muted">Last 7 days</button>
                        <button onClick={() => quickRange('30d')} className="btn-muted">Last 30 days</button>
                        <button onClick={() => quickRange('thisMonth')} className="btn-muted">This month</button>
                        <button onClick={() => { setStartDate(''); setEndDate('') }} className="btn-muted">All</button>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {/* Total Orders (uses orderItems as proxy for per-day counts when available) */}
                    <div className="p-4">
                        <p className="text-sm text-gray-500">Total Orders</p>
                        <h2 className="text-2xl font-bold">{loading ? '...' : analytics?.totalOrders || 0}</h2>
                        {analytics && (
                            (() => {
                                const arr14 = getValuesForLast14Days(analytics.orderItems, 'items');
                                const change = computeChange(arr14);
                                return (
                                    <div className="flex items-center gap-2 text-sm text-muted mt-2">
                                        <span className={change.percent >= 0 ? 'text-green-600' : 'text-red-600'}>{change.percent >= 0 ? `▲ ${Math.abs(change.percent)}%` : `▼ ${Math.abs(change.percent)}%`}</span>
                                        <span className="text-gray-400">last week</span>
                                        {renderSparkline(arr14.slice(7), '#f59e0b')}
                                    </div>
                                );
                            })()
                        )}
                    </div>

                    {/* Order items over time */}
                    <div className="p-4">
                        <p className="text-sm text-gray-500">Order items over time</p>
                        <h2 className="text-2xl font-bold">{loading ? '...' : (analytics?.orderItems?.reduce((s, i) => s + (i.items || 0), 0) || 0)}</h2>
                        {analytics && (
                            (() => {
                                const arr14 = getValuesForLast14Days(analytics.orderItems, 'items');
                                const change = computeChange(arr14);
                                return (
                                    <div className="flex items-center gap-2 text-sm text-muted mt-2">
                                        <span className={change.percent >= 0 ? 'text-green-600' : 'text-red-600'}>{change.percent >= 0 ? `▲ ${Math.abs(change.percent)}%` : `▼ ${Math.abs(change.percent)}%`}</span>
                                        <span className="text-gray-400">last week</span>
                                        {renderSparkline(arr14.slice(7), '#06b6d4')}
                                    </div>
                                );
                            })()
                        )}
                    </div>

                    {/* Returns */}
                    <div className="p-4">
                        <p className="text-sm text-gray-500">Returns Orders</p>
                        <h2 className="text-2xl font-bold">{loading ? '...' : analytics?.returnOrders || 0}</h2>
                        <div className="flex items-center gap-2 text-sm text-muted mt-2">
                            <span className="text-gray-400">last week</span>
                        </div>
                    </div>

                    {/* Fulfilled orders */}
                    <div className="p-4">
                        <p className="text-sm text-gray-500">Fulfilled orders over time</p>
                        <h2 className="text-2xl font-bold">{loading ? '...' : (analytics?.fulfilledOrders?.reduce((s, i) => s + (i.count || 0), 0) || 0)}</h2>
                        {analytics && (
                            (() => {
                                const arr14 = getValuesForLast14Days(analytics.fulfilledOrders, 'count');
                                const change = computeChange(arr14);
                                return (
                                    <div className="flex items-center gap-2 text-sm text-muted mt-2">
                                        <span className={change.percent >= 0 ? 'text-green-600' : 'text-red-600'}>{change.percent >= 0 ? `▲ ${Math.abs(change.percent)}%` : `▼ ${Math.abs(change.percent)}%`}</span>
                                        <span className="text-gray-400">last week</span>
                                        {renderSparkline(arr14.slice(7), '#10b981')}
                                    </div>
                                );
                            })()
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs above table */}
            <div className="flex items-center gap-3">
                {['All', 'Unfulfilled', 'Fulfilled'].map(tab => (
                    <button key={tab} onClick={() => { setFilterTab(tab); setPage(1); }} className={`px-3 py-1 rounded ${filterTab === tab ? 'bg-muted text-black font-semibold' : 'bg-white text-gray-700'}`}>
                        {tab}
                    </button>
                ))}

                {/* Status filter panel when Unfulfilled tab is active */}
                {filterTab === 'Unfulfilled' && (
                    <div className="ml-4 flex items-center gap-2">
                        {statuses.map(s => (
                            <label key={s} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={selectedStatuses.includes(s)} onChange={() => toggleStatus(s)} />
                                <span className="capitalize">{s}</span>
                            </label>
                        ))}
                    </div>
                )}

                <div className="ml-auto flex items-center gap-2">
                    {!searchOpen ? (
                        <button onClick={() => setSearchOpen(true)} className="p-2 rounded bg-white/0">
                            <Search size={16} />
                        </button>
                    ) : (
                        <input ref={searchRef} placeholder="Search customer" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input" />
                    )}

                    <button onClick={exportSelected} className="btn-muted">Export selected</button>
                    <button onClick={() => setBulkConfirmOpen(true)} className="btn-primary">Mark Fulfilled</button>
                </div>
            </div>

            {/* Orders table wrapper */}
            <div className="admin-card overflow-x-auto mt-3">
                <table className="w-full text-sm">
                    <thead className="bg-muted/40">
                        <tr>
                            <th className="p-3 text-left">
                                <input type="checkbox" checked={selectAll} onChange={(e) => setSelectAll(e.target.checked)} />
                            </th>
                            <th className="p-3 text-left">Order</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Customer</th>
                            <th className="p-3 text-left">Payment</th>
                            <th className="p-3 text-left">Total</th>
                            <th className="p-3 text-left">Items</th>
                            <th className="p-3 text-left">Delivery</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" className="p-6 text-center">Loading orders...</td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan="9" className="p-6 text-center">No orders found</td></tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.orderId} className="transition-colors hover:bg-muted/10">
                                    <td className="p-3"><input type="checkbox" checked={selected.has(order.orderId)} onChange={() => toggleRow(order.orderId)} /></td>
                                    <td className="p-3">{order.id || `#${String(order.orderId).slice(-5)}`}</td>
                                    <td className="p-3">{new Date(order.date).toLocaleDateString()}</td>
                                    <td className="p-3">{order.customer || 'Guest'}</td>
                                    <td className="p-3">{order.payment || 'Pending'}</td>
                                    <td className="p-3">₹{order.total ?? 0}</td>
                                    <td className="p-3">{order.items ?? 0}</td>
                                    <td className="p-3">{order.status}</td>
                                    <td className="p-3"> <button onClick={() => openOrder(order)} className="mr-3 btn-muted">Open</button> <span>⋯</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-3">
                <div className="text-sm text-gray-600">Showing {orders?.length || 0} of {total} orders</div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 rounded bg-muted/10 hover:bg-muted/20">Prev</button>
                    <div>Page {page} / {pages}</div>
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} className="px-2 py-1 rounded bg-muted/10 hover:bg-muted/20">Next</button>
                    <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="rounded px-2 py-1">
                        {[10, 25, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                    </select>
                </div>
            </div>

            {showModal && <OrderModal order={activeOrder} onClose={() => setShowModal(false)} onUpdated={() => refetch()} />}

            <ConfirmModalButton
                open={exportConfirmOpen}
                onClose={() => setExportConfirmOpen(false)}
                onConfirm={performExport}
                title={"Export selected orders?"}
                btnName={"Export"}
            />
            <ConfirmModalButton
                open={bulkConfirmOpen}
                onClose={() => setBulkConfirmOpen(false)}
                onConfirm={performBulkFulfill}
                title={"Mark selected orders as Fulfilled?"}
                btnName={"Confirm"}
            />

        </>
    );
}