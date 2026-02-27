"use client";

import { useState } from "react";

import AccountSidebar from "./AccountSidebar";
import OrderHistory from "./OrderHistory";
import MyCoupons from "./MyCoupons";
import PersonalInfo from "./PersonalInfo";
import MyWallet from "./MyWallet";
import MyBankDetails from "./MyBankDetails";
import MyAddressBook from "./MyAddressBook";
import ManageNotifications from "./ManageNotifications";

export default function AccountLayout() {
  const [activeSection, setActiveSection] = useState("order-history");

  const renderContent = () => {
    switch (activeSection) {
      case "order-history":
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
        return <OrderHistory />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <AccountSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 w-full md:w-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 py-6 sticky top-0 z-10 flex justify-center">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-2">
            🔒 My Account
          </h1>
        </div>

        {/* Content */}
        <div className="p-6 md:p-10 w-full">{renderContent()}</div>
      </div>
    </div>
  );
}