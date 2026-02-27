"use client";

import AccountLayout from "@/components/account/AccountLayout";
import { AccountProvider } from "@/context/AccountContext";

export default function AccountPage() {
  return (
    <AccountProvider>
      <div className="min-h-screen bg-white">
        <AccountLayout />
      </div>
    </AccountProvider>
  );
}