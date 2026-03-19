"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AccountSidebar from "./AccountSidebar";
import Overview from "./Overview";
import OrderHistory from "./OrderHistory";
import ManageNotifications from "./ManageNotifications";
import MyAddressBook from "./MyAddressBook";
import MyBankDetails from "./MyBankDetails";
import MyWallet from "./MyWallet";
import PersonalInfo from "./PersonalInfo";
import MyCoupons from "./MyCoupons";


export default function AccountLayout() {

  const pathname = usePathname();
  // Extract section from pathname, e.g. /account/coupons => "coupons"
  const sectionMatch = pathname.match(/account\/(\w+)/);
  const section = sectionMatch ? sectionMatch[1] : "dashboard";
  const [activeSection, setActiveSection] = useState(section);

  useEffect(() => {
    setActiveSection(section);
  }, [section]);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Overview />;
      case "orders":
        return <OrderHistory />;
      case "coupons":
        return <MyCoupons />;
      case "personal-info":
        return <PersonalInfo />;
      case "wallet":
        return <MyWallet />;
      case "bank-details":
        return <MyBankDetails />;
      case "address-book":
        return <MyAddressBook />;
      case "notifications":
        return <ManageNotifications />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header - Full width, sticky above everything */}
      <div className="sticky top-0 z-20 flex justify-center" style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid var(--color-border)", padding: "20px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "var(--color-heading)", margin: 0, letterSpacing: "-0.5px" }}>
          🔒 My Account
        </h1>
      </div>

      {/* Main content flex - sidebar + content below header */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar - Visible on desktop, drawer on mobile */}
        <AccountSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content - Full width on mobile, flex-1 on desktop */}
        <div className="flex-1 w-full">
          {/* Content */}
          <div className="container-imkaa" style={{ paddingTop: "32px", paddingBottom: "32px", scrollBehavior: "smooth" }}>
            <div className="card-imkaa" style={{ padding: "24px" }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}