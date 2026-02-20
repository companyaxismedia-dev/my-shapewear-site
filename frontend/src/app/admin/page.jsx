"use client";
import { useState } from "react";
import Link from "next/link";

import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/admin/AdminLayout";

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ title, value, change, positive, icon: Icon, prefix }) {
  return (
    <div className="admin-card p-5 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="w-9 h-9 rounded-lg bg-admin-green-light flex items-center justify-center">
          <Icon className="w-4 h-4 text-admin-green-text" />
        </div>
      </div>
      <div className="flex items-end gap-2 flex-wrap">
        <span className="text-2xl font-bold text-foreground">
          {prefix}
          {value !== undefined && value !== null && value !== "" ? value : "—"}
        </span>
        {change && (
          <span
            className={cn(
              "text-xs font-medium pb-0.5",
              positive ? "text-admin-green" : "text-destructive"
            )}
          >
            {positive ? "+" : ""}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Order Status Badge ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    Pending:
      "bg-admin-pending-light text-admin-pending border border-admin-pending/20",
    Delivered:
      "bg-admin-delivered-light text-admin-delivered border border-admin-delivered/20",
    Shipped:
      "bg-admin-shipped-light text-admin-shipped border border-admin-shipped/20",
    Cancelled:
      "bg-destructive/10 text-destructive border border-destructive/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

// ── Dashboard Page ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState("7days");

  // All data empty — will be populated when backend is connected
  const stats = {
    totalSales: null,
    totalOrders: null,
    totalProducts: null,
    totalCustomers: null,
  };

  const salesData = [];

  const recentOrders = [];

  const recentProducts = [];

  const lowStockProducts = [];

  return (
    <AdminLayout>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          Welcome back, Admin 👋
        </h1>
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
          <span>Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Dashboard</span>
        </nav>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Sales" value={stats.totalSales ?? "—"} icon={TrendingUp} />
        <StatCard title="Total Orders" value={stats.totalOrders ?? "—"} icon={ShoppingCart} />
        <StatCard title="Total Products" value={stats.totalProducts ?? "—"} icon={Package} />
        <StatCard title="Total Customers" value={stats.totalCustomers ?? "—"} icon={Users} />
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Sales Overview ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <h2 className="text-base font-semibold text-foreground">
                Sales Overview
              </h2>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setChartPeriod("7days")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    chartPeriod === "7days"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setChartPeriod("month")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    chartPeriod === "month"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  This Month
                </button>
              </div>
            </div>

            {salesData.length === 0 ? (
              <div className="h-56 flex flex-col items-center justify-center text-muted-foreground gap-2 border-2 border-dashed border-border rounded-lg">
                <TrendingUp className="w-8 h-8 opacity-30" />
                <p className="text-sm">No sales data available</p>
                <p className="text-xs opacity-70">
                  Connect your backend to see sales overview
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={224}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(158,64%,40%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(158,64%,40%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--border))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--border))" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(158,64%,40%)"
                    strokeWidth={2}
                    fill="url(#salesGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent products */}

          <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Recent Products
              </h2>
              <button className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentProducts.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Package className="w-8 h-8 opacity-30" />
                <p className="text-sm">No products yet</p>
                <p className="text-xs opacity-70">
                  Products will appear here once your backend is connected
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-muted-foreground font-medium pb-3 pr-4">
                        Product
                      </th>
                      <th className="text-right text-muted-foreground font-medium pb-3 pr-4">
                        Price
                      </th>
                      <th className="text-right text-muted-foreground font-medium pb-3">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right font-medium text-foreground">
                          ₹{product.price.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          {product.stock}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-4">
          {/* ── Recent Orders ── */}
          <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Recent Orders
              </h2>
             <Link href="/admin/orders/recent">
              <button className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button></Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <ShoppingCart className="w-8 h-8 opacity-30" />
                <p className="text-sm">No orders yet</p>
                <p className="text-xs opacity-70 text-center">
                  Orders will appear here once your backend is connected
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Header */}
                <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border mb-1">
                  <span className="text-xs text-muted-foreground font-medium col-span-1">
                    Order ID
                  </span>
                  <span className="text-xs text-muted-foreground font-medium col-span-1">
                    Customer
                  </span>
                  <span className="text-xs text-muted-foreground font-medium text-right">
                    Amount
                  </span>
                  <span className="text-xs text-muted-foreground font-medium text-right">
                    Status
                  </span>
                </div>

                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="grid grid-cols-4 gap-2 py-2.5 border-b border-border last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <span className="text-xs font-medium text-foreground col-span-1 truncate">
                      {order.id}
                    </span>
                    <span className="text-xs text-foreground col-span-1 truncate">
                      {order.customer}
                    </span>
                    <span className="text-xs text-right text-foreground font-medium">
                      ₹{order.amount}
                    </span>
                    <div className="flex justify-end">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Low Stock Products ── */}
          <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">
                Low Stock Products
              </h2>
              <button className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <AlertTriangle className="w-8 h-8 opacity-30" />
                <p className="text-sm">No low stock alerts</p>
                <p className="text-xs opacity-70 text-center">
                  Low stock items will appear here once backend is connected
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-admin-warning-light flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-admin-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.variant}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-foreground">
                        {product.left} left
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
