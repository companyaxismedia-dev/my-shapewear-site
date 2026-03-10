"use client";

import { useEffect, useState, Fragment } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";
import {Calendar as CalendarIcon,User as UserIcon,
	Edit,
	MessageSquare,
	ChevronRight,
	Info,
	ArrowUp,
	ArrowDown,
	Download,
	Plus,
	Package,
	Tag,
	PlusCircle,
	Image,
	CalendarDays,
} from "lucide-react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { API_BASE } from "@/lib/api";
import ExportModal from "@/components/admin/modals/ExportModal";

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

	return (
		<div>
			<AdminBreadcrumbs items={[{ label: "Home", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: user?.name || "Customer" }]} />

			<div className="p-6 flex gap-6 flex-col lg:flex-row">
				<div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
					<div className="admin-card p-5">
						<div className="flex items-center justify-between mb-5">
							<h2 className="font-semibold text-black">Customer information</h2>
							<button onClick={() => router.push(`/admin/customers/edit/${id}`)} className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-black transition-colors">
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
								<p className="text-black">{user?.address || '—'}</p>
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
							{(orders && orders.length ? orders.slice(0,4).map((o, i) => (
								<div key={o._id || i} className="flex items-start gap-3">
									<div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-orange-50 text-orange-500`}>
										<Package className="w-4 h-4" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-black">Order #{String(o._id).slice(-6)}</p>
										<p className="text-xs text-gray-700">{o.status} • ₹{(o.finalAmount||0).toFixed(2)}</p>
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
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{[
							{ label: "Total Spending", value: `₹${(totals.totalSpent||0).toFixed(2)}`, change: "+3.5%", positive: true, sub: "vs Year", link: true },
							{ label: "Total Orders", value: totals.totalOrders||0, change: "+3.5%", positive: true, sub: "vs last Year", link: true },
							{ label: "Complete Order", value: totals.completedOrders||0, change: "-4.7%", positive: false, sub: "vs last Year", link: false },
						].map((kpi, i) => (
							<div key={i} className="admin-card p-5">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm text-black">{kpi.label}</p>
									<Info className="w-4 h-4 text-muted-foreground" />
								</div>
								<p className="text-2xl font-bold text-black mb-2">{kpi.value}</p>
								<div className="flex items-center gap-2 text-xs">
									<span className={`flex items-center gap-0.5 ${kpi.positive ? "text-status-positive" : "text-status-negative"}`}>
										{kpi.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
										{kpi.change}
									</span>
									<span className="text-gray-700">{kpi.sub}</span>
									{kpi.link && (
										<button className="ml-auto flex items-center gap-0.5 text-gray-700 hover:text-black">
											View details <ChevronRight className="w-3 h-3" />
										</button>
									)}
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
								<AreaChart data={spendingData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
								<button className="text-sm text-gray-700 hover:text-black border border-border rounded-lg px-3 py-1.5">Calm Types</button>
								<button onClick={() => setExportOpen(true)} className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-black border border-border rounded-lg px-3 py-1.5">
									<Download className="w-4 h-4" /> Export As CSV
								</button>
								<button className="w-8 h-8 rounded-lg bg-accent-brand text-accent-brand-foreground flex items-center justify-center">
									<Plus className="w-4 h-4" />
								</button>
							</div>
						</div>

						<table className="w-full text-sm">
							<thead>
								<tr className="">
									<th className="text-left py-3 font-medium text-gray-700 w-8">
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
									<th className="text-left py-3 font-medium text-gray-700">Items</th>
									<th className="text-left py-3 font-medium text-gray-700">Order ID</th>
									<th className="text-left py-3 font-medium text-gray-700">Date</th>
									<th className="text-left py-3 font-medium text-gray-700">Amount</th>
								</tr>
							</thead>
							<tbody>
								{(orders && orders.length ? orders : []).map((o, i) => {
									const idStr = String(o._id);
									const isSelected = selected.has(idStr);
									const isExpanded = expanded.has(idStr);
									return (
										<Fragment key={idStr}>
											<tr key={idStr + "-row"} className="transition-colors hover:bg-muted/40 cursor-pointer">
												<td className="py-3 align-top">
													<input
														type="checkbox"
														className="rounded border-border"
														checked={isSelected}
														onChange={(e) => {
															const s = new Set(selected);
															if (e.target.checked) s.add(idStr);
															else s.delete(idStr);
															setSelected(s);
															setSelectAll(s.size === (orders || []).length && s.size > 0);
														}}
													/>
												</td>
												<td className="py-3 text-black cursor-pointer" onClick={() => {
													const s = new Set(expanded);
													if (s.has(idStr)) s.delete(idStr); else s.add(idStr);
													setExpanded(s);
												}}>
													{(o.products && o.products[0] && o.products[0].name) || `Order ${String(o._id).slice(-6)}`}
												</td>
												<td className="py-3 text-gray-700">#{String(o._id).slice(-8)}</td>
												<td className="py-3 text-gray-700">{new Date(o.createdAt).toLocaleDateString()}</td>
												<td className="py-3 font-medium text-black">₹{(o.finalAmount||0).toFixed(2)}</td>
											</tr>
											{isExpanded && (
												<tr key={idStr + "-detail"} className="bg-muted/5">
													<td colSpan={5} className="p-4">
														<div className="space-y-3">
															{(o.products || []).map((p, idx) => (
																<div key={idx} className="flex items-center gap-3">
																	<div className="w-12 h-12 rounded-md bg-white border flex items-center justify-center overflow-hidden">
																		{p.images && p.images[0] ? (
																			<img src={p.images[0].url || p.images[0]} alt={p.name} className="w-full h-full object-cover" />
																		) : (
																			<div className="w-full h-full flex items-center justify-center text-xs text-gray-700">No image</div>
																			)}
																	</div>
																	<div className="flex-1">
																		<div className="font-medium">{p.name}</div>
																		<div className="text-xs text-gray-700">Color: {p.color || '—'} • Size: {p.size || '—'}</div>
																	</div>
																	<div className="text-sm">Qty: {p.quantity || p.qty || 1}</div>
																</div>
															))}
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
		</div>
	);
}
