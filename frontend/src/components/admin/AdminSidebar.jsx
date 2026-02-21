"use client";

import {
  Home,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  Tag,
  Inbox,
} from "lucide-react";

export default function AdminSidebar() {
  const menu = [
    { name: "Home", icon: Home },
    { name: "Products", icon: ShoppingBag },
    { name: "Orders", icon: Package },
    { name: "Customers", icon: Users },
    { name: "Analytics", icon: BarChart3 },
    { name: "Promotion", icon: Tag },
    { name: "Inbox", icon: Inbox },
    { name: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r p-5">
      <h1 className="text-xl font-bold mb-8">Glovia Admin</h1>

      <nav className="space-y-3">
        {menu.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-700"
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
