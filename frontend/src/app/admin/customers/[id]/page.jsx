"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import {
	User as UserIcon, Edit, MessageSquare, ChevronRight,
	Info, ArrowUp, ArrowDown, Plus, Package, Calendar,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
import { API_BASE } from "@/lib/api";
import ExportModal from "@/components/admin/modals/ExportModal";
import CustomerEditModal from "@/components/admin/CustomerEditModal";
import DateRangePickerModal from "@/components/admin/DateRangePickerModal";

const formatShort = (d) => {
	if (!d) return '';
	try {
		return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
	} catch { return '' }
};

const monthYearLabel = (d) => {
	if (!d) return '';
	try {
		return new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
	} catch { return '' }
};

const formatLong = (d) => {
	if (!d) return '';
	try {
		return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
	} catch { return '' }
};

export default function CustomerDetailPage() {
	const router = useRouter();
	const params = useParams();
	const id = params?.id;

	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);
	const [orders, setOrders] = useState([]);
	const [spending, setSpending] = useState([]);
	const [totals, setTotals] = useState({ totalSpent: 0, totalOrders: 0, completedOrders: 0 });
	const [selected, setSelected] = useState(new Set());
	const [selectAll, setSelectAll] = useState(false);
	const [expanded, setExpanded] = useState(new Set());
	const [exportOpen, setExportOpen] = useState(false);
	const [showAllOrders, setShowAllOrders] = useState(false);
	const [expandAll, setExpandAll] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const [datePickerOpen, setDatePickerOpen] = useState(false);
	const [dateRange, setDateRange] = useState({ start: null, end: null });
	const [menuOpen, setMenuOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);

	useEffect(() => {
		if (!id) return;

		const fetchData = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem("adminToken");
				const res = await fetch(`${API_BASE}/api/admin/customers/${id}`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const json = await res.json();
				if (!json.success) {
					console.error(json.message || "Failed to load customer");
					return;
				}

				setUser(json.user || null);
				setOrders(json.orders || []);
				setSpending((json.spendingOverTime || []).map((s) => ({ month: s.label, spending: s.total })));
				setTotals({ totalSpent: json.totalSpent || 0, totalOrders: json.totalOrders || 0, completedOrders: json.completedOrders || 0 });
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	// Mock fallback data if spending empty for visual parity
	const spendingData = spending && spending.length ? spending : [
		{ month: "Jan", spending: 3800 },
		{ month: "Feb", spending: 3500 },
		{ month: "Mar", spending: 4200 },
		{ month: "Apr", spending: 5400 },
		{ month: "May", spending: 5800 },
		{ month: "Jun", spending: 6388 },
		{ month: "Jul", spending: 6100 },
		{ month: "Aug", spending: 6500 },
	];

	if (loading) return <div className="admin-card p-6">Loading...</div>;

	// Resolve image src from different shapes (string path, full URL, or object)
	const resolveImageSrc = (img) => {
		if (!img) return "";
		if (typeof img === "string") {
			if (img.startsWith("http") || img.startsWith("data:")) return img;
			return `${API_BASE}${img}`;
		}
		if (img.url) return img.url.startsWith("http") ? img.url : `${API_BASE}${img.url}`;
		if (img.path) return img.path.startsWith("http") ? img.path : `${API_BASE}${img.path}`;
		return "";
	};

	const statusClass = (status) => {
		if (!status) return "bg-gray-200 text-gray-800";
		const s = String(status).toLowerCase();
		if (s.includes("pending") || s.includes("processing")) return "bg-orange-100 text-orange-700";
		if (s.includes("completed") || s.includes("delivered")) return "bg-green-100 text-green-700";
		if (s.includes("cancel") || s.includes("refunded") || s.includes("failed")) return "bg-red-100 text-red-700";
		return "bg-gray-100 text-gray-800";
	};

	const generateProductsCSV = (list) => {
		const header = "Order ID,Order Date,Product Name,Color,Size,Quantity,Unit Price,Total Price\n";
		const rows = (list || []).map((r) => {
			const orderId = r.orderId || '';
			const date = r.orderDate ? new Date(r.orderDate).toLocaleDateString() : '';
			const name = (r.name || '').replace(/,/g, '');
			const color = r.color || '';
			const size = r.size || '';
			const qty = r.quantity || r.qty || 1;
			const unit = Number(r.unitPrice || 0).toFixed(2);
			const total = Number(r.totalPrice || (Number(unit) * qty)).toFixed(2);
			return `${orderId},${date},${name},${color},${size},${qty},${unit},${total}`;
		}).join("\n");
		return header + rows;
	};


	// Filter orders by dateRange and searchQuery: matches order id, status, amount or any product name
	const filteredOrders = (orders || []).filter((o) => {
		const orderDate = new Date(o.createdAt);
		if (dateRange?.start) {
			const s = new Date(dateRange.start);
			s.setHours(0, 0, 0, 0);
			if (orderDate < s) return false;
		}
		if (dateRange?.end) {
			const e = new Date(dateRange.end);
			e.setHours(23, 59, 59, 999);
			if (orderDate > e) return false;
		}

		if (!searchQuery) return true;
		const q = searchQuery.toLowerCase();
		if (String(o._id).toLowerCase().includes(q)) return true;
		if ((o.status || '').toLowerCase().includes(q)) return true;
		if (String(o.finalAmount || '').toLowerCase().includes(q)) return true;
		const prodNames = (o.products || []).map(p => (p.name || '').toLowerCase()).join(' ');
		if (prodNames.includes(q)) return true;
		return false;
	});

	const displayedOrders = (filteredOrders || []).slice(0, showAllOrders ? filteredOrders.length : 5);

	const computedTotals = (filteredOrders || []).reduce((acc, o) => {
		acc.totalSpent += Number(o.finalAmount || 0);
		acc.totalOrders += 1;
		const s = (o.status || '').toLowerCase();
		if (s.includes('complete') || s.includes('delivered')) acc.completedOrders += 1;
		return acc;
	}, { totalSpent: 0, totalOrders: 0, completedOrders: 0 });

	// derive spending over time from filteredOrders so graph updates by date range
	const deriveSpendingFromOrders = (list, range) => {
		const map = new Map();
		let granularity = 'month';
		if (range && range.start && range.end) {
			const s = new Date(range.start);
			const e = new Date(range.end);
			const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
			if (diffDays <= 31) granularity = 'day';
		} else if (range && range.start && !range.end) {
			granularity = 'day';
		}

		(list || []).forEach(o => {
			const d = new Date(o.createdAt);
			if (granularity === 'day') {
				const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
				const label = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
				if (!map.has(key)) map.set(key, { label, spending: 0 });
				map.get(key).spending += Number(o.finalAmount || 0);
			} else {
				const key = `${d.getFullYear()}-${d.getMonth()}`; // sortable key
				const label = monthYearLabel(d);
				if (!map.has(key)) map.set(key, { label, spending: 0 });
				map.get(key).spending += Number(o.finalAmount || 0);
			}
		});
		const arr = Array.from(map.entries()).map(([key, v]) => ({ month: v.label, spending: v.spending, _k: key }));
		// sort by key (lexicographic works for our keys)
		arr.sort((a, b) => a._k.localeCompare(b._k));
		return arr.map(({ _k, ...rest }) => rest);
	};

	const displayedSpending = (filteredOrders && filteredOrders.length) ? deriveSpendingFromOrders(filteredOrders, dateRange) : (spendingData || []);

	return (
		<div>
			<AdminBreadcrumbs
				items={[
					{ label: "Home", href: "/admin" },
					{ label: "All Customers", href: "/admin/customers" },
				{ label: user?.name || "Customer", href: "/admin/customers/{id}" },
				]}
				mode={null}
			/>
			<div className="p-6 flex gap-6 flex-col lg:flex-row">
				<div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
					<div className="admin-card p-5">
						<style jsx>{`
							.admin-card { transition: transform .12s ease, box-shadow .12s ease; }
							.admin-card:hover { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(16,24,40,0.06); }
							button, .btn-muted { transition: transform .08s ease, box-shadow .08s ease; }
							button:hover { transform: translateY(-1px); }
							.orders-scroll table tr:hover td { background: rgba(15,23,42,0.03); }
						`}</style>
						<div className="flex items-center justify-between mb-5">
							<h2 className="font-semibold text-black">Customer information</h2>
							<button onClick={() => setEditOpen(true)} className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-black transition-colors">
								<Edit className="w-4 h-4" /> Edit
							</button>
						</div>

						<div className="flex items-center gap-3 mb-6">
							<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
								<UserIcon className="w-6 h-6 text-muted-foreground" />
							</div>
							<div className="flex-1">
								<p className="font-semibold text-black">{user?.name || "—"}</p>
								<p className="text-sm text-gray-700">Customer ID: #{String(user?._id || '').slice(-6)}</p>
							</div>
							<button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:bg-muted">
								<MessageSquare className="w-4 h-4" />
							</button>
						</div>

						<div className="space-y-4 text-sm">
							<div>
								<p className="text-gray-700 mb-0.5">Email</p>
								<p className="text-black">{user?.email || '—'}</p>
							</div>
							<div>
								<p className="text-gray-700 mb-0.5">Phone number</p>
								<p className="text-black">{user?.phone || '—'}</p>
							</div>
							<div>
								<p className="text-gray-700 mb-0.5">Address</p>
								<p className="text-black">{user?.addresses?.[0]?.addressLine || '—'}</p>
							</div>
							<div>
								<p className="text-gray-700 mb-0.5">Last Order</p>
								<p className="text-black">{orders && orders.length ? new Date(orders[0].createdAt).toLocaleDateString() : '—'}</p>
							</div>
						</div>
					</div>

					<div className="admin-card p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold text-black">Recent Activities</h2>
							<button className="text-gray-700 hover:text-black">⋮</button>
						</div>
						<div className="space-y-4">
							{(orders && orders.length ? orders.slice(0, 4).map((o, i) => (
								<div key={o._id || i} className="flex items-start gap-3">
									<div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-orange-50 text-orange-500`}>
										<Package className="w-4 h-4" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-black">Order #{String(o._id).slice(-6)}</p>
										<p className="text-xs text-gray-700">{o.status} • ₹{(o.finalAmount || 0).toFixed(2)}</p>
									</div>
									<span className="text-xs text-gray-700 whitespace-nowrap">{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
								</div>
							)) : (
								<div className="text-xs text-gray-700">No recent activity</div>
							))}
						</div>
					</div>
				</div>

				<div className="flex-1 flex flex-col gap-6 min-w-0">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3 w-full max-w-2xl">
							<input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search by ID, name, status, amount"
								className="w-full rounded-lg px-3 py-2 text-sm shadow-sm bg-white"
							/>
						</div>
						<div className="flex items-center gap-2 relative">
							<button onClick={() => setDatePickerOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-md bg-white shadow-sm">
								<Calendar className="w-4 h-4 text-gray-700" />
								<span className="text-sm text-gray-700 cursor-pointer">{dateRange.start ? `${formatShort(dateRange.start)} - ${dateRange.end ? formatShort(dateRange.end) : '…'}` : 'Select Date'}</span>
							</button>
							<button onClick={() => setMenuOpen(!menuOpen)} className="text-sm text-gray-700 px-3 py-2 cursor-pointer rounded-md bg-white shadow-sm">⋮</button>
							{menuOpen && (
								<div className="absolute right-0 mt-10 w-40 bg-white rounded-md shadow-lg z-20">
									<button
										className={`w-full cursor-pointer text-left px-3 py-2 text-sm ${dateRange.start ? 'hover:bg-gray-50' : 'text-gray-400 pointer-events-none opacity-60'}`}
										onClick={() => {
											if (!dateRange.start) return;
											setDateRange({ start: null, end: null });
											setMenuOpen(false);
										}}
									>
										Clear date range
									</button>
								</div>
							)}
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{[
							{ label: "Total Spending", key: 'spend', value: `₹${(computedTotals.totalSpent || 0).toFixed(2)}`, color: '#f97316' },
							{ label: "Total Orders", key: 'orders', value: computedTotals.totalOrders || 0, color: '#10b981' },
							{ label: "Complete Order", key: 'complete', value: computedTotals.completedOrders || 0, color: '#60a5fa' },
						].map((kpi, i) => (
							<div key={kpi.key} className="admin-card p-5 flex items-center justify-between">
								<div>
									<p className="text-sm text-black">{kpi.label}</p>
									<p className="text-2xl font-bold text-black mb-1">{kpi.value}</p>
									<div className="text-xs text-gray-600">{dateRange.start ? `${formatLong(dateRange.start)} - ${dateRange.end ? formatLong(dateRange.end) : ''}` : 'vs last period'}</div>
								</div>
								<div style={{ width: 160, height: 50 }}>
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={displayedSpending} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
											<defs>
												<linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
													<stop offset="5%" stopColor={kpi.color} stopOpacity={0.25} />
													<stop offset="95%" stopColor={kpi.color} stopOpacity={0} />
												</linearGradient>
											</defs>
											<Area type="monotone" dataKey="spending" stroke={kpi.color} strokeWidth={2} fill={`url(#grad-${i})`} dot={false} activeDot={{ r: 4 }} />
										</AreaChart>
									</ResponsiveContainer>
								</div>
							</div>
						))}
					</div>

					<div className="admin-card p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold text-black">Spending Over Time</h2>
							<div className="flex items-center gap-2 text-sm text-gray-700">
								<span className="w-3 h-3 rounded-sm bg-accent-brand inline-block" /> Spending
							</div>
						</div>
						<div className="h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={displayedSpending} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
									<defs>
										<linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="hsl(var(--accent-brand))" stopOpacity={0.15} />
											<stop offset="95%" stopColor="hsl(var(--accent-brand))" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
									<XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
									<YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `₹${v / 1000}K`} />
									<Tooltip />
									<Area type="monotone" dataKey="spending" stroke="hsl(var(--accent-brand))" strokeWidth={2} fill="url(#spendGrad)" dot={{ r: 3, fill: "hsl(var(--accent-brand))", strokeWidth: 0 }} activeDot={{ r: 5, fill: "hsl(var(--accent-brand))", strokeWidth: 2, stroke: "hsl(var(--background))" }} />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="admin-card p-5">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-semibold text-gray-900">Order History</h2>
							<div className="flex items-center gap-3">
								<button className="text-sm text-gray-700 hover:shadow-md rounded-md bg-white shadow-sm px-3 py-1.5">Calm Types</button>
								<button
									onClick={() => setExportOpen(true)}
									className="btn-muted px-4 py-2 text-sm whitespace-nowrap flex items-center gap-2"
								>
									Export As CSV
								</button>
								<button
									onClick={() => {
										const next = !showAllOrders;
										setShowAllOrders(next);
									}}
									className="text-sm text-gray-700 hover:shadow-md rounded-md bg-white shadow-sm px-3 py-1.5"
								>
									{/* {showAllOrders ? 'Show less' : `Show all (${orders.length})`} */}
									{showAllOrders ? 'Show less' : `Show all`}

								</button>

								<button
									onClick={() => {
										const next = !expandAll;
										setExpandAll(next);
										if (next) setExpanded(new Set((orders || []).map((x) => String(x._id))));
										else setExpanded(new Set());
									}}
									className="text-sm text-gray-700 hover:shadow-md rounded-md bg-white shadow-sm px-3 py-1.5"
								>
									{expandAll ? 'Collapse all' : 'Expand all'}
								</button>
								<button className="w-8 h-8 rounded-lg bg-accent-brand text-accent-brand-foreground flex items-center justify-center">
									<Plus className="w-4 h-4" />
								</button>
							</div>
						</div>

						<div className="orders-scroll" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
							<style jsx>{`
								.orders-scroll::-webkit-scrollbar { width: 6px }
								.orders-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 9999px }
							`}</style>
							<table className="w-full text-sm">
								<thead>
									<tr className="">
										<th className="text-left py-3 font-medium text-gray-700 w-8 align-middle">
											<input
												type="checkbox"
												className="rounded border-border"
												checked={selectAll}
												onChange={(e) => {
													const checked = e.target.checked;
													setSelectAll(checked);
													if (checked) {
														setSelected(new Set((orders || []).map((o) => String(o._id))));
													} else {
														setSelected(new Set());
													}
												}}
											/>
										</th>
										<th className="text-left py-3 font-medium text-gray-700">Order ID</th>
										<th className="text-left py-3 font-medium text-gray-700">Date</th>
										<th className="text-left py-3 font-medium text-gray-700">Amount</th>
										<th className="text-left py-3 font-medium text-gray-700">Items</th>
									</tr>
								</thead>
								<tbody>
									{(displayedOrders && displayedOrders.length ? displayedOrders : []).map((o, i) => {
										const idStr = String(o._id);
										const isSelected = selected.has(idStr);
										const isExpanded = expanded.has(idStr);
										const totalItems = (o.products || []).reduce((s, p) => s + (p.quantity || p.qty || 1), 0);
										return (
											<Fragment key={idStr}>
												<tr key={idStr + "-row"}
													className="transition-colors hover:bg-muted/40 cursor-pointer"
													onClick={() => {
														const s = new Set(expanded);
														if (s.has(idStr)) s.delete(idStr); else s.add(idStr);
														setExpanded(s);
													}}												>
													<td className="py-3 align-middle">
														<input
															type="checkbox"
															className="rounded border-border"
															checked={isSelected}
															onClick={(e) => e.stopPropagation()}
															onChange={(e) => {
																const s = new Set(selected);
																if (e.target.checked) s.add(idStr);
																else s.delete(idStr);
																setSelected(s);
																setSelectAll(s.size === (orders || []).length && s.size > 0);
															}} />
													</td>
													<td className="py-3 text-gray-700">#{String(o._id).slice(-8)}</td>
													<td className="py-3 text-gray-700">{new Date(o.createdAt).toLocaleDateString()}</td>
													<td className="py-3 font-medium text-black">₹{(o.finalAmount || 0).toFixed(2)}</td>
													<td className="py-3 text-gray-600">{totalItems} items</td>
												</tr>
												{isExpanded && (
													<tr key={idStr + "-detail"} className="bg-muted/5">
														<td colSpan={5} className="p-4">
															<div className="space-y-3">
																{(o.products || []).map((p, idx) => {
																	const unitPrice = (p.price || p.unitPrice || p.salePrice || p.finalAmount || 0);
																	const paymentMethod = o.paymentMethod || o.paymentType || (o.payment && o.payment.method) || '';
																	return (
																		<div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-md shadow-sm hover:shadow-lg transition-shadow duration-200 transform hover:-translate-y-0.5">
																			<div className="flex items-center gap-3 min-w-0">
																				<div className="w-16 h-16 rounded-md bg-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
																					{p.images && p.images[0] ? (
																						<img
																							src={resolveImageSrc(p.images[0])}
																							alt={p.name}
																							className="w-full h-full object-cover"
																						/>
																					) : (
																						<div className="w-full h-full flex items-center justify-center text-xs text-gray-700">No image</div>
																					)}
																				</div>
																				<div className="flex-1 min-w-0">
																					<div className="font-medium text-sm truncate">{p.name}</div>
																					<div className="text-xs text-gray-700">Color: {(p.color || (p.variant && p.variant.color) || p.selectedColor || p.colorCode) || '—'} • Size: {(p.size || p.variant?.size) || '—'}</div>
																					<div className="text-xs text-gray-700">Quantity: {p.quantity || p.qty || 1}</div>
																				</div>
																			</div>
																			<div className="text-right flex flex-col items-end">
																				<div className="text-sm text-gray-700">{paymentMethod}</div>
																				<div className="text-lg font-medium">₹{Number(unitPrice).toFixed(2)}</div>
																			</div>
																			<div>
																				<span className={`px-3 py-1 rounded ${statusClass(o.status)} text-xs`}>{o.status || '—'}</span>
																			</div>
																		</div>
																	);
																})}
															</div>
														</td>
													</tr>
												)}
											</Fragment>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<DateRangePickerModal
					open={datePickerOpen}
					onClose={() => setDatePickerOpen(false)}
					initialRange={dateRange}
					onApply={(range) => {
						setDateRange(range);
						setDatePickerOpen(false);
					}}
				/>
				<CustomerEditModal
					open={editOpen}
					onClose={() => setEditOpen(false)}
					user={user}
					userId={id}
					variant="drawer"
					onSaved={(updated) => {
						setUser(updated);
						setEditOpen(false);
					}}
				/>
				<ExportModal
					open={exportOpen}
					onClose={() => setExportOpen(false)}
					entityName="products"
					selectedIds={Array.from(selected)}
					fetchSelected={async (orderIds) => {
						const idsSet = new Set(orderIds.map(String));
						const list = (orders || []).flatMap((o) =>
							idsSet.has(String(o._id))
								? (o.products || []).map((p) => {
									const qty = p.quantity || p.qty || 1;
									const unit = Number(p.price || p.unitPrice || p.salePrice || p.finalAmount || 0);
									return {
										orderId: o._id,
										orderDate: o.createdAt,
										name: p.name,
										color: p.color,
										size: p.size,
										quantity: qty,
										unitPrice: unit,
										totalPrice: unit * qty,
									};
								})
								: []
						);
						return list;
					}}
					fetchAll={async () => {
						return (orders || []).flatMap((o) => (o.products || []).map((p) => {
							const qty = p.quantity || p.qty || 1;
							const unit = Number(p.price || p.unitPrice || p.salePrice || p.finalAmount || 0);
							return {
								orderId: o._id,
								orderDate: o.createdAt,
								name: p.name,
								color: p.color,
								size: p.size,
								quantity: qty,
								unitPrice: unit,
								totalPrice: unit * qty,
							};
						}));
					}}
					generateCSV={generateProductsCSV}
				/>
			</div>
		</div>
	);
}
