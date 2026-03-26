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
      <div className="sticky top-0 z-20 flex justify-center" style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid var(--color-border)", padding: "20px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "var(--color-heading)", margin: 0, letterSpacing: "-0.5px" }}>
          🔒 My Account
        </h1>
      </div>

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


// logic for the top navigation in the acccount page
// const menuItems = [
//     { id: "orders", label: "Orders", icon: ShoppingBag },
//     { id: "coupons", label: "Coupons", icon: Ticket },
//     { id: "personal-info", label: "Profile", icon: User },
//     { id: "wallet", label: "Wallet", icon: Wallet },
//     { id: "bank-details", label: "Bank", icon: Banknote },
//     { id: "address-book", label: "Address", icon: MapPin },
//     { id: "notifications", label: "Alerts", icon: Bell },
// ];

//             <div className="md:hidden mb-6 px-4 lg:px-6" style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid var(--color-border)", marginLeft: "-16px", marginRight: "-16px", marginTop: "-32px", paddingLeft: "16px", paddingRight: "16px", paddingTop: "16px", paddingBottom: "16px" }}>
//                 <div className="flex gap-2 overflow-x-auto pb-2">
//                     {menuItems.map((item) => {
//                         const Icon = item.icon;
//                         const isActive = item.id === "orders";
//                         return (
//                             <Link
//                                 key={item.id}
//                                 href={`/account?tab=${item.id}`}
//                                 className="flex items-center gap-1 px-3 py-2 rounded-full flex-shrink-0 text-sm font-medium whitespace-nowrap transition"
//                                 style={{
//                                     background: isActive ? "var(--color-primary)" : "var(--color-card)",
//                                     color: isActive ? "white" : "var(--color-body)",
//                                     border: `1px solid ${isActive ? "var(--color-primary)" : "var(--color-border)"}`,
//                                 }}
//                             >
//                                 <Icon size={16} />
//                                 <span>{item.label}</span>
//                             </Link>
//                         );
//                     })}
//                 </div>
//             </div>
