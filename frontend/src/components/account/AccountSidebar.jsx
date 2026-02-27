"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Ticket,
  User,
  Wallet,
  Banknote,
  MapPin,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const menuItems = [
  { id: "order-history", label: "Order History", icon: ShoppingBag },
  { id: "coupons", label: "My Coupons", icon: Ticket },
  { id: "personal-info", label: "Personal Information", icon: User },
  { id: "wallet", label: "My Wallet", icon: Wallet },
  { id: "bank-details", label: "My Bank Details", icon: Banknote },
  { id: "address-book", label: "My Address Book", icon: MapPin },
  { id: "notifications", label: "Manage Notifications", icon: Bell },
];

export default function AccountSidebar({ activeSection, onSectionChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const { logout } = useAuth(); // 🔥 backend auth context
  const router = useRouter();

  const handleLogout = () => {
    logout();                 // localStorage clear
    router.push("/");    // redirect
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-40 md:hidden bg-pink-600 text-white p-2 rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 w-72 h-screen md:h-auto bg-white md:bg-transparent pt-20 md:pt-0 transform transition-transform md:translate-x-0 z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mx-4 md:mx-0 bg-pink-50 rounded-md p-6 h-fit">

          {/* Heading */}
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            My Account
          </h2>

          {/* Menu */}
          <nav>
            {menuItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 py-4 text-left transition ${
                    activeSection === item.id
                      ? "text-pink-500"
                      : "text-gray-800 hover:text-pink-500"
                  } ${
                    index !== menuItems.length - 1
                      ? "border-b border-gray-300 border-dashed"
                      : ""
                  }`}
                >
                  <Icon size={22} strokeWidth={1.8} />
                  <span className="text-xl font-medium">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* 🔥 BACKEND CONNECTED LOGOUT */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 mt-6 py-3 px-3 bg-white rounded-md border border-gray-200 hover:bg-gray-50 transition font-semibold text-gray-800"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}