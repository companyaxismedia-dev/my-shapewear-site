"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Home, ShoppingBag, Ticket, User, Wallet, Banknote, MapPin, Bell } from "lucide-react";
import styles from "../../app/globals.css";

const overviewItems = [
  {
    id: "orders",
    label: "Orders",
    description: "Check your order status",
    icon: ShoppingBag,
    link: "/account/orders",
  },
  {
    id: "collections",
    label: "Collections & Wishlist",
    description: "All your curated product collections",
    icon: Home,
    link: "/wishlist",
  },
  {
    id: "coupons",
    label: "Coupons",
    description: "Manage coupons for additional discounts",
    icon: Ticket,
    link: "/account/coupons",
  },
  {
    id: "wallet",
    label: "Wallets/BNPL",
    description: "View your saved wallets and BNPL",
    icon: Wallet,
    link: "/account/wallet",
  },
  {
    id: "bank-details",
    label: "Saved Cards",
    description: "Save your cards for faster checkout",
    icon: Banknote,
    link: "/account/bank-details",
  },
  {
    id: "address-book",
    label: "Addresses",
    description: "Save addresses for a hassle-free checkout",
    icon: MapPin,
    link: "/account/address-book",
  },
  {
    id: "personal-info",
    label: "Profile Details",
    description: "Change your profile details",
    icon: User,
    link: "/account/personal-info",
  },
  {
    id: "notifications",
    label: "Manage Notifications",
    description: "Manage your notifications",
    icon: Bell,
    link: "/account/notifications",
  },
];

export default function Overview() {
  const router = useRouter();

  return (
    <div className="overview-container" style={{ padding: "32px 0" }}>
      <div className="card-imkaa" style={{ padding: "24px", marginBottom: "32px", textAlign: "center" }}>
        <img
          src="/image/profile-placeholder.png"
          alt="Profile"
          style={{ width: 80, height: 80, borderRadius: "50%", marginBottom: 16 }}
        />
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>user@gmail.com</div>
        <button className="btn-secondary-imkaa" style={{ marginBottom: 16 }}>EDIT PROFILE</button>
      </div>
      <div
        className="overview-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
        }}
      >
        {overviewItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="overview-item card-imkaa"
              style={{
                padding: "24px",
                cursor: "pointer",
                textAlign: "center",
              }}
              onClick={() => router.push(item.link)}
            >
              <Icon
                size={32}
                style={{ color: "var(--color-primary)" }}
                className="block mx-auto md:mb-3"
              />

              <div style={{ fontWeight: 600, fontSize: 16, marginTop: 10 }}>
                {item.label}
              </div>

              <div className="hidden md:block" style={{ color: "var(--color-body)", fontSize: 13 }}>
                {item.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
