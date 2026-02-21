"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Store,
  ShoppingCart,
  Settings2,
  BarChart3,
  Layers,
  Tag,
  Settings,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
  ChevronUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* ================= NAV ITEMS ================= */
const navItems = [
  {
    title: "Home",
    href: "/admin",
    icon: Home,
  },
  {
    title: "My Shop",
    icon: Store,
    children: [
      {
        title: "Products",
        children: [
          { title: "All Products", href: "/admin/products" },
          { title: "Add Product", href: "/admin/products/add" },
          { title: "Categories", href: "/admin/products/categories" },
        ],
      },
      { title: "Orders", href: "/admin/orders" },
      { title: "Customers", href: "/admin/customers" },
    ],
  },
  {
    title: "Shop Management",
    href: "/admin/shop-management",
    icon: Settings2,
  },
  {
    title: "Analytics Report",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Layers,
  },
  {
    title: "Promotions",
    href: "/admin/promotions",
    icon: Tag,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/admin/help",
    icon: HelpCircle,
  },
];

/* ================= SIDEBAR ================= */
export function AdminSidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState(["My Shop"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubItems, setExpandedSubItems] = useState([]);

  const toggleExpanded = (title) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const toggleSubExpanded = (title) => {
    setExpandedSubItems((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (href) => {
    if (!href) return false;
    return pathname === href;
  };

  const isChildActive = (children) => {
    if (!children) return false;
    return children.some((child) => pathname === child.href);
  };

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-full flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
          collapsed ? "w-0 lg:w-16 overflow-hidden" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-border min-h-[64px]">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-bold text-base text-foreground truncate">
              AdminPanel
            </span>
          )}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-border">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm">
              <Search className="w-4 h-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none flex-1 text-sm placeholder:text-muted-foreground text-foreground"
              />
              <span className="text-xs hidden sm:block">⌘S</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {!collapsed && (
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Main Menu
            </p>
          )}

          <ul className="space-y-0.5">
            {navItems.map((item) => (
              <li key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isChildActive(item.children)
                          ? "admin-nav-active"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">
                            {item.title}
                          </span>
                          {expandedItems.includes(item.title) ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </>
                      )}
                    </button>

                    {!collapsed && expandedItems.includes(item.title) && (
                      <ul className="mt-0.5 ml-4 border-l border-border pl-3 space-y-0.5">
                        {item.children.map((child) => (
                          <li key={child.title}>
                            {child.children ? (
                              <div>
                                <button
                                  onClick={() => toggleSubExpanded(child.title)}
                                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:bg-muted"
                                >
                                  <ChevronRight
                                    className={cn(
                                      "w-3 h-3 transition-transform",
                                      expandedSubItems.includes(child.title) && "rotate-90"
                                    )}
                                  />
                                  <span className="flex-1 text-left">{child.title}</span>
                                </button>

                                {expandedSubItems.includes(child.title) && (
                                  <ul className="ml-4 mt-1 border-l border-border pl-3 space-y-1">
                                    {child.children.map((sub) => (
                                      <li key={sub.href}>
                                        <Link
                                          href={sub.href}
                                          className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                                            isActive(sub.href)
                                              ? "admin-nav-active"
                                              : "text-muted-foreground hover:bg-muted"
                                          )}
                                        >
                                          {sub.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ) : (
                              <Link
                                href={child.href}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                                  isActive(child.href)
                                    ? "admin-nav-active"
                                    : "text-muted-foreground hover:bg-muted"
                                )}
                              >
                                <ChevronRight className="w-3 h-3" />
                                {child.title}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive(item.href)
                        ? "admin-nav-active"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        {/* User */}
        <div className="border-t border-border px-3 py-3">
          <div
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors",
              collapsed && "justify-center"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>

            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Admin</p>
                  <p className="text-xs text-muted-foreground">
                    Super Admin
                  </p>
                </div>
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

/* ================= ADMIN LAYOUT ================= */
export function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-16" : "ml-0 lg:ml-64"
        )}
      >
        <header className="sticky top-0 z-10 h-16 bg-card border-b border-border flex items-center px-4 gap-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
          >
            {sidebarCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>

          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            <span>/</span>
            <span className="text-foreground font-medium">Dashboard</span>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm w-48 lg:w-64">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none flex-1 text-sm"
              />
            </div>

            <Link
              href="/admin/products/add"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              <span className="hidden sm:block">Add Product</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
