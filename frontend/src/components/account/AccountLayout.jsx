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

const section = pathname?.split("/")[2] || "dashboard";
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

      <div className="flex flex-col md:flex-row flex-1">
        <AccountSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="flex-1 w-full">
          <div className="container-imkaa" style={{ paddingTop: "32px", paddingBottom: "32px", scrollBehavior: "smooth" }}>
            <div className="card-imkaa" style={{ padding: "24px", overflow: "visible" }}>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}                                                                                                     