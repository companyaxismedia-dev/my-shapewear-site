"use client";

import AccountLayout from "@/components/account/AccountLayout";
import { AccountProvider } from "@/context/AccountContext";
import { Suspense } from "react";

export default function AccountPage() {
  return (
    <Suspense fallback={<div>Loading account details...</div>}>
      <AccountProvider>
        <div className="min-h-screen bg-white">
          <AccountLayout />
        </div>
      </AccountProvider>
    </Suspense>
  );
}