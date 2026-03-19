"use client";

import { useState } from "react";
import {ShoppingBag,Ticket,User,Wallet,Banknote,MapPin,Bell,Menu,X,LogOut,Home} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const menuItems = [
  { id: "dashboard", label: "Overview", icon: Home, link: "/account/dashboard" },
  { id: "orders", label: "Order History", icon: ShoppingBag, link: "/account/orders" },
  { id: "coupons", label: "My Coupons", icon: Ticket, link: "/account/coupons" },
  { id: "personal-info", label: "Personal Information", icon: User, link: "/account/personal-info" },
  { id: "wallet", label: "My Wallet", icon: Wallet, link: "/account/wallet" },
  { id: "bank-details", label: "My Bank Details", icon: Banknote, link: "/account/bank-details" },
  { id: "address-book", label: "My Address Book", icon: MapPin, link: "/account/address-book" },
  { id: "notifications", label: "Manage Notifications", icon: Bell, link: "/account/notifications" },
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
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed right-6 z-40 btn-primary-imkaa"
        style={{ bottom: "30px", height: 50, width: 50, padding: 0 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar - Always visible on desktop, sticky below header */}
      <aside
        className="hidden md:block md:w-72 md:sticky md:top-[80px] md:h-[calc(100vh-100px)] md:overflow-y-auto md:flex-shrink-0"
        style={{ background: "var(--color-bg)", borderRight: "1px solid var(--color-border)" }}
      >
        <div className="p-6">
          <div className="card-imkaa" style={{ padding: "18px" }}>
            {/* Heading */}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--color-heading)", textAlign: "left", marginBottom: "12px" }}>
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
                      router.push(item.link);
                      if (onSectionChange) onSectionChange(item.id);
                    }}
                    className="w-full flex items-center gap-3 py-2 px-3 text-left transition-all rounded-lg text-sm font-medium"
                    style={{
                      background: activeSection === item.id ? "var(--color-accent)" : "transparent",
                      color: activeSection === item.id ? "var(--color-heading)" : "var(--color-body)",
                      borderLeft: activeSection === item.id ? "3px solid var(--color-primary)" : "none",
                      borderBottom: index !== menuItems.length - 1 ? "1px solid var(--color-border)" : "none",
                      paddingLeft: activeSection === item.id ? "12px" : "16px",
                    }}
                  >
                    <Icon size={16} strokeWidth={1.8} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 500 }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn-secondary-imkaa w-full mt-3"
              style={{ fontSize: "13px", height: "40px" }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer - Slides from left on mobile */}
      <aside
        className={`fixed md:hidden top-0 left-0 w-72 h-screen pt-0 transform transition-transform z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "var(--color-bg)", borderRight: "1px solid var(--color-border)" }}
      >
        <div className="p-4 h-screen overflow-y-auto">
          <div className="card-imkaa" style={{ padding: "18px" }}>
            {/* Heading */}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600, color: "var(--color-heading)", textAlign: "left", marginBottom: "12px" }}>
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
                      router.push(item.link);
                      if (onSectionChange) onSectionChange(item.id);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 py-2 px-3 text-left transition-all rounded-lg text-sm font-medium cursor-pointer"
                    style={{
                      background: activeSection === item.id ? "var(--color-accent)" : "transparent",
                      color: activeSection === item.id ? "var(--color-heading)" : "var(--color-body)",
                      borderLeft: activeSection === item.id ? "3px solid var(--color-primary)" : "none",
                      borderBottom: index !== menuItems.length - 1 ? "1px solid var(--color-border)" : "none",
                      paddingLeft: activeSection === item.id ? "12px" : "16px",
                    }}
                  >
                    <Icon size={16} strokeWidth={1.8} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 500 }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn-secondary-imkaa w-full mt-3"
              style={{ fontSize: "13px", height: "40px" }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay - Backdrop for drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 md:hidden z-20"
          style={{ background: "rgba(74,46,53,0.35)" }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}